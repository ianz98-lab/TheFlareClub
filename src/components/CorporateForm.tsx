"use client";

import { useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FormAlert, FormNote, TextArea } from "@/components/ui/form";
import { CORPORATE } from "@/content/site";
import { LEAD_DEMO, LEAD_LIMITS, leadsLive, submitLead } from "@/lib/leads";

type FieldName = "company" | "name" | "phone" | "email" | "message";
type Values = Record<FieldName, string>;
type Errors = Partial<Record<FieldName, string>>;

const EMPTY: Values = { company: "", name: "", phone: "", email: "", message: "" };
const ORDER: FieldName[] = ["company", "name", "phone", "email", "message"];

/** Largos máximos: los mismos CHECK de la tabla `leads`. Pasarse haría fallar el envío. */
const MAX: Record<FieldName, number> = LEAD_LIMITS;
/** Desde aquí se muestra cuánto falta para el límite del mensaje. */
const MESSAGE_WARN = 4500;

/** Validación propia (con noValidate) para que los mensajes salgan en español y junto a su campo. */
function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.company.trim()) e.company = "Escribe el nombre de la empresa o marca.";
  if (!v.name.trim()) e.name = "Escribe tu nombre.";
  if (!v.phone.trim()) e.phone = "Escribe tu teléfono.";
  else if (v.phone.replace(/\D/g, "").length < 8) e.phone = "Revisa tu teléfono: debe tener al menos 8 dígitos.";
  if (!v.email.trim()) e.email = "Escribe tu correo.";
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email.trim())) e.email = "Ese correo no parece válido. Revísalo.";
  if (!v.message.trim()) e.message = "Cuéntanos qué te gustaría cotizar.";
  // maxLength ya lo impide al escribir; esto cubre autocompletados o valores pegados por script.
  for (const f of ORDER) if (!e[f] && v[f].trim().length > MAX[f]) e[f] = `Máximo ${MAX[f].toLocaleString("es-GT")} caracteres.`;
  return e;
}

/**
 * Cotización para empresas y marcas. Se guarda como lead `corporativo` (tabla `leads` de Supabase).
 * Sin Supabase (prototipo) no se envía nada y el formulario lo dice (LEAD_DEMO). Textos en
 * `CORPORATE.form` (src/content/site.ts). Campos, errores y envío: src/components/ui/form.tsx.
 */
export function CorporateForm() {
  const uid = useId();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  // El envío terminó en modo demo: no llegó a ningún lado.
  const [demo, setDemo] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const sending = state === "sending";

  const onChange = (f: FieldName) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setValues((v) => ({ ...v, [f]: value }));
    // El error de un campo se quita en cuanto la persona lo corrige.
    if (errors[f]) setErrors((prev) => ({ ...prev, [f]: undefined }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    setSubmitError(null);
    const found = validate(values);
    setErrors(found);
    const first = ORDER.find((f) => found[f]);
    if (first) {
      // El lector anuncia el label y el error del campo al recibir el foco.
      (formRef.current?.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    // Honeypot: el campo "website" está oculto para las personas; submitLead finge el envío si viene lleno.
    const website = new FormData(e.currentTarget).get("website");
    setState("sending");
    const res = await submitLead({ kind: "corporativo", ...values, source: "corporativo", website: typeof website === "string" ? website : undefined });
    if (res.error) {
      setSubmitError(res.error);
      setState("idle");
      return;
    }
    setDemo(Boolean(res.demo));
    setState("sent");
    // El formulario desaparece: el foco pasa al mensaje de confirmación.
    requestAnimationFrame(() => doneRef.current?.focus());
  };

  if (state === "sent") {
    return (
      <div ref={doneRef} tabIndex={-1} role="status" className="border-t border-ink pt-6 outline-none">
        <p className="max-w-xl font-display text-display-md">{CORPORATE.form.done}</p>
        {demo && <FormNote className="mt-4">{LEAD_DEMO.sent}</FormNote>}
      </div>
    );
  }

  /** Lo común de cada campo: nombre, valor, límite, label y su error. */
  const field = (f: FieldName) => ({
    id: `${uid}-${f}`,
    name: f,
    required: true,
    value: values[f],
    onChange: onChange(f),
    maxLength: MAX[f],
    label: CORPORATE.form.fields[f],
    error: errors[f],
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={sending} className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
      <Field {...field("company")} type="text" autoComplete="organization" />
      <Field {...field("name")} type="text" autoComplete="name" />
      <Field {...field("phone")} type="tel" autoComplete="tel" inputMode="tel" />
      <Field {...field("email")} type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} />
      <TextArea {...field("message")} hint={CORPORATE.form.messageHint} countFrom={MESSAGE_WARN} className="sm:col-span-2" />

      {/* Honeypot anti-spam: fuera de la vista, del tabulador y de los lectores de pantalla. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor={`${uid}-website`}>No llenes este campo</label>
        <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="sm:col-span-2">
        <FormAlert className="mb-4">{submitError}</FormAlert>
        <Button type="submit" size="lg" pending={sending} className="w-full sm:w-auto">
          {sending ? "Enviando…" : CORPORATE.form.submit}
        </Button>
        {/* Solo lo confirmado: el aviso de privacidad llega cuando exista (decisión D12). */}
        <FormNote className="mt-3">Sin compromiso.</FormNote>
        {!leadsLive && <FormNote className="mt-1">{LEAD_DEMO.notice}</FormNote>}
      </div>
    </form>
  );
}
