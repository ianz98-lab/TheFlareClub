import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountView } from "@/components/AccountView";
import { ACCOUNT_COPY, ACCOUNT_PHOTOS } from "@/components/account/copy";
import { AccountSkeleton } from "@/components/account/SignedOutView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({ title: "Mi cuenta", description: ACCOUNT_COPY.portal.description, path: "/cuenta", image: ACCOUNT_PHOTOS.signedOut }),
  robots: { index: false },
};

export default function CuentaPage() {
  // Lee ?bienvenida / ?pago / ?code en el cliente (export estático): va dentro de Suspense.
  return (
    <Suspense fallback={<AccountSkeleton />}>
      <AccountView />
    </Suspense>
  );
}
