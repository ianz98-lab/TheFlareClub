import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell, FormSkeleton } from "@/components/account/AuthShell";
import { ACCOUNT_COPY, ACCOUNT_PHOTOS } from "@/components/account/copy";
import { SignUpView } from "@/components/account/SignUpView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({ title: "Crear cuenta", description: ACCOUNT_COPY.signUp.description, path: "/cuenta/crear", image: ACCOUNT_PHOTOS.signUp }),
  robots: { index: false },
};

export default function CrearCuentaPage() {
  // ?plan=flare-mensual|flare-anual se lee en el cliente: va dentro de Suspense.
  return (
    <Suspense
      fallback={
        <AuthShell photo={ACCOUNT_PHOTOS.signUp} title={ACCOUNT_COPY.signUp.title} description={ACCOUNT_COPY.signUp.description}>
          <FormSkeleton fields={3} />
        </AuthShell>
      }
    >
      <SignUpView />
    </Suspense>
  );
}
