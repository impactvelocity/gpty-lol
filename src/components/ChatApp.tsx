"use client";

import { useChat } from "@ai-sdk/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { COSTUMES, DEFAULT_COSTUME, getCostume, type Costume } from "@/lib/costumes";
import { HauntOverlay } from "./Haunt";
import { Wardrobe } from "./Wardrobe";
import { BbsLayout } from "./layouts/BbsLayout";
import { CleanLayout } from "./layouts/CleanLayout";
import { IcqLayout } from "./layouts/IcqLayout";
import { MessengerLayout } from "./layouts/MessengerLayout";
import { MsnLayout } from "./layouts/MsnLayout";
import { IrcLayout } from "./layouts/IrcLayout";
import { MachineLayout } from "./layouts/MachineLayout";
import { SlackLayout } from "./layouts/SlackLayout";
import { TerminalLayout } from "./layouts/TerminalLayout";
import { SeanceLayout } from "./layouts/SeanceLayout";
import { SkypeLayout } from "./layouts/SkypeLayout";
import type { ChatLine, LayoutProps } from "./layouts/types";
import type { ChatMessage } from "@/lib/types";

const LAYOUTS: Record<Costume["layout"], (p: LayoutProps) => React.ReactNode> = {
  clean: CleanLayout,
  msn: MsnLayout,
  bbs: BbsLayout,
  icq: IcqLayout,
  skype: SkypeLayout,
  messenger: MessengerLayout,
  slack: SlackLayout,
  irc: IrcLayout,
  terminal: TerminalLayout,
  machine: MachineLayout,
  seance: SeanceLayout,
};

const STORAGE_KEY = "gpty.costume";

export function ChatApp() {
  const [costumeId, setCostumeId] = useState(DEFAULT_COSTUME);
  const [wardrobeOpen, setWardrobeOpen] = useState(false);
  const [changing, setChanging] = useState<Costume | null>(null);
  const costume = getCostume(costumeId);

  const { messages, sendMessage, status, stop, error } = useChat<ChatMessage>();

  // Restore the last costume (or ?costume=id) after hydration.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("costume");
    const saved = fromUrl ?? localStorage.getItem(STORAGE_KEY);
    // localStorage is only readable after hydration, so this must be an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved && COSTUMES.some((c) => c.id === saved)) setCostumeId(saved);
  }, []);

  // Ctrl/Cmd+K opens the wardrobe from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setWardrobeOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pick = useCallback(
    (next: Costume) => {
      setWardrobeOpen(false);
      if (next.id === costumeId) return;
      setChanging(next);
      // Swap in the middle of the flash so the old UI never visibly pops.
      setTimeout(() => {
        setCostumeId(next.id);
        localStorage.setItem(STORAGE_KEY, next.id);
      }, 450);
      setTimeout(() => setChanging(null), 1000);
    },
    [costumeId],
  );

  const lines: ChatLine[] = useMemo(
    () =>
      messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => {
          const text = m.parts
            .map((p) => (p.type === "text" ? p.text : ""))
            .join("");
          return {
            id: m.id,
            role: m.role as "user" | "assistant",
            text,
            at: m.metadata?.createdAt ?? 0,
          };
        })
        // Hide the empty assistant placeholder; `waiting` covers that moment.
        .filter((l) => l.text.length > 0),
    [messages],
  );

  const busy = status === "submitted" || status === "streaming";
  const waiting =
    status === "submitted" ||
    (status === "streaming" && lines.at(-1)?.role !== "assistant");

  const onSend = useCallback(
    (text: string) => {
      sendMessage(
        { text, metadata: { createdAt: Date.now() } },
        { body: { costume: costumeId } },
      );
    },
    [sendMessage, costumeId],
  );

  const Layout = LAYOUTS[costume.layout];

  return (
    <div
      className={`costume costume-${costume.layout} ${costume.haunted ? "is-haunted" : ""}`}
      style={costume.palette as React.CSSProperties}
    >
      <Layout
        costume={costume}
        lines={lines}
        busy={busy}
        waiting={waiting}
        error={status === "error" || !!error}
        onSend={onSend}
        onStop={stop}
        onOpenWardrobe={() => setWardrobeOpen(true)}
      />
      {costume.haunted && <HauntOverlay />}
      {changing && (
        <div className="poof" aria-hidden>
          <span>{changing.avatar}</span>
          <b>{changing.name}</b>
        </div>
      )}
      <Wardrobe
        open={wardrobeOpen}
        current={costumeId}
        onPick={pick}
        onClose={() => setWardrobeOpen(false)}
      />
    </div>
  );
}
