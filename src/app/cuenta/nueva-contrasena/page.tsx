import type { Metadata } from "next";
import { ACCOUNT_COPY, ACCOUNT_PHOTOS } from "@/components/account/copy";
import { NewPasswordView } from "@/components/account/NewPasswordView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Nueva contraseña",
    description: ACCOUNT_COPY.newPassword.description,
    path: "/cuenta/nueva-contrasena",
    image: ACCOUNT_PHOTOS.password,
  }),
  robots: { index: false },
};

/** Destino del correo de "recuperar contraseña" (ver `sendPasswordReset` en src/lib/auth.tsx). */
export default function NuevaContrasenaPage() {
  return <NewPasswordView />;
}
