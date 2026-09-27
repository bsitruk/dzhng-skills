import React from "react";
import { AbsoluteFill } from "remotion";
import { C, MONO, SANS } from "./theme.ts";
import { Backdrop, GoalIcon, Grain, Vignette, Wordmark } from "./ui.tsx";

// Key-art still for the headline number (the thumbnail stays the product at work).
export const KeyArt: React.FC = () => (
  <AbsoluteFill>
    <Backdrop s={-1} dark={1} />
    <div style={{ position: "absolute", left: 960, top: 540, width: 1500, height: 1500, marginLeft: -750, marginTop: -750, borderRadius: "50%", background: "radial-gradient(circle, rgba(43,82,245,0.55) 0%, rgba(43,82,245,0) 60%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 48, color: "#c9d4ff" }}>one unattended run, one goal</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 330, lineHeight: 1, letterSpacing: -14, color: "#fff", textShadow: "0 0 70px rgba(91,141,239,0.8)" }}>1d 16h</div>
    <div style={{ position: "absolute", left: 960, top: 690, transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 22, padding: "24px 38px", borderRadius: 28, background: "#fff", whiteSpace: "nowrap" }}>
      <GoalIcon size={44} color={C.muted} />
      <span style={{ fontFamily: SANS, fontSize: 38, fontWeight: 600, color: C.ink }}>Pursuing goal</span>
      <span style={{ fontFamily: SANS, fontSize: 38, color: "#8e9ab8" }}>Make the …</span>
      <span style={{ fontFamily: MONO, fontSize: 40, color: C.ink }}>1d 16h 40m 1s</span>
    </div>
    <div style={{ position: "absolute", left: 90, bottom: 80 }}><Wordmark size={96} color="#fff" /></div>
    <div style={{ position: "absolute", right: 90, bottom: 92, fontFamily: MONO, fontSize: 30, color: "#c9d4ff" }}>npx skills add dzhng/skills</div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, textAlign: "center", fontFamily: SANS, fontSize: 20, color: "#8793c4" }}>
      One unattended Codex run pursuing a single goal on top of these skills (n = 1). Timer as shown in the run's goal view.
    </div>
    <Vignette />
    <Grain frame={0} />
  </AbsoluteFill>
);
