/**
 * Funciones de motion que carga MotionProvider de forma diferida en todas las páginas: animaciones,
 * exit y gestos (domAnimation). Layout y arrastre (domMax) van aparte, en layout-features.ts, y solo
 * los cargan las herramientas que los usan (LayoutMotion).
 */
import { domAnimation } from "motion/react";

export default domAnimation;
