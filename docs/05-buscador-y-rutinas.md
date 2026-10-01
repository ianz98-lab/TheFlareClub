# Buscador por categoría y constructor de rutinas

> Decisiones del 28-sep-2026 a partir del pedido de Ian: menos scroll, buscador eficiente
> y la posibilidad de armar una sesión completa que corra sola.

## 1. Buscador (Movement y Meditaciones)

Componente único: `src/components/finder/ContentFinder.tsx`, configurado por dominio en
`src/components/finder/finders.tsx` (`MovementFinder`, `MeditationFinder`). Charlas y Workbooks ya no
usan el buscador: son listas cortas.

**Patrón elegido** (el estándar de Peloton, Apple Fitness+, Alo Moves y las guías de
Algolia / Smashing Magazine sobre filtros):
- **Barra fija** bajo el header (`.sticky-under-header`), de fondo sólido y ~69 px: solo las **tabs**
  de la categoría principal (Todas / Pilates / Barre / Calentamientos / Estiramientos; en meditaciones,
  el momento) y, desde lg, el campo de búsqueda. Su alto se publica en `--subheader-h` para que el foco
  y las anclas no queden tapados.
- **Facetas** pocas y relevantes: duración, enfoque y estilo (en meditaciones, cómo te sientes y
  duración). Multi-selección donde tiene sentido (OR dentro de la faceta, AND entre facetas). Desde lg
  van **en flujo**, bajo la barra, no fijas: fijas tapaban un tercio de la pantalla en una tablet acostada.
- **Búsqueda por texto** con retardo de 250 ms, **orden** (más nuevas / más cortas / más
  largas) y **contador** de resultados siempre visible.
- **Una sola grilla** de resultados con "Cargar más" en lotes de 12. Se eliminaron las
  secciones apiladas (Pilates Mat → Barre → Warm Ups → Stretching) que obligaban a
  scrollear.
- **Móvil:** botón "Filtros · n" (en la fila del contador, fuera de la barra fija) que abre una hoja
  inferior: tirador y título "Filtros" con un botón Cerrar de 44 px arriba; en el medio la búsqueda y
  las facetas, que son lo único que se desplaza; abajo un pie fijo con filete, "Limpiar" y "Ver N clases"
  (con la zona segura del iPhone). Al cerrar, el foco vuelve a "Filtros".
- **Estado en la URL** (`?type=pilates&duration=10,20&focus=abs`): compartible, botón
  atrás funciona, y sirve para los accesos rápidos de Inicio ("Tengo 10 minutos"). Se lee con
  `src/components/finder/use-url-search.ts` (`useSyncExternalStore` sobre `location.search`) y se
  escribe con `history.replaceState`, sin `useSearchParams` ni `Suspense`: **el HTML trae el catálogo
  completo** (se ve sin JavaScript) y el filtro de la URL se aplica al hidratar, sin animar.
- Animaciones de layout al filtrar (las cards se reacomodan, no parpadean): van dentro de
  `LayoutMotion`, que carga `domMax` solo en el buscador y el constructor.

## 2. Constructor de rutinas (`/rutina`)

`src/lib/routine.ts` · `src/components/routine/RoutineBuilder.tsx` · `RoutinePlayer.tsx`

**Qué hace:** la usuaria arma una sesión por pasos y la reproduce de corrido.

| Paso | Pool (solo lo que tiene sentido) | Máx. | Opcional |
|---|---|---|---|
| 01 Calentamiento | calentamientos | 1 | sí |
| 02 Clase | Pilates + Barre | 3 | no |
| 03 Estiramiento | estiramientos | 1 | sí |
| 04 Meditación | meditaciones de ≤ 10 min | 1 | sí |

- Cada paso tiene **sus propios filtros** (duración, enfoque).
- **Rutinas predeterminadas** (30-sep, textos de las fundadoras): 5 min — Reset rápido "Solo 5" ·
  15 min — Express "Muévete 15" · 30 min — Movement "Tu media hora" · 60 min — Full session "Una hora para ti".
  Duran exactamente eso (`totalMinutes`). Se abren con `/rutina?preset=<id>`. En Inicio y en Movement cada
  una cierra con la acción visible "Usar esta rutina →" (toda la fila es el enlace).
