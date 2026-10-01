/**
 * Inventario de fotos (generado el 30-sep-2026; para agregar más ver scripts/fotos/README.md).
 * Fotos oficiales ordenadas por evento y sección, con dimensiones reales, alt y punto focal.
 */
import type { Photo } from "./types";

/** Portadas oficiales (posts 4:5 de eventos pasados; story 9:16 de la Night Edition) */
export const EVENT_COVERS: Record<string, Photo> = {
  "pilates-charms-sep-2026": { src: "/images/eventos/pilates-charms-sep-2026/portada.jpg", width: 1080, height: 1350, alt: "Flyer oficial de Pilates & Charms" },
  "pilates-paint-jul-2026": { src: "/images/eventos/pilates-paint-jul-2026/portada.jpg", width: 1080, height: 1350, alt: "Flyer de Pilates & Paint (Sound Healing Edition)" },
  "pilates-mindfulness-may-2026": { src: "/images/eventos/pilates-mindfulness-may-2026/portada.jpg", width: 1080, height: 1350, alt: "Flyer de Pilates & Mindfulness" },
  "pilates-breathwork-abr-2026": { src: "/images/eventos/pilates-breathwork-abr-2026/portada.jpg", width: 1080, height: 1350, alt: "Flyer de Pilates & Breathwork" },
  "pilates-vision-board-mar-2026": { src: "/images/eventos/pilates-vision-board-mar-2026/portada.jpg", width: 1080, height: 1350, alt: "Flyer de Pilates & Vision Board" },
  "pilates-journaling-feb-2026": { src: "/images/eventos/pilates-journaling-feb-2026/portada.jpg", width: 1080, height: 1350, alt: "Flyer de Pilates & Journaling" },
  "night-edition-vol-1-oct-2026": { src: "/images/eventos/night-edition-vol-1-oct-2026/portada.jpg", width: 718, height: 1266, alt: "Night Editions Vol. 1: Pilates, Paint & Wine. Pinta tu propia copa de vino. Jueves 8 de octubre, 6 a 9 pm, Zona 15, Q450" },
};

/**
 * Galerías por evento, mejores primero. El `focal` sirve cuando la foto se recorta (portadas,
 * miniaturas de clases). En el salón de Pilates & Paint se ve un letrero de salida arriba:
 * sus verticales recortadas van ancladas abajo ("center 100%") para dejarlo fuera.
 */
