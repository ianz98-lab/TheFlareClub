# Marca — The Flare Club

## Logo e ícono
`brand/logo/logo-principal.png` — "THE FLARE" en serif alta (tipo Didot/Bodoni, letras
espaciadas) en espresso, "club" en script terracota, sobre crema. Versión web:
`public/images/logo.png` (480×210, 10 KB, transparente). Sobre espresso (footer) se usa
`public/images/logo-on-dark.png`, la misma pieza en una sola tinta `surface` (no un filtro `invert`).

**Ícono** (decisión D4-B de Ian, 30-sep): la "F" de FLARE en espresso sobre `surface` plano, sacada de
`brand/logo/logo-transparente.png` sin el halo crema del recorte. Archivos en `public/`: `favicon.ico` (16/32/48, la F
algo más gruesa para que se lea), `icon.png` (512), `icon-192.png`, `icon-maskable.png` (512, la F dentro de la zona
segura del 80 %) y `apple-icon.png` (180), todos PNG indexados de pocos KB. Se declaran en `metadata.icons` de
`src/app/layout.tsx` (con el basePath a mano: como archivos de `src/app`, Next perdía el favicon en Inicio) y en
`src/app/manifest.ts`. Se regeneran, junto con `logo-on-dark.png`, con `python scripts/marca/iconos.py`.

## Paleta: neutro + un acento (decisión D2-C de Ian, 30-sep)

Ian eligió entre cuatro direcciones (página "Decisiones visuales Flare"): superficies casi blancas sin tinte, tinta
casi negra y el terracota del logo como **único acento** (~10 % de la pantalla). El calor lo ponen las fotos y el
logo, no el fondo. **No hay colores por módulo**: los bloques pastel (rosa, salvia, cielo, arena) se retiraron.

Fuente de verdad: `@theme` en `src/app/globals.css`. Contrastes medidos sobre `surface`.

| Token (rol) | Hex | Uso |
|---|---|---|
| `surface` | `#F6F5F3` | Fondo de página |
| `surface-alt` | `#ECEBE8` | Solo bloques que de verdad deben separarse (formularios destacados, bandas puntuales) |
| `espresso` | `#2F2823` | Tinta (13.3:1) y superficie oscura: footer, player, visor de fotos |
| `cocoa` | `#5E5651` | Texto secundario (6.6:1 sobre surface, 6.0:1 sobre surface-alt) |
| `accent` | `#B3654A` | Terracota del logo: rellenos, filetes, barras, texto de 24 px o más (3.95:1) |
| `accent-ink` | `#8F4D36` | Terracota para texto chico (5.9:1) y fondo de la acción principal (blanco encima: 6.4:1) |
| `accent-soft` | `#D8A48F` | Terracota claro, solo sobre espresso (6.65:1) |
| `on-accent` | `#FFFFFF` | Texto sobre `accent-ink` |

**Disciplina del acento:** terracota solo en la acción principal de cada pantalla, el dato clave (precio, fecha,
"Próximamente", estado activo) y lo que pide atención. Nunca decorativo.

Los nombres anteriores (`cream`, `sand`, `rose-soft`, `sage-soft`, `sky-soft`, `mauve`, `terracotta`…) se
retiraron el 1-oct: ya no existen como clases. Usar siempre el rol.

### Capa semántica (usar estos en código nuevo)
El rol, no el color. Dentro de un contenedor `.on-dark` se redefinen solos para fondo espresso.

