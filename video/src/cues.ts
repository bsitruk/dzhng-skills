// The one cue sheet. Scenes and the synthesized soundtrack both import it, so
// every hit on screen lands on a hit in the mix. Times are song seconds; the
// video adds PREROLL in front for the feed thumbnail.

export const BPM = 120;
export const BEAT = 60 / BPM;
export const BAR = BEAT * 4;
export const PREROLL = 0.3;
export const FPS = 60;
export const SONG_END = 33;
export const DURATION = PREROLL + SONG_END;

export const SCENES = [
  { id: "cold", label: "THE FOG", start: 0, end: 4 },
  { id: "reveal", label: "INSTALL", start: 4, end: 10 },
  { id: "loop", label: "THE LOOP", start: 10, end: 20 },
  { id: "engine", label: "HARNESS", start: 20, end: 22 },
  { id: "proof", label: "PROOF", start: 22, end: 28 },
  { id: "lockup", label: "SKILLS", start: 28, end: SONG_END },
] as const;

// Music arrangement: where the kick plays, where it breaks down, where it builds.
export const SECTIONS = {
  intro: [0, 4],
  drop: [4, 22],
  breakdown: [22, 24],
  build: [24, 26],
  drop2: [26, 31.5],
  outro: [31.5, SONG_END],
} as const;

export const SKILLS = [
  "explore-unknowns", "write-spec", "implement-spec", "implement-spec-with-codex",
  "close-spec", "auto-research", "refactor-clean", "write-tests",
  "audit-performance", "write-docs", "code-review", "audit-choices",
  "eli5", "review", "codex", "claude",
  "marketing-pages", "compare-screenshots", "screenshot-critique", "preview-shots",
  "write-skills", "eval-skills", "renderer", "launch-video",
];

export const INSTALL_CMD = "npx skills add dzhng/skills";
export const HARNESSES = ["Claude Code", "Codex", "opencode", "Cursor", "duet", "+70 more"];

const range = (start: number, step: number, n: number) =>
  Array.from({ length: n }, (_, i) => start + i * step);

export const CUE = {
  // Cold open: tasks get done, the goal is fog.
  coldWords: [0.25, 0.75, 1.0], // "Your agent" "finishes" "tasks."
  coldChecks: [0.5, 1.0, 1.5],
  fogWords: [2.0, 2.5, 3.0], // "But a goal" "is" "fog."
  fogRoll: 2.75,
  fogMarks: [3.0, 3.25, 3.5],
  riser1: [3.0, 4.0],

  // Drop + reveal.
  drop: 4.0,
  tagWords: [4.5, 5.0, 5.25, 5.5],
  termIn: 6.0,
  typing: range(6.25, 1 / 27, INSTALL_CMD.length),
  enter: 7.5,
  chips: range(7.75, 0.0625, SKILLS.length),
  installed: 9.5,
  zoomThrough: 9.5,

  // The loop: four steps, one per two bars.
  steps: [10, 12, 14, 18],
  quadrants: [10.5, 10.875, 11.25, 11.625],
  slices: [12.25, 12.5, 12.75, 13.0, 13.25],
  territoriesFill: 13.5,
  verdicts: [
    { t: 14.5, cell: 0, ok: true },
    { t: 15.0, cell: 1, ok: true },
    { t: 15.5, cell: 2, ok: false },
    { t: 16.0, cell: 2, ok: true },
    { t: 16.5, cell: 3, ok: true },
    { t: 17.0, cell: 4, ok: true },
    { t: 17.5, cell: 5, ok: true },
  ],
  reslice: 15.75,
  choices: [18.25, 18.5, 18.75, 19.0],
  auditLine: 19.5,

  // Harness.
  harnessTitle: 20.0,
  harnesses: [20.25, 20.5, 20.75, 21.0, 21.25, 21.5],

  // Proof.
  proofWords: [22.0, 23.0], // "One goal." "Unattended."
  goalPill: 24.0,
  counter: [24.25, 26.0],
  riser2: [24.0, 26.0],
  slam: 26.0,
  proofSub: 27.0,

  // Lockup.
  lockup: 28.0,
  lockCmd: 28.5,
  lockUrl: 29.0,
  finalHit: 32.0,
} as const;

// The run's goal timer, exactly as the README's screenshot shows it.
export const RUN_SECONDS = 1 * 86400 + 16 * 3600 + 40 * 60 + 1;

// The proof counter accelerates through the riser; ticks fire each time it
// crosses another 1/24 of the run, so the sound speeds up with the digits.
const COUNTER_TICKS = 24;
export const counterProgress = (s: number) => {
  const [a, b] = CUE.counter;
  const p = Math.min(1, Math.max(0, (s - a) / (b - a)));
  return p * p * p;
};
export const counterTicks = Array.from(
  { length: COUNTER_TICKS },
  (_, i) => CUE.counter[0] + ((i + 1) / COUNTER_TICKS) ** (1 / 3) * (CUE.counter[1] - CUE.counter[0]),
).slice(0, -1);
