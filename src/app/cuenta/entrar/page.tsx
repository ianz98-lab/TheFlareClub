import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell, FormSkeleton } from "@/components/account/AuthShell";
import { ACCOUNT_COPY, ACCOUNT_PHOTOS } from "@/components/account/copy";
import { SignInView } from "@/components/account/SignInView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({ title: "Entrar", description: ACCOUNT_COPY.signIn.description, path: "/cuenta/entrar", image: ACCOUNT_PHOTOS.signIn }),
  robots: { index: false },
};

export default function EntrarPage() {
  return (
    <Suspense
      fallback={
        <AuthShell photo={ACCOUNT_PHOTOS.signIn} title={ACCOUNT_COPY.signIn.title} description={ACCOUNT_COPY.signIn.description}>
          <FormSkeleton />
        </AuthShell>
      }
    >
      <SignInView />
    </Suspense>
  );
}
