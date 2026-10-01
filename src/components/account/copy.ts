import { ABOUT_PHOTOS, EVENT_GALLERIES, MEDITATION_PHOTOS, STUDIO_PHOTOS } from "@/content/media";
import type { Photo } from "@/content/types";

/**
 * Textos y fotos de las pantallas de cuenta. Viven fuera de los componentes cliente para que
 * las páginas (servidor) puedan usarlos en el fallback de Suspense sin duplicarlos.
 */
const fallbackPhoto: Photo = ABOUT_PHOTOS[0];

export const ACCOUNT_PHOTOS = {
  /** Alumna e instructora en sentadilla junto al ventanal: empezar a moverse (las fundadoras ya salen en Inicio y Sobre nosotras) */
  signUp: STUDIO_PHOTOS.sentadilla,
  /** Meditación sentada: volver */
  signIn: MEDITATION_PHOTOS[4] ?? fallbackPhoto,
  password: MEDITATION_PHOTOS[1] ?? fallbackPhoto,
  /** Pilates & Journaling: mujeres escribiendo junto al ventanal */
  signedOut: EVENT_GALLERIES["pilates-journaling-feb-2026"]?.[4] ?? fallbackPhoto,
  /** Mi cuenta con sesión (desktop, junto al saludo): estiramiento tranquilo junto al ventanal */
  portal: STUDIO_PHOTOS.estiramiento,
} satisfies Record<string, Photo>;

export const ACCOUNT_COPY = {
  signUp: {
    title: "Crea tu cuenta.",
    description: "Guarda tus favoritos y retoma tus clases donde te quedaste.",
    withPlan: "Primero, tu cuenta. Después empiezas tus 7 días gratis.",
  },
  signIn: {
    title: "Entra a tu cuenta.",
    description: "Tus favoritos y tus rutinas te esperan.",
    /** Después de "Cerrar sesión" (/cuenta/entrar?salida=1) */
    signedOut: "Cerraste sesión. Tus favoritos y rutinas te esperan cuando vuelvas.",
  },
  recover: {
    title: "Recupera tu acceso.",
    description: "Escribe el correo con el que creaste tu cuenta y te enviamos un enlace para crear una contraseña nueva.",
    sent: "Si existe una cuenta con ese correo, te enviamos un enlace para crear una contraseña nueva.",
  },
  newPassword: {
    title: "Crea tu nueva contraseña.",
    changeTitle: "Cambia tu contraseña.",
    description: "Crea una contraseña nueva para tu cuenta.",
  },
  /** Mi cuenta sin sesión (también la descripción de la página) */
  portal: {
    title: "Tu espacio.",
    description: "Entra para retomar tus clases, ver tus favoritos y repetir tus rutinas.",
  },
  /** Aviso del portal en modo demo (mismo formato que LEAD_DEMO en src/lib/leads.ts) */
  demo: "Modo demo: tu cuenta y tu actividad se guardan solo en este navegador.",
  /** Aviso de los formularios (crear cuenta / entrar) en modo demo */
  demoAuth: "Modo demo: tu cuenta vive solo en este navegador y la contraseña no se guarda ni se verifica.",
  demoRecover: "En el modo demo no enviamos correos: tu cuenta vive en este navegador y para volver a entrar solo necesitas tu correo.",
  demoPassword: "En el modo demo la contraseña no se guarda. Cuando activemos las cuentas reales podrás cambiarla aquí.",
} as const;

/**
 * Correo de contacto de la marca. `null` mientras no exista el buzón de la empresa (decisión D5): las
 * frases que invitan a escribirnos no se muestran (`hasContact` en portal-ui) y el pie omite la fila.
 * Cuando exista, poner aquí "hola@theflare.club" y todo el sitio lo muestra.
 */
export const CONTACT_EMAIL: string | null = null;
