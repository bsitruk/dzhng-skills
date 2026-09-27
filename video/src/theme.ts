import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

export const fontsReady = Promise.all([
  loadInter("normal", { weights: ["400", "600", "700", "800", "900"], subsets: ["latin"] }).waitUntilDone(),
  loadMono("normal", { weights: ["400", "500", "700"], subsets: ["latin"] }).waitUntilDone(),
]);

// Palette from the repo's own art (assets/hero.jpg, assets/full-loop.svg).
export const C = {
  sky: "#dfe6fb",
  skyDeep: "#c3d0f7",
  ink: "#0f1839",
  muted: "#5b6684",
  blue: "#2b52f5",
  periwinkle: "#8fb0ff",
  green: "#2f9a5c",
  red: "#e5484d",
  night: "#0a1030",
  nightFog: "#141d4a",
  land: "#98a3c6",
  // Territory colors, in the hero map's order.
  lands: ["#3346c4", "#6f9f6c", "#d6b27c", "#9fb4e6", "#8b7fd8", "#5eaaa1", "#4f62d2"],
};

export const SANS = "Inter, system-ui, sans-serif";
export const MONO = "'JetBrains Mono', Menlo, monospace";
export const W = 1920;
export const H = 1080;