export const EVENT_GALLERIES: Record<string, Photo[]> = {
  "pilates-charms-sep-2026": [
    { src: "/images/eventos/pilates-charms-sep-2026/01.jpg", width: 2400, height: 1600, alt: "Vista amplia del rooftop en plena clase: filas de asistentes en postura de niño o estiramiento sobre tapetes negros, con ventanales, barra y mural floral colorido al fondo", focal: "center 65%" },
    { src: "/images/eventos/pilates-charms-sep-2026/02.jpg", width: 1600, height: 2400, alt: "Tres asistentes sentadas a la mesa del taller muestran sonrientes los charms dorados que armaron, con jugos y vasos en primer plano", focal: "center 40%" },
    { src: "/images/eventos/pilates-charms-sep-2026/03.jpg", width: 1600, height: 2400, alt: "Tres asistentes en la barra de madera muestran a cámara los charms o aretes que armaron, sonriendo, con lámparas Edison y ventanales detrás", focal: "35% 45%" },
    { src: "/images/eventos/pilates-charms-sep-2026/04.jpg", width: 2400, height: 1600, alt: "Foto grupal de todas las asistentes del evento Pilates & Charms en el rooftop, de pie y sentadas en los tapetes, todas sonriendo a cámara", focal: "center 55%" },
    { src: "/images/eventos/pilates-charms-sep-2026/05.jpg", width: 2400, height: 1600, alt: "Momento de meditación: asistentes sentadas en tapetes con las piernas cruzadas y los ojos cerrados", focal: "60% 55%" },
    { src: "/images/eventos/pilates-charms-sep-2026/06.jpg", width: 1600, height: 2400, alt: "Mesa del taller de charms bajo la pérgola con vista a la ciudad y a los volcanes", focal: "center 50%" },
    { src: "/images/eventos/pilates-charms-sep-2026/07.jpg", width: 2400, height: 1600, alt: "Clase vista desde atrás: asistentes en estocada con los brazos arriba bajo lámparas colgantes, con ventanales", focal: "center 40%" },
    { src: "/images/eventos/pilates-charms-sep-2026/08.jpg", width: 1600, height: 2400, alt: "Clase en rooftop: asistentes inclinadas con las manos en las rodillas, riéndose en medio del ejercicio", focal: "center 45%" },
    { src: "/images/eventos/pilates-charms-sep-2026/09.jpg", width: 1600, height: 2400, alt: "Taller de charms en una mesa larga de madera bajo pérgola: una asistente arma su charm concentrada, con lámparas de mimbre y un mural colorido al fondo", focal: "40% 50%" },
    { src: "/images/eventos/pilates-charms-sep-2026/10.jpg", width: 1600, height: 2400, alt: "Asistente arrodillada en su tapete, con top Nike, sostiene el celular sobre la cabeza mirándolo", focal: "center 40%" },
  ],
  "pilates-paint-jul-2026": [
    { src: "/images/eventos/pilates-paint-jul-2026/01.jpg", width: 1600, height: 2400, alt: "Facilitadora de sound healing sentada sobre alfombra entre cuencos de cuarzo blancos y cuencos tibetanos dorados, sosteniendo una sonaja de semillas frente a ventanales con luz natural", focal: "40% 55%" },
    { src: "/images/eventos/pilates-paint-jul-2026/02.jpg", width: 2400, height: 1600, alt: "Foto grupal de cierre del evento Pilates & Paint: todas las asistentes sonriendo detrás de una mesa llena de tote bags pintadas, pinturas y eucalipto", focal: "center 60%" },
    { src: "/images/eventos/pilates-paint-jul-2026/03.jpg", width: 1600, height: 2400, alt: "Primer plano de una asistente con top rojo pintando olas verdes sobre una tote bag; mesa con vaso Stanley rosado, eucalipto, frascos de pintura y bebidas", focal: "65% 45%" },
    { src: "/images/eventos/pilates-paint-jul-2026/04.jpg", width: 2400, height: 1600, alt: "Plano general del taller de pintura: mesas largas con papel kraft llenas de asistentes pintando tote bags, una mujer de pie al fondo tomando foto con el celular", focal: "55% 45%" },
    { src: "/images/eventos/pilates-paint-jul-2026/05.jpg", width: 2400, height: 1600, alt: "Asistentes en postura de niño (child's pose) en filas de mats negros; salón claro con tote bags y termos junto a cada mat", focal: "60% 60%" },
    { src: "/images/eventos/pilates-paint-jul-2026/06.jpg", width: 1600, height: 2400, alt: "Taller de pintura: joven con lentes y top blanco pinta franjas azules sobre una tote bag de manta; mesa con pinturas, paleta y pinceles, más asistentes pintando al fondo junto a ventanales", focal: "62% 45%" },
    { src: "/images/eventos/pilates-paint-jul-2026/07.jpg", width: 1600, height: 2400, alt: "Momento de meditación en el taller: asistentes sentadas a la mesa con los ojos cerrados, eucalipto y materiales de pintura sobre la mesa; lámparas colgantes al fondo", focal: "62% 45%" },
    { src: "/images/eventos/pilates-paint-jul-2026/08.jpg", width: 2400, height: 1600, alt: "Clase grupal de pie en salón: asistentes en zancada con brazos arriba (warrior), mats negros y tote bags en el piso; candelabro en el techo", focal: "center 60%" },
    { src: "/images/eventos/pilates-paint-jul-2026/09.jpg", width: 1600, height: 2400, alt: "Clase de Pilates Mat en el piso: filas de mujeres acostadas boca arriba con manos detrás de la cabeza y piernas elevadas (single leg stretch)", focal: "center 100%" },
    { src: "/images/eventos/pilates-paint-jul-2026/10.jpg", width: 1600, height: 2400, alt: "Asistentes en perro boca abajo (downward dog) sobre mats negros, vistas de lado; tote bags, termos y celulares en el piso", focal: "center 100%" },
    { src: "/images/eventos/pilates-paint-jul-2026/11.jpg", width: 2400, height: 1600, alt: "Clase de Pilates Mat en cuadrupedia/plancha sobre codos, vista general del salón con asistente de pelo fucsia en primer plano", focal: "60% 55%" },
  ],
  "pilates-mindfulness-may-2026": [
    { src: "/images/eventos/pilates-mindfulness-may-2026/01.jpg", width: 2400, height: 1600, alt: "Clase masiva bajo techo abierto de centro comercial: filas de mujeres en estocada baja con las manos en posición de rezo, sonriendo", focal: "center 60%" },
    { src: "/images/eventos/pilates-mindfulness-may-2026/02.jpg", width: 2400, height: 1600, alt: "Clase de rodillas con los brazos arriba", focal: "center 65%" },
    { src: "/images/eventos/pilates-mindfulness-may-2026/03.jpg", width: 2400, height: 1600, alt: "Vista amplia de la clase de pie con los brazos arriba y las manos juntas, en filas bajo la estructura de vigas negras", focal: "center 60%" },
    { src: "/images/eventos/pilates-mindfulness-may-2026/04.jpg", width: 1519, height: 2400, alt: "Participante sonriente de rodillas en su mat, con los brazos abiertos en cruz", focal: "center 45%" },
    { src: "/images/eventos/pilates-mindfulness-may-2026/05.jpg", width: 1600, height: 2400, alt: "Fila de participantes en postura del niño (child's pose) con los brazos extendidos, en diagonal", focal: "center 50%" },
    { src: "/images/eventos/pilates-mindfulness-may-2026/06.jpg", width: 1600, height: 2400, alt: "Facilitadora rubia con chaleco blanco y jeans, caminando por el espacio vacío mientras lee una tarjeta con la práctica", focal: "center 55%" },
  ],
  "pilates-breathwork-abr-2026": [
    { src: "/images/eventos/pilates-breathwork-abr-2026/01.jpg", width: 1280, height: 853, alt: "Clase de Pilates Mat en el salón: filas de asistentes en puente de glúteos con los brazos arriba, junto a bolsas de regalo azules", focal: "center 75%" },
    { src: "/images/eventos/pilates-breathwork-abr-2026/02.jpg", width: 931, height: 764, alt: "Vista amplia del salón en plena clase: decenas de asistentes en sentadilla con las manos juntas al pecho, sobre tapetes con bolsas de regalo azules", focal: "center 70%" },
    { src: "/images/eventos/pilates-breathwork-abr-2026/03.jpg", width: 1179, height: 786, alt: "Salón de hotel con dos instructoras en el escenario haciendo estiramiento en split lateral sobre tapetes rosados, mientras las asistentes las imitan en primer plano sobre tapetes con bolsas de regalo", focal: "55% 60%" },
    { src: "/images/eventos/pilates-breathwork-abr-2026/04.jpg", width: 1179, height: 785, alt: "Brunch después de la clase: mesa redonda con mantel blanco, sándwiches, jugos y termos", focal: "center 55%" },
    { src: "/images/eventos/pilates-breathwork-abr-2026/05.jpg", width: 1178, height: 778, alt: "Asistentes de pie antes de empezar, sonriendo, en un salón con luz ambiental magenta y bolsas de regalo en el piso", focal: "40% 45%" },
    { src: "/images/eventos/pilates-breathwork-abr-2026/06.jpg", width: 1179, height: 779, alt: "Otra mesa del brunch: asistentes sentadas con bebidas, termos rosados y flores, sonriendo a cámara", focal: "center 60%" },
    { src: "/images/eventos/pilates-breathwork-abr-2026/07.jpg", width: 1206, height: 759, alt: "Dos asistentes sonríen a cámara con audífonos iluminados durante el breathwork" },
  ],
  "pilates-vision-board-mar-2026": [
    { src: "/images/eventos/pilates-vision-board-mar-2026/01.jpg", width: 2400, height: 1600, alt: "Asistentes de rodillas y de espaldas con los brazos en alto frente a ventanales con vista a la ciudad; al fondo las instructoras de frente guían el estiramiento", focal: "center 55%" },
    { src: "/images/eventos/pilates-vision-board-mar-2026/02.jpg", width: 1600, height: 2400, alt: "Una de las fundadoras (top rosado, leggings grises, micrófono de diadema) guía la clase en una estocada lateral; atrás las asistentes siguen el movimiento en mats frente a ventanales", focal: "58% 55%" },
    { src: "/images/eventos/pilates-vision-board-mar-2026/03.jpg", width: 2400, height: 1655, alt: "Foto grupal del evento Pilates & Vision Board en el salón del hotel, con techo de listones de madera; todas posando en dos filas", focal: "center 60%" },
    { src: "/images/eventos/pilates-vision-board-mar-2026/04.jpg", width: 2400, height: 1600, alt: "Mesa redonda del taller de vision board con asistentes trabajando, centro de mesa de cristal y ventanales con vista a montañas y ciudad", focal: "center 50%" },
    { src: "/images/eventos/pilates-vision-board-mar-2026/05.jpg", width: 2400, height: 1600, alt: "Meditación sentada en postura fácil con mudras, asistentes con ojos cerrados sobre mats en salón de hotel con ventanales", focal: "55% 60%" },
    { src: "/images/eventos/pilates-vision-board-mar-2026/06.jpg", width: 1600, height: 2400, alt: "Dos asistentes sonrientes de negro brindan con vasos de matcha en la mesa del evento; wraps en cajitas kraft y ventanales con vista a la ciudad al fondo", focal: "center 45%" },
    { src: "/images/eventos/pilates-vision-board-mar-2026/07.jpg", width: 2400, height: 1600, alt: "Asistentes acostadas en mats haciendo abdominales con manos tras la cabeza; bolsas azules junto a cada mat; mesero y buffet al fondo", focal: "center 60%" },
    { src: "/images/eventos/pilates-vision-board-mar-2026/08.jpg", width: 2400, height: 1600, alt: "Asistente de chaqueta blanca sonríe mientras toma un snack en la barra de comida; canasta de mimbre y otras mujeres desenfocadas atrás", focal: "55% 35%" },
  ],
  "pilates-journaling-feb-2026": [
    { src: "/images/eventos/pilates-journaling-feb-2026/01.jpg", width: 1709, height: 2136, alt: "Fila larga de mujeres sentadas o recostadas en mats negros, escribiendo en sus journals dentro de un lobby con muros de piedra clara y ventanal al fondo", focal: "center 55%" },
    { src: "/images/eventos/pilates-journaling-feb-2026/02.jpg", width: 2400, height: 1600, alt: "Clase de Pilates Mat en cuadrupedia con elevación de pierna (donkey kicks), con varias filas de mujeres sobre mats negros en el lobby", focal: "40% 60%" },
    { src: "/images/eventos/pilates-journaling-feb-2026/03.jpg", width: 1600, height: 2400, alt: "Retrato espontáneo de una participante sonriente de pelo ondulado, sentada en su mat con una botella de kombucha", focal: "center 35%" },
    { src: "/images/eventos/pilates-journaling-feb-2026/04.jpg", width: 2400, height: 1133, alt: "Foto grupal del evento, con unas 30 mujeres en dos filas (de pie y sentadas) frente a un muro de listones de madera y una pantalla verde", focal: "center 35%" },
    { src: "/images/eventos/pilates-journaling-feb-2026/05.jpg", width: 2400, height: 1600, alt: "Cuatro mujeres sentadas en mats escribiendo en sus journals junto a un gran ventanal con helechos y jardín", focal: "center 35%" },
    { src: "/images/eventos/pilates-journaling-feb-2026/06.jpg", width: 1600, height: 2400, alt: "Detalle del desayuno: una mano sirve granola en un vaso junto a una bandeja de madera con croissants y pan de chocolate", focal: "40% 60%" },
    { src: "/images/eventos/pilates-journaling-feb-2026/07.jpg", width: 2400, height: 1600, alt: "Dos participantes posando sonrientes junto al ventanal con sus bolsas de regalo kraft y una caja", focal: "center 45%" },
  ],
};

