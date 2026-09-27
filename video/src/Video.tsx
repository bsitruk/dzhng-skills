import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { FPS, PREROLL } from "./cues.ts";
import { inCubic, kick, prog, shake } from "./anim.ts";
import { Backdrop, Grain, Vignette } from "./ui.tsx";
import { Hud } from "./Hud.tsx";
import { Cold } from "./scenes/Cold.tsx";
import { Reveal } from "./scenes/Reveal.tsx";
import { Loop } from "./scenes/Loop.tsx";
import { Engine } from "./scenes/Engine.tsx";
import { Proof } from "./scenes/Proof.tsx";
import { Lockup } from "./scenes/Lockup.tsx";

// Song time s = video time − PREROLL. Scenes overlap a little at their edges so
// match cuts can hand one element to the next scene.
export const LaunchVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / FPS - PREROLL;
  const dark = s >= 22 && s < 28 ? 1 : 0;
  const { x, y, r } = shake(s);
  const cam = 1 + kick(s) * 0.012;
  const posterOut = inCubic(prog(s, 0, 0.25));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop s={s} dark={dark} />
      <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${cam})` }}>
        {s < 0.25 && (
          <AbsoluteFill style={{ transform: `scale(${1 + posterOut * 0.35})`, opacity: 1 - posterOut, filter: `blur(${posterOut * 14}px)` }}>
            <Reveal s={9.49} poster />
          </AbsoluteFill>
        )}
        {s >= 0 && s < 4.1 && <Cold s={s} />}
        {s >= 3.95 && s < 10.05 && <Reveal s={s} />}
        {s >= 9.9 && s < 20.05 && <Loop s={s} />}
        {s >= 19.9 && s < 22.05 && <Engine s={s} />}
        {s >= 22 && s < 28.05 && <Proof s={s} />}
        {s >= 28 && <Lockup s={s} />}
      </AbsoluteFill>
      <Hud s={s} dark={dark} />
      <Vignette />
      <Grain frame={frame} />
      <Audio src={staticFile("soundtrack.wav")} />
    </AbsoluteFill>
  );
};
