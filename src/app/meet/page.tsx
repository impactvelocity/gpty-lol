import type { Metadata } from "next";
import { ClientApp } from "../ClientApp";

const description =
  "The gptys are little chatbots who each live inside a chat app from another time, from a cave wall to MSN Messenger to 2199, and only know what their era knew.";

export const metadata: Metadata = {
  title: "Meet the gptys — gpty.lol",
  description,
  openGraph: { title: "Meet the gptys — gpty.lol", description },
};

/** gpty.lol/meet: the app, opened on the Meet the gptys page. */
export default function Meet() {
  return <ClientApp costume="meet" />;
}
