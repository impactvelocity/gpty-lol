import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { agentEra, getAgent, isAgent } from "@/lib/agents";
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
  const a = isAgent(c.id) ? getAgent(c.id) : null;
  const title = a ? `${a.name} · ${agentEra(a)} — gpty.lol` : costumeTitle(c);
  const description = a
    ? `Chat with ${a.name}, a gpty who lives in ${c.app} (${c.year}) and only knows the world up to then. ${a.bio}`
    : `${c.tagline} An AI chatbot dressed up as ${c.app}.`;
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