| Token (clase) | Claro | En `.on-dark` | Para qué |
|---|---|---|---|
| `ink` (`text-ink`) | espresso | surface | Texto principal |
| `ink-muted` | cocoa | surface 75 % | Texto secundario, labels, hints |
| `line` | espresso 15 % | surface 15 % | Filete suave, divisores, bordes de tarjeta (`.rule-soft`) |
| `line-strong` | espresso 35 % | surface 35 % | Filete editorial (`.rule`), contorno suave |
| `line-input` | espresso 60 % (≥3.3:1) | surface 55 % (4.9:1) | Borde de campos, chips y casillas (WCAG 1.4.11) |
| `focus` | espresso | surface | Anillo de foco |
| `error` | accent-ink | accent-soft | Errores de formulario |
| `on-ink` | surface | espresso | Texto sobre un relleno `bg-ink` (chip activo, botón `outline` al pasar el mouse) |
| `hover` | espresso 5 % | surface 5 % | Fondo al pasar el mouse por un control sin relleno (`hover:bg-hover`) |
| `press` | espresso 10 % | surface 10 % | Fondo al presionar un control sin relleno (`active:bg-press`); también el resaltado al tocar |
| `scrim` | espresso 70 % | igual | Velo detrás de diálogos y hojas (`backdrop:bg-scrim`, `bg-scrim`) |
| `scrim-strong` | espresso 88 % | igual | Velo sobre un video o una foto con texto encima (aviso de video de muestra) |
| `on-dark-muted` / `on-dark-line` | — | — | Versión explícita de `ink-muted` y `line` oscuros, si no hay `.on-dark` |

Nada de opacidades sueltas (`bg-espresso/10`, `bg-surface/15`…): cada una corresponde a uno de estos roles.

`.on-dark` va en el contenedor de toda superficie espresso: footer, player, barra del constructor, bloque
oscuro de Movement y visor de fotos. Así el foco, los filetes y los campos se ven sin clases especiales.

## Tipografía (decisión D1-A de Ian, 30-sep)
- Display: **Gloock** — serif de alto contraste con remates suaves; hace eco del Didone del logo sin sentirse
  "de periódico". Solo regular y **sin itálica**: nunca `italic` con `font-display` (el navegador la inventaría).
- Texto y UI: **Hanken Grotesk** (variable 400–600) — muy legible entre 12 y 16 px. Su itálica real se carga aparte y
  sin precarga (`--font-hanken-italic`): solo la usan dos frases, con la clase `italic-accent` (no `italic`).
- Alojadas en el repo (`src/fonts`, `next/font/local`, licencia OFL en `src/fonts/OFL.txt`): el sitio no depende de
  Google Fonts. Subconjunto latino (todo el español).
- Acento script: solo en el logo (imagen); no se usa como fuente de UI.
- Escala display (clamp, tope 5.25 rem): `text-display-2xl` solo el H1 de Inicio · `text-display-xl` H1 de página ·
  `text-display-lg` H2 · `text-display-md` H3 y títulos destacados · `text-display-sm` títulos de fila. Gloock es
  ancha: revisar siempre 320/375/768 px.
- Datos (precios, fechas, duraciones) en Hanken con `tabular-nums`.

Tamaños, siempre en rem (crecen con la letra del navegador; nunca `text-[15px]`):

| Clase | Tamaño | Uso |
|---|---|---|
| `.label` | 13 px móvil · 12 px desde md, versalitas | **Solo meta**: duración, fecha, tipo y los kickers del documento de las fundadoras |
| `text-caption` | 13 px | Notas legales y ayudas secundarias (nunca acciones, datos del player ni avisos para decidir) |
| `text-sm` | 14 px | Meta de tarjetas, labels de formulario, hints, errores; lo que se lee para decidir (cobro, cancelación, modo demo: `FormNote`) |
| `text-body-sm` | 15 px | Texto de UI, acciones de texto, párrafos en móvil |
| `text-base` | 16 px | Párrafos; **todo campo de formulario** (con menos, iOS hace zoom) |
| `text-lead` | 17 px | Entradilla |

- Acciones de texto ("Ver todo", "Leer más", "Cerrar sesión"): `.link-action` (15 px, minúscula, subrayado
  fino, 44 px de área táctil). Un enlace dentro de un párrafo: `.link`.
- Títulos display: `font-display` + un token `text-display-*`. `.font-display` además corta palabras con guion
  bajo 640 px y lleva `overflow-wrap: anywhere` (una palabra larga no desborda ni ensancha su fila flex o grid).
  En una fila flex, el título lleva `min-w-0` y lo de al lado `shrink-0`; una grilla de una columna,
  `grid-cols-[minmax(0,1fr)]`.
