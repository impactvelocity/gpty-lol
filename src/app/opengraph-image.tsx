import { homeCard, OG_SIZE } from "./og";

export const alt =
  "gpty.lol: AI agents that can’t do anything. Twelve Gptys, each stuck in a chat app from another time, with all twelve in a row.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return homeCard();
}
