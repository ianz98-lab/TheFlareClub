/**
 * domMax: lo de domAnimation más `layout`/`layoutId` y `drag`. Solo lo carga LayoutMotion (buscador,
 * hoja de filtros y constructor de rutinas), así las demás páginas no bajan ese chunk.
 */
import { domMax } from "motion/react";

export default domMax;
