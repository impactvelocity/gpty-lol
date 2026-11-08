import type { Metadata } from "next";
import { ClientApp } from "../ClientApp";

const description =
  "AI agents that can't do anything. The Gptys each live inside a chat app from another time, from a cave wall to MSN Messenger to 2199, and only know their own little life.";

export const metadata: Metadata = {
  title: "Meet the Gptys — gpty.lol",
  description,
  openGraph: { title: "Meet the Gptys — gpty.lol", description },
};

/** gpty.lol/meet: the app, opened on the Meet the gptys page. */
export default function Meet() {
  return <ClientApp costume="meet" />;
}
