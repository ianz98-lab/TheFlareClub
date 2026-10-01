# Cuentas de usuaria y pagos (Supabase + Recurrente)

> 30-sep-2026. Pedido de las fundadoras: "que la persona que tenga su usuario tenga su portal con las clases
> que ya vio, clases favoritas, videos que ya vio, cursos que compró. Los cursos son comprados aparte de la
> membresía. Igual los eventos."
>
> **Estado:** todo el código está escrito (web, migración y funciones). Falta **activarlo** siguiendo el
> checklist de la sección 7. Mientras tanto la web corre en **modo demo**: las cuentas y la actividad se
> guardan solo en el navegador y la prueba gratis se simula.

## 1. Piezas

| Pieza | Dónde | Qué hace |
|---|---|---|
| Web estática | `src/` (GitHub Pages) | Registro, entrar, recuperar contraseña, portal "Mi cuenta". Habla con Supabase con la llave pública; RLS decide qué puede leer o escribir. |
| Auth | Supabase Auth | Correo + contraseña. Confirmación de correo y recuperación de contraseña con enlaces `token_hash`, que sirven en cualquier navegador o dispositivo (ver 7.1). |
| Base de datos | `supabase/migrations/0002_cuentas.sql` | Perfiles, favoritos, historial, membresías, compras, bitácora de cobros y formularios. |
| `crear-checkout` | `supabase/functions/crear-checkout` | Con la sesión de la usuaria, crea el checkout de Recurrente (membresía o curso) con su id en la metadata y devuelve la URL de pago. |
| `cancelar-membresia` | `supabase/functions/cancelar-membresia` | Con la sesión de la usuaria, cancela su membresía en Recurrente y la marca cancelada. Conserva el acceso hasta el fin del periodo pagado (o de la prueba). |
| `recurrente-webhook` | `supabase/functions/recurrente-webhook` | Recibe los avisos de Recurrente (firmados con Svix) y escribe membresías y compras. |
| Código compartido | `supabase/functions/_shared` | Precios y regla de acceso (`catalog.ts`), cliente de Recurrente y firma Svix (`recurrente.ts`), PostgREST/Auth por fetch y fallas pasajeras (`supabase.ts`), CORS. |
| Links públicos | `ticketUrl` en `src/content/events.ts` | Entradas a eventos. El webhook las reconoce por el producto (`recurrente_products`) y las enlaza por correo. |

### Diagrama

```
                 ┌──────────────────────── Navegador (sitio estático) ───────────────────────┐
                 │  supabase-js con llave pública + sesión de la usuaria                     │
                 └───────┬───────────────────────┬───────────────────────────┬───────────────┘
                         │ registro / entrar      │ leer y guardar lo suyo    │ "Empezar 7 días gratis"
                         │                        │                           │ "Cancelar membresía"
                         ▼                        ▼ (RLS)                     ▼ (JWT de la usuaria)
                ┌────────────────┐   ┌──────────────────────────────┐  ┌──────────────────────┐
                │ Supabase Auth  │   │ PostgREST                    │  │ Edge Functions       │
                │ correo con     │   │ profiles · favorites ·       │  │ crear-checkout       │
                │ token_hash →   │   │ watch_history (lee/escribe)  │  │ cancelar-membresia   │
                │ /cuenta/       │   │ subscriptions · purchases    │  └──────────┬───────────┘
                └────────────────┘   │ (solo lee) · leads (inserta) │             │ POST /customers, /checkouts
                                     └──────────────▲───────────────┘             │ DELETE /subscriptions/{id}
                                                    │ service role                ▼   (metadata flare_*)
┌─────────────────────────┐   webhook (Svix)  ┌─────┴────────────────┐    ┌──────────────────────┐
│ Links públicos de pago  │ ────────────────► │ Edge Function        │ ◄─ │ Recurrente           │
│ (entradas a eventos)    │   vía Recurrente  │ recurrente-webhook   │    │ checkout_url → pago  │
└─────────────────────────┘                   │ billing_events →     │    │ (tarjeta, prueba 7d) │
                                              │ subscriptions /      │    └──────────────────────┘
                                              │ purchases            │
                                              └──────────────────────┘
```

## 2. Tablas (migración 0002)

