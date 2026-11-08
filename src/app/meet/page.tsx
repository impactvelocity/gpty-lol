import type { Metadata } from "next";
import { ClientApp } from "../ClientApp";

// The same page as the home page, so it points search engines there.
export const metadata: Metadata = { alternates: { canonical: "/" } };

/** gpty.lol/meet: an older address for the Meet page; the app settles it on /. */
export default function Meet() {
  return <ClientApp costume="meet" />;
}
