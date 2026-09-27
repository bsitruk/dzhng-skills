import React from "react";
import { CUE, INSTALL_CMD, SKILLS } from "../cues.ts";
import { C, MONO, SANS } from "../theme.ts";
import { clamp, inCubic, inOutCubic, lerp, outCubic, prog, spring, squash } from "../anim.ts";
import { Burst, Caret, CheckIcon, Fog, Shockwave, Terminal, Word, Wordmark } from "../ui.tsx";

const COLS = 4;
const TERM = { left: 250, top: 390, width: 1420 };
const CHIP_W = (TERM.width - 68) / COLS;
const CHIP_H = 46;
// Screen position of the first chip — the surface we zoom through.
export const ZOOM_TARGET = { x: TERM.left + 34 + CHIP_W / 2, y: TERM.top + 52 + 26 + 50 + 18 + CHIP_H / 2 };

// Drop: the wordmark blows the fog away, then the real install command runs.
// `poster` freezes the finished state for the feed thumbnail.
export const Reveal: React.FC<{ s: number; poster?: boolean }> = ({ s, poster }) => {
  const slam = clamp((s - CUE.drop) / 0.1);
  const [sx, sy] = squash(s, CUE.drop + 0.1, 0.25);
  const up = inOutCubic(prog(s, CUE.termIn - 0.1, CUE.termIn + 0.35));
  const groupY = lerp(430, 175, up);
  const groupScale = lerp(1, 0.56, up);
  const termP = spring(s, CUE.termIn, 1.8, 0.5);
  const typed = CUE.typing.filter((t) => s >= t).length;
  const entered = s >= CUE.enter;
  const installedAt = poster ? -Infinity : CUE.installed;
  const zoom = poster ? 0 : inCubic(prog(s, CUE.zoomThrough, 10.0));
  const whiteout = poster ? 0 : prog(s, 9.8, 10.0);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, transformOrigin: `${ZOOM_TARGET.x}px ${ZOOM_TARGET.y}px`, transform: `scale(${1 + zoom * 30})` }}>
        <Fog s={s} density={1} blast={outCubic(prog(s, CUE.drop, CUE.drop + 0.8))} />
        <Shockwave s={s} at={CUE.drop} x={960} y={430} size={2000} />
        <Burst s={s} at={CUE.drop} x={960} y={430} rays={22} len={900} />
        <div style={{ position: "absolute", left: 0, right: 0, top: groupY, display: "flex", flexDirection: "column", alignItems: "center", transform: `translateY(-50%) scale(${groupScale})` }}>
          <div style={{ transform: `scale(${lerp(2.6, 1, slam) * sx}, ${lerp(2.6, 1, slam) * sy})`, opacity: slam, filter: `blur(${(1 - slam) * 12}px)` }}>
            <Wordmark size={300} />
          </div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 66, color: C.ink, letterSpacing: -1.5, marginTop: 10 }}>
            <Word s={s} at={CUE.tagWords[0]}>AI skills for</Word>{" "}
            <Word s={s} at={CUE.tagWords[1]}>building</Word>{" "}
            <Word s={s} at={CUE.tagWords[2]}>software</Word>{" "}
            <Word s={s} at={CUE.tagWords[3]} color={C.blue}>factories.</Word>
          </div>
        </div>
        {s > CUE.termIn - 0.05 && (
          <div style={{ position: "absolute", left: TERM.left, top: TERM.top, transform: `translateY(${(1 - termP) * 700}px) rotate(${(1 - termP) * 4}deg)` }}>
            <Terminal width={TERM.width}>
              <div style={{ fontFamily: MONO, fontSize: 34, color: "#e8edff", height: 50, display: "flex", alignItems: "center" }}>
                <span style={{ color: "#7c9bff", marginRight: 18 }}>$</span>
                <span>{INSTALL_CMD.slice(0, typed)}</span>
                {!entered && <Caret s={s} />}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${COLS}, ${CHIP_W}px)`, gridAutoRows: CHIP_H, marginTop: 18 }}>
                {SKILLS.map((name, i) => {
                  const at = CUE.chips[i];
                  const p = spring(s, at, 3.2, 0.4);
                  return (
                    <div key={name} style={{ display: "flex", alignItems: "center", gap: 12, opacity: clamp(p * 3), transform: `translateY(${(1 - p) * 24}px) scale(${0.6 + 0.4 * p})`, transformOrigin: "left center" }}>
                      <CheckIcon size={24} bg={i === 0 ? C.blue : C.green} draw={prog(s, at + 0.03, at + 0.15)} />
                      <span style={{ fontFamily: MONO, fontSize: 20, whiteSpace: "nowrap", color: i === 0 ? "#fff" : "#b9c5f0", background: i === 0 ? "rgba(91,141,239,0.25)" : "transparent", padding: "2px 8px", borderRadius: 8 }}>{name}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 28, marginTop: 20, height: 40, color: "#5fd58f", opacity: clamp((s - installedAt) / 0.08), transform: `scale(${s >= installedAt ? 1 + 0.08 * Math.exp(-(s - installedAt) / 0.1) : 1})`, transformOrigin: "left center" }}>
                ✓ {SKILLS.length} skills installed
              </div>
            </Terminal>
          </div>
        )}
      </div>
      {whiteout > 0 && <div style={{ position: "absolute", inset: 0, background: C.bgTop, opacity: whiteout }} />}
    </div>
  );
};