| Tabla | Quién escribe | Quién lee | Notas |
|---|---|---|---|
| `profiles` | trigger al crear la cuenta; la usuaria solo su nombre | la usuaria (lo suyo) | `role` member/admin. |
| `favorites` | la usuaria | la usuaria | Claves de texto: `class:<id>`, `meditation:<id>`, `talk:<id>`, `lesson:<curso>:<lección>`. |
| `watch_history` | la usuaria | la usuaria | `pct`, `completed_at`: alimenta "Continuar viendo" y "Lo que ya viste". |
| `subscriptions` | webhook y `cancelar-membresia` (service role) | la usuaria (lo suyo) | `plan_slug` flare-mensual/flare-anual, `status` trialing/active/past_due/canceled, `trial_ends_at`, `current_period_end` (en una cancelada: hasta cuándo conserva el acceso), `canceled_at`, `recurrente_subscription_id` único. |
| `purchases` | webhook | la usuaria | `item_key` `course:<slug>` / `event:<slug>` / `workbook:<slug>`. `recurrente_checkout_id` único = idempotencia. |
| `recurrente_products` | el equipo, a mano (SQL) | solo service role | Producto de Recurrente → qué es (`item_key` o `plan_slug`). Necesario para links públicos. |
| `billing_events` | webhook | solo service role | Bitácora de cada aviso (id = `svix-id`), `processed_at` y `error`. |
| `leads` | cualquiera (solo insertar) | solo service role | Cotizaciones corporativas y listas de espera. |

Enlace por correo: membresías y compras guardan el correo de quien pagó. Si no hay cuenta (o el correo no está
confirmado) quedan con `user_id` vacío y la función `link_billing_to_user` las enlaza **cuando la usuaria confirma
ese correo**. Así nadie puede reclamar compras ajenas registrándose con un correo que no es suyo.

## 3. Flujos

### 3.1 Registro → confirmación → prueba gratis → portal

1. `/membresia` → "Empezar 7 días gratis" → `/cuenta/crear?plan=flare-mensual` (o `flare-anual`).
2. La usuaria crea su cuenta. Supabase le manda el correo de confirmación con un enlace
   `/cuenta/?token_hash=…&type=email` (plantilla 7.1). El plan elegido queda en `localStorage`
   (`tfc:pending-plan`) para retomarlo. Si el correo no llega, "Reenviar el correo" (con espera de 60 s).
3. Al abrir el enlace, en cualquier navegador o dispositivo (también desde la app de Gmail u Outlook),
   la web lo verifica con `verifyOtp`, limpia la URL y queda con sesión. El trigger enlaza compras previas
   hechas con ese correo. El plan elegido se retoma automáticamente solo en el navegador donde se registró;
   en otro, lo vuelve a elegir en `/membresia`.
4. En el portal aparece "Continuar con Flare Mensual" → `startMembershipCheckout()` (`src/lib/checkout.ts`)
   → `crear-checkout`:
   - valida el JWT con Auth y que el correo esté confirmado;
   - rechaza si ya hay una membresía viva (trialing/active/past_due);
   - crea/obtiene el cliente en Recurrente (`POST /api/customers`) para prellenar nombre y correo;
   - crea el checkout (`POST /api/checkouts`) con un ítem inline recurrente: USD 15/mes o USD 165/año,
     `free_trial_interval: "week"` × 1 (Recurrente no acepta días), `tax_category: "service"`, y metadata
     `flare_user_id`, `flare_plan`, `flare_email`, `flare_trial`;
   - responde `{ url }` y la web redirige a Recurrente.
5. La usuaria pone su tarjeta (no se cobra). Recurrente avisa `setup_intent.succeeded` + `subscription.create`
   → el webhook crea la membresía en **trialing** con `trial_ends_at` = +7 días.
6. Recurrente la devuelve a `/cuenta/?pago=ok`; el portal lee `subscriptions` y muestra "Prueba gratis hasta…".
7. Día 7: primer cobro → `intent.succeeded` / `payment_intent.succeeded` → **active** con `current_period_end`
   (el de Recurrente; si no viene, +1 mes / +1 año). Cada renovación llega igual.