- Jerarquía: el H1 de una página mide al menos 1.25 veces su H2. Si un H2 queda muy cerca (fichas), bajarlo con
  `SectionHeading size="md"` sin cambiar el nivel del encabezado.
- `h1`, `h2` y `h3` llevan `text-wrap: balance`.

## Lenguaje visual (rediseño 28-sep, pedido por Ian: sin huella de generador)
- **Un solo radio de 6 px** (decisión D3-B de Ian, 30-sep), nombrado por rol: `rounded-control` (botones, chips,
  campos, botones de ícono) y `rounded-media` (fotos, flyers, miniaturas). Los tamaños de Tailwind (`rounded-xs…3xl`,
  también por lado como `rounded-t-md`) se borraron del tema (`--radius-*: initial`): no generan nada y
  `npm run lint` los rechaza. `rounded-full` solo en el botón de play y avatares. Nada de pastillas.
- Fotos limpias con el texto DEBAJO; sin degradados ni texto sobre la imagen.
- Separadores: filetes finos (`.rule`, `.rule-soft`), no cajas. Numeración solo en secuencias reales.
- **Botones en minúscula normal**, 15 px, peso medio, 48–52 px de alto (decisión D3-B): se leen de lejos con el
  celular en el piso. La acción principal va en terracota (`primary`); el resto en contorno. Enlaces subrayados finos.
- Badges = texto pequeño de color, sin fondo. Sin iconos decorativos (`Icon` solo tiene iconos funcionales).
- Sin bandas laterales de color (`border-l` de acento) en ningún lado.
- Motion sí, pero fino y con "reducir movimiento" respetado en todo. Sin grano ni sombras decorativas.
  Sin bloques de color por módulo: superficies neutras y fotos.
- Hero: foto a sangre con el titular montado en un bloque de la superficie neutra. `PageHero` se apila hasta lg (en tablet
  vertical dos columnas recortaban la foto), con el celular acostado la foto queda en una franja de 32 % del alto (el
  título entra en el primer pantallazo), la foto se pide en prioridad alta (es el LCP) y no lleva parallax (queda solo
  en Inicio y Sobre nosotras).

## Sistema: tokens y componentes base

### Layout, capas y motion (variables en `:root`)
- `--gutter` (1.25 → 2 → 3 rem): margen de `.container-x`. Para un carrusel a sangre: `-mx-(--gutter) px-(--gutter)`.
- `--header-h` (4 rem; 5 rem desde lg): fijo, no cambia al ocultar el header. El header oculto se marca con
  `data-header="hidden"` en `<html>`; `.sticky-under-header` y la variante `header-hidden:` reaccionan a eso.
- `--tabbar-h` (3.5 rem) y `--tabbar-space` (barra + zona segura del iPhone; 0 desde md): `pb-(--tabbar-space)`,
  `bottom-(--tabbar-space)`.
- `--subheader-h` y `--bottom-bar-h` (0 por defecto): el componente que muestra una barra fija extra (buscador
  sticky, barra del constructor) escribe su alto en `<html>` y lo devuelve a 0 al irse.
- `scroll-padding` global en `<html>` (header + subheader arriba; barra inferior + bottom-bar abajo): el foco y
  los `#anclas` nunca quedan tapados. **No usar `scroll-mt-[var(--header-h)…]`**: se suma y duplica el espacio.
- Capas: `z-(--z-sticky)` 30 · `--z-header` 40 · `--z-tabbar` 40 · `--z-menu` 45 · `--z-sheet` 50 ·
  `--z-toast` 55 (avisos flotantes, como el del primer favorito) · `--z-modal` 60 · `--z-skip` 70. Nunca números
  sueltos.
- Motion: curva `ease-out-quint`; duraciones `--duration-fast` 200 ms (estados), `--duration-base` 450 ms (header,
  overlays, menús, hojas), `--duration-slow` 700 ms (entradas de texto y bloques), `--duration-media` 800 ms (cortina
  de una foto) y `--duration-settle` 1200 ms (el zoom de la foto bajo la cortina). La fuente es `DUR` en
  `src/lib/motion.ts`; `:root` de globals.css es su copia (si cambia una, cambiar la otra). Nunca segundos sueltos.
  Animar `transform`/`opacity`, no `width`.
