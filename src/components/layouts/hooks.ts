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

/** Simple controlled input that submits on Enter (Shift+Enter = newline). */
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
