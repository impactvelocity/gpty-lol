"use client";

import { useSyncExternalStore } from "react";

/*
 * The footer's bat, ported from LotteryClock's night scene: the bat's three poses share one
 * path structure, so the wings morph smoothly between them.
 */

/** The bat's wing poses on a 32 × 14 grid: raised, level, lowered. Same commands in each. */
const BAT_RAISED =
  "M 13 6.1 C 9 3.8 5 2 0.5 0.7 Q 2.8 4.7 4.8 6.1 Q 5.8 5.3 6.9 8.2 Q 8.9 6.9 8.2 8.3 Q 10.3 9.5 11.4 9.2 Q 11.5 8.1 13 9.8 C 13.3 14.2 18.7 14.2 19 9.8 Q 20.5 8.1 20.6 9.2 Q 21.7 9.5 23.8 8.3 Q 23.1 6.9 25.1 8.2 Q 26.2 5.3 27.2 6.1 Q 29.2 4.7 31.5 0.7 C 27 2 23 3.8 19 6.1 L 18.4 2.4 Q 18.2 1.8 17.6 2.4 L 16.6 4.1 Q 16 3.8 15.4 4.1 L 14.4 2.4 Q 13.8 1.8 13.6 2.4 Z";
const BAT_LEVEL =
  "M 13 6.1 C 9 3.6 5 2.6 0.5 5.4 Q 2.7 7.7 4.8 9.4 Q 5.8 7.4 6.9 10.7 Q 8.9 8.7 8.2 10.6 Q 10.3 11.5 11.4 10.4 Q 11.5 9 13 9.8 C 13.3 14.2 18.7 14.2 19 9.8 Q 20.5 9 20.6 10.4 Q 21.7 11.5 23.8 10.6 Q 23.1 8.7 25.1 10.7 Q 26.2 7.4 27.2 9.4 Q 29.3 7.7 31.5 5.4 C 27 2.6 23 3.6 19 6.1 L 18.4 2.4 Q 18.2 1.8 17.6 2.4 L 16.6 4.1 Q 16 3.8 15.4 4.1 L 14.4 2.4 Q 13.8 1.8 13.6 2.4 Z";
const BAT_LOWERED =
  "M 13 6.1 C 9 5.5 4 7.8 0.5 12.7 Q 2.7 10.7 4.8 12.3 Q 5.8 10.2 6.9 12.7 Q 8.9 9.7 8.2 11.7 Q 10.3 12.3 11.4 10.8 Q 11.5 9.5 13 9.8 C 13.3 14.2 18.7 14.2 19 9.8 Q 20.5 9.5 20.6 10.8 Q 21.7 12.3 23.8 11.7 Q 23.1 9.7 25.1 12.7 Q 26.2 10.2 27.2 12.3 Q 29.3 10.7 31.5 12.7 C 28 7.8 23 5.5 19 6.1 L 18.4 2.4 Q 18.2 1.8 17.6 2.4 L 16.6 4.1 Q 16 3.8 15.4 4.1 L 14.4 2.4 Q 13.8 1.8 13.6 2.4 Z";
/** One wingbeat: up, through level, down, and back. */
const BAT_BEAT = [BAT_RAISED, BAT_LEVEL, BAT_LOWERED, BAT_LEVEL, BAT_RAISED].join(";");

const REDUCE = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(REDUCE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
/** True when the viewer asked for less motion (false on the server). */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(REDUCE).matches, () => false);
}

/** A bat in flight: the wings morph through the three poses. Holds level under reduced motion. */
export function Bat({
  width,
  beat,
  className,
  style,
}: {
  width: number;
  /** Seconds per wingbeat. */
  beat: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const still = useReducedMotion();
  return (
    <svg
      viewBox="0 0 32 14"
      width={width}
      height={(width * 14) / 32}
      className={className}
      style={{ overflow: "visible", ...style }}
    >
      <path d={BAT_LEVEL} fill="#0C0614">
        {!still && (
          <animate
            attributeName="d"
            dur={`${beat}s`}
            repeatCount="indefinite"
            values={BAT_BEAT}
            calcMode="spline"
            keyTimes="0;0.25;0.5;0.75;1"
            keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"
          />
        )}
      </path>
    </svg>
  );
}
