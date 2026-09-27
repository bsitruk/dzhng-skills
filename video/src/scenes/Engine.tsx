import React from "react";
import { CUE, HARNESSES, SKILLS } from "../cues.ts";
import { C, MONO, SANS } from "../theme.ts";
import { inCubic, kick, outCubic, prog, spring, squash } from "../anim.ts";
import { FolderIcon, Word } from "../ui.tsx";

const CENTER = { x: 960, y: 600 };
export const IRIS_CENTER = CENTER;

// One folder of skills, every harness that reads skills (README: "works with any harness").
export const Engine: React.FC<{ s: number }> = ({ s }) => {
  const k = kick(s);
  const inP = spring(s, 19.95, 2.4, 0.38);
  const [sx, sy] = squash(s, 20.1, 0.18);
  const gather = inCubic(prog(s, 21.7, 21.95));
  const iris = inCubic(prog(s, 21.78, 22.0));
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 76, letterSpacing: -2, color: C.ink, opacity: 1 - gather }}>
        <Word s={s} at={CUE.harnessTitle}>Works in any harness</Word>{" "}
        <Word s={s} at={CUE.harnessTitle + 0.12} color={C.blue}>that reads skills.</Word>
      </div>
      <svg style={{ position: "absolute", inset: 0 }} width={1920} height={1080}>
        {HARNESSES.map((h, i) => {
          const pos = orbit(i, gather);
          const p = outCubic(prog(s, CUE.harnesses[i] - 0.05, CUE.harnesses[i] + 0.2));
          return <line key={h} x1={CENTER.x} y1={CENTER.y} x2={CENTER.x + (pos.x - CENTER.x) * p} y2={CENTER.y + (pos.y - CENTER.y) * p} stroke={C.sky} strokeWidth={3} strokeDasharray="6 10" strokeDashoffset={-s * 60} opacity={0.7} />;
        })}
      </svg>
      {HARNESSES.map((h, i) => {
        const pos = orbit(i, gather);
        const p = spring(s, CUE.harnesses[i], 3, 0.36);
        const last = i === HARNESSES.length - 1;
        return (
          <div key={h} style={{ position: "absolute", left: pos.x, top: pos.y, transform: `translate(-50%,-50%) scale(${p * (1 - gather)})`, padding: "20px 34px", borderRadius: 999, background: last ? C.blue : C.white, color: last ? "#fff" : C.ink, fontFamily: SANS, fontWeight: 700, fontSize: 36, boxShadow: "0 14px 40px rgba(26,42,99,0.15)", whiteSpace: "nowrap" }}>{h}</div>
        );
      })}
      <div style={{ position: "absolute", left: CENTER.x, top: CENTER.y, transform: `translate(-50%,-50%) scale(${inP * sx * (1 + k * 0.05)}, ${inP * sy * (1 + k * 0.05)})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 250, height: 250, borderRadius: 60, background: C.white, boxShadow: `0 24px 60px rgba(26,42,99,0.2), 0 0 0 ${10 + k * 10}px rgba(43,82,245,0.1)`, display: "grid", placeItems: "center" }}>
          <FolderIcon size={150} />
        </div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.ink, marginTop: 20 }}>skills/</div>
        <div style={{ fontFamily: SANS, fontSize: 24, color: C.muted, marginTop: 4 }}>{SKILLS.length} skills · one copy</div>
      </div>
      {iris > 0 && (
        <div style={{ position: "absolute", left: CENTER.x, top: CENTER.y - 60, width: 2400 * iris, height: 2400 * iris, marginLeft: -1200 * iris, marginTop: -1200 * iris, borderRadius: "50%", background: C.navy }} />
      )}
    </div>
  );
};

function orbit(i: number, gather: number) {
  const a = (-160 + i * 64) * (Math.PI / 180) + Math.PI / 2 + Math.PI;
  const rx = 640 * (1 - gather), ry = 290 * (1 - gather);
  return { x: CENTER.x + Math.cos(a) * rx, y: CENTER.y + 40 + Math.sin(a) * ry };
}
