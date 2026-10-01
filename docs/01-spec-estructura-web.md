# THE FLARE CLUB — ESTRUCTURA DE PÁGINA WEB

> Spec funcional entregada por Ian (28-sep-2026). Fuente de verdad para las secciones
> y el CMS. Diagrama visual: `brand/referencias/sitemap-estructura-web.jpeg`.

## MENÚ PRINCIPAL (actualizado 30-sep-2026)
1. Inicio · 2. Movement · 3. Meditaciones · 4. Workbooks · 5. Charlas · 6. Cursos — Próximamente ·
7. Podcast · 8. Eventos · 9. Corporativo · 10. Sobre nosotras (`/sobre-nosotras`) · Mi cuenta

> **Cambios pedidos por las fundadoras (CAMBIOS PAGINA WEB.docx, 30-sep-2026).** Donde este spec
> diga otra cosa, manda esto:
> - **Arma tu rutina** no es sección del menú: es una herramienta destacada DENTRO de Movement
>   ("¿No sabes qué hacer hoy?"). Rutinas predeterminadas: Solo 5 (5 min), Muévete 15, Tu media hora (30),
>   Una hora para ti (60).
> - "Warm-ups" y "stretching" se dicen **calentamientos** y **estiramientos** en toda la UI.
> - **Cursos**: "Algo nuevo está por llegar" + lista de espera (sin catálogo por ahora). Se compran aparte
>   de la membresía.
> - **Charlas**: charlas EN VIVO con expertos; las grabaciones aparecen después. Hoy: estado vacío +
>   "Activar notificaciones" por correo.
> - **Workbooks**: un solo workbook ("Autoconociéndome para decidir de nuevo"), sin filtros ni contador;
>   la descarga es el CTA principal. Categorías cuando haya suficientes.
> - **Podcast**: episodios reales de Spotify (sin categorías inventadas).
> - **Eventos**: "Nos encontramos fuera de la pantalla"; 6 eventos anteriores con flyer y galería; cada
>   evento a la venta va al link de pago de Recurrente.
> - **Corporativo**: experiencias para empresas y para marcas (PR, lanzamientos, activaciones); sin
>   paquetes; formulario: empresa, nombre, teléfono, correo, qué quiere cotizar.
> - **Mi cuenta**: registro y portal con continuar viendo, clases y videos ya vistos, favoritos, cursos y
>   eventos comprados, rutinas guardadas. Ver `docs/06-cuentas-y-pagos.md`.
> - **Inicio** se arma con los mismos textos y datos de cada sección (`src/content/site.ts`), así se
>   actualiza sola cuando cambia una página.

---

# 1. INICIO
### Hero principal
- Imagen/video principal · Breve descripción de The Flare Club · CTA: Explorar la plataforma
### Accesos rápidos
- Movement · Meditaciones · Cursos · Charlas · Workbooks
### ¿Qué necesitas hoy?
- Tengo 5 minutos · Tengo 10 minutos · Tengo 20 minutos · Quiero una clase completa ·
  Quiero estirarme · Quiero meditar
### Contenido destacado
- Clases nuevas · Meditaciones destacadas · Cursos · Charlas nuevas
### The Flare Club
- Próximos eventos · Último episodio del podcast · CTA para conocer más

---

# 2. MOVEMENT — biblioteca principal de clases pregrabadas

## A. PILATES MAT
**Tipo de clase**: Pilates Flow (movimiento fluido, control y conexión) · Pilates Strength
(fuerza y resistencia)

- **5 minutos por zona**: Arms · Abs · Glutes · Inner Thighs · Back · Biceps · Shoulders ·
  Triceps · Hamstrings · Quads
- **10 minutos**: Legs · Abs · Arms
- **20 minutos**: Upper Body · Lower Body · Full Body
- **Clases completas**: 30 min · 40 min

## B. BARRE
- Barre 20 min · Barre 40 min
- Preparar estructura para agregar: Barre Arms · Barre Abs · Barre Glutes · Barre Legs ·
  Full Body Barre

## C. WARM UPS
- Upper Body · Lower Body · Full Body — duración aprox. 5–10 min
- Se comparten entre clases: cada clase puede apuntar a un warm-up.

## D. STRETCHING
- Upper Body (5 / 10 min) · Lower Body (5 / 10 min) · Full Body (5 / 10 min)

