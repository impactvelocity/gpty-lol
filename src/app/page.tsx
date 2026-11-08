import type { Metadata } from "next";
import { ClientApp } from "./ClientApp";

// Title, description and share card come from the root layout; this is the canonical home.
export const metadata: Metadata = { alternates: { canonical: "/" } };

/** gpty.lol: the app, opened on the Meet the Gptys page. */
export default function Home() {
  return <ClientApp costume="meet" />;
}
