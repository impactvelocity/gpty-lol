"use client";

import { useEffect, useRef } from "react";
import { COSTUMES, type Costume, type CostumeGroup } from "@/lib/costumes";

const GROUPS: CostumeGroup[] = ["Classic", "Haunted", "Other"];

export function Wardrobe({
  open,
  current,
  onPick,
  onClose,
}: {
  open: boolean;
  current: string;
  onPick: (c: Costume) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(920px,94vw)] rounded-2xl border border-white/10 bg-[#120c1a] p-0 text-zinc-100 shadow-2xl shadow-black/60 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="max-h-[86vh] overflow-y-auto p-5 sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              🎭 The Wardrobe
            </h2>
            <p className="text-sm text-zinc-400">
              A costume changes how gpty looks <em>and</em> how it talks.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-zinc-400 hover:bg-white/10 hover:text-white"
            aria-label="Close wardrobe"
          >
            Esc
          </button>
        </div>

        {GROUPS.map((group) => {
          const items = COSTUMES.filter((c) => c.group === group);
          if (!items.length) return null;
          return (
            <section key={group} className="mb-6 last:mb-0">
              <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-500">
                {group === "Haunted" ? "Haunted editions †" : group}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onPick(c)}
                    aria-pressed={c.id === current}
                    className={`group relative overflow-hidden rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:border-orange-400/70 focus-visible:outline-2 focus-visible:outline-orange-400 ${
                      c.id === current
                        ? "border-orange-400 bg-white/10"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div
                      className="mb-3 h-14 rounded-lg ring-1 ring-white/10"
                      style={{
                        background: `linear-gradient(135deg, ${c.swatch[0]}, ${c.swatch[1]})`,
                      }}
                    >
                      <span className="block px-2 pt-2 text-2xl drop-shadow">
                        {c.avatar}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-xs text-zinc-500">{c.year}</span>
                    </div>
                    <p className="mt-1 text-xs leading-snug text-zinc-400">
                      {c.tagline}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </dialog>
  );
}
