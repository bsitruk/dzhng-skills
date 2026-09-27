import React from "react";
import { CUE, INSTALL_CMD } from "../cues.ts";
import { C, MONO, SANS } from "../theme.ts";
import { clamp, kick, lerp, outCubic, prog, spring, squash } from "../anim.ts";
import { Shockwave, Word } from "../ui.tsx";

// The proof's dark field collapses into the wordmark's blue period.
export const Lockup: React.FC<{ s: number }> = ({ s }) => {
  const k = kick(s);
  const iris = outCubic(prog(s, CUE.lockup, CUE.lockup + 0.4));
  const irisR = lerp(1250, 0, iris);
  const [sx, sy] = squash(s, CUE.lockup + 0.4, 0.12);
  const cmd = spring(s, CUE.lockCmd, 2.4, 0.42);
  const url = spring(s, CUE.lockUrl, 2.4, 0.42);
  const final = s >= CUE.finalHit ? Math.exp(-(s - CUE.finalHit) / 0.25) : 0;
  const size = 280;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Shockwave s={s} at={CUE.finalHit} x={960} y={370} color={C.blue} size={1800} />
      <div style={{ position: "absolute", zIndex: 5, left: 0, right: 0, top: 370, display: "flex", justifyContent: "center", transform: `translateY(-50%) scale(${sx * (1 + k * 0.01 + final * 0.04)}, ${sy * (1 + k * 0.01 + final * 0.04)})` }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: -size * 0.045, color: C.ink, lineHeight: 1, display: "flex", alignItems: "baseline" }}>
          skills
          <span style={{ position: "relative", display: "inline-block", width: size * 0.2, height: size * 0.2, marginLeft: size * 0.03, borderRadius: "50%", background: C.blue, transform: `scale(${1 + final * 0.5})` }}>
            {irisR > 1 && (
              <span style={{ position: "absolute", left: "50%", top: "50%", width: irisR * 2, height: irisR * 2, marginLeft: -irisR, marginTop: -irisR, borderRadius: "50%", background: iris > 0.85 ? C.blue : C.navy, zIndex: 10 }} />
            )}
          </span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 540, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 64, letterSpacing: -1.5, color: C.ink }}>
        <Word s={s} at={CUE.lockup + 0.3}>AI skills for building software</Word>{" "}
        <Word s={s} at={CUE.lockup + 0.4} color={C.blue}>factories.</Word>
      </div>
      <div style={{ position: "absolute", left: 960, top: 720, transform: `translate(-50%,0) scale(${cmd})`, opacity: clamp(cmd * 2), display: "flex", alignItems: "center", gap: 22, padding: "26px 44px", borderRadius: 24, background: "linear-gradient(160deg, #1d2a60, #0e1533)", boxShadow: `0 24px 60px rgba(26,42,99,0.3), 0 0 ${k * 30}px rgba(43,82,245,0.5)`, whiteSpace: "nowrap" }}>
        <span style={{ fontFamily: MONO, fontSize: 44, color: "#7c9bff" }}>$</span>
        <span style={{ fontFamily: MONO, fontSize: 44, color: "#fff" }}>{INSTALL_CMD}</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, textAlign: "center", fontFamily: MONO, fontSize: 34, color: C.muted, transform: `scale(${url})`, opacity: clamp(url * 2) }}>
        github.com/dzhng/skills
      </div>
    </div>
  );
};