/** Sección de meditaciones (01 = hero ancho; 02 y 03 = verticales) */
export const MEDITATION_PHOTOS: Photo[] = [
  { src: "/images/meditaciones/01.jpg", width: 2400, height: 1600, alt: "Meditación grupal en un salón elegante con pared de mármol y ventanal con vista a las montañas", focal: "center 45%" },
  { src: "/images/meditaciones/02.jpg", width: 1600, height: 2400, alt: "Mujer joven rubia con top negro de tirantes, sentada con las piernas cruzadas en una colchoneta negra, con los ojos cerrados, serena y meditando", focal: "center 35%" },
  { src: "/images/meditaciones/03.jpg", width: 1600, height: 2400, alt: "Mujer de frente y centrada, con camiseta negra, leggings celestes y calcetas blancas, sentada con las piernas cruzadas en una colchoneta negra, con los ojos cerrados y las manos sobre las rodillas", focal: "center 35%" },
  { src: "/images/meditaciones/04.jpg", width: 2400, height: 1600, alt: "Fila en diagonal de mujeres meditando sentadas sobre colchonetas negras en un salón con ventanales", focal: "65% 60%" },
  { src: "/images/meditaciones/05.jpg", width: 1600, height: 2400, alt: "Mujer joven con set gris claro, sentada con las piernas cruzadas y los ojos cerrados, con las manos en mudra y una botellita de aceite a su lado", focal: "55% 50%" },
  { src: "/images/meditaciones/06.jpg", width: 2400, height: 1600, alt: "Toma por encima del hombro de una mujer con trenza y chaqueta negra, con las manos juntas en oración frente a la cara", focal: "55% 40%" },
];