8. Cobro fallido → **past_due**. Recurrente reintenta; si falla por tercera vez manda `subscription.cancel`
   → **canceled** (se conserva `current_period_end`).
9. Si ella cancela desde Mi cuenta: ver 3.3.

Si Supabase no pidiera confirmación, el paso 4 ocurre de una vez al crear la cuenta.

**Una prueba por cuenta:** quien ya tuvo una membresía (aunque la cancelara) vuelve sin prueba gratis
(`ONE_TRIAL_PER_ACCOUNT` en `_shared/catalog.ts`). Pendiente de confirmar con las fundadoras.

### 3.2 Estados de la membresía según el aviso de Recurrente

| Aviso | Resultado |
|---|---|
| `setup_intent.succeeded` (tarjeta guardada, prueba iniciada) | trialing (+7 días). Nunca baja una membresía ya activa. |
| `subscription.create` | trialing si el checkout tenía prueba, si no active. Guarda el id `su_…`. |
| `intent.succeeded` / `payment_intent.succeeded` de una membresía | active + fin de periodo. |
| `intent.failed` / `payment_intent.failed` | past_due (solo si estaba activa o en prueba). |
| `setup_intent.cancelled` | past_due (si estaba en prueba). |
| `subscription.past_due` / `subscription.pause` | past_due. |
| `subscription.unpause` / `subscription.reactivate` | active. |
| `subscription.cancel` | canceled + `canceled_at`. `current_period_end` queda en el fin del periodo pagado (o de la prueba) y un aviso tardío nunca acorta esa fecha. Una cancelada solo revive con un cobro o una reactivación. |
| `subscription.update`, `item_*` | Solo sincroniza id y fechas. |
| Otros (`refund.*`, `dispute.*`, `intent.pending`…) | Se registran y se ignoran. |

Recurrente manda **cada pago dos veces** (formato unificado `intent.*` y legacy `payment_intent.*`). Se procesan
los dos a propósito (el legacy trae el id de la suscripción) y todo es idempotente: una compra por checkout, los
estados no retroceden, y una fecha calculada no pisa la que dio Recurrente.

### 3.3 Cancelar la membresía (Mi cuenta)

1. Mi cuenta → Tu membresía → "Cancelar membresía" → confirmación → `cancelMembership()`
   (`src/lib/checkout.ts`) → función `cancelar-membresia` con el JWT de la usuaria.
