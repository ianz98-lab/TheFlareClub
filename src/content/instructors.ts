import type { Instructor } from "./types";

export const instructors: Instructor[] = [
  {
    id: "mariana",
    slug: "mariana-wer",
    name: "Mariana Wer",
    role: "Co-fundadora · Coach de Pilates Mat y Barre",
    tagline: "Movement, mindset & conscious living.",
    photo: "/images/coach-clase-barre-vertical.jpg",
    founder: true,
    bio: "Coach de Pilates Mat y Barre, apasionada por el crecimiento personal y por crear espacios que te hagan sentir más conectada contigo. Ha dado clases, talleres y charlas en colegios, universidades, empresas y eventos, llevando el bienestar más allá del movimiento. En redes comparte contenido sobre bienestar, crecimiento personal y una forma más consciente de vivir.",
  },
  {
    id: "sofi",
    slug: "sofi-wer",
    name: "Sofi Wer",
    role: "Co-fundadora · Coach de Pilates Mat y Barre",
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
