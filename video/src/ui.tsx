import React from "react";
import { random } from "remotion";
import { C, H, MONO, SANS, W } from "./theme.ts";
import { clamp, kick, outCubic, prog, spring, wordIn } from "./anim.ts";

type P = { s: number };

// ---------- kinetic type ----------
export const Word: React.FC<P & { at: number; children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ s, at, children, color, style }) => {
  const { y, opacity } = wordIn(s, at);
  return (
    <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingBottom: "0.08em", marginBottom: "-0.08em" }}>
      <span style={{ display: "inline-block", transform: `translateY(${y}%)`, opacity, color, ...style }}>{children}</span>
    </span>
  );
};

export const Wordmark: React.FC<{ size: number; color?: string; dot?: React.CSSProperties }> = ({ size, color = C.ink, dot }) => (
  <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: -size * 0.045, color, lineHeight: 1 }}>
    skills<span style={{ color: C.blue, display: "inline-block", ...dot }}>.</span>
  </div>
);

// ---------- icons ----------
export const CheckIcon: React.FC<{ size: number; color?: string; bg?: string; draw?: number }> = ({ size, color = C.white, bg = C.green, draw = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="11" fill={bg} />
    <path d="M7 12.5l3.2 3.2L17.2 8.8" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="16" strokeDashoffset={16 * (1 - draw)} />
  </svg>
);
export const CrossIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="11" fill={C.red} />
    <path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);
export const FolderIcon: React.FC<{ size: number; color?: string }> = ({ size, color = C.blue }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 60 48">
    <path d="M4 8a4 4 0 014-4h14l6 6h24a4 4 0 014 4v26a4 4 0 01-4 4H8a4 4 0 01-4-4z" fill={color} />
    <path d="M4 16h52v24a4 4 0 01-4 4H8a4 4 0 01-4-4z" fill="#fff" opacity="0.18" />
  </svg>
);
export const FileIcon: React.FC<{ size: number; color?: string }> = ({ size, color = C.blue }) => (
  <svg width={size * 0.8} height={size} viewBox="0 0 40 50">
    <path d="M4 4a3 3 0 013-3h19l11 11v34a3 3 0 01-3 3H7a3 3 0 01-3-3z" fill="#fff" stroke={color} strokeWidth="2.5" />
    <path d="M26 1v11h11" fill="none" stroke={color} strokeWidth="2.5" />
    <path d="M11 24h18M11 31h18M11 38h12" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
  </svg>
);
export const GoalIcon: React.FC<{ size: number; color: string; spin?: number }> = ({ size, color, spin = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ transform: `rotate(${spin}deg)` }}>
    <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2" strokeDasharray="44 13" strokeLinecap="round" />
    <circle cx="12" cy="12" r="4" fill="none" stroke={color} strokeWidth="2" />
    <path d="M12 12l7-7M16 5h3v3" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

// ---------- terminal ----------
export const Terminal: React.FC<{ width: number; title?: string; children: React.ReactNode; style?: React.CSSProperties; dark?: boolean }> = ({ width, title = "zsh — ~/my-app", children, style, dark = true }) => (
  <div style={{ width, borderRadius: 22, background: dark ? "linear-gradient(160deg, #1a2452, #0e1533)" : C.white, boxShadow: "0 30px 80px rgba(20,32,90,0.28), 0 0 0 1px rgba(255,255,255,0.08) inset", overflow: "hidden", ...style }}>
    <div style={{ height: 52, display: "flex", alignItems: "center", gap: 10, padding: "0 22px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      {["#ff6159", "#ffbd2e", "#28c941"].map((c) => <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}
      <div style={{ flex: 1, textAlign: "center", fontFamily: MONO, fontSize: 17, color: "#8a96c8", marginRight: 60 }}>{title}</div>
    </div>
    <div style={{ padding: "26px 34px 30px" }}>{children}</div>
  </div>
);

export const Caret: React.FC<P> = ({ s }) => (
  <span style={{ display: "inline-block", width: 13, height: 30, background: "#8fb0ff", verticalAlign: "middle", marginLeft: 4, opacity: Math.floor(s * 2.5) % 2 ? 0.2 : 1 }} />
);

// ---------- impacts ----------
export const Shockwave: React.FC<P & { at: number; x: number; y: number; color?: string; size?: number }> = ({ s, at, x, y, color = C.blue, size = 1400 }) => {
  const t = s - at;
  if (t < 0 || t > 0.9) return null;
  const p = outCubic(t / 0.9);
  return (
    <>
      {[0, 0.12].map((d, i) => {
        const q = outCubic(clamp((t - d) / 0.8));
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: size * q, height: size * q, marginLeft: (-size * q) / 2, marginTop: (-size * q) / 2, borderRadius: "50%", border: `${(1 - q) * 26 + 1}px solid ${color}`, opacity: (1 - p) * (i ? 0.5 : 0.8) }} />;
      })}
    </>
  );
};

export const Burst: React.FC<P & { at: number; x: number; y: number; color?: string; rays?: number; len?: number }> = ({ s, at, x, y, color = C.blue, rays = 16, len = 520 }) => {
  const t = s - at;
  if (t < 0 || t > 0.55) return null;
  const p = outCubic(t / 0.55);
  return (
    <svg style={{ position: "absolute", left: 0, top: 0 }} width={W} height={H}>
      {Array.from({ length: rays }, (_, i) => {
        const a = (i / rays) * Math.PI * 2 + random(`b${at}${i}`) * 0.2;
        const r0 = 80 + len * p * 0.6, r1 = 80 + len * p * (0.8 + random(`l${at}${i}`) * 0.4);
        return <line key={i} x1={x + Math.cos(a) * r0} y1={y + Math.sin(a) * r0} x2={x + Math.cos(a) * r1} y2={y + Math.sin(a) * r1} stroke={color} strokeWidth={(1 - p) * 10} strokeLinecap="round" />;
      })}
    </svg>
  );
};

