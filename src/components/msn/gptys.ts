import type { GelGpty } from "@/components/Gpty";

/**
 * Every gpty as a glossy MSN Messenger 7.5 gel icon, worn by all of them while
 * Kayleigh is open (see THEMES in components/Gpty.tsx). Taken from the SVGs in
 * public/gptys-msn-gel-agents/. Each keeps its own silhouette from Gpty.tsx;
 * this is only the light on it: the rim, the body's gradient, the glow along
 * the bottom, the gloss over the top and its white catchlights. (The files
 * also clip the gloss away from the eyes; it changes almost nothing, so it's
 * left out.)
 */
export const MSN_GPTYS: Record<string, GelGpty> = {
  // Daisy
  icq: {
    rim: "#18481d",
    body: ["#82d48b", "#3fbd4c", "#32973d"],
    glow: { color: "#7cd285", d: "M7 38C10 43.8 38 43.8 41 38C38 41.1 10 41.1 7 38Z" },
    gloss: { y: [5.5, 19], d: "M10 14C12 8.8 18.5 5.5 24 5.5C31 5.5 37 9 38.2 15C33 19.5 16 20 10 17.5Z" },
    sparks: [[16, 10.5, 2.2, 1.25]],
  },
  // Kayleigh
  msn: {
    rim: "#5b203b",
    body: ["#f590be", "#f0559b", "#c0447c"],
    glow: { color: "#f58bbb", d: "M12 39C15 44.8 33 44.8 36 39C33 42.1 15 42.1 12 39Z" },
    gloss: { y: [5.5, 24], d: "M24 6.8C27 10 32.2 16.6 34.3 21.4C29 24.2 19 24.2 13.7 21.4C15.8 16.6 21 10 24 6.8Z" },
    sparks: [[21.5, 13.2, 1.35, 2.1]],
  },
  // Cal
  skype: {
    rim: "#08425b",
    body: ["#68caf5", "#16aeef", "#128bbf"],
    glow: { color: "#61c8f4", d: "M7 31C10 36.8 38 36.8 41 31C38 34.1 10 34.1 7 31Z" },
    gloss: { y: [11.5, 20], d: "M15 20C15.7 15 19.4 11.5 24.5 11.5C29.8 11.5 33.5 15.2 34.3 20.4C29.8 22.5 19.5 22.6 15 20Z" },
    sparks: [[20, 14.8, 2.1, 1.2]],
  },
  // Mark
  facebook: {
    rim: "#293244",
    body: ["#a0afce", "#6d84b4", "#576a90"],
    glow: { color: "#9cabcc", d: "M11 35.5C14 41.3 36 41.3 39 35.5C36 38.6 14 38.6 11 35.5Z" },
    gloss: { y: [8, 17], d: "M10.3 16.2C11.4 11.5 18 8.3 23.9 8.1C29 7.9 34.1 10.2 37 14.1C34 19.3 21.8 20.5 13.4 19.1C11.4 18.5 10.5 17.5 10.3 16.2Z" },
    sparks: [[17.5, 11.5, 2.3, 1.25]],
  },
  // Arthur
  reddit: {
    rim: "#611a00",
    body: ["#ff8659", "#ff4500", "#cc3700"],
    glow: { color: "#ff8152", d: "M9.5 34C12.5 39.8 35.5 39.8 38.5 34C35.5 37.1 12.5 37.1 9.5 34Z" },
    gloss: { y: [18.5, 22.5], d: "M9.2 26C10.5 21.4 16.8 18.5 24 18.5C31.2 18.5 37.5 21.4 38.8 26C31.3 28 16.7 28 9.2 26Z" },
    sparks: [[16, 21, 2.2, 1.1], [32.6, 4.8, 0.75, 0.75]],
  },
  // Channing
  slack: {
    rim: "#341e52",
    body: ["#b38de6", "#8a4fd8", "#6e3fad"],
    glow: { color: "#af87e4", d: "M7 29C10 34.8 38 34.8 41 29C38 32.1 10 32.1 7 29Z" },
    gloss: { y: [14.5, 19], d: "M6 23C6.6 17.8 10.1 14.5 15 14.5H33C37.9 14.5 41.4 17.8 42 23C33.5 20.3 14.5 20.3 6 23Z" },
    sparks: [[12.3, 16.8, 2.1, 1]],
  },
  // Grug
  caveman: {
    rim: "#522712",
    body: ["#e69c78", "#d9662f", "#ae5226"],
    glow: { color: "#e59772", d: "M11 34.2C14 40 36 40 39 34.2C36 37.3 14 37.3 11 34.2Z" },
    gloss: { y: [11.5, 19], d: "M11 21C12.9 15.1 18.1 11.3 25 11.5C30.7 10.6 35.3 13.4 37 18.1C32 22.6 17 23.5 11 21Z" },
    sparks: [[18, 14.4, 2.1, 1.15]],
  },
  // Mortimer
  seance: {
    rim: "#444152",
    body: ["#cec9e6", "#b4acd9", "#908aae"],
    glow: { color: "#ccc7e5", d: "M13 35C16 40.8 32 40.8 35 35C32 38.1 16 38.1 13 35Z" },
    gloss: { y: [9.5, 16], d: "M11.8 21C12.5 14.5 17.5 9.5 24 9.5C30.5 9.5 35.5 14.5 36.2 21C31.1 18.4 16.9 18.4 11.8 21Z" },
    sparks: [[18.5, 12.8, 2, 1.25]],
  },
  // Shelly
  fury: {
    rim: "#611134",
    body: ["#ff77b2", "#ff2e88", "#cc256d"],
    glow: { color: "#ff71ae", d: "M8.5 35C11.5 40.8 36.5 40.8 39.5 35C36.5 38.1 11.5 38.1 8.5 35Z" },
    gloss: { y: [8.5, 25], d: "M24 8.6C25.1 8.6 25.9 9.4 26.5 10.4L33.7 23.9C28 26.1 20 26.1 14.3 23.9L21.5 10.4C22.1 9.4 22.9 8.6 24 8.6Z" },
    sparks: [[22.9, 13.1, 1.05, 1.65]],
  },
  // Carol
  elf: {
    rim: "#571516",
    body: ["#ee7e80", "#e5383b", "#b72d2f"],
    glow: { color: "#ed787a", d: "M12 37C15 42.8 33 42.8 36 37C33 40.1 15 40.1 12 37Z" },
    gloss: { y: [6.5, 21], d: "M24 6.5C29.9 6.5 35 14.2 36.9 22C29.8 24.1 18.2 24.1 11.1 22C13 14.2 18.1 6.5 24 6.5Z" },
    sparks: [[20, 11.5, 1.65, 2.1]],
  },
  // Cora
  machine: {
    rim: "#4c6111",
    body: ["#dbff77", "#c8ff2e", "#a0cc25"],
    glow: { color: "#daff71", d: "M8 37C11 42.8 37 42.8 40 37C37 40.1 11 40.1 8 37Z" },
    gloss: { y: [6.5, 17], d: "M7.3 18.8C9.3 11.8 16 6.5 24 6.5C32 6.5 38.7 11.8 40.7 18.8C32.8 21.4 15.2 21.4 7.3 18.8Z" },
    sparks: [[16.5, 10.5, 2.4, 1.3]],
  },
  // Lucky
  slots: {
    rim: "#614b13",
    body: ["#ffd97a", "#ffc533", "#cc9e29"],
    glow: { color: "#ffd874", d: "M15 36C18 41.8 30 41.8 33 36C30 39.1 18 39.1 15 36Z" },
    gloss: { y: [11.5, 20], d: "M13.6 21.5C13.7 15.4 17.7 11.5 24 11.5C30.3 11.5 34.3 15.4 34.4 21.5C28.8 22.7 19.2 22.7 13.6 21.5Z" },
    sparks: [[19, 14.4, 1.8, 1.1], [39.6, 8.6, 0.75, 0.75]],
  },
};
