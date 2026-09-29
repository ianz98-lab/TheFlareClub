import type { Metadata } from "next";
import { AccountView } from "@/components/AccountView";

export const metadata: Metadata = { title: "Mi cuenta" };

export default function CuentaPage() {
  return <AccountView />;
}
