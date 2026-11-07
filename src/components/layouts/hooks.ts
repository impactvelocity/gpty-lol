import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/** Keeps a scroll container pinned to the bottom when content changes. */
export function useStickyScroll<T extends HTMLElement>(dep: unknown) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [dep]);
  return ref;
}

/** Controlled input that submits on Enter (Shift+Enter = newline). */
export function useComposer(onSend: (t: string) => void, disabled = false) {
  const [value, setValue] = useState("");
  const submit = () => {
    const t = value.trim();
    if (!t || disabled) return;
    onSend(t);
    setValue("");
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };
  return { value, setValue, submit, onKeyDown };
}

/** Current time, refreshed every `ms`. Client-only component tree, so no hydration concerns. */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

/** Fires `fn` once each time a new assistant line appears (not on every token). */
export function useOnNewReply(
  lines: { id: string; role: string }[],
  fn: () => void,
) {
  const last = lines.at(-1);
  const lastReplyId = last?.role === "assistant" ? last.id : null;
  const seen = useRef(lastReplyId);
  const cb = useRef(fn);
  useEffect(() => {
    cb.current = fn;
  });
  useEffect(() => {
    if (!lastReplyId || lastReplyId === seen.current) return;
    seen.current = lastReplyId;
    cb.current();
  }, [lastReplyId]);
}

/** Where each costume's window was dragged to, so it stays put across chats. */
const spots = new Map<string, { x: number; y: number }>();

/**
 * Lets a window that's smaller than the chat area be dragged around it by its
 * title bar, like a window on a desktop. Put `ref` on the window and spread
 * `handle` on the title bar; double-click the title bar to put it back. The
 * window can't leave its container. Moves with the CSS `translate` property,
 * so transform animations (MSN's nudge shake) still work on top.
 */
export function useDesktopDrag<T extends HTMLElement>(key: string) {
  const ref = useRef<T>(null);
  const drag = useRef<{ id: number; x: number; y: number; from: { x: number; y: number } } | null>(null);

  /** Moves the window to `p`, kept inside its container. */
  const place = useCallback(
    (p: { x: number; y: number }) => {
      const el = ref.current;
      const box = el?.parentElement;
      if (!el || !box) return;
      const now = spots.get(key) ?? { x: 0, y: 0 };
      const r = el.getBoundingClientRect();
      const b = box.getBoundingClientRect();
      // Where the window sits with no offset.
      const left = r.left - now.x;
      const top = r.top - now.y;
      const clamp = (v: number, min: number, max: number) => Math.round(Math.min(Math.max(v, Math.min(min, 0)), Math.max(max, 0)));
      const next = { x: clamp(p.x, b.left - left, b.right - (left + r.width)), y: clamp(p.y, b.top - top, b.bottom - (top + r.height)) };
      spots.set(key, next);
      el.style.translate = next.x || next.y ? `${next.x}px ${next.y}px` : "";
    },
    [key],
  );

  // Restore the last spot, and keep the window inside when the area resizes.
  useLayoutEffect(() => {
    const box = ref.current?.parentElement;
    place(spots.get(key) ?? { x: 0, y: 0 });
    if (!box) return;
    const ro = new ResizeObserver(() => place(spots.get(key) ?? { x: 0, y: 0 }));
    ro.observe(box);
    return () => ro.disconnect();
  }, [key, place]);

  const handle = {
    onPointerDown(e: React.PointerEvent<HTMLElement>) {
      // Buttons in the title bar stay clickable.
      if (e.button !== 0 || (e.target as HTMLElement).closest("button, a, input, textarea")) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, from: spots.get(key) ?? { x: 0, y: 0 } };
      ref.current?.setAttribute("data-dragging", "");
    },
    onPointerMove(e: React.PointerEvent<HTMLElement>) {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      place({ x: d.from.x + e.clientX - d.x, y: d.from.y + e.clientY - d.y });
    },
    onPointerUp(e: React.PointerEvent<HTMLElement>) {
      if (drag.current?.id !== e.pointerId) return;
      drag.current = null;
      ref.current?.removeAttribute("data-dragging");
    },
    onPointerCancel(e: React.PointerEvent<HTMLElement>) {
      handle.onPointerUp(e);
    },
    onDoubleClick() {
      const el = ref.current;
      if (!el) return;
      const ease = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (ease) el.style.transition = "translate .28s cubic-bezier(.3,.8,.3,1)";
      place({ x: 0, y: 0 });
      if (ease) setTimeout(() => (el.style.transition = ""), 300);
    },
  };

  return { ref, handle };
}
