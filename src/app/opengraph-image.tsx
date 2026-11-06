import { homeCard, OG_SIZE } from "./og";

export const alt = "gpty.lol: an AI chatbot that changes costumes, from a 1993 BBS to MSN Messenger";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return homeCard();
}
