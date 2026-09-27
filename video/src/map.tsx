import React from "react";
import { random } from "remotion";
import { C, SANS } from "./theme.ts";
import { clamp, outBack, outCubic, spring } from "./anim.ts";
import { CELLS, Flag, HEX_R, hexPath } from "./ui.tsx";

export type Stamp = { cell: number; t: number; ok: boolean };

type MapProps = {
  s: number;
  gap: number; // px between territories (0 = one landmass)
  color: number; // 0 grey → 1 territory colors
  cellFog: number[]; // per cell 0..1
  marks?: (number | undefined)[]; // "?" pop times per cell
  flagsAt?: number;
  stamps?: Stamp[];
  split?: { cell: number; t: number }; // re-slice a failed cell into two
  agent?: { x: number; y: number; trail: { x: number; y: number }[] };
  cut?: { t: number; angle: number }[]; // slice sweeps
};

const GREY = "#c3cbe0";

export const TerritoryMap: React.FC<MapProps> = ({ s, gap, color, cellFog, marks, flagsAt, stamps = [], split, agent, cut = [] }) => {
  const size = 900;
  const half = size / 2;
  const mix = (a: string, b: string, t: number) => {
    const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const [x, y] = [p(a), p(b)];
    return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(",")})`;
  };
  return (
    <svg width={size} height={size} viewBox={`${-half} ${-half} ${size} ${size}`} style={{ overflow: "visible" }}>
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      {CELLS.map((c, i) => {
        const push = gap / (HEX_R * 1.7);
        const x = c.x * (1 + push), y = c.y * (1 + push);
        const fill = mix(GREY, C.lands[i], color);
        const isSplit = split && split.cell === i && s >= split.t;
        const sp = isSplit ? outBack(clamp((s - split!.t) / 0.25)) : 0;
        const r = HEX_R - 3;
        const pieces = isSplit
          ? [
              { clip: "left", dx: -14 * sp },
              { clip: "right", dx: 14 * sp },
            ]
          : [{ clip: "none", dx: 0 }];
        return (
          <g key={i} transform={`translate(${x},${y})`}>
            <path d={hexPath(r + 10)} fill="#fff" opacity={0.45 * color} filter="url(#glow)" />
            {pieces.map((pc, k) => (
              <g key={k} transform={`translate(${pc.dx},0)`}>
                <clipPath id={`clip${i}${pc.clip}`}>
                  {pc.clip === "none" ? <rect x={-r} y={-r} width={2 * r} height={2 * r} /> : <rect x={pc.clip === "left" ? -r : 2} y={-r} width={r - 2} height={2 * r} />}
                </clipPath>
                <path d={hexPath(r)} fill={fill} stroke="#fff" strokeWidth={gap > 1 ? 5 : 0} strokeLinejoin="round" clipPath={`url(#clip${i}${pc.clip})`} />
                {/* terrain dots */}
                {Array.from({ length: 7 }, (_, j) => (
                  <circle key={j} cx={(random(`tx${i}${j}`) - 0.5) * r * 1.2} cy={(random(`ty${i}${j}`) - 0.5) * r * 1.2} r={5 + random(`tr${i}${j}`) * 7} fill="#000" opacity={0.08} clipPath={`url(#clip${i}${pc.clip})`} />
                ))}
              </g>
            ))}
            {flagsAt !== undefined && i < 6 && (() => {
              const p = spring(s, flagsAt + i * 0.04, 3, 0.35);
              return p > 0 ? <g transform="translate(-30,40)"><Flag color={C.blue} scale={p} /></g> : null;
            })()}
            {i === 6 && flagsAt !== undefined && (() => {
              const p = spring(s, flagsAt, 3, 0.35);
              // The goal: a target at the heart of the map.
              return (
                <g transform={`scale(${p})`} opacity={clamp(p)}>
                  <circle r="38" fill={C.ink} />
                  <circle r="24" fill="none" stroke="#fff" strokeWidth="5" />
                  <circle r="9" fill={C.blue} stroke="#fff" strokeWidth="4" />
                </g>
              );
            })()}
            {/* fog cap */}
            <path d={hexPath(r + 6)} fill="#f4f7ff" opacity={cellFog[i] * 0.92} />
            {marks && marks[i] !== undefined && s >= marks[i]! && (() => {
              const p = spring(s, marks[i]!, 3, 0.4);
              return <text y="22" textAnchor="middle" fontFamily={SANS} fontWeight="800" fontSize={64} fill="#6b7799" opacity={clamp(cellFog[i] * 1.8)} transform={`scale(${p})`}>?</text>;
            })()}
          </g>
        );
      })}
      {cut.map((c, i) => {
        const t = s - c.t;
        if (t < -0.1 || t > 0.3) return null;
        const p = outCubic((t + 0.1) / 0.3);
        const a = (c.angle * Math.PI) / 180;
        const L = 560;
        const ox = Math.cos(a) * L, oy = Math.sin(a) * L;
        const hx = -ox + 2 * ox * p, hy = -oy + 2 * oy * p;
        return (
          <g key={i} opacity={1 - clamp(t / 0.3)}>
            <line x1={-ox} y1={-oy} x2={hx} y2={hy} stroke="#fff" strokeWidth={10} strokeLinecap="round" filter="url(#glow)" />
            <line x1={-ox} y1={-oy} x2={hx} y2={hy} stroke="#fff" strokeWidth={4} strokeLinecap="round" />
          </g>
        );
      })}
      {agent && (
        <g>
          {agent.trail.length > 1 && <polyline points={agent.trail.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="4 14" strokeLinecap="round" />}
          <circle cx={agent.x} cy={agent.y} r={26} fill={C.blue} opacity={0.25} />
          <circle cx={agent.x} cy={agent.y} r={13} fill={C.blue} stroke="#fff" strokeWidth={4} />
        </g>
      )}
      {stamps.filter((st) => s >= st.t).map((st, k) => {
        const c = CELLS[st.cell];
        const later = stamps.some((o) => o.cell === st.cell && o.t > st.t && s >= o.t);
        if (later) return null;
        const p = spring(s, st.t, 3.2, 0.3);
        const x = c.x * (1 + gap / (HEX_R * 1.7)), y = c.y * (1 + gap / (HEX_R * 1.7));
        const wob = st.ok ? 0 : Math.sin((s - st.t) * 60) * 10 * Math.exp(-(s - st.t) / 0.15);
        return (
          <g key={k} transform={`translate(${x + wob},${y - 18}) scale(${p})`}>
            <circle r="40" fill="#fff" opacity="0.95" />
            <circle r="34" fill={st.ok ? C.green : C.red} />
            {st.ok ? <path d="M-14,1 L-4,11 L15,-9" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M-11,-11 L11,11 M11,-11 L-11,11" stroke="#fff" strokeWidth="7" strokeLinecap="round" />}
          </g>
        );
      })}
    </svg>
  );
};
