"use client";

/**
 * Trick-or-treat: chat in a costume (get at least one reply) and it drops a
 * candy in your bag. Fill the bag by trying all of them. Stored per browser.
 */

import { useCallback, useRef, useState } from "react";
import { COSTUMES } from "./costumes";
import type { Thread } from "./threads";

const KEY = "gpty.candy.v1";

const valid = (ids: unknown) =>
  new Set(
    (Array.isArray(ids) ? ids : []).filter(
      (id): id is string => typeof id === "string" && COSTUMES.some((c) => c.id === id),
    ),
  );

function save(set: Set<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {}
}

/** Credit costumes the user already chatted in before candy existed. */
function fromThreads(threads: Thread[]) {
  const got = new Set<string>();
  for (const t of threads) {
    if (!t.messages.some((m) => m.role === "assistant")) continue;
    for (const m of t.messages) {
      const c = m.metadata?.costume;
      if (m.role === "user" && typeof c === "string") got.add(c);
    }
  }
  return valid([...got]);
}

export function useCandy(threads: Thread[]) {
  const [got, setGot] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return valid(JSON.parse(raw));
    } catch {}
    const seeded = fromThreads(threads);
    save(seeded);
    return seeded;
  });
  const ref = useRef(got);

  /** Returns the new bag count if this costume was newly collected, else null. */
  const collect = useCallback((id: string) => {
    if (ref.current.has(id) || !COSTUMES.some((c) => c.id === id)) return null;
    const next = new Set(ref.current).add(id);
    ref.current = next;
    save(next);
    setGot(next);
    return next.size;
  }, []);

  return { got, collect, total: COSTUMES.length };
}
