import React from "react";
import { BEAT, CUE } from "../cues.ts";
import { C, MONO, SANS } from "../theme.ts";
import { clamp, inCubic, inOutCubic, kick, lerp, outBack, outCubic, prog, spring, squash } from "../anim.ts";
import { TerritoryMap, type Stamp } from "../map.tsx";
import { CELLS, Chip, FileIcon, HEX_R } from "../ui.tsx";

// Copy from the README and assets/full-loop.svg.
const STEPS = [
  { cmd: "/explore-unknowns", title: "Map the fog", body: "Quadrant-by-quadrant interview. It hands you rendered options to react to instead of asking you to imagine.", tag: "you answer · you decide", color: C.blue },
  { cmd: "/write-spec", title: "Codify", body: "Transcribes the map into independently verifiable slices.", tag: "you don't read the spec", color: C.violet },
  { cmd: "/goal /implement-spec", title: "Build", body: "Loop mode in Claude Code or Codex. It re-slices the plan when the code proves it stale.", tag: "", color: "#8fb0ff" },
  { cmd: "choices.md", title: "Review the choices", body: "Not the diff. Every decision made where the spec was silent, ranked least-confident first.", tag: "this is the review surface", color: C.green },
];
const QUADRANTS = [
  { label: "known knowns", cells: [0, 1], x: 830, y: 250 },
  { label: "known unknowns", cells: [2, 3], x: 1790, y: 250 },
  { label: "unknown knowns", cells: [5, 4], x: 830, y: 900 },
  { label: "unknown unknowns", cells: [6], x: 1790, y: 900 },
];
// Illustrative ledger rows; confidence rises down the list.
const CHOICES = [
  { text: "Kept retry state in one owner", conf: 0.34 },
  { text: "Split the sync slice in two", conf: 0.52 },
  { text: "Reused the existing cache key", conf: 0.71 },
  { text: "Server-side sort for the list", conf: 0.88 },
];
const MAP_C = { x: 1310, y: 575 };
const RAIL_X = [150, 550, 950, 1350];

function stepIndex(s: number) {
  let i = 0;
  CUE.steps.forEach((t, k) => { if (s >= t) i = k; });
  return i;
}

const at = (cell: number, gap: number) => {
  const k = 1 + gap / (HEX_R * 1.7);
  return { x: CELLS[cell].x * k, y: CELLS[cell].y * k };
};

