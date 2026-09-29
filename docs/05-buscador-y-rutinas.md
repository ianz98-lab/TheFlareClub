# Buscador por categoría y constructor de rutinas

> Decisiones del 28-sep-2026 a partir del pedido de Ian: menos scroll, buscador eficiente
> y la posibilidad de armar una sesión completa que corra sola.

## 1. Buscador (Movement, Meditaciones, Charlas, Workbooks)

Componente único: `src/components/finder/ContentFinder.tsx`, configurado por dominio en
`src/components/finder/finders.tsx`.

**Patrón elegido** (el estándar de Peloton, Apple Fitness+, Alo Moves y las guías de
Algolia / Smashing Magazine sobre filtros):
- **Barra fija** bajo el header con **tabs** para la categoría principal (Pilates / Barre /
  Warm Up / Stretching; en meditaciones el momento; en charlas la categoría).
- **Facetas** pocas y relevantes: duración, enfoque, estilo. Multi-selección donde tiene
  sentido (OR dentro de la faceta, AND entre facetas).
- **Búsqueda por texto** con retardo de 250 ms, **orden** (más nuevas / más cortas / más
  largas) y **contador** de resultados siempre visible.
- **Una sola grilla** de resultados con "Cargar más" en lotes de 12. Se eliminaron las
  secciones apiladas (Pilates Mat → Barre → Warm Ups → Stretching) que obligaban a
  scrollear.
- **Móvil:** botón "Filtros · n" que abre una hoja inferior deslizable; desktop muestra
  las facetas inline.
- **Estado en la URL** (`?type=pilates&duration=10,20&focus=abs`): compartible, botón
  atrás funciona, y sirve para los accesos rápidos de Inicio ("Tengo 10 minutos").
- Animaciones de layout al filtrar (las cards se reacomodan, no parpadean).

## 2. Constructor de rutinas (`/rutina`)

`src/lib/routine.ts` · `src/components/routine/RoutineBuilder.tsx` · `RoutinePlayer.tsx`

**Qué hace:** la usuaria arma una sesión por pasos y la reproduce de corrido.

| Paso | Pool (solo lo que tiene sentido) | Máx. | Opcional |
|---|---|---|---|
| 01 Calentamiento | videos tipo warm-up | 1 | sí |
| 02 Clase | Pilates + Barre | 3 | no |
| 03 Stretch | stretching | 1 | sí |
| 04 Cierre | meditaciones de ≤ 10 min | 1 | sí |

- Cada paso tiene **sus propios filtros** (duración, enfoque).
- **Rutinas rápidas** (presets) + **guardar** las propias + **repetir la última**: para
  quien ya sabe lo que quiere, es un toque.
- **Reproductor** único con cola, barra de progreso por video, "Saltar aquí", y
  **transición automática**: al terminar un video (evento `ended` del player de Vimeo)
  aparece una cuenta regresiva de 6 s y pasa solo al siguiente; se puede adelantar
  ("Ahora") o pausar. "Terminé" dispara el mismo flujo con los placeholders del prototipo.
- **Al terminar**: pantalla de cierre con recomendaciones de cursos, charlas y el último
  episodio del podcast. Podcast y cursos **no** entran en la rutina: no tiene sentido
  mezclarlos con ejercicio y solo suman opciones.
- Persistencia local por ahora (`tfc:routines`, `tfc:routine-last`); en Fase 2 tabla
  `routines` + `routine_items` por usuaria.

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

`src/components/motion/`: Lenis (scroll con inercia), `Reveal`/`Stagger` (aparición en
cascada al entrar en pantalla), `Parallax` en heros, header que se oculta al bajar y
vuelve al subir, `template.tsx` para transición entre páginas, zoom suave en imágenes al
hover. Todo respeta `prefers-reduced-motion`.
