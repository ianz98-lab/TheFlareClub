import type { Metadata } from "next";
import { ACCOUNT_COPY, ACCOUNT_PHOTOS } from "@/components/account/copy";
import { RecoverView } from "@/components/account/RecoverView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Recuperar contraseña",
    description: ACCOUNT_COPY.recover.description,
    path: "/cuenta/recuperar",
    image: ACCOUNT_PHOTOS.password,
  }),
  robots: { index: false },
};

export default function RecuperarPage() {
  return <RecoverView />;
}
