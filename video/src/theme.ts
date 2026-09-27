import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

loadInter("normal", { weights: ["400", "500", "600", "700", "800", "900"], subsets: ["latin"] });
loadMono("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });

// Palette from the repo's own art (assets/full-loop.svg, assets/hero.jpg).
export const C = {
  bgTop: "#f2f5fd",
  bgMid: "#e6ecfb",
  bgBottom: "#d8e2fb",
  ink: "#0f1839",
  muted: "#5b6684",
  line: "#dde5f7",
  chip: "#eef2ff",
  blue: "#2b52f5",
  sky: "#5b8def",
  violet: "#6a58d0",
  green: "#2f9a5c",
  red: "#e5484d",
  navy: "#18224c",
  navyDeep: "#0b1130",
  white: "#ffffff",
  // Territory colors, in the hero map's order.
  lands: ["#6f9f6c", "#d6b27c", "#9fb4e6", "#8b7fd8", "#5eaaa1", "#4f62d2", "#3346c4"],
};

export const SANS = "'SF Pro Display', system-ui, -apple-system, Inter, sans-serif";
export const MONO = "'JetBrains Mono', 'SF Mono', Menlo, monospace";
export const W = 1920;
export const H = 1080;
