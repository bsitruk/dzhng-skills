import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { C, MONO, SANS, fontsReady } from "./theme.ts";
import { World } from "./world/World.tsx";

// Key-art still for the headline number, over the finished night factory.
export const KeyArt: React.FC = () => {
  const [handle] = useState(() => delayRender("fonts"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    fontsReady.then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  if (!ready) return null;
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <World s={24.5} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(10,16,48,0.2) 0%, rgba(10,16,48,0.75) 70%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 380, lineHeight: 1, letterSpacing: -18, color: "#fff", textShadow: "0 0 80px rgba(91,141,239,0.95)" }}>1d 16h</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 660, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 64, color: "#dfe6ff" }}>one unattended run, one goal.</div>
      <div style={{ position: "absolute", left: 90, bottom: 80, fontFamily: SANS, fontWeight: 900, fontSize: 96, letterSpacing: -4, color: "#fff" }}>skills<span style={{ color: C.blue }}>.</span></div>
      <div style={{ position: "absolute", right: 90, bottom: 96, fontFamily: MONO, fontSize: 34, color: "#c9d4ff" }}>npx skills add dzhng/skills</div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, textAlign: "center", fontFamily: SANS, fontSize: 22, color: "#aab6e6" }}>
        One unattended Codex run pursuing a single goal on top of these skills (n = 1). Goal timer: 1d 16h 40m 1s.
      </div>
    </AbsoluteFill>
  );
};
