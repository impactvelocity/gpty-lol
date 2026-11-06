import { useEffect, useRef, useState } from "react";

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
