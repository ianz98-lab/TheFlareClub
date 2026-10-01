/**
 * Errores que no se le muestran a la usuaria (sincronización, formularios, pagos).
 * En desarrollo van a la consola con su área; en producción no se escriben: la consola del
 * sitio público la puede abrir cualquiera. Solo se reporta el código y el mensaje del error,
 * nunca lo que escribió la usuaria (nombre, correo, teléfono, mensaje).
 * Fase 2: el servicio de monitoreo se conecta aquí, en un solo lugar.
 */
export function reportError(scope: string, err: unknown): void {
  if (process.env.NODE_ENV === "production") return;
  console.warn(`[${scope}]`, describe(err));
}

function describe(err: unknown): string {
  if (err && typeof err === "object") {
    // Error de JS o de Supabase (PostgrestError / AuthError traen `code` y `message`).
    const { code, message } = err as { code?: unknown; message?: unknown };
    const text = [code, message].filter((x) => typeof x === "string" && x).join(" ");
    if (text) return text;
  }
  return String(err);
}
