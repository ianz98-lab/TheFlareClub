import type { Instructor } from "./types";

export const instructors: Instructor[] = [
  {
    id: "mariana",
    slug: "mariana-wer",
    name: "Mariana Wer",
    role: "Co-fundadora · Coach de Pilates Mat & Barre",
    tagline: "Movement, mindset & conscious living.",
    photo: "/images/coach-clase-barre-vertical.jpg",
    founder: true,
    bio: "El movimiento ha sido parte de mi vida desde que tengo memoria. Crecí bailando jazz y ballet y, con los años, fui probando prácticamente todo lo que despertara mi curiosidad: box, indoor cycling, Pilates Reformer, yoga, acrobacia aérea, pesas, fútbol, volleyball, basketball, natación… hasta encontrar en Pilates Mat y Barre una de mis grandes pasiones.",
    // Texto de Mariana (CAMBIOS PAGINA WEB.docx, 30-sep-2026)
    longBio: [
      "El movimiento ha sido parte de mi vida desde que tengo memoria. Crecí bailando jazz y ballet y, con los años, fui probando prácticamente todo lo que despertara mi curiosidad: box, indoor cycling, Pilates Reformer, yoga, acrobacia aérea, pesas, fútbol, volleyball, basketball, natación… hasta encontrar en Pilates Mat y Barre una de mis grandes pasiones.",
      "Pero nunca he creído que exista una sola forma correcta de moverse. Me gusta ser principiante, probar cosas nuevas y recordar que mover el cuerpo también puede ser una forma de conocernos. Hoy, por ejemplo, estoy aprendiendo tenis, y probablemente mañana encuentre algo nuevo que quiera intentar.",
      "Mi camino de crecimiento personal ha sido igual: una búsqueda constante.",
      "Durante años soñé con tener un podcast, pero me daba miedo lanzarlo. También me daba miedo empezar a compartir en redes lo que estaba aprendiendo o pararme frente a un colegio o una universidad a dar una charla. Lo hice con miedo. Y poco a poco, una decisión a la vez, ese camino se fue construyendo.",
      "En paralelo, seguí un camino mucho más tradicional. Me gradué Summa Cum Laude de la Universidad del Valle de Guatemala como Licenciada en International Marketing & Business Analytics y empecé mi carrera en el mundo corporativo. Aprendí muchísimo ahí, pero eventualmente tomé la decisión de dejarlo para seguir un llamado que llevaba tiempo sintiendo: crear, comunicar y compartir herramientas que pudieran aportar algo a la vida de otras personas.",
      "Mi propio proceso ha estado acompañado por terapia, constelaciones familiares, Un Curso de Milagros, libros, cursos, viajes —incluyendo India— y maestros increíbles que he tenido la suerte de encontrar en el camino. Herramientas que han transformado mi manera de verme, de relacionarme conmigo y de entender la vida.",
      "Con el tiempo entendí que había algo que se repetía dentro de mí: las ganas de compartir las herramientas que estaban cambiando mi propia vida. No porque tenga todas las respuestas, sino porque sigo aprendiendo, cuestionándome y transformándome también.",
      "Creo profundamente que mi vida de hoy es el resultado de muchas pequeñas decisiones: cuestionar creencias que me limitaban, atreverme aunque tuviera miedo, cumplir una promesa que me hice y elegir de nuevo.",
      "The Flare Club es una forma de compartir ese camino y poner al alcance de más personas las herramientas que a mí me han ayudado a volver a mí, encender mi luz y recordar todo lo que somos capaces de transformar."
    ],
  },
  {
    id: "sofi",
    slug: "sofi-wer",
    name: "Sofi Wer",
    // Bio nueva de Sofi: pendiente (el documento dice "PENDIENTES LOS CAMBIOS DE SOFI").
    role: "Co-fundadora · Coach de Pilates Mat & Barre",
    tagline: "Movement, wellness & everyday balance.",
    photo: "/images/coach-evento-gorra-vertical.jpg",
    founder: true,
    bio: "Coach de Pilates Mat y Barre y creadora de contenido de bienestar y lifestyle. Ha dado clases, talleres y charlas en colegios, universidades, empresas y eventos, creando experiencias que mezclan movimiento, conexión y bienestar. En redes comparte su forma de vivir el bienestar desde lo cotidiano: movimiento, disciplina, autocuidado y balance.",
  },
  {
    id: "exp-nutricion",
    slug: "andrea-lopez",
    name: "Andrea López",
    role: "Nutricionista",
    photo: "/images/coaches-mariana-sofi-retrato.jpg",
    bio: "Nutricionista clínica enfocada en alimentación intuitiva y relación sana con la comida.",
  },
  {
    id: "exp-psico",
    slug: "camila-ruiz",
    name: "Camila Ruiz",
    role: "Psicóloga",
    photo: "/images/meditacion-clase-ventanal.jpg",
    bio: "Psicóloga clínica especializada en autoestima, límites y relaciones.",
  },
  {
    id: "exp-finanzas",
    slug: "lucia-mendez",
    name: "Lucía Méndez",
    role: "Asesora financiera",
    photo: "/images/clase-04.jpg",
    bio: "Ayuda a mujeres a construir una relación tranquila y clara con su dinero.",
  },
];

export const instructorById = (id: string) =>
  instructors.find((i) => i.id === id) ?? instructors[0];
