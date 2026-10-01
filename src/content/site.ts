/**
 * Textos de la web en un solo lugar. Fuente: "CAMBIOS PAGINA WEB.docx" (fundadoras, 30-sep-2026).
 * Las páginas y la página de Inicio leen de aquí, así Inicio se actualiza sola cuando
 * cambia el texto de una sección (pedido explícito del documento).
 * Mañana esto puede venir de `site_settings` en Supabase con la misma forma.
 */

/** Cambiar a "live" cuando abran los cursos: Inicio, el menú y /cursos se actualizan solos. */
const COURSES_STATUS: "coming-soon" | "live" = "coming-soon";
export function coursesLive(): boolean {
  return COURSES_STATUS === "live";
}

export const BRAND_LINE = "Tu luz no desaparece. A veces, solo necesitas volver a encenderla.";

/* ---------------- Inicio ---------------- */
export const HOME = {
  hero: {
    title: "Todo cambia cuando empiezas a elegirte.",
    paragraphs: [
      "The Flare Club es un espacio de movimiento, crecimiento y bienestar creado para acompañarte a volver a ti y encender tu luz interna.",
      "Muévete, conócete, cuestiona lo que ya no te sirve y crea hábitos que te hagan sentir bien. A tu ritmo, estés donde estés.",
    ],
    cta: "Explora The Flare Club",
  },
  need: {
    eyebrow: "Empieza aquí",
    title: "¿Qué necesitas hoy?",
    description: "No todos los días necesitas lo mismo. Empieza por lo que hoy se siente bien para ti.",
    options: [
      { label: "Solo tengo 5 minutos", href: "/movement?duration=5#clases" },
      { label: "Quiero moverme", href: "/movement" },
      { label: "Necesito bajar revoluciones", href: "/meditaciones?moment=stress" },
      { label: "Quiero estirarme", href: "/movement?type=stretching#clases" },
      { label: "Quiero meditar", href: "/meditaciones" },
      { label: "Tengo tiempo para mí", href: "/rutina?preset=preset-60" },
    ],
  },
} as const;

/* ---------------- Índice de secciones (Inicio y menú) ---------------- */
export interface SectionEntry {
  href: string;
  label: string;
  note: string;
  /** "Próximamente" u otra marca de estado */
  status?: string;
}

/** Marca de secciones que aún no abren. */
export const COMING_SOON = "Próximamente";

export const SECTIONS: SectionEntry[] = [
  { href: "/movement", label: "Movement", note: "Pilates Mat, Barre, calentamientos y estiramientos para moverte a tu manera." },
  { href: "/meditaciones", label: "Meditaciones", note: "Espacios para pausar, escucharte y volver a ti." },
  { href: "/workbooks", label: "Workbooks", note: "Herramientas para conocerte, cuestionarte y llevar lo que aprendes a tu día a día." },
  { href: "/charlas", label: "Charlas", note: "Conversaciones con expertos para aprender, cuestionarnos y seguir creciendo." },
  { href: "/cursos", label: "Cursos", status: coursesLive() ? undefined : COMING_SOON, note: "Programas creados para profundizar en distintos temas, a tu ritmo." },
  { href: "/podcast", label: "Podcast", note: "Conversaciones y reflexiones para acompañarte estés donde estés." },
];

/* ---------------- Movement y rutinas ---------------- */
export const MOVEMENT = {
  title: "Muévete a tu manera",
  description:
    "Pilates Mat, Barre, calentamientos y estiramientos para acompañarte estés donde estés. Elige por tiempo, enfoque o estilo, o arma tu rutina personalizada en segundos.",
  routinePrompt: {
    title: "¿No sabes qué hacer hoy?",
    description: "Arma una rutina según el tiempo que tienes y lo que quieres trabajar.",
    cta: "Arma tu rutina",
  },
} as const;

export const ROUTINE = {
  eyebrow: "Nuevo",
  title: "Arma tu rutina.",
  /** Bloque de Inicio */
  teaser:
    "¿Tienes 5 minutos o una hora? Hay espacio para ti. Elige una rutina lista para empezar o combina calentamiento, clase y estiramiento para crear la tuya.",
  /** Página del constructor (/rutina) */
  description:
    "Elige tu calentamiento, clase, estiramiento y, si quieres, una meditación para cerrar. Nosotros los conectamos para crear una rutina que fluya de principio a fin.",
  presetsTitle: "Rutinas predeterminadas",
  cta: "Arma tu rutina",
} as const;

/* ---------------- Meditaciones ---------------- */
export const MEDITATIONS = {
  eyebrow: "Meditaciones",
  title: "Meditaciones",
  description: "Un espacio para hacer una pausa, escucharte y volver a ti. Elige la meditación que necesites hoy.",
} as const;