/** Sección corporativa (01 = activación de marca con las fundadoras al centro) */
export const CORPORATE_PHOTOS: Photo[] = [
  { src: "/images/corporativo/01.jpg", width: 1800, height: 2400, alt: "Foto grupal posada al final de una activación de marca en un salón con techo de listones de madera, jardín vertical y un banner de Neutrogena", focal: "center 88%" },
  { src: "/images/corporativo/02.jpg", width: 1206, height: 1473, alt: "Foto grupal después de una clase en un espacio de oficina con piso negro brillante, colchonetas de foam moradas encajables, ventanales y techo con ductos y proyector a la vista", focal: "center 62%" },
];

/** Sobre nosotras (01 = las dos fundadoras juntas; 02 y 03 = una fundadora cada una, sin confirmar quién) */
export const ABOUT_PHOTOS: Photo[] = [
  { src: "/images/nosotras/01.jpg", width: 1421, height: 1776, alt: "Retrato de medio cuerpo de dos mujeres abrazadas y sonriendo a la cámara, con micrófono de diadema", focal: "center 25%" },
  { src: "/images/nosotras/02.jpg", width: 1919, height: 2400, alt: "Instructora de pie sobre una colchoneta rosada dando una charla, con micrófono de diadema y enterizo color ciruela, gesticulando", focal: "65% 45%" },
  { src: "/images/nosotras/03.jpg", width: 1206, height: 1793, alt: "Instructora de perfil con gorra beige, micrófono de diadema, top deportivo negro y reloj, sonriendo en medio de un movimiento durante una clase o evento", focal: "center 30%" },
];

