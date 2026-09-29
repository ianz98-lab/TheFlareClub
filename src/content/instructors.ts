import type { Instructor } from "./types";

export const instructors: Instructor[] = [
  {
    id: "mariana",
    slug: "mariana-wer",
    name: "Mariana Wer",
    role: "Co-fundadora · Pilates & Barre",
    photo: "/images/coach-clase-barre-vertical.jpg",
    founder: true,
    bio: "Mariana lidera las clases de Pilates Mat y Barre. Cree que el movimiento es la forma más honesta de volver a ti: sin perfección, con presencia.",
  },
  {
    id: "sofi",
    slug: "sofi-wer",
    name: "Sofi Wer",
    role: "Co-fundadora · Meditación & Bienestar",
    photo: "/images/coach-evento-gorra-vertical.jpg",
    founder: true,
    bio: "Sofi guía las meditaciones y el podcast Decide de Nuevo. Su trabajo une respiración, journaling y conversaciones que ayudan a soltar lo que ya no es tuyo.",
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