/* ---------------- Cursos (próximamente) ---------------- */
export const COURSES = {
  status: COURSES_STATUS as "coming-soon" | "live",
  eyebrow: "Cursos",
  title: "Algo nuevo está por llegar.",
  paragraphs: ["Estamos creando cursos para acompañarte a conocerte, cuestionarte y seguir creciendo a tu ritmo."],
  waitlistPrompt: "Únete a la lista de espera y sé de las primeras personas en enterarte.",
  cta: "Unirme a la lista de espera",
  done: "Listo. Te avisaremos primero cuando abramos los cursos.",
};

/* ---------------- Charlas ---------------- */
export const TALKS = {
  eyebrow: "Charlas",
  title: "Conversaciones que suman",
  paragraphs: [
    "Charlas en vivo con expertos sobre bienestar, nutrición, relaciones, hábitos, abundancia y mucho más.",
    "Después de cada encuentro, podrás encontrar la grabación aquí para verla cuando quieras.",
  ],
  notify: {
    title: "¿Quieres enterarte de la próxima charla en vivo?",
    description: "Activa las notificaciones por correo y te avisaremos cuando tengamos una nueva fecha.",
    cta: "Activar notificaciones",
    done: "Listo. Te escribiremos cuando tengamos la próxima fecha.",
  },
  empty: {
    title: "Muy pronto encontrarás nuestras primeras charlas aquí.",
    description: "Estamos preparando conversaciones con expertos que queremos compartir contigo.",
  },
} as const;

/* ---------------- Workbooks ---------------- */
export const WORKBOOKS = {
  eyebrow: "Workbooks",
  title: "Un espacio para escribir, reflexionar y conocerte más",
  description:
    "Workbooks creados para acompañarte en distintos momentos y procesos. Descárgalos, imprímelos y llévalos contigo para trabajar en ellos a tu ritmo.",
  comingSoon: "Nuevos workbooks próximamente.",
  cta: "Descargar workbook",
} as const;

/* ---------------- Eventos ---------------- */
export const EVENTS = {
  eyebrow: "Eventos",
  title: "Nos encontramos fuera de la pantalla",
  description:
    "Creamos experiencias de bienestar que combinan movimiento, conexión y actividades especiales. Cada edición es diferente, pero todas tienen la misma intención: regalarte un espacio para ti.",
  upcomingTitle: "Próximos eventos",
  pastTitle: "Eventos anteriores",
  pastDescription: "Toca un evento para ver su galería de fotos.",
  buy: "Comprar entrada",
  waitlist: "Únete a la lista de espera",
  waitlistDone: "Listo. Te avisaremos en cuanto abramos la venta.",
  sponsorsTitle: "Marcas que han creído en nosotras",
} as const;

/* ---------------- Corporativo ---------------- */
export const CORPORATE = {
  eyebrow: "Corporativo",
  title: "Experiencias de bienestar para empresas y marcas",
  paragraphs: [
    "Creamos experiencias que combinan movimiento, bienestar y conexión, diseñadas para equipos, colaboradores y comunidades de marca.",
    "Desde actividades corporativas hasta eventos de PR, adaptamos cada experiencia a la intención, formato y necesidades de cada proyecto.",
  ],
  audiences: [
    {
      title: "Para empresas",
      description:
        "Experiencias para colaboradores, actividades de cierre o inicio de año, clases, charlas, journaling, vision boards, etc.",
    },
    {
      title: "Para marcas",
      description: "Eventos de PR, lanzamientos, experiencias para invitados o creators y activaciones de bienestar.",
    },
  ],
  cta: "Cotiza una experiencia",
  form: {
    fields: {
      company: "Nombre de la empresa",
      name: "Tu nombre",
      phone: "Teléfono",
      email: "Correo",
      message: "¿Qué te gustaría cotizar?",
    },
    messageHint: "Incluye la mayor cantidad de detalles posibles.",
    submit: "Enviar solicitud",
    done: "Gracias por tu interés en co-crear bienestar juntos. Pronto nos pondremos en contacto contigo.",
  },
} as const;

/* ---------------- Membresía ---------------- */
export const MEMBERSHIP = {
  eyebrow: "Membresía",
  title: "Todo The Flare Club, a tu ritmo.",
  description:
    "Movement, meditaciones, charlas, workbooks y nuevas herramientas que iremos sumando para acompañarte a volver a ti y encender tu luz interna.",
  trialLine: "7 días gratis. Cancela cuando quieras.",
  /** CTA de la prueba gratis, igual en todo el sitio */
  cta: "Empezar 7 días gratis",
  business: {
    eyebrow: "Empresas & marcas",
    title: "Experiencias creadas para tu equipo o comunidad.",
    description:
      "Experiencias de bienestar para colaboradores, eventos especiales y activaciones de PR para marcas, diseñadas según las necesidades de cada proyecto.",
    cta: "Cotizar una experiencia",
  },
} as const;