- `--opacity-disabled` (0.5) para todo lo deshabilitado.
- Variantes propias: `landscape-short:` (celular acostado, alto ≤ 500 px), `narrow:` (menos de 22.5 rem de ancho:
  bajo 360 px o con la letra agrandada; para apilar lo que en Gloock no cabe lado a lado), `header-hidden:` y
  `playing:` (los players ponen `data-playing` en `<html>` mientras hay video).
  Ojo: `narrow:` es una media query y sus rem son los del navegador (16 px o la letra que la usuaria eligió en
  ajustes), no los de `html { font-size }`. Para que una fila responda al ancho real que le queda al texto, usar una
  consulta de contenedor: `@container` en el bloque y `@max-[16rem]:grid-cols-[minmax(0,1fr)]` en la fila (así
  apilan etiqueta y dato la ficha de evento y Mi cuenta).
- `sticky-aside`: columna fija bajo el header (fotos o formularios que acompañan el scroll); sube con el header
  cuando se oculta. Con el prefijo de ancho donde la columna existe (`lg:sticky-aside`); la separación es
  `--sticky-offset` (2 rem; p. ej. `[--sticky-offset:1.5rem]`). La barra pegada al header es `.sticky-under-header`.
- Foco: `:focus-visible` de 2 px con 3 px de separación en `--color-focus`, también en los campos (el foco siempre
  gana al error). Dentro de un contenedor con `overflow-hidden` el anillo se recorta: ponerlo por dentro. Al tocar,
  el resaltado es `--color-press`.
- `.skip-link`: el "Saltar al contenido", fuera de vista hasta recibir foco.

### Componentes (`src/components/ui/`)
- **Button** (`Button.tsx`): `<Button>` (acciones; `type="button"` por defecto; `pending` para envíos: se ve
  deshabilitado, conserva el foco y no repite el envío), `<ButtonLink>` (next/link), `<ButtonAnchor>`
  (`<a>` externo con `external` o descarga con `download`) y `buttonClass()` para otros elementos.
  Variantes: `primary`, `outline`, `outline-soft`, `outline-on-dark` (dentro de `.on-dark`), `light`; los contornos
  van por rol y se invierten solos en `.on-dark`. Para una acción de texto, `.link-action`. Tamaños (alto mínimo):
  `sm` 44 · `md` 48 · `lg` 52 · `xl` 56 px. En el celular el texto puede partirse antes que desbordar; `wrap`
  lo permite en todos los anchos. Todos responden al presionar.
- **Chip** (`Chip.tsx`): filtros y opciones, 44 px, `aria-pressed`; `toggle={false}` para un botón que abre
  algo. `chipClass(active)` para otros elementos.
- **Badge**: meta en versalitas sin fondo, con dos tonos: `neutral` (`ink-muted`) y `accent` (`accent-ink`, lo único
  que pide atención). `AccessBadge` para Gratis / Pago.
- **Formularios** (`form.tsx`): `Field`, `PasswordField`, `TextArea` (`countFrom`), `FieldError`, `FormAlert`
  (error del servidor), `FormStatus` (confirmación), `FormNote` (nota al pie, 14 px). `hint` va antes del campo y
  `error` debajo, los dos en `aria-describedby`; dentro de `.on-dark` se adaptan solos. `controlClass` para controles
  propios. Sin placeholder que repita la etiqueta.
- **SectionHeading** (`size` para bajar el título sin cambiar el nivel; bajo `narrow:` el link va debajo),
  **ReadMore** (`collapse="always"` recorta también en desktop), **NewTabHint** (aviso de pestaña nueva), **Icon**
  (solo funcionales).
- **Chequeo de tokens**: `npm run lint` corre eslint y `scripts/check-tokens.mjs`, que falla con `text-[Npx]`, hex
  fuera de los tokens, nombres de la paleta vieja, `z-` con número, `italic` junto a `font-display` o un radio viejo
  (`rounded-xs…3xl`).