export const Loop: React.FC<{ s: number }> = ({ s }) => {
  const step = stepIndex(s);
  const k = kick(s);
  const enter = prog(s, 9.9, 10.05);
  const collapse = inCubic(prog(s, 19.72, 20.0));

  // Map state per step.
  const slicesDone = CUE.slices.filter((t) => s >= t).length;
  const gap = slicesDone * 5 + (slicesDone ? outBack(prog(s, CUE.slices[slicesDone - 1], CUE.slices[slicesDone - 1] + 0.2)) * 6 : 0);
  const colorP = clamp(spring(s, CUE.territoriesFill, 2.2, 0.5));
  const cellFog = CELLS.map((_, i) => {
    const q = QUADRANTS.findIndex((qq) => qq.cells.includes(i));
    return 1 - outCubic(prog(s, CUE.quadrants[q], CUE.quadrants[q] + 0.3));
  });

  // The agent walks the ring, arriving at each cell on its verdict.
  const way = [{ t: CUE.steps[2], cell: 6 }, ...CUE.verdicts.map((v) => ({ t: v.t, cell: v.cell }))];
  let agent: { x: number; y: number; trail: { x: number; y: number }[] } | undefined;
  if (s >= CUE.steps[2] && s < CUE.steps[3] + 0.3) {
    let i = 0;
    while (i < way.length - 1 && s >= way[i + 1].t) i++;
    const a = at(way[i].cell, gap);
    const b = i < way.length - 1 ? at(way[i + 1].cell, gap) : a;
    const p = i < way.length - 1 ? inOutCubic(prog(s, way[i + 1].t - 0.35, way[i + 1].t)) : 0;
    const pos = { x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) - 18 };
    agent = { ...pos, trail: [...way.slice(0, i + 1).map((w) => ({ ...at(w.cell, gap), y: at(w.cell, gap).y - 18 })), pos] };
  }
  const stamps: Stamp[] = CUE.verdicts.map((v) => ({ cell: v.cell, t: v.t, ok: v.ok }));

  const toDoc = inOutCubic(prog(s, CUE.steps[3] - 0.1, CUE.steps[3] + 0.4));
  const mapScale = lerp(1, 0.5, toDoc) * (1 + k * 0.015);
  const mapX = lerp(MAP_C.x, 1640, toDoc);
  const mapY = lerp(MAP_C.y, 800, toDoc);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: enter, transformOrigin: "960px 560px", transform: `scale(${lerp(1, 0.08, collapse)})`, filter: `blur(${collapse * 6}px)` }}>
      {/* rail */}
      <div style={{ position: "absolute", left: 0, top: 118 }}>
        <div style={{ position: "absolute", left: RAIL_X[0], top: 0, width: RAIL_X[3] - RAIL_X[0], height: 4, background: C.line, borderRadius: 2 }} />
        <div style={{ position: "absolute", left: RAIL_X[0], top: 0, width: (RAIL_X[3] - RAIL_X[0]) * clamp((s - 10) / 9), height: 4, background: C.blue, borderRadius: 2, boxShadow: `0 0 ${10 + k * 16}px ${C.blue}` }} />
        {STEPS.map((st, i) => {
          const active = i === step;
          const done = s >= CUE.steps[i];
          const p = spring(s, CUE.steps[i], 3, 0.35);
          return (
            <div key={i} style={{ position: "absolute", left: RAIL_X[i] - 20, top: -18, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: done ? st.color === "#8fb0ff" ? C.navy : st.color : C.white, border: `3px solid ${done ? "transparent" : C.line}`, color: done ? "#fff" : C.muted, display: "grid", placeItems: "center", fontFamily: SANS, fontWeight: 800, fontSize: 19, transform: `scale(${done ? 0.8 + 0.2 * p + (active ? k * 0.08 : 0) : 0.8})`, boxShadow: active ? `0 0 0 ${8 + k * 6}px rgba(43,82,245,0.12)` : "none" }}>{i + 1}</div>
              <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, whiteSpace: "nowrap", color: active ? C.ink : C.muted, background: C.bgTop, padding: "4px 12px", borderRadius: 10 }}>{st.cmd}</div>
            </div>
          );
        })}
      </div>

      {/* active step card */}
      {STEPS.map((st, i) => {
        const start = CUE.steps[i];
        const end = CUE.steps[i + 1] ?? 20.5;
        if (s < start - 0.1 || s > end) return null;
        const p = spring(s, start, 2.0, 0.42);
        const out = inCubic(prog(s, end - 0.18, end));
        const [sx, sy] = squash(s, start + 0.12, 0.08);
        const dark = i === 2;
        return (
          <div key={i} style={{ position: "absolute", left: 110, top: 230, width: 640, padding: "44px 48px", borderRadius: 30, background: dark ? "linear-gradient(160deg, #1d2a60, #0e1533)" : C.white, boxShadow: "0 26px 70px rgba(26,42,99,0.16)", transform: `translateX(${(1 - p) * -260}px) translateY(${out * -120}px) scale(${sx}, ${sy}) rotate(${(1 - p) * -6}deg)`, opacity: clamp(p * 2) * (1 - out), overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 8, background: dark ? C.blue : st.color }} />
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 24, background: dark ? "rgba(255,255,255,0.1)" : "#eef2ff", display: "grid", placeItems: "center", fontFamily: SANS, fontWeight: 800, fontSize: 22, color: dark ? "#fff" : st.color }}>{i + 1}</div>
              <div style={{ fontFamily: MONO, fontSize: 30, fontWeight: 700, color: st.color }}>{st.cmd}</div>
            </div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 72, color: dark ? "#fff" : C.ink, letterSpacing: -2, marginTop: 30 }}>{st.title}</div>
            <div style={{ fontFamily: SANS, fontSize: 30, lineHeight: 1.45, color: dark ? "#b8c3ea" : C.muted, marginTop: 18 }}>{st.body}</div>
            {st.tag && <Chip style={{ marginTop: 30, fontSize: 22 }}>{st.tag}</Chip>}
            {dark && <Pipeline s={s} />}
          </div>
        );
      })}

      {/* quadrant labels (step 1) */}
      {QUADRANTS.map((q, i) => {
        const t = CUE.quadrants[i];
        const p = spring(s, t, 3, 0.4);
        const out = prog(s, CUE.steps[1] - 0.2, CUE.steps[1]);
        if (s < t) return null;
        return (
          <div key={q.label} style={{ position: "absolute", left: q.x, top: q.y, transform: `translate(${i % 2 ? "-100%" : "0"}, -50%) scale(${p})`, transformOrigin: i % 2 ? "right center" : "left center", opacity: 1 - out }}>
            <Chip style={{ background: C.white, color: C.ink, fontSize: 26, padding: "14px 24px", boxShadow: "0 10px 30px rgba(26,42,99,0.12)" }}>
              <span style={{ width: 14, height: 14, borderRadius: 7, background: C.lands[QUADRANTS[i].cells[0]] }} />
              {q.label}
            </Chip>
          </div>
        );
      })}

      {/* the map */}
      <div style={{ position: "absolute", left: mapX - 450, top: mapY - 450, transform: `scale(${mapScale})`, opacity: 1 - toDoc }}>
        <TerritoryMap s={s} gap={gap} color={colorP} cellFog={cellFog} flagsAt={CUE.territoriesFill} stamps={stamps} split={{ cell: 2, t: CUE.reslice }} agent={agent} cut={CUE.slices.map((t, i) => ({ t, angle: [0, 60, 120, 30, 90][i] }))} marks={[10, 10, 10, 10, 10, 10, 10]} />
      </div>
      {s >= CUE.verdicts[2].t && s < CUE.verdicts[3].t + 0.2 && (
        <div style={{ position: "absolute", left: MAP_C.x + at(2, gap).x + 70, top: MAP_C.y + at(2, gap).y - 40, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: s < CUE.reslice ? C.red : C.violet, background: C.white, padding: "8px 14px", borderRadius: 10, boxShadow: "0 8px 24px rgba(26,42,99,0.15)", transform: `scale(${spring(s, s < CUE.reslice ? CUE.verdicts[2].t : CUE.reslice, 3, 0.4)})`, opacity: 1 - prog(s, CUE.verdicts[3].t, CUE.verdicts[3].t + 0.2) }}>
          {s < CUE.reslice ? "stale plan" : "re-slice"}
        </div>
      )}

      {/* choices.md ledger (step 4) */}
      {s >= CUE.steps[3] - 0.1 && <Ledger s={s} />}
    </div>
  );
};