## FILTROS DE MOVEMENT
- **Duración**: 5 · 10 · 20 · 30 · 40 min
- **Tipo**: Pilates · Barre · Warm Up · Stretching
- **Enfoque**: Full Body · Upper Body · Lower Body · Arms · Abs · Glutes · Back · Legs

Cada video puede pertenecer a más de una categoría/filtro.
Ej. "10 Min Pilates Abs" → Pilates · 10 min · Abs · Pilates Strength.

---

# 3. MEDITACIONES — biblioteca de meditaciones pregrabadas
**Categorías (momento)**
- Morning: para iniciar el día · intención del día · energía para comenzar
- Night: para dormir · soltar el día · relajación
- Stress: momentos de estrés · calmar la mente · volver al presente
- Abundance: abundancia · gratitud · recibir
- Otras: Confianza · Amor propio · Soltar · Claridad · Gratitud · Volver a ti

**Filtros por duración**: 5 · 10 · 15 · 20 min

---

# 4. CURSOS — biblioteca de cursos digitales (cada curso con su propia página)
Página individual: Portada · Nombre · Descripción · Instructor/a · Duración · Número de
módulos · Módulos/lecciones · Videos · Recursos descargables · Workbooks asociados ·
Progreso del usuario. Agregar cursos sin tocar diseño.

---

# 5. CHARLAS — charlas virtuales pregrabadas por expertos
Categorías: Nutrición · Autoestima · Imagen personal · Relaciones · Hábitos · Manejo del
estrés · Bienestar · Productividad · Sueño · Finanzas personales
Cada charla: Título · Experto/a · Especialidad · Descripción · Duración · Video

---

# 6. WORKBOOKS — recursos descargables
Ejemplos: Vision Board · Monthly Reset · Weekly Reset · Journaling Prompts · Gratitude
Journal · Goal Setting · End of Year Reflection · New Year · Future Self · Habit Tracker
Cada uno: Portada · Título · Descripción · Botón descargar/acceder
Tipos: incluidos en membresía · gratuitos · pago individual

---

# 7. PODCAST — "Decide de Nuevo"
Página: descripción · último episodio · biblioteca de episodios
Categorías: Relaciones · Amor propio · Ego · Percepción · Crecimiento personal · Volver a ti
Episodio: Título · Imagen · Descripción · Duración · Reproductor o link (Spotify).
**No se alojan episodios en la web: solo redirección a Spotify.**

---

# 8. EVENTOS
Próximos: Imagen · Nombre · Fecha · Horario · Ubicación · Descripción · Precio ·
Qué incluye · CTA Comprar entrada. Categorías: The Flare Club Events · Night Editions
Anteriores: galería/recap (fotos · videos · nombre · fecha · descripción)

---

# 9. CORPORATIVO — The Flare Club for Companies
Servicios: Pilates · Meditaciones · Journaling · Vision Boards · Actividades creativas ·
Charlas con expertos · Eventos especiales · Programas anuales de bienestar
CTA: **Cotiza una experiencia**
Formulario: Nombre · Empresa · Puesto · Email · Teléfono · Nº aprox. de colaboradores ·
Tipo de experiencia · Fecha aproximada · Mensaje

---

# 10. NOSOTRAS
The Flare Club: Historia · Concepto · Qué significa "Flare" · Filosofía · Fotos
Fundadoras: **Mariana Wer** (foto, bio) · **Sofi Wer** (foto, bio)

---

# 11. MI CUENTA — área privada
Perfil: Nombre · Email · Info de membresía
Mi contenido: Continuar viendo · Clases favoritas · Meditaciones favoritas · Cursos ·
Progreso de cursos · Workbooks
Membresía: Plan actual · Estado · Próximo cobro · Administrar

---

# FUNCIONALIDADES GENERALES (Admin / CMS)
Subir videos · Crear clases · Asignar múltiples categorías/filtros · Crear meditaciones ·
Crear cursos y módulos · Subir workbooks · Crear charlas · Crear/editar eventos ·
Marcar destacado · Cambiar imágenes y textos sin código · Definir público vs membresía ·
Definir gratis vs pago · Administrar usuarios · Administrar membresías.

- **Videos**: no se alojan en el servidor; se integran desde plataforma privada (Vimeo).
- **Favoritos**: clases, meditaciones, charlas, cursos.
- **Continuar viendo**: guardar progreso de video.
- **Responsive**: celular es PRIORIDAD (las usuarias entrenan con el celular), luego
  desktop y tablet.
