"use client";

import { useState } from "react";
import { ClassicTitleBar, IcqFlower } from "@/components/chrome";
import { useComposer, useNow, useOnNewReply, useStickyScroll } from "./hooks";
import { clock, type LayoutProps, type ThreadItem } from "./types";

const DAY = 86_400_000;
const MAX_CHARS = 450;

/** ICQ 2000b on Windows 98: contact list plus a Message Session dialog. */
export function IcqLayout({
  costume,
  lines,
  busy,
  waiting,
  error,
  onSend,
  onStop,
  threads,
  activeId,
  onSelectThread,
  onNewThread,
  onDeleteThread,
}: LayoutProps) {
  const { value, setValue, submit, onKeyDown } = useComposer(onSend, busy);
  const scroller = useStickyScroll<HTMLDivElement>(lines);
  const [uhoh, setUhoh] = useState(0);
  useOnNewReply(lines, () => setUhoh((n) => n + 1));

  // Contacts you talked to in the last day are "online"; older ones went offline.
  const now = useNow(30_000);
  const online = threads.filter((t) => t.draft || now - t.updatedAt < DAY);
  const offline = threads.filter((t) => !t.draft && now - t.updatedAt >= DAY);
  const active = threads.find((t) => t.id === activeId);
  const nick = active?.draft || !active ? costume.assistant : active.title;

  return (
    <div className="pixel-text bevel-window relative flex h-full flex-col bg-[#d4d0c8] p-[3px] font-[Tahoma,Arial,sans-serif] text-[11px] text-black">
      <ClassicTitleBar
        title={`${costume.app} - Message Session - ${nick}`}
        icon={<IcqFlower className="h-4 w-4" status="logo" />}
        gradient="from-[#000080] to-[#1084d0]"
      />

      <div className="mt-[3px] flex min-h-0 flex-1 gap-[3px]">
        {/* Contact list */}
        <aside className="hidden w-52 shrink-0 flex-col gap-[3px] md:flex">
          <div className="bevel-out flex items-center gap-2 bg-[#d4d0c8] px-2 py-1.5">
            <IcqFlower className="h-7 w-7" status="logo" />
            <div className="leading-tight">
              <div className="text-[15px] font-bold tracking-tight">
                ICQ <span className="text-[10px] font-normal">2000b</span>
              </div>
              <div className="text-[10px] text-[#404040]">#12345678</div>
            </div>
          </div>
          <nav className="bevel-in min-h-0 flex-1 overflow-y-auto bg-white p-1" aria-label="Contacts">
            <Group label="Online" count={online.length} />
            {online.map((t) => (
              <Contact
                key={t.id}
                t={t}
                label={t.draft ? costume.newThread : t.title}
                status="online"
                active={t.id === activeId}
                onSelect={onSelectThread}
                onDelete={onDeleteThread}
              />
            ))}
            <Group label="Offline" count={offline.length} />
            {offline.map((t) => (
              <Contact
                key={t.id}
                t={t}
                label={t.title}
                status="offline"
                active={t.id === activeId}
                onSelect={onSelectThread}
                onDelete={onDeleteThread}
              />
            ))}
          </nav>
          <div className="flex gap-[3px]">
            <button onClick={onNewThread} className="btn-classic flex flex-1 items-center justify-center gap-1 py-1 font-bold">
              <IcqFlower className="h-3.5 w-3.5" status="logo" /> Add Contact
            </button>
          </div>
          <div className="flex gap-[3px]">
            <span className="btn-classic flex-1 py-1 text-center">Main</span>
            <span className="btn-classic flex-1 py-1 text-center">Services</span>
          </div>
          <div className="btn-classic flex items-center justify-center gap-1.5 py-1">
            <IcqFlower className="h-3.5 w-3.5" /> Online
          </div>
        </aside>

        {/* Message session */}
        <section className="flex min-w-0 flex-1 flex-col gap-1.5 px-1 pb-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
            <Field label="Nickname:" value={nick} grow />
            <Field label="UIN:" value="31337" />
            <Field label="Email:" value="buddy@icq.com" />
          </div>
          <div className="flex items-center gap-1.5 text-[#404040]">
            <IcqFlower className="h-3 w-3" status={busy ? "away" : "online"} />
            {busy ? "Occupied (urgent msgs)" : "Online"} · Local time {clock(now)}
          </div>
          <div ref={scroller} className="bevel-in min-h-0 flex-1 overflow-y-auto bg-white p-1.5 text-[12px]">
            <Entry who={costume.assistant} text={costume.greeting} them />
            {lines.map((l) => (
              <Entry
                key={l.id}
                who={l.role === "user" ? costume.user : costume.assistant}
                text={l.text}
                them={l.role === "assistant"}
                at={l.at}
              />
            ))}
            {error && <Entry who="ICQ System" text={costume.error} them />}
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold">Message:</span>
            <span className="text-[#404040]">{waiting ? costume.typing : ""}</span>
          </div>
          <textarea
            value={value}
            maxLength={MAX_CHARS}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            rows={3}
            aria-label="Message"
            className="bevel-in resize-none bg-white p-1.5 text-[12px] outline-none"
          />
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1">
              <span className="bevel-in inline-block h-3 w-3 bg-white" /> Send Multiple
            </label>
            <span className="text-[#404040]">
              Chars: {value.length}/{MAX_CHARS}
            </span>
            <span className="flex-1" />
            <button onClick={submit} disabled={busy || !value.trim()} className="btn-classic min-w-[72px] px-3 py-1 font-bold">
              Send
            </button>
            <button
              onClick={() => (busy ? onStop() : setValue(""))}
              className="btn-classic min-w-[72px] px-3 py-1"
            >
              Cancel
            </button>
            <span className="btn-classic hidden px-3 py-1 sm:inline">More ▸</span>
          </div>
        </section>
      </div>

      {uhoh > 0 && (
        <div
          key={uhoh}
          className="pop pointer-events-none absolute bottom-16 right-6 z-10 flex items-center gap-2 border border-black bg-[#ffffe1] px-3 py-2 text-[12px] shadow-[2px_2px_0_rgba(0,0,0,.4)]"
          role="status"
        >
          <IcqFlower className="h-6 w-6" status="logo" />
          <div>
            <b>Uh-oh!</b>
            <div>Incoming message from {costume.assistant}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Group({ label, count }: { label: string; count: number }) {
  return (
    <div className="mt-1 flex items-center gap-1 font-bold first:mt-0">
      <span className="text-[9px]">▼</span> {label} ({count})
    </div>
  );
}

function Contact({
  t,
  label,
  status,
  active,
  onSelect,
  onDelete,
}: {
  t: ThreadItem;
  label: string;
  status: "online" | "offline";
  active: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="group flex items-center gap-1 pl-2">
      <IcqFlower className="h-3.5 w-3.5 shrink-0" status={status} />
      <button
        onClick={() => onSelect(t.id)}
        className={`min-w-0 truncate px-0.5 text-left ${active ? "bg-[#000080] text-white" : status === "offline" ? "text-[#404040]" : ""}`}
      >
        {label}
      </button>
      {!t.draft && (
        <button
          onClick={() => onDelete(t.id)}
          className="ml-auto hidden px-1 text-[#800000] group-hover:block"
          aria-label={`Delete ${label}`}
        >
          ×
        </button>
      )}
    </div>
  );
}

function Field({ label, value, grow }: { label: string; value: string; grow?: boolean }) {
  return (
    <label className={`flex items-center gap-1 ${grow ? "min-w-0 flex-1" : ""}`}>
      <span>{label}</span>
      <span className={`bevel-in truncate bg-white px-1.5 py-0.5 ${grow ? "min-w-0 flex-1" : "w-24"}`}>{value}</span>
    </label>
  );
}

function Entry({ who, text, them, at }: { who: string; text: string; them?: boolean; at?: number }) {
  return (
    <div className="mb-1.5 whitespace-pre-wrap break-words">
      <div className={`font-bold ${them ? "text-[#c00000]" : "text-[#0000c0]"}`}>
        {who}
        {at ? ` (${clock(at)})` : ""}:
      </div>
      <div className="pl-2">{text}</div>
    </div>
  );
}