- **Guardar** las propias ("Tus rutinas") + **repetir la última**: para quien ya sabe lo que quiere, es un toque.
- La rutina ya no es sección del menú: vive dentro de Movement ("¿No sabes qué hacer hoy?").
- **Reproductor** único con cola, barra de progreso por video, "Saltar aquí", y
  **transición automática**: al terminar un video (evento `ended` del player de Vimeo)
  aparece una cuenta regresiva de 6 s y pasa solo al siguiente; se puede adelantar
  ("Ahora") o pausar. "Terminé" dispara el mismo flujo con los placeholders del prototipo.
- **Al terminar**: pantalla de cierre con recomendaciones de cursos, charlas y el último
  episodio del podcast. Podcast y cursos **no** entran en la rutina: no tiene sentido
  mezclarlos con ejercicio y solo suman opciones.
- Persistencia local por ahora (`tfc:routines`, `tfc:routine-current`, `tfc:routine-last`); en Fase 2
  tabla `routines` + `routine_items` por usuaria.

## 3. Qué aprendimos de los demás (para no repetir errores)

- **Peloton Stacks**: playlist de hasta 10 clases, una sola stack a la vez, y **hay que
  pulsar play manualmente entre clases**; además la clase se borra de la stack al
  reproducirla, así que no hay rutinas reutilizables.
  ([soporte Peloton](https://support.onepeloton.com/hc/en-us/articles/360054847611-Feature-Stacked-Classes),
  [Pelobuddy](https://www.pelobuddy.com/class-stacking-peloton-multiple-back-to-back/))
- **Apple Fitness+ Stacks**: también requiere "Let's Go" entre actividades y **no admite
  meditaciones de audio** dentro de la stack; sí permite guardar, reordenar y borrar.
  ([soporte Apple](https://support.apple.com/guide/fitness-plus/apd127115e55/ios))
- **Filtros**: pocas facetas bien elegidas, resultados visibles al instante y sin
  "filtros congelados" que obligan a aplicar.
  ([Algolia](https://www.algolia.com/blog/ux/search-filter-ux-best-practices),
  [Smashing Magazine](https://www.smashingmagazine.com/2021/07/frustrating-design-patterns-broken-frozen-filters/))

Nuestras diferencias: transición automática con cuenta regresiva, rutinas guardadas y
presets, cierre con meditación permitido, y pools restringidos por paso para evitar
indecisión.

## 4. Motion

`src/components/motion/`:
- Entradas al hacer scroll sin librería (`reveal-observer.ts`): `Reveal`, `RevealHeading`, `RevealImage` y
  `RevealList` (aparición en cascada de una lista; reemplaza al viejo `Stagger`, que ya no existe). El
  contenido llega visible en el HTML; lo del primer pantallazo usa la clase `.hero-in`.
- `Parallax` solo en los heros de Inicio y Sobre nosotras; Lenis (scroll con inercia) solo con mouse o
  trackpad, nunca en el celular ni en las páginas con player.
- motion (`LazyMotion` en `MotionProvider.tsx`) queda para lo interactivo: menú móvil, hoja de filtros,
  visor de fotos, player y constructor. Todas las páginas cargan `domAnimation`; `domMax` (layout,
  `layoutId`, arrastre) solo dentro de `LayoutMotion`: buscador y constructor.
- Header que se oculta al bajar y vuelve al subir, `template.tsx` para la transición entre páginas (Web
  Animations, sin librería), zoom suave en las fotos de las tarjetas al pasar el mouse (`.card-media`).

Todo respeta `prefers-reduced-motion`.

## 5. Ajustes del 30-sep (auditoría)
- El constructor arranca en el paso **01 Calentamiento** y en el 04 el botón dice "Listo, empezar".
- La rutina en curso guarda el paso donde va y los pasos ya vistos (`ROUTINE_KEYS.current` con `step` y
  `seen`, ver `src/components/routine/routine-store.ts`): al volver, "Seguir donde ibas" conserva los "Visto"
  y el cierre cuenta bien los videos completados. `/rutina?last=1` repite la última.
- Al terminar: "Guardar esta rutina". Salir a medias pide confirmación.
- Player: la cola va en una columna lateral desde xl; en lg el video ocupa todo el ancho (con tope por el
  alto de la pantalla) y el título, "Pantalla completa", Anterior y "Terminé" van en una fila debajo, del
  mismo ancho que el video. En el celular acostado el header y la barra inferior se ocultan
  (`html[data-playing]`) y el video cabe con "Terminé" a la vista. La cuenta regresiva entre videos se puede
  pausar y no se roba el foco.