const Pipeline: React.FC<{ s: number }> = ({ s }) => {
  const items = ["slice", "/review", "choices.md"];
  const active = Math.floor((s - CUE.steps[2]) / BEAT) % 3;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 30 }}>
      {items.map((it, i) => (
        <React.Fragment key={it}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, padding: "10px 18px", borderRadius: 999, background: i === active ? C.blue : "rgba(255,255,255,0.08)", color: i === active ? "#fff" : "#9fb0e8", transform: `scale(${i === active ? 1.06 : 1})` }}>{it}</div>
          {i < 2 && <div style={{ color: "#6f80c0", fontSize: 24 }}>→</div>}
        </React.Fragment>
      ))}
    </div>
  );
};

const Ledger: React.FC<{ s: number }> = ({ s }) => {
  const p = spring(s, CUE.steps[3] + 0.05, 2.0, 0.45);
  const audit = spring(s, CUE.auditLine, 2.6, 0.4);
  return (
    <>
      <div style={{ position: "absolute", left: 860, top: 250, width: 900, borderRadius: 26, background: C.white, boxShadow: "0 30px 80px rgba(26,42,99,0.2)", padding: "34px 40px", transform: `translateY(${(1 - p) * 500}px) rotate(${(1 - p) * 5}deg)`, opacity: clamp(p * 2) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <FileIcon size={40} color={C.green} />
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.ink }}>choices.md</div>
          <div style={{ flex: 1 }} />
          <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 600, color: C.muted }}>least-confident first ↓</div>
        </div>
        {CHOICES.map((c, i) => {
          const t = CUE.choices[i];
          const q = spring(s, t, 3, 0.4);
          const bar = outCubic(prog(s, t + 0.05, t + 0.4));
          return (
            <div key={c.text} style={{ display: "flex", alignItems: "center", gap: 20, height: 66, borderTop: `1px solid ${C.line}`, opacity: clamp(q * 3), transform: `translateX(${(1 - q) * 60}px)` }}>
              <div style={{ fontFamily: MONO, fontSize: 22, color: C.muted, width: 30 }}>{i + 1}</div>
              <div style={{ fontFamily: SANS, fontSize: 27, fontWeight: 600, color: C.ink, flex: 1 }}>{c.text}</div>
              <div style={{ width: 180, height: 12, borderRadius: 6, background: "#edf1fb", overflow: "hidden" }}>
                <div style={{ width: `${c.conf * 100 * bar}%`, height: "100%", borderRadius: 6, background: c.conf < 0.5 ? "#f0a14a" : C.green }} />
              </div>
            </div>
          );
        })}
        <div style={{ fontFamily: SANS, fontSize: 17, color: "#8e9ab8", marginTop: 12 }}>illustrative entries</div>
      </div>
      {s >= CUE.auditLine && (
        <div style={{ position: "absolute", left: 860, top: 790, width: 900, fontFamily: SANS, fontWeight: 800, fontSize: 46, letterSpacing: -1, color: C.ink, transform: `scale(${audit})`, transformOrigin: "left center" }}>
          You audit what it <span style={{ color: C.green }}>chose</span>, not the diff.
        </div>
      )}
    </>
  );
};
