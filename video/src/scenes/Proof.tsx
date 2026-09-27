import React from "react";
import { random } from "remotion";
import { CUE, RUN_SECONDS, counterProgress } from "../cues.ts";
import { C, MONO, SANS } from "../theme.ts";
import { clamp, inOutCubic, kick, lerp, outCubic, prog, spring, squash } from "../anim.ts";
import { Burst, GoalIcon, Shards, Shockwave, Word } from "../ui.tsx";

export const fmtRun = (secs: number) => {
  const d = Math.floor(secs / 86400), h = Math.floor((secs % 86400) / 3600), m = Math.floor((secs % 3600) / 60), x = Math.floor(secs % 60);
  const parts = [d && `${d}d`, (d || h) && `${h}h`, (d || h || m) && `${m}m`, `${x}s`].filter(Boolean);
  return parts.join(" ");
};

// Proof: the README's one unattended run, 1d 16h on a single goal.
export const Proof: React.FC<{ s: number }> = ({ s }) => {
  const k = kick(s);
  const wordsOut = inOutCubic(prog(s, CUE.goalPill - 0.15, CUE.goalPill + 0.2));
  const pillP = spring(s, CUE.goalPill, 2.2, 0.45);
  const riser = prog(s, CUE.riser2[0], CUE.riser2[1]);
  const slammed = s >= CUE.slam;
  const slamP = clamp((s - CUE.slam) / 0.08);
  const [sx, sy] = squash(s, CUE.slam + 0.08, 0.3);
  const push = slammed ? 1 : 1 + riser * riser * 0.12;
  const pillDrop = inOutCubic(prog(s, CUE.slam, CUE.slam + 0.3));
  const secs = Math.floor(RUN_SECONDS * counterProgress(s));
  const collapse = prog(s, 27.85, 28.0);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - collapse }}>
      {/* streaking particles during the build */}
      {riser > 0 && !slammed && Array.from({ length: 60 }, (_, i) => {
        const a = random(`pa${i}`) * Math.PI * 2;
        const phase = (random(`pp${i}`) + (s - 24) * (0.6 + riser * 1.6)) % 1;
        const r = lerp(1100, 60, phase);
        const len = 20 + riser * 120;
        return <div key={i} style={{ position: "absolute", left: 960 + Math.cos(a) * r, top: 540 + Math.sin(a) * r, width: len, height: 3, background: "#8fb0ff", opacity: riser * 0.8 * phase, transform: `rotate(${a}rad)`, transformOrigin: "left center" }} />;
      })}
      <div style={{ position: "absolute", left: 960, top: 540, width: 1400, height: 1400, marginLeft: -700, marginTop: -700, borderRadius: "50%", background: `radial-gradient(circle, rgba(43,82,245,${0.25 + riser * 0.45 + (slammed ? 0.3 * Math.exp(-(s - CUE.slam) / 0.4) : 0)}) 0%, rgba(43,82,245,0) 60%)` }} />

      <div style={{ position: "absolute", inset: 0, transform: `scale(${push})` }}>
        {/* kinetic words */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontFamily: SANS, fontWeight: 800, color: "#fff", letterSpacing: -5, transform: `translateY(${wordsOut * -300}px)`, opacity: 1 - wordsOut }}>
          <div style={{ fontSize: 170, lineHeight: 1, transform: `scale(${lerp(1, 0.62, inOutCubic(prog(s, 22.9, 23.15)))})`, opacity: lerp(1, 0.55, prog(s, 22.9, 23.15)) }}>
            <Word s={s} at={CUE.proofWords[0]}>One goal.</Word>
          </div>
          <div style={{ fontSize: 170, lineHeight: 1.05, marginTop: -30 }}>
            <Word s={s} at={CUE.proofWords[1]} color="#8fb0ff">Unattended.</Word>
          </div>
        </div>

        {/* goal pill, rebuilt from the README's screenshot */}
        {s >= CUE.goalPill - 0.05 && (
          <div style={{ position: "absolute", left: 960, top: lerp(540, 820, pillDrop), transform: `translate(-50%,-50%) scale(${pillP * lerp(1, 0.72, pillDrop)})`, display: "flex", alignItems: "center", gap: 24, padding: "30px 44px", borderRadius: 32, background: "rgba(255,255,255,0.97)", boxShadow: `0 30px 90px rgba(0,0,0,0.4), 0 0 ${40 + riser * 80}px rgba(91,141,239,${0.4 + riser * 0.4})`, whiteSpace: "nowrap" }}>
            <GoalIcon size={52} color={C.muted} spin={s * 200} />
            <div style={{ fontFamily: SANS, fontSize: 44, fontWeight: 600, color: C.ink }}>Pursuing goal</div>
            <div style={{ fontFamily: SANS, fontSize: 44, color: "#8e9ab8" }}>Make the …</div>
            <div style={{ fontFamily: MONO, fontSize: 46, fontWeight: 500, color: C.ink, minWidth: 380, textAlign: "right" }}>{fmtRun(secs)}</div>
          </div>
        )}

        {/* the slam */}
        {slammed && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center", transform: `translateY(-50%) scale(${lerp(2.2, 1, slamP) * sx}, ${lerp(2.2, 1, slamP) * sy})`, opacity: slamP }}>
            <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 330, lineHeight: 1, letterSpacing: -14, color: "#fff", textShadow: `0 0 ${60 + k * 40}px rgba(91,141,239,0.8)` }}>1d 16h</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 52, color: "#c9d4ff", marginTop: 6, opacity: clamp((s - CUE.slam - 0.15) / 0.2) }}>
              one unattended run, one goal
            </div>
          </div>
        )}
        {s >= CUE.proofSub && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 40, color: "#8fb0ff" }}>
            <Word s={s} at={CUE.proofSub}>slicing and iterating until done.</Word>
          </div>
        )}
      </div>
      <Shockwave s={s} at={CUE.slam} x={960} y={400} color="#8fb0ff" size={2400} />
      <Burst s={s} at={CUE.slam} x={960} y={400} color="#8fb0ff" rays={28} len={1100} />
      <Shards s={s} at={CUE.slam} x={960} y={400} n={90} colors={C.lands} power={1.2} />
      {/* disclosure */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 92, textAlign: "center", fontFamily: SANS, fontSize: 22, color: "#8793c4", opacity: outCubic(prog(s, CUE.slam + 0.3, CUE.slam + 0.6)) }}>
        One unattended Codex run pursuing a single goal on top of these skills (n = 1). Timer as shown in the run's goal view: 1d 16h 40m 1s.
      </div>
    </div>
  );
};