2. La función valida la sesión contra Auth, busca SUS membresías vivas (trialing/active/past_due) y llama
   `DELETE /api/subscriptions/{id}` en Recurrente, que deja de cobrar desde ya (Recurrente no tiene "cancelar
   al final del periodo": ese acceso lo damos nosotras).
3. Marca la fila `canceled`, con `canceled_at` y con `current_period_end` = hasta cuándo conserva el acceso:
   el fin del periodo pagado o, si canceló en la prueba gratis, el fin de la prueba.
4. Responde `{ ok: true, currentPeriodEnd }` y el portal muestra "Cancelada · tienes acceso hasta {fecha}".
   Esa fecha es la misma que queda en `subscriptions`, así que se ve igual al recargar.
5. Después llega `subscription.cancel` al webhook: no cambia nada ni acorta la fecha.

| Caso | Respuesta |
|---|---|
| Ya estaba cancelada (doble clic, otra pestaña, o el webhook llegó antes) | `{ ok: true, currentPeriodEnd }` con la misma fecha. |
| No tiene membresía viva | 404 "No tienes una membresía activa para cancelar." |
| La membresía aún no tiene id de Recurrente (no llegó `subscription.create`) | 409: pide escribir a hola@theflare.club. No se marca nada para no mostrarla cancelada mientras Recurrente sigue cobrando. Se cancela a mano (sección 6). |
| Recurrente no responde o falla | 502 "No pudimos cancelar tu membresía en este momento…". Se puede reintentar: si en Recurrente ya no existe (404), se marca igual. |
| Sesión vencida / sin sesión | 401. |

En modo demo, `cancelMembership()` marca la membresía simulada como cancelada con fin = fin de la prueba.

### 3.4 Entradas a eventos (links públicos)

1. El botón "Comprar entrada" abre el `ticketUrl` de Recurrente (link público).
2. Al pagar, el webhook ve el producto → busca en `recurrente_products` → `event:<slug>` → inserta en `purchases`
   con el correo de quien pagó.
3. Si ese correo es de una cuenta confirmada, la compra aparece de una vez en "Tus eventos"; si no, cuando
   se registre y confirme ese mismo correo.
4. Los links públicos no aceptan metadata ni prellenan el correo: **hay que pagar con el mismo correo de la
   cuenta**. La página del evento lo dice debajo de "Comprar entrada" (con sesión, muestra su correo). Conviene
   repetirlo en el correo de confirmación de Recurrente.

Lista de asistentes de un evento: `select email, created_at from purchases where item_key = 'event:<slug>';`

### 3.5 Cursos (se compran aparte de la membresía)

`crear-checkout` ya acepta `{ kind: "course", slug, successUrl, cancelUrl }`: pago único, metadata
`flare_item_key: "course:<slug>"`, y el webhook lo registra en `purchases` ("Tus cursos"). Hoy los cursos están
"Próximamente", así que el catálogo `COURSES` de `_shared/catalog.ts` está vacío. Para vender uno:
1. Agregar `"<slug>": { name, amountCents, currency }` en `COURSES` y redesplegar `crear-checkout`.
2. Agregar en la web un botón "Comprar curso" que llame a la función (hoy `src/lib/checkout.ts` solo tiene
   la membresía).

### 3.6 Modo demo

Sin `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` la web no llama a Supabase: la cuenta, los
favoritos, el historial y una prueba gratis simulada viven en `localStorage`. También se puede cancelar la
membresía simulada y, en la página de un evento, "Simular compra (modo demo)" para ver cómo queda en Tus eventos.
Sirve para revisar la experiencia.

## 4. Seguridad

- La service role solo existe dentro de las funciones (la inyecta Supabase). La web usa la llave pública y RLS.
- `crear-checkout`: valida el JWT contra Auth, exige correo confirmado, pone los precios en el servidor, solo
  acepta URLs de regreso de orígenes propios y solo responde CORS a `ianz98-lab.github.io`, `localhost:3000` y
  `theflare.club` (más los de `ALLOWED_ORIGINS`).
- `recurrente-webhook`: verifica la firma Svix con WebCrypto (HMAC-SHA256, tolerancia de 5 min, comparación en
  tiempo constante), es idempotente por `svix-id` y solo confía en `flare_user_id` porque esa metadata solo la
  puede poner nuestra función (requiere la llave secreta). El enlace por correo exige correo confirmado.
- Respuestas del webhook:
  - **200** si se procesó, si el aviso no nos importa o si no se puede asociar por un motivo permanente
    ("sin mapeo", "sin correo"): queda cerrado (`processed_at`) con el motivo en `billing_events.error`.
  - **400** si la firma es inválida.
  - **503** si falta el secreto o si hubo una **falla pasajera** (PostgREST o Auth con 5xx, timeout de 10 s,
    sin red, o Recurrente sin responder cuando hacía falta para asociar el pago). El aviso queda abierto
    (`processed_at` vacío, con el error) y Svix lo reintenta; el reintento lo reprocesa desde cero, y como
    todo es idempotente no duplica nada. Así una compra o una prueba pagada no se pierde por un timeout.
  - **500** si no se pudo ni registrar el aviso.
- `cancelar-membresia`: valida el JWT contra Auth, solo toca las membresías de ESA usuaria (`user_id` del
  JWT), la llave de Recurrente solo vive en el servidor y tiene el mismo CORS que `crear-checkout`. Las
  usuarias no pueden escribir en `subscriptions` por la API (solo leen lo suyo).
- `verify_jwt = false` en las tres funciones (`supabase/config.toml`): el webhook no recibe JWT de Supabase, y
  `crear-checkout` y `cancelar-membresia` lo validan por dentro (compatible con llaves legacy y nuevas, y
  responden el preflight de CORS).
- Permisos explícitos en 0002: la web solo puede leer lo suyo, escribir favoritos/historial/su nombre e
  insertar formularios; cobros y bitácora son solo de la service role. Sirve también en proyectos que no
  exponen las tablas nuevas a la API por defecto.
- Catálogo (0001, Fase 3): lectura pública de metadatos, pero **sin** `videos.provider_id` (id de Vimeo) ni
  `course_lessons.resources` (grants por columna). Esos datos los entregará una función que valide membresía
  o compra. Las consultas públicas a esas dos tablas tienen que listar columnas (`select=*` da error).

### 4.1 Formularios (`leads`) y spam

Hoy:
- La llave pública solo puede **insertar** en `leads` (con `status = 'nuevo'`); no puede leer, editar ni borrar.
- Los CHECK de la tabla topan los largos (correo 254, nombre y empresa 200, teléfono 40, mensaje 5000). Los
  formularios usan esos mismos `maxLength` y, si aun así el CHECK falla (código `23514`), muestran un mensaje
  específico en vez del genérico.
- **Honeypot:** `LeadForm` y `CorporateForm` tienen un campo oculto `website` que una persona no ve ni llena
  (y los lectores de pantalla no anuncian); un bot que llena todo, sí. Si viene lleno, la web finge éxito y
  no inserta nada.

El honeypot frena bots que llenan el formulario, no a alguien que llame a la API directo con la llave pública.
Mejora recomendada si llega spam (o antes de promocionar los formularios):
1. **Cloudflare Turnstile** (gratis, sin acertijos): widget en los formularios + Edge Function `enviar-lead`
   que valida el token en `https://challenges.cloudflare.com/turnstile/v0/siteverify` (secreto
   `TURNSTILE_SECRET_KEY`) e inserta con la service role. Luego quitar el insert público:
   `drop policy "cualquiera puede dejar sus datos" on public.leads; revoke insert on public.leads from anon, authenticated;`
2. **Límite por IP y por correo** en esa misma función (p. ej. 5 envíos por hora por IP, con `x-forwarded-for`,
   y uno por correo y tipo cada 10 minutos).

## 5. Variables y secretos

| Nombre | Dónde | Para qué |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | variable del repo (GitHub) y `.env.local` | URL del proyecto. Vacía = modo demo. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | variable del repo y `.env.local` | Llave pública (anon o `sb_publishable_…`). |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` | las pone Supabase en cada función | No se configuran. |
| `RECURRENTE_SECRET_KEY` | secreto de funciones | Crear clientes y checkouts, leer y cancelar suscripciones. |
| `RECURRENTE_WEBHOOK_SECRET` | secreto de funciones | `whsec_…` del endpoint del webhook. |
| `SITE_URL` (opcional) | secreto de funciones | Base para volver tras pagar si la web no manda las URLs. |
| `ALLOWED_ORIGINS` (opcional) | secreto de funciones | Orígenes extra para CORS y URLs de regreso. |

## 6. Operación

```sql
-- Últimos avisos de Recurrente y si fallaron
select id, type, received_at, processed_at, error from public.billing_events order by received_at desc limit 50;
select id, type, error from public.billing_events where error is not null order by received_at desc;

-- Avisos abiertos: Svix los está reintentando (falla pasajera) o se cortaron a medias
select id, type, received_at, error from public.billing_events where processed_at is null order by received_at;

-- Membresías (en una cancelada, current_period_end = hasta cuándo conserva el acceso)
select email, plan_slug, status, trial_ends_at, current_period_end, canceled_at, user_id is not null as con_cuenta
from public.subscriptions order by created_at desc;
```

- **"sin mapeo"** en `billing_events.error`: llegó un pago de un producto que no está en `recurrente_products`
  (el error trae el `prod_…`). Se agrega el producto y se reprocesa.
- **Aviso abierto con error** (`processed_at` vacío): fue una falla pasajera y Svix lo sigue reintentando
  (durante aproximadamente un día, cada vez más espaciado). No hay que hacer nada; si ya agotó los reintentos
  (en Svix aparece como fallido), corregir la causa y "Resend" (abajo).
- **Reprocesar un aviso:** corregir la causa, luego
  `update public.billing_events set processed_at = null, error = null where id = '<svix-id>';`
  y en el dashboard de Svix (Recurrente → Configuración → Desarrolladores y API → Webhooks) abrir el mensaje y
  "Resend". El webhook ve que no estaba procesado y lo vuelve a correr.
- **Cancelar a mano** (si `cancelar-membresia` respondió "Escríbenos…" porque la membresía no tenía id de
  Recurrente): cancelarla en Recurrente → Suscripciones. El webhook recibe `subscription.cancel` y la marca
  cancelada, con acceso hasta el fin del periodo (o de la prueba).
- **Reembolsos** (`refund.create`): no se tocan solos. Si se devuelve una entrada o un curso, borrar la fila de
  `purchases` a mano.
- **Cambio de precios:** `_shared/catalog.ts` + `src/content/plans.ts` + `docs/03-pricing.md`, y redesplegar.
  Las membresías existentes siguen con su precio en Recurrente.

## 7. Checklist para activar

Proyecto de Supabase: **"ianz98-lab's Project"** (`jqaxonrzbyjppuqvppfw`, hoy vacío).
URL de funciones: `https://jqaxonrzbyjppuqvppfw.supabase.co/functions/v1/`.

### Supabase
- [ ] **Migración 0002.** Dashboard → SQL Editor → pegar `supabase/migrations/0002_cuentas.sql` y ejecutar.
  No usar `supabase db push` todavía: aplicaría también `0001_schema.sql` (catálogo de contenido de la Fase 3).
  Verificar en Table Editor las 8 tablas con RLS activado y en Advisors que no haya alertas de seguridad.
  (0002 todavía no se ha aplicado en ningún lado, por eso `canceled_at` y los permisos explícitos se
  agregaron ahí mismo y no en una 0003. Desde que se aplique, cualquier cambio va en una migración nueva.)
- [ ] **Auth → URL Configuration.** Site URL: `https://ianz98-lab.github.io/TheFlareClub/`.
  Redirect URLs: `https://ianz98-lab.github.io/TheFlareClub/**` y `http://localhost:3000/**`
  (al lanzar, agregar `https://theflare.club/**` y cambiar el Site URL). Tienen que cubrir `/cuenta/` y
  `/cuenta/nueva-contrasena/`: si el redirect que pide la web no está permitido, Supabase usa el Site URL y el
  enlace del correo cae en la portada.
- [ ] **Auth → Sign In / Providers → Email.** "Confirm email" activado; largo mínimo de contraseña 8
  (`MIN_PASSWORD` en `src/lib/auth.tsx`).
- [ ] **Auth → Emails → Templates en español** (ver 7.1).
- [ ] **SMTP propio** (Auth → Emails → SMTP Settings) antes de invitar a nadie: el correo por defecto de Supabase
  solo envía a los miembros del equipo del proyecto y con un límite muy bajo por hora. Opciones: Google
  Workspace de `theflare.club` (smtp.gmail.com, contraseña de aplicación) o Resend con el dominio verificado.
  Remitente: "The Flare Club".
- [ ] Copiar **Project URL** y la **llave pública** (Settings → API Keys).

### GitHub (prototipo en Pages)
- [ ] Variables del repo:
  ```bash
  gh variable set NEXT_PUBLIC_SUPABASE_URL --body "https://jqaxonrzbyjppuqvppfw.supabase.co"
  gh variable set NEXT_PUBLIC_SUPABASE_ANON_KEY --body "<llave pública>"
  ```
  y volver a correr el workflow "Prototipo en GitHub Pages". Local: las mismas en `.env.local`.

### Recurrente
- [ ] **Cuenta verificada.** Sin verificar, Recurrente no deja procesar más de Q500 / USD 50 **acumulados**: el
  plan anual (USD 165) ni siquiera abre el checkout y las entradas se bloquean después de la primera.
- [ ] **Pedir un Sandbox** a soporte@recurrente.com para probar. La llave `sk_test_` "legacy" simula pagos pero
  **no crea suscripciones**, así que no sirve para probar la prueba gratis ni las renovaciones.
- [ ] Llave secreta: `sk_test_…` del Sandbox para probar; `sk_live_…` para lanzar.

### Funciones
- [ ] Desplegar:
  ```bash
  npx supabase login
  npx supabase link --project-ref jqaxonrzbyjppuqvppfw
  # 0002 se aplicó a mano en el SQL Editor: registrarla para que un `db push` futuro no la repita.
  # (0001 = catálogo de contenido, queda pendiente para la Fase 3.)
  npx supabase migration repair --status applied 0002
  npx supabase secrets set RECURRENTE_SECRET_KEY=sk_test_... SITE_URL=https://ianz98-lab.github.io/TheFlareClub
  npx supabase functions deploy crear-checkout
  npx supabase functions deploy cancelar-membresia
  npx supabase functions deploy recurrente-webhook
  ```
  (`supabase/config.toml` ya pone `verify_jwt = false` en las tres).
- [ ] **Endpoint del webhook en Recurrente:** Configuración → Desarrolladores y API → Webhooks → agregar
  `https://jqaxonrzbyjppuqvppfw.supabase.co/functions/v1/recurrente-webhook` con los eventos
  `intent.succeeded`, `intent.failed`, `payment_intent.succeeded`, `payment_intent.failed`,
  `setup_intent.succeeded`, `setup_intent.cancelled` y todos los `subscription.*`.
  Copiar el signing secret (`whsec_…`) desde el dashboard de Svix y cargarlo:
  `npx supabase secrets set RECURRENTE_WEBHOOK_SECRET=whsec_...` (no hace falta redesplegar).
  Alternativa por API: `POST /api/webhook_endpoints` devuelve `signingSecret` solo en esa respuesta.
- [ ] **Productos de links públicos** en `recurrente_products`. Night Edition Vol. 1 (link
  `https://app.recurrente.com/s/theflareclub/night-edition-vol-1-8-de-oct-zona-15`): buscar su `prod_…` en
  Recurrente → Productos (o `curl -H "X-SECRET-KEY: $KEY" https://app.recurrente.com/api/products`) y:
  ```sql
  insert into public.recurrente_products (product_id, item_key, note)
  values ('prod_...', 'event:night-edition-vol-1-oct-2026', 'Night Edition Vol. 1 · 8 oct 2026 · link público');
  ```
  Si se escapa, la primera venta queda en `billing_events` con "sin mapeo" y el `prod_…`: se inserta y se
  reprocesa (sección 6). Repetir con cada evento nuevo que salga a la venta.
- [ ] **Prueba punta a punta** (Sandbox): crear cuenta con un correo real → confirmar → "Continuar con Flare
  Mensual" → pagar con `4242 4242 4242 4242` → volver a `/cuenta/?pago=ok` → "Prueba gratis hasta…".
  Revisar `billing_events` sin errores. Con un Test Clock adelantar 7 días → active; con
  `4000 0000 0000 0002` → past_due. Comprar una entrada de prueba → aparece en "Tus eventos".
  Mi cuenta → "Cancelar membresía" → "Cancelada · tienes acceso hasta…", en Recurrente queda cancelada y
  `subscription.cancel` entra sin error y sin cambiar la fecha.
  Correos: abrir el de confirmación y el de "Recuperar contraseña" en OTRO navegador (o desde la app de
  Gmail en el celular) → tienen que funcionar igual.
- [ ] **Lanzar:** cambiar `RECURRENTE_SECRET_KEY` a `sk_live_…`, crear el endpoint del webhook en LIVE (tiene
  otro `whsec_…`) y actualizar `RECURRENTE_WEBHOOK_SECRET`.

### 7.1 Plantillas de correo (Auth → Emails → Templates)

**Por qué `token_hash` y no `{{ .ConfirmationURL }}`:** la web usa PKCE, y el enlace por defecto
(`?code=…`) solo funciona en el MISMO navegador donde se pidió (el verificador vive en su `localStorage`).
Si la usuaria pide "Recuperar contraseña" en Safari y abre el correo en la app de Gmail, o en otro dispositivo,
llega sin sesión y el enlace ya quedó gastado. Con `token_hash` el enlace lleva el token y la web lo verifica
donde se abra: `AuthProvider` (`src/lib/auth.tsx`) lee `token_hash` y `type`, llama `verifyOtp`, limpia la URL
y, si es `recovery`, abre "Elige tu contraseña nueva". Los enlaces viejos con `?code=` siguen funcionando.
Ventaja extra: los antivirus de correo que "prueban" los enlaces no los gastan, porque el token solo se usa
cuando la página corre en un navegador.

`{{ .RedirectTo }}` es la dirección que manda la web (`/cuenta/` al registrarse o reenviar el correo,
`/cuenta/nueva-contrasena/` al recuperar), ya validada contra las Redirect URLs. Nunca lleva `?`, por eso la
plantilla agrega `?token_hash=…`. Si la web algún día agrega parámetros a esas direcciones, hay que cambiar
el `?` de las plantillas por `&`.

**Confirm signup** · Asunto: `Confirma tu correo · The Flare Club`
```html
<h2>Te damos la bienvenida a The Flare Club</h2>
<p>Confirma tu correo para activar tu cuenta y seguir con tu membresía.</p>
<p><a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">Confirmar mi correo</a></p>
<p>Puedes abrir el enlace en cualquier navegador o dispositivo. Sirve una sola vez.</p>
<p>Si no creaste una cuenta, ignora este mensaje.</p>
```

**Reset password** · Asunto: `Cambia tu contraseña · The Flare Club`
```html
<h2>Cambia tu contraseña</h2>
<p>Recibimos una solicitud para cambiar la contraseña de tu cuenta.</p>
<p><a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery">Elegir una contraseña nueva</a></p>
<p>Puedes abrir el enlace en cualquier navegador o dispositivo. Sirve una sola vez.</p>
<p>Si no fuiste tú, ignora este mensaje: tu contraseña no cambia.</p>
```

Las dos que siguen no las usa la web hoy (no se puede cambiar el correo ni entrar con enlace), pero conviene
dejarlas en español. Si algún día se usan, pasarlas al mismo formato con `type=email_change` y `type=magiclink`.

**Change email address** · Asunto: `Confirma tu nuevo correo · The Flare Club`
```html
<h2>Confirma tu nuevo correo</h2>
<p>Confirma el cambio de {{ .Email }} a {{ .NewEmail }}.</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar el cambio</a></p>
```

**Magic link** · Asunto: `Tu enlace para entrar · The Flare Club`
```html
<h2>Entra a The Flare Club</h2>
<p><a href="{{ .ConfirmationURL }}">Entrar a mi cuenta</a></p>
<p>Si no lo pediste, ignora este mensaje.</p>
```

## 8. Pendientes y decisiones abiertas

- **Acceso hasta el fin del periodo.** Al cancelar (desde Mi cuenta o desde Recurrente) `current_period_end`
  queda en la fecha hasta la que conserva el acceso (fin del periodo pagado o de la prueba). El control de
  acceso al contenido (Vimeo privado) debe dar acceso mientras `status in ('trialing','active','past_due')` o
  `status = 'canceled' and current_period_end > now()`. Recomendación: para `active` exigir también
  `current_period_end > now() - interval '3 days'` (con margen por si una renovación llega tarde), así una
  membresía que quedó `active` sin más cobros (p. ej. un cobro que entró justo después de cancelar) no da
  acceso para siempre.
- **Volver antes de que termine el periodo.** Hoy, si una usuaria cancelada vuelve a "Empezar", `crear-checkout`
  abre un checkout nuevo que cobra desde el primer día aunque aún le queden días pagados. Opciones: avisarlo
  en ese momento ("tu nuevo periodo empieza hoy") o no abrir el checkout hasta que termine el periodo.
  Decidir con las fundadoras.
- **Una prueba gratis por cuenta** (`ONE_TRIAL_PER_ACCOUNT`): confirmar con las fundadoras.
- **Correo distinto al pagar una entrada:** la compra queda por correo y no aparece en el portal hasta que
  alguien confirme una cuenta con ese correo.
- **Reembolsos y contracargos:** manuales por ahora.

## Portal "Mi cuenta" (30-sep, después de la auditoría)
- Secciones: Tu membresía · Continuar viendo · Lo que ya viste · Favoritos · Tus cursos · Tus eventos · Tus rutinas ·
  Workbooks · Ajustes. Las secciones vacías se ocultan (y su ancla en el índice); una cuenta nueva ve "Empieza aquí"
  con las rutinas predeterminadas y tres opciones de "¿Qué necesitas hoy?".
- La prueba gratis es una sola por cuenta (igual que `crear-checkout`): quien ya tuvo membresía ve "Elegir {plan}" y el
  cobro desde hoy.
- Sin correo publicado: `CONTACT_EMAIL = null` en `src/components/account/copy.ts` hasta que exista el buzón.