/**
 * Fotos sueltas de public/images (clases en estudio y retratos). Las usan las miniaturas de
 * videos.ts mientras no haya portadas de Vimeo. `coach-clase-barre-vertical.jpg` no se usa como
 * miniatura: se ve un letrero de salida (la foto de Mariana es la decisión D7).
 */
export const STUDIO_PHOTOS = {
  estiramiento: { src: "/images/clase-03.jpg", width: 2400, height: 1600, alt: "Dos alumnas en estiramiento sentado hacia adelante sobre tapetes rosados, junto a un ventanal", focal: "center 60%" },
  instructora: { src: "/images/clase-04.jpg", width: 2400, height: 1600, alt: "Instructora de pie sobre un tapete rosado, con micrófono de diadema, guiando la clase", focal: "60% 50%" },
  sentadilla: { src: "/images/clase-pilates-squat-ventanal.jpg", width: 2400, height: 1600, alt: "Alumna e instructora en sentadilla frente a un ventanal con vista a la ciudad", focal: "center 55%" },
  meditacion: { src: "/images/meditacion-clase-ventanal.jpg", width: 2400, height: 1600, alt: "Instructora sentada con las piernas cruzadas sobre un tapete rosado, guiando a otras alumnas junto a un ventanal", focal: "center 60%" },
  estocada: { src: "/images/coach-vertical-02.jpg", width: 1702, height: 2400, alt: "Instructora con gorra en estocada, con las manos juntas, durante una clase en grupo", focal: "center 55%" },
  gorra: { src: "/images/coach-evento-gorra-vertical.jpg", width: 1600, height: 2400, alt: "Instructora con gorra beige y micrófono de diadema, sonriendo durante un evento", focal: "center 30%" },
  duo: { src: "/images/coaches-mariana-sofi-retrato.jpg", width: 1472, height: 1472, alt: "Mariana y Sofi Wer de pie, sonriendo, con tops y leggings color vino", focal: "center 30%" },
  charla: { src: "/images/foto-extra-01.jpg", width: 1179, height: 779, alt: "Instructora con micrófono de mano hablando en un evento, sonriendo", focal: "60% 40%" },
} satisfies Record<string, Photo>;

export const WORKBOOK_COVER: Photo = { src: "/images/workbooks/autoconociendome-portada.jpg", width: 1132, height: 1588, alt: "Portada del workbook Autoconociéndome para decidir de nuevo" };

/** Recorte de CORPORATE_PHOTOS[0] sin el techo, para cabeceras (el grupo queda protagonista). */
export const CORPORATE_HERO: Photo = { src: "/images/corporativo/01-grupo.jpg", width: 2400, height: 1856, alt: "Foto grupal al final de una activación de marca: participantes con leggings y tops negros, con las fundadoras al centro", focal: "center 55%" };
