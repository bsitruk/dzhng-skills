import React from "react";
import { SCENES, SONG_END } from "./cues.ts";
import { MONO } from "./theme.ts";
import { clamp, kick } from "./anim.ts";

// Corner marks, scene counter, timecode, and a kick-pulsed progress bar.
export const Hud: React.FC<{ s: number; dark: number }> = ({ s, dark }) => {
  const k = kick(s);
  const idx = Math.max(0, SCENES.findIndex((sc) => s >= sc.start && s < sc.end));
  const color = dark > 0.5 ? "rgba(200,212,255,0.75)" : "rgba(15,24,57,0.55)";
  const accent = dark > 0.5 ? "#8fb0ff" : "#2b52f5";
  const text: React.CSSProperties = { position: "absolute", fontFamily: MONO, fontSize: 17, letterSpacing: 2, color, textTransform: "uppercase" };
  const corner = (x: number, y: number, rot: number) => (
    <svg key={`${x}${y}`} style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)` }} width="30" height="30">
      <path d="M2 28V2h26" fill="none" stroke={color} strokeWidth="2.5" />
    </svg>
  );
  const tc = Math.max(0, s);
  const secs = Math.floor(tc), cs = Math.floor((tc % 1) * 100);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: clamp((s + 0.05) / 0.3) }}>
      {corner(36, 36, 0)}
      {corner(1854, 36, 90)}
      {corner(1854, 1014, 180)}
      {corner(36, 1014, 270)}
      <div style={{ ...text, left: 84, top: 42 }}>dzhng/skills</div>
      <div style={{ ...text, right: 84, top: 42 }}>
        <span style={{ color: accent }}>{String(idx + 1).padStart(2, "0")}</span> / {String(SCENES.length).padStart(2, "0")} — {SCENES[idx].label}
      </div>
      <div style={{ ...text, left: 84, bottom: 44 }}>
        {String(secs).padStart(2, "0")}:{String(cs).padStart(2, "0")} · 120 BPM
      </div>
      <div style={{ ...text, right: 84, bottom: 44 }}>npx skills add dzhng/skills</div>
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 6 + k * 4, width: `${clamp(tc / SONG_END) * 100}%`, background: accent, boxShadow: `0 0 ${8 + k * 20}px ${accent}` }} />
    </div>
  );
};
