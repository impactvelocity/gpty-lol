import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { COSTUMES, costumeTitle } from "@/lib/costumes";
import { ClientApp, Splash } from "../ClientApp";

type Props = { params: Promise<{ costume: string }> };

export function generateStaticParams() {
  return COSTUMES.map((c) => ({ costume: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { costume } = await params;
  const c = COSTUMES.find((x) => x.id === costume);
  if (!c) return {};
  const title = costumeTitle(c);
  const description = `${c.tagline} An AI chatbot dressed up as ${c.app}: the look and the personality change together.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** gpty.lol/msn and friends: open the app wearing that costume. */
export default function CostumePage({ params }: Props) {
  return (
    <Suspense fallback={<Splash />}>
      <Costume params={params} />
    </Suspense>
  );
}

async function Costume({ params }: Props) {
  const { costume } = await params;
  if (!COSTUMES.some((c) => c.id === costume)) notFound();
  return <ClientApp costume={costume} />;
}