- Foco en overlays: `src/lib/focus.ts` (`useFocusTrap`, `trapFocus`, `inertOutside`, `getFocusable`).
- Colores para donde no llega CSS (theme-color): `src/components/ui/tokens.ts`.

## Motion (vocabulario)
Fuente: `src/components/motion/*` y `src/lib/motion.ts`. El contenido llega **visible en el HTML**; la
animación solo mejora lo que entra por scroll, y con "reducir movimiento" no hay animación.
- Primer pantallazo: clases CSS `.hero-in` (titular y CTA, con `animationDelay`) y `.hero-clip` (cortina de la foto),
  que corren antes de que cargue el JS. Están fuera de `@layer`: el retraso va en `style`, no en una utilidad.
- `Reveal` (bloques cortos: sube 1rem), `RevealHeading` (titulares por líneas), `RevealImage` (cortina con clip-path en
  fotos) y `RevealList` (filas: solo opacidad, 40 ms entre filas). Nada de reveal en párrafos largos, bios ni formularios.
- `Parallax` solo en los heros de Inicio y Sobre nosotras. Lenis solo con mouse/trackpad y fuera de los players.
- Componentes interactivos con `m.*` (LazyMotion estricto, funciones cargadas aparte).

## Navegación
Menú de escritorio y links del header a 14 px en minúscula normal; barra inferior móvil a 12 px, con la pestaña
actual en tinta y una barra de 2 px en el acento arriba (no solo el color). "Próximamente" como texto chico en
`accent-ink`, sin fondo (`accent-soft` sobre espresso, en el footer).

## Tono
Cálido, cercano, femenino sin ser infantil. Español neutro (LatAm), tuteo. Frases cortas.
"Volver a ti" es el mantra que se repite en meditaciones y podcast.

## Fotos
Todas viven en `public/images/` en JPEG progresivo (lado largo máx. 2400 px, calidad 82, **sin EXIF/GPS**); nunca
se reescala hacia arriba. Antes de cada build `scripts/fotos/variantes.mjs` genera variantes **WebP** de 480 a 2400 px
(las que pide el loader según el ancho real) y **JPEG** de respaldo hasta 1600 px (og:image, descargas); no se suben
a git. Los recortes fijos (p. ej. `fundadoras-mariana-sofi-estudio-movil.jpg`, el hero vertical para celular) sí se
suben. El inventario con dimensiones, texto alternativo y punto focal está en `src/content/media.ts`. Cómo agregar
fotos nuevas: `scripts/fotos/README.md`.

- **Actuales (28-sep)**: re-exportadas el 30-sep desde los originales de `brand/fotos/` (3600 px). Las versiones
  anteriores estaban a calidad ~60 y se veían borrosas en pantallas grandes. Fundadoras confirmadas por Ian (28-sep):
  **Mariana** es la de la clase de Barre con traje morado (`coach-clase-barre-vertical`); **Sofi** es la del evento
  con gorra (`coach-evento-gorra-vertical`).
- **Eventos** (`eventos/<slug>/`): `portada.jpg` = flyer oficial (4:5) y `01.jpg…` = galería, mejores primero. Se
  dejaron fuera las borrosas u oscuras (3 de Breathwork, 1 de Mindfulness, 1 de Paint y 2 de celular de Vision Board).
  Breathwork llegó en baja resolución (~1200 px, tipo WhatsApp): conviene pedir los originales al fotógrafo.
- **Meditaciones** (`meditaciones/01–06`), **Corporativo** (`corporativo/01–02`; la 02 es de celular y solo sirve
  chica) y **Sobre nosotras** (`nosotras/01–03`; la 01 son las dos juntas; en la 02 y la 03 aparece una sola
  fundadora y falta confirmar quién es).
- **Patrocinadores**: los "logos" que llegaron eran capturas de las franjas de los flyers (calidad baja), así que en
  la web se muestran como lista tipográfica de nombres (`SPONSORS` en `src/content/events.ts`). Si se quieren logos,
  hay que pedir los archivos vectoriales a cada marca.
- Los flyers de Journaling y Vision Board dicen "the flow club" (nombre anterior de la marca).
