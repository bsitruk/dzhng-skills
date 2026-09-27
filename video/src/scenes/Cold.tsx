import React from "react";
import { CUE } from "../cues.ts";
import { C, MONO, SANS } from "../theme.ts";
import { clamp, inOutCubic, outCubic, prog, spring } from "../anim.ts";
import { TerritoryMap } from "../map.tsx";
import { CheckIcon, Fog, Word } from "../ui.tsx";

const TASKS = ["fix the flaky test", "add a retry cap", "rename the handler"];

// Problem: agents close tasks, but a goal is fog.
export const Cold: React.FC<{ s: number }> = ({ s }) => {
  const out1 = inOutCubic(prog(s, 1.85, 2.2));
  const mapIn = spring(s, 2.0, 1.6, 0.5);
  const fog = clamp(prog(s, CUE.fogRoll, 3.6) * 0.65 + prog(s, 3.5, 4.0) * 0.5);
  const fogWordBlur = prog(s, 3.2, 4.0) * 8;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* line 1 + finished tasks */}
      <div style={{ position: "absolute", left: 140, top: 380, fontFamily: SANS, fontWeight: 800, fontSize: 118, color: C.ink, letterSpacing: -4, lineHeight: 1.05, transform: `translateY(${-out1 * 160}px)`, opacity: 1 - out1 }}>
        <div><Word s={s} at={CUE.coldWords[0]}>Your agent</Word></div>
        <div>
          <Word s={s} at={CUE.coldWords[1]}>finishes</Word>{" "}
          <Word s={s} at={CUE.coldWords[2]} color={C.blue}>tasks.</Word>
        </div>
      </div>
      <div style={{ position: "absolute", left: 1100, top: 330, display: "flex", flexDirection: "column", gap: 26, transform: `translateY(${-out1 * 160}px)`, opacity: 1 - out1 }}>
        {TASKS.map((task, i) => {
          const p = spring(s, 0.05 + i * 0.12, 2.2, 0.45);
          const at = CUE.coldChecks[i];
          const done = prog(s, at, at + 0.18);
          const pk = spring(s, at, 3.4, 0.3);
          return (
            <div key={task} style={{ width: 640, height: 104, borderRadius: 22, background: C.white, boxShadow: "0 14px 40px rgba(26,42,99,0.12)", display: "flex", alignItems: "center", gap: 26, padding: "0 32px", transform: `translateX(${(1 - p) * 300}px) scale(${1 + (s > at ? Math.sin(clamp((s - at) / 0.25) * Math.PI) * 0.05 : 0)})`, opacity: clamp(p * 2) }}>
              <div style={{ width: 52, height: 52, borderRadius: 26, border: `3px solid ${done > 0 ? "transparent" : C.line}`, display: "grid", placeItems: "center" }}>
                {s >= at && <div style={{ transform: `scale(${pk})` }}><CheckIcon size={52} draw={done} /></div>}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 32, color: done > 0.5 ? C.muted : C.ink, textDecoration: done > 0.5 ? "line-through" : "none" }}>{task}</div>
            </div>
          );
        })}
      </div>

      {/* line 2 + fogged map */}
      <div style={{ position: "absolute", left: 140, top: 380, fontFamily: SANS, fontWeight: 800, fontSize: 118, color: C.ink, letterSpacing: -4, lineHeight: 1.05 }}>
        <div><Word s={s} at={CUE.fogWords[0]}>But a goal</Word></div>
        <div>
          <Word s={s} at={CUE.fogWords[1]}>is</Word>{" "}
          <Word s={s} at={CUE.fogWords[2]} color="#8e9ab8" style={{ filter: `blur(${fogWordBlur}px)` }}>fog.</Word>
        </div>
      </div>
      {s > 1.9 && (
        <div style={{ position: "absolute", left: 1320 - 450, top: 540 - 450, transform: `scale(${0.6 + 0.35 * mapIn}) rotate(${(1 - outCubic(prog(s, 2, 3))) * -8}deg)`, opacity: clamp(mapIn * 1.5) }}>
          <TerritoryMap s={s} gap={0} color={0} cellFog={[0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55]} marks={[CUE.fogMarks[0], undefined, CUE.fogMarks[1], undefined, CUE.fogMarks[2]]} />
        </div>
      )}
      <Fog s={s} density={fog} />
    </div>
  );
};