// Confetti/shards flung from a point with gravity.
export const Shards: React.FC<P & { at: number; x: number; y: number; n?: number; colors: string[]; power?: number }> = ({ s, at, x, y, n = 70, colors, power = 1 }) => {
  const t = s - at;
  if (t < 0 || t > 2.4) return null;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = random(`sa${at}${i}`) * Math.PI * 2;
        const v = (500 + random(`sv${at}${i}`) * 1300) * power;
        const drag = (1 - Math.exp(-t * 2.2)) / 2.2;
        const px = x + Math.cos(a) * v * drag;
        const py = y + Math.sin(a) * v * drag + 520 * t * t;
        const w = 10 + random(`sw${at}${i}`) * 18;
        const rot = t * (random(`sr${at}${i}`) - 0.5) * 1400;
        const flip = Math.cos(t * (6 + random(`sf${at}${i}`) * 10));
        return <div key={i} style={{ position: "absolute", left: px, top: py, width: w, height: w * 0.55, background: colors[i % colors.length], borderRadius: i % 3 === 0 ? w : 2, transform: `rotate(${rot}deg) scaleY(${flip})`, opacity: clamp(2.4 - t) }} />;
      })}
    </>
  );
};

// ---------- surfaces ----------
export const Backdrop: React.FC<P & { dark?: number }> = ({ s, dark = 0 }) => {
  const k = kick(s);
  const light = `linear-gradient(135deg, ${C.bgTop} 0%, ${C.bgMid} 55%, ${C.bgBottom} 100%)`;
  const drift = (s * 14) % 40;
  return (
    <div style={{ position: "absolute", inset: 0, background: light }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 40%, #1c2a66 0%, ${C.navy} 45%, ${C.navyDeep} 100%)`, opacity: dark }} />
      <div style={{ position: "absolute", inset: -40, transform: `translate(${-drift}px, ${-drift}px)`, backgroundImage: `radial-gradient(circle, ${dark > 0.5 ? "rgba(140,170,255,0.5)" : "rgba(43,82,245,0.35)"} 1.6px, transparent 2px)`, backgroundSize: "40px 40px", opacity: 0.35 + k * 0.45 }} />
    </div>
  );
};

export const Grain: React.FC<{ frame: number }> = ({ frame }) => (
  <svg style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.22, pointerEvents: "none" }} width={W} height={H}>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 30} stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={W} height={H} filter="url(#grain)" />
  </svg>
);

export const Vignette: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(10,18,60,0.28) 100%)" }} />
);

// Soft fog puffs; density 0..1, `blast` flings them outward from center.
export const Fog: React.FC<P & { density: number; blast?: number; tint?: string }> = ({ s, density, blast = 0, tint = "255,255,255" }) => {
  if (density <= 0.001) return null;
  return (
    <>
      {Array.from({ length: 34 }, (_, i) => {
        const bx = random(`fx${i}`) * (W + 400) - 200;
        const by = random(`fy${i}`) * (H + 300) - 150;
        const r = 260 + random(`fr${i}`) * 380;
        const dx = bx - W / 2, dy = by - H / 2;
        const d = Math.hypot(dx, dy) || 1;
        const x = bx + Math.sin(s * 0.4 + i) * 40 + (dx / d) * blast * 1600;
        const y = by + Math.cos(s * 0.3 + i * 2) * 25 + (dy / d) * blast * 1600;
        const appear = clamp(density * 1.6 - random(`fo${i}`) * 0.6);
        return <div key={i} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: `radial-gradient(circle, rgba(${tint},0.95) 0%, rgba(${tint},0.55) 40%, rgba(${tint},0) 70%)`, opacity: appear * (1 - blast) }} />;
      })}
    </>
  );
};

// ---------- the territory map (hex flower) ----------
export const HEX_R = 118;
const SQ3 = Math.sqrt(3);
// Ring cells 0..5 clockwise from top-left, center is 6 (the goal).
export const CELLS = [-120, -60, 0, 60, 120, 180].map((deg) => {
  const a = (deg * Math.PI) / 180;
  return { x: Math.cos(a) * SQ3 * HEX_R, y: Math.sin(a) * SQ3 * HEX_R };
}).concat([{ x: 0, y: 0 }]);

export const hexPath = (r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = ((60 * i - 30) * Math.PI) / 180;
    return `${i ? "L" : "M"}${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
  }).join("") + "Z";

export const Flag: React.FC<{ color: string; scale: number }> = ({ color, scale }) => (
  <g transform={`scale(${scale})`}>
    <line x1="0" y1="0" x2="0" y2="-34" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    <path d="M0,-34 L22,-27 L0,-19Z" fill={color} />
    <circle cx="0" cy="0" r="4" fill="#fff" />
  </g>
);

export const Chip: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; dark?: boolean }> = ({ children, style, dark }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 999, background: dark ? "rgba(255,255,255,0.08)" : C.chip, color: dark ? "#c9d4ff" : "#4b5b87", fontFamily: SANS, fontWeight: 600, fontSize: 20, whiteSpace: "nowrap", ...style }}>{children}</div>
);

export const pop = (s: number, at: number) => spring(s, at, 3, 0.38);
export const fadeIn = (s: number, at: number, d = 0.15) => prog(s, at, at + d);
