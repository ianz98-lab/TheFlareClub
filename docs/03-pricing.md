# Pricing

> Definido por las fundadoras el 30-sep-2026 ("CAMBIOS PAGINA WEB.docx"). Código: `src/content/plans.ts`.

## Membresía personal

| Plan | Precio | Incluye |
|---|---|---|
| **Flare Mensual** | USD 15 / mes | Todas las clases de Movement, Arma tu rutina, biblioteca de meditaciones, charlas y sus grabaciones, workbooks incluidos en membresía, favoritos y continuar viendo, nuevo contenido conforme se publique. |
| **Flare Anual** | USD 165 / año | Exactamente lo mismo. El incentivo es el precio: **ahorra USD 15** (12 × 15 = 180). |
| **Prueba gratis** | 7 días | "7 días gratis. Cancela cuando quieras." Se pide tarjeta; se renueva automáticamente salvo que se cancele antes. |

Letra pequeña bajo cada botón:
- Mensual: "Después de los 7 días gratis, tu membresía se renovará automáticamente por USD 15 al mes hasta que decidas cancelarla."
- Anual: "… por USD 165 al año hasta que decidas cancelarla."

Decisiones:
- **Sin "Más elegido"** en el anual al lanzar: todavía no hay datos. Se puede poner cuando los haya.
- **Sin beneficios extra en el anual** (se quitaron: acceso anticipado a cursos, 15% en eventos, workbook premium,
  comunidad privada) salvo que las fundadoras decidan comprometerse a darlos.

## Se compra aparte (no entra en la membresía)
- **Cursos**: cada curso se compra por separado (hoy están "Próximamente", con lista de espera).
- **Eventos**: cada evento tiene su link de pago de Recurrente (`ticketUrl` en `src/content/events.ts`).

## Empresas y marcas
Ya no hay paquetes con precio (Team / Experiencia / Programa anual). Todo entra por el formulario
"Cotiza una experiencia" (`/corporativo#cotizar`): experiencias para colaboradores y para marcas (PR, lanzamientos,
activaciones), cotizadas a la medida. Los datos llegan a la tabla `leads` (tipo `corporativo`).

## Cobro
Todo se cobra con **Recurrente**. Membresías y cursos: checkout creado por la Edge Function `crear-checkout`
(con la usuaria en la metadata); eventos: link público. El webhook `recurrente-webhook` activa membresías y registra
compras. Detalle y checklist de activación en `docs/06-cuentas-y-pagos.md`.
