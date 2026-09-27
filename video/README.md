# Launch video

A ~33s beat-locked launch reel for this repo, built entirely in code with the
[launch-video](../skills/graphics/launch-video/SKILL.md) skill: Remotion scenes
plus a soundtrack synthesized from the same cue sheet.

```bash
npm install
npm run audio    # synthesize + master public/soundtrack.wav (-12 LUFS, -1 dBTP)
npm run studio   # scrub it in the browser
npm run draft    # half-scale review render
npm run render   # 1080p60 H.264, 320k AAC → out/skills-launch.mp4
npm run still -- KeyArt out/key-art.png   # the headline-number still
```

Renders and generated audio are ignored; rerun `npm run audio` after a fresh
clone.

## One cue sheet

`src/cues.ts` holds every event time — scene starts, word reveals, stamps,
typing, impacts, risers — in song seconds at 120 BPM (a bar is 2s). The scenes
and `audio/synth.ts` both import it, so moving a cue moves its picture and its
sound together. Add a visual event by adding a cue first, then give it a sound.
Scenes read absolute time in seconds, never frames.

The video opens with a 0.3s pre-roll holding the finished install as the feed
thumbnail; `PREROLL` shifts both picture and music.

## Claims to preserve

- The proof number is the README's single unattended Codex run: **1d 16h**
  (goal timer `1d 16h 40m 1s`). It is one run (n = 1), and the on-screen
  disclosure says so — keep it next to the number wherever it appears.
- The harness list and "70+ others" come from the root README.
- The `choices.md` ledger rows are illustrative and labeled that way.

Audio is verified by measurement (ffmpeg `ebur128` and a spectrogram), not by
ear.