/* ---------------- Sobre nosotras ---------------- */
export const ABOUT = {
  eyebrow: "Sobre nosotras",
  title: "Un club para volver a ti.",
  intro: [
    "Creemos que todos tenemos una luz interna. Esa parte de ti que sabe lo que vales, que confía en lo que eres capaz de hacer y que reconoce lo que te hace bien.",
    "A veces, entre la rutina, las expectativas y todo lo que pasa afuera, dejamos de escucharla. The Flare Club nació para crear espacios que te ayuden a volver a ella.",
    "Porque algo cambia cuando empiezas a cumplir las promesas que te haces. Cuando eliges hábitos que te hacen sentir bien. Cuando mueves tu cuerpo, cuidas tu energía, escuchas lo que necesitas y tomas decisiones desde un lugar más consciente.",
    "No se trata de convertirte en alguien nuevo. Se trata de volver a ti, recordar tu valor y encender de nuevo esa luz que siempre ha estado ahí.",
    "Eso es The Flare Club.",
  ],
  quote: BRAND_LINE,
  blocks: [
    {
      n: "01",
      title: "Nuestra historia",
      paragraphs: [
        "El movimiento ha sido parte de nuestra vida desde que éramos niñas. Crecimos bailando jazz y ballet, y nuestra abuela siempre decía que soñaba con el día en que tuviéramos nuestra propia academia de baile. Hoy nos gusta pensar que, de una forma muy distinta, ese sueño encontró su camino.",
        "Años después empezamos dando clases de Pilates y Barre en un gimnasio. Luego nació la idea de crear nuestra primera experiencia de The Flare Club. No sabíamos cuántas personas iban a llegar ni cuántas marcas iban a creer en el proyecto. Solo teníamos algo claro: si una persona se inscribía y regresaba a su casa sintiéndose un poquito mejor consigo misma, para nosotras ya había valido la pena.",
        "Ese primer evento hizo sold out. Después vino otro, y otro, y con cada edición entendimos que The Flare Club podía ser mucho más que eventos.",
        "Hoy damos el siguiente paso llevando esa misma intención al mundo digital. Porque The Flare Club no es una clase, una plataforma o un evento. Es todo lo que pueda ayudarte a volver a ti y encender tu luz desde adentro.",
      ],
    },
    {
      n: "02",
      title: "¿Qué significa Flare?",
      paragraphs: [
        "Flare es esa luz que existe dentro de ti.",
        "La que aparece cuando recuerdas tu valor, cuando vuelves a confiar en lo que eres capaz de hacer y cuando empiezas a elegirte en las pequeñas decisiones de todos los días.",
        "Para nosotras, encender tu luz no significa convertirte en alguien diferente. Significa volver a reconocer lo que ya existe dentro de ti y hacer más espacio para todo aquello que te hace sentir bien, presente y conectado contigo.",
        "Por eso somos The Flare Club: un espacio creado para ayudarte a volver a esa luz, una y otra vez.",
      ],
    },
    {
      n: "03",
      title: "Nuestra filosofía",
      paragraphs: [
        "Creemos que las pequeñas decisiones cambian la forma en la que te relacionas contigo.",
        "Cumplir una promesa que te hiciste. Mover tu cuerpo porque te hace sentir bien. Cuidar tu energía. Hacer una pausa. Escucharte. Elegir un hábito que sabes que te hace bien, incluso cuando nadie más lo está viendo.",
        "Porque cada vez que haces algo por ti, te recuerdas que puedes confiar en ti.",
        "No buscamos perfección. Buscamos intención. Crear una vida en la que cuidarte no sea algo que haces de vez en cuando, sino una forma de elegirte.",
        "Y creemos que cuando empiezas a elegirte, tu luz se nota desde adentro hacia afuera.",
      ],
    },
  ],
  foundersTitle: "Fundadoras",
  /** Resumen para el bloque de Inicio */
  homeTeaser:
    "Creemos que todos tenemos una luz interna. The Flare Club nació para crear espacios que te ayuden a volver a ella: movimiento, herramientas, conversaciones y experiencias.",
} as const;

/* ---------------- Pie de página ---------------- */
export const FOOTER = {
  title: "Un espacio para volver a ti.",
  paragraphs: [
    "Para moverte, conocerte, cuestionarte, aprender y crear hábitos que te hagan sentir bien. Un lugar para recordar tu valor, confiar en lo que eres capaz y seguir encendiendo esa luz que ya existe dentro de ti.",
    "Movimiento, herramientas, conversaciones y experiencias. A tu ritmo, estés donde estés.",
  ],
} as const;
