import { alt, homeCard, OG_SIZE } from "./og";

export { alt };
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return homeCard();
}
