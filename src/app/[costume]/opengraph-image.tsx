import { COSTUMES } from "@/lib/costumes";
import { alt, homeCard, OG_SIZE } from "../og";

/**
 * Every agent's page shares the home card. A page that sets its own Open
 * Graph title (see page.tsx) stops inheriting the root image, so it's
 * rendered here too.
 */
export { alt };
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return COSTUMES.map((c) => ({ costume: c.id }));
}

export default function Image() {
  return homeCard();
}
