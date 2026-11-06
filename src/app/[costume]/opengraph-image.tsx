import { notFound } from "next/navigation";
import { COSTUMES } from "@/lib/costumes";
import { costumeCard, OG_SIZE } from "../og";

export const alt = "gpty.lol: an AI chatbot in costume";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return COSTUMES.map((c) => ({ costume: c.id }));
}

export default async function Image({ params }: { params: Promise<{ costume: string }> }) {
  const { costume } = await params;
  const c = COSTUMES.find((x) => x.id === costume);
  if (!c) notFound();
  return costumeCard(c);
}
