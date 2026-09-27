// The 3D world: a hex continent under fog that gets mapped, sliced, built on,
// and verified. Everything is a pure function of song time `s`.
import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Post } from "./Post.tsx";
import { ThreeCanvas } from "@remotion/three";
import { random } from "remotion";
import { CUE, SKILLS } from "../cues.ts";
import { C, H, W } from "../theme.ts";
import { clamp, inCubic, inOutCubic, kick, lerp, night, outBack, outCubic, outExpo, prog, spring } from "../anim.ts";
import { cameraAt } from "./camera.ts";
import { BUILDINGS, HEXES, LANDS, RAIN_TARGETS, RESLICE_LAND, type Hex } from "./grid.ts";
import { beamTex, docTex, facadeDayTex, facadeTex, glowTex, groundTextTex, puffTex, questionTex, ringTex, skillTileTex, stampTex, terrainTex, wordTex } from "./textures.ts";

export const LOCKUP_BG = "#e3e9fc";
// Sky: the hero art's periwinkle gradient by day, navy by night.
let skyCanvas: HTMLCanvasElement | null = null;
let skyTex: THREE.CanvasTexture | null = null;
function skyTexture(n: number, flat: number) {
  if (!skyCanvas) {
    skyCanvas = document.createElement("canvas");
    skyCanvas.width = 160;
    skyCanvas.height = 90;
    skyTex = new THREE.CanvasTexture(skyCanvas);
    skyTex.colorSpace = THREE.SRGBColorSpace;
  }
  const g = skyCanvas.getContext("2d")!;
  const day = g.createLinearGradient(0, 0, 160, 90);
  day.addColorStop(0, "#f4f7ff");
  day.addColorStop(0.45, "#dde5fc");
  day.addColorStop(1, "#95abf3");
  g.globalAlpha = 1;
  g.fillStyle = day;
  g.fillRect(0, 0, 160, 90);
  if (n > 0) {
    const nt = g.createRadialGradient(80, 30, 0, 80, 30, 110);
    nt.addColorStop(0, "#1d2a6e");
    nt.addColorStop(0.7, C.night);
    g.globalAlpha = n;
    g.fillStyle = nt;
    g.fillRect(0, 0, 160, 90);
  }
  if (flat > 0) {
    g.globalAlpha = flat;
    g.fillStyle = LOCKUP_BG;
    g.fillRect(0, 0, 160, 90);
  }
  skyTex!.needsUpdate = true;
  return skyTex!;
}

const col = (a: string, b: string, t: number) => new THREE.Color(a).lerp(new THREE.Color(b), clamp(t));
const ADD = THREE.AdditiveBlending;

// ---------- per-hex state ----------
function ripple(s: number, t0: number, d: number, amp: number, speed: number) {
  if (s < t0) return 0;
  const front = (s - t0) * speed;
  return amp * Math.exp(-((d - front) ** 2) / 1.4) * Math.exp(-(s - t0) / 1.3);
}
const LAND_H = [0.95, 0.55, 0.75, 0.6, 0.8, 0.5, 0.7];

function hexHeight(h: { land: number; rnd: number }, s: number) {
  const start = CUE.rise + h.land * 0.06 + h.rnd * 0.12;
  return 0.35 + h.rnd * 0.05 + spring(s, start, 2.2, 0.35) * (LAND_H[h.land] + h.rnd * 0.25);
}
function landGap(s: number) {
  const cuts = CUE.lasers.reduce((a, t) => a + outBack(prog(s, t + 0.2, t + 0.45)), 0);
  return cuts * 0.07 + spring(s, CUE.rise, 2, 0.5) * 0.22;
}
function hexOffset(h: Hex, s: number): [number, number] {
  const L = LANDS[h.land];
  const g = landGap(s);
  let ox = L.dir[0] * g, oz = L.dir[1] * g;
  if (h.land === RESLICE_LAND) {
    const sep = outBack(prog(s, CUE.reslice, CUE.reslice + 0.3)) * 0.4 * h.half;
    ox += -L.dir[1] * sep;
    oz += L.dir[0] * sep;
  }
  return [ox, oz];
}
function hexLift(h: Hex, s: number) {
  let y = ripple(s, CUE.drop, h.dist, 1.4, 13) + ripple(s, CUE.slam, h.dist, 0.9, 15);
  for (const p of CUE.pulses) y += ripple(s, p, h.dist, 0.2, 11);
  const k = RAIN_TARGETS.indexOf(h.i);
  if (k >= 0) {
    const t = s - CUE.rain[k];
    if (t >= 0) y -= 0.35 * Math.exp(-t / 0.12) * Math.cos(t * 28);
  }
  return y;
}
const landTop = (land: number, s: number) => hexHeight({ land, rnd: 0.5 }, s);
const landPos = (land: number, s: number): [number, number] => {
  const L = LANDS[land];
  const g = landGap(s);
  return [L.cx + L.dir[0] * g, L.cz + L.dir[1] * g];
};
const passTime = (land: number) => CUE.visits.filter((v) => v.land === land && v.ok).at(-1)!.t;

// ---------- the canvas ----------
export const World: React.FC<{ s: number }> = ({ s }) => (
  <ThreeCanvas width={W} height={H} shadows={{ type: THREE.VSMShadowMap }} gl={{ antialias: false, alpha: false, preserveDrawingBuffer: true, toneMapping: THREE.NoToneMapping, powerPreference: "high-performance" }} camera={{ fov: 38, near: 0.1, far: 300, position: [0, 20, 20] }}>
    <Scene s={s} />
  </ThreeCanvas>
);

const Scene: React.FC<{ s: number }> = ({ s }) => {
  const n = night(s);
  const { camera, scene, gl } = useThree();
  const env = useMemo(() => new THREE.PMREMGenerator(gl).fromScene(new RoomEnvironment(), 0.04).texture, [gl]);
  scene.environment = env;
  scene.environmentIntensity = lerp(0.9, 0.3, n);
  const { pos, look } = cameraAt(s);
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.lookAt(look[0], look[1], look[2]);
  const cam = camera as THREE.PerspectiveCamera;
  cam.fov = 38 - kick(s) * 0.7;
  cam.updateProjectionMatrix();

  const fog = useMemo(() => new THREE.Fog(C.sky, 10, 80), []);
  scene.background = skyTexture(n, prog(s, CUE.collapse[0] - 0.3, CUE.collapse[0]));
  fog.color.copy(col("#d2dbf8", C.nightFog, n));
  const intro = s < CUE.drop;
  fog.near = intro ? lerp(6, 1, prog(s, 3.0, 4)) : lerp(40, 22, n);
  fog.far = intro ? lerp(46, 9, prog(s, 3.0, 4)) : lerp(120, 80, n);
  scene.fog = fog;

  // Sun: warm by day, moonlight at night, racing through days in the time-lapse.
  const lapse = prog(s, CUE.timelapse[0], CUE.timelapse[1]);
  const az = lapse > 0 && lapse < 1 ? (s - CUE.timelapse[0]) * (4 + lapse * 10) : 0.7;
  const sun: [number, number, number] = [Math.cos(az) * 12, 14, Math.sin(az) * 12];
  const flash = s >= CUE.slam ? Math.exp(-(s - CUE.slam) / 0.25) : 0;

  return (
    <>
      <hemisphereLight args={[col("#f4f7ff", "#3a4a9a", n), col("#8f9bbd", "#0a0f2a", n), lerp(0.7, 0.28, n) + flash * 0.3]} />
      <directionalLight position={[-10, 6, -12]} intensity={lerp(0.9, 0.7, n)} color={col("#c9d6ff", "#6f8cff", n)} />
      <directionalLight position={sun} intensity={lerp(1.9, 0.55, n) + (lapse > 0 && lapse < 1 ? Math.max(0, Math.sin(az)) * 1.2 : 0)} color={col("#fff4e6", "#9fb4ff", n)} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={16} shadow-camera-bottom={-16} shadow-bias={-0.0006} shadow-radius={6} shadow-blurSamples={16} />
      <Hexes s={s} n={n} />
      <IntroWords s={s} />
      <Titles s={s} n={n} />
      <WallFog s={s} />
      <GroundFog s={s} n={n} />
      <Questions s={s} />
      <Rain s={s} />
      <Sonar s={s} />
      <GroundText s={s} />
      <Lasers s={s} />
      <ResliceLaser s={s} />
      <Flags s={s} />
      <Buildings s={s} n={n} />
      <Agent s={s} />
      <Beams s={s} />
      <Stamps s={s} />
      <DocCard s={s} />
      <ShockRing s={s} at={CUE.drop} color="#ffffff" speed={18} />
      <ShockRing s={s} at={CUE.slam} color={C.periwinkle} speed={20} />
      <Dust s={s} n={n} />
      <Sparks s={s} />
      <Post s={s} n={n} />
    </>
  );
};

// ---------- hexes ----------
// Bevelled hex prism, unit height centered on the origin, pointy along z.
const HEX_GEO = (() => {
  const shape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const a = ((90 + 60 * i) * Math.PI) / 180;
    const x = Math.cos(a) * 0.9, y = Math.sin(a) * 0.9;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const bevel = 0.06;
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 1 - 2 * bevel, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3 });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -0.5 + bevel, 0);
  geo.computeVertexNormals();
  return geo;
})();
const Hexes: React.FC<{ s: number; n: number }> = ({ s, n }) => {
  const mats = useMemo(() => {
    const detail = terrainTex();
    return HEXES.map((h) => {
      const m = new THREE.MeshPhysicalMaterial({ map: detail, bumpMap: detail, bumpScale: 0.6, roughnessMap: detail, roughness: 0.7, clearcoat: 0.35, clearcoatRoughness: 0.35, sheen: 0.3, sheenRoughness: 0.8 });
      // Each tile samples a different patch of the detail texture.
      m.map = detail.clone();
      m.map.repeat.set(0.35, 0.35);
      m.map.offset.set(h.rnd, (h.rnd * 7.3) % 1);
      m.map.needsUpdate = true;
      return m;
    });
  }, []);
  const k = kick(s);
  return (
    <>
      {HEXES.map((h, i) => {
        const height = hexHeight(h, s);
        const lift = hexLift(h, s);
        const [ox, oz] = hexOffset(h, s);
        const cp = clamp(spring(s, CUE.color + h.dist * 0.035, 2.5, 0.5));
        const m = mats[i];
        m.color.copy(col(s < CUE.drop ? "#7f8bb3" : C.land, C.lands[h.land], cp));
        const visited = CUE.visits.filter((v) => v.land === h.land && s >= v.t).at(-1);
        const visitGlow = visited ? Math.exp(-(s - visited.t) / 0.3) : 0;
        const slamGlow = s >= CUE.slam ? Math.exp(-(s - CUE.slam - h.dist * 0.04) / 0.4) * (s - CUE.slam > h.dist * 0.04 ? 1 : 0) : 0;
        m.emissive.copy(col(C.lands[h.land], visited && !visited.ok && s < CUE.reslice ? C.red : C.lands[h.land], 1));
        m.emissiveIntensity = cp * (n * 0.22 + k * 0.08) + visitGlow * 0.9 + slamGlow * 1.2;
        return (
          <mesh key={i} geometry={HEX_GEO} material={m} position={[h.x + ox, height / 2 + lift, h.z + oz]} scale={[1, height, 1]} castShadow receiveShadow />
        );
      })}
    </>
  );
};

// ---------- fog ----------
const WALL = Array.from({ length: 150 }, (_, i) => ({
  x: (random(`wx${i}`) - 0.5) * 30,
  y: random(`wy${i}`) * 4.5,
  z: -8 + random(`wz${i}`) * 34,
  size: 7 + random(`ws${i}`) * 8,
  rnd: random(`wr${i}`),
}));
const WallFog: React.FC<{ s: number }> = ({ s }) => {
  if (s > CUE.drop + 1.4) return null;
  const blast = outExpo(prog(s, CUE.drop, CUE.drop + 1.2));
  const thick = prog(s, 2.8, 3.95);
  return (
    <>
      {WALL.map((p, i) => {
        const d = Math.hypot(p.x, p.z - 6) || 1;
        const push = blast * 30;
        const x = p.x + Math.sin(s * 0.5 + i) * 0.4 + (p.x / d) * push;
        const z = p.z + ((p.z - 6) / d) * push;
        const y = p.y + blast * 6 * p.rnd;
        const o = (0.05 + thick * 0.75) * (1 - blast);
        return (
          <sprite key={i} position={[x, y, z]} scale={[p.size, p.size, 1]}>
            <spriteMaterial map={puffTex()} transparent opacity={o} depthWrite={false} color={i % 3 ? "#ffffff" : "#e3e9fb"} fog={false} />
          </sprite>
        );
      })}
    </>
  );
};

const GROUND = Array.from({ length: 170 }, (_, i) => {
  const r = Math.sqrt(random(`gr${i}`)) * 10.5;
  const a = random(`ga${i}`) * Math.PI * 2;
  const x = Math.cos(a) * r, z = Math.sin(a) * r;
  return { x, z, y: 0.6 + random(`gy${i}`) * 0.6, size: 4.5 + random(`gs${i}`) * 3.5, quad: r < 1 ? 3 : Math.floor(((Math.atan2(z, x) + Math.PI) / (2 * Math.PI)) * 4) % 4, r };
});
const GroundFog: React.FC<{ s: number; n: number }> = ({ s }) => {
  if (s > CUE.pulses[3] + 1.5) return null;
  return (
    <>
      {GROUND.map((p, i) => {
        const clearAt = CUE.pulses[p.quad] + p.r / 11;
        const c = outCubic(prog(s, clearAt, clearAt + 0.6));
        const x = p.x * (1 + c * 0.6), z = p.z * (1 + c * 0.6);
        const o = (s < CUE.drop ? 0.1 + prog(s, 2.8, 4) * 0.3 : 0.5) * (1 - c);
        return (
          <sprite key={i} position={[x + Math.sin(s * 0.6 + i) * 0.2, p.y + c * 2.5, z]} scale={[p.size, p.size, 1]}>
            <spriteMaterial map={puffTex()} transparent opacity={o} depthWrite={false} depthTest={false} color="#f4f7ff" />
          </sprite>
        );
      })}
    </>
  );
};

// "?" glints: in the fog on the way in, then over each unmapped quadrant.
const Q_INTRO = CUE.glints.map((t, i) => ({ t, x: (random(`qx${i}`) - 0.5) * 8, y: 1.4 + random(`qy${i}`) * 2, z: -5 + random(`qz${i}`) * 8 }));
const Q_MAP = Array.from({ length: 8 }, (_, i) => {
  const quad = i % 4;
  const a = -Math.PI + (quad + 0.3 + random(`qa${i}`) * 0.4) * (Math.PI / 2);
  const r = 3 + random(`qr${i}`) * 5;
  return { quad, x: Math.cos(a) * r, z: Math.sin(a) * r, t: CUE.drop + 0.8 + i * 0.12 };
});
const Questions: React.FC<{ s: number }> = ({ s }) => (
  <>
    {s < CUE.drop &&
      Q_INTRO.map((q, i) => {
        const p = spring(s, q.t, 3, 0.35);
        const flick = 0.75 + 0.25 * Math.sin(s * 23 + i);
        return p > 0 ? (
          <sprite key={`i${i}`} position={[q.x, q.y, q.z]} scale={[0.9 * p, 0.9 * p, 1]}>
            <spriteMaterial map={questionTex()} transparent opacity={flick * clamp(p)} depthWrite={false} fog={false} />
          </sprite>
        ) : null;
      })}
    {s >= CUE.drop &&
      s < CUE.slice &&
      Q_MAP.map((q, i) => {
        const pin = spring(s, q.t, 3, 0.35);
        const out = prog(s, CUE.pulses[q.quad], CUE.pulses[q.quad] + 0.2);
        const sc = 1.6 * pin * (1 - out) + out * 3 * (1 - out);
        return (
          <sprite key={`m${i}`} position={[q.x, 2.4 + Math.sin(s * 2 + i) * 0.15, q.z]} scale={[sc, sc, 1]}>
            <spriteMaterial map={questionTex()} transparent opacity={clamp(pin) * (1 - out)} depthWrite={false} />
          </sprite>
        );
      })}
  </>
);

// ---------- skills rain ----------
const Rain: React.FC<{ s: number }> = ({ s }) => {
  if (s < CUE.rain[0] - 0.7 || s > CUE.color + 0.3) return null;
  return (
    <>
      {SKILLS.map((name, k) => {
        const h = HEXES[RAIN_TARGETS[k]];
        const land = CUE.rain[k];
        const t0 = land - 0.38;
        const top = hexHeight(h, s) + 0.5;
        const p = prog(s, t0, land);
        const after = s - land;
        const drift = (random(`rd${k}`) - 0.5) * 3 * (1 - p);
        const shrink = after > 0 ? 1 - outCubic(after / 0.22) : 1;
        const flash = after >= 0 && after < 0.45;
        const marker = after > 0.1 && s < CUE.slice;
        return (
          <group key={name}>
            {s >= t0 && shrink > 0.01 && (
              <sprite position={[h.x + drift, lerp(11, top, inCubic(p)), h.z]} scale={[5 * shrink, 0.78 * shrink, 1]}>
                <spriteMaterial map={skillTileTex(name)} transparent depthWrite={false} opacity={clamp(p * 4)} />
              </sprite>
            )}
            {flash && (
              <mesh position={[h.x, top - 0.4, h.z]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.6 + after * 7, 0.6 + after * 7, 1]}>
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial map={ringTex()} transparent opacity={1 - after / 0.45} color={C.blue} blending={ADD} depthWrite={false} />
              </mesh>
            )}
            {marker && (
              <sprite position={[h.x, top - 0.1 + hexLift(h, s), h.z]} scale={[0.55, 0.55, 1]}>
                <spriteMaterial map={glowTex()} transparent color={C.blue} blending={ADD} depthWrite={false} opacity={0.9 * (0.7 + 0.3 * kick(s))} />
              </sprite>
            )}
          </group>
        );
      })}
    </>
  );
};

// ---------- mapping ----------
const Sonar: React.FC<{ s: number }> = ({ s }) => (
  <>
    {CUE.pulses.map((p, i) => {
      const t = s - p;
      if (t < 0 || t > 1.3) return null;
      const r = t * 11 + 0.5;
      return (
        <mesh key={i} position={[0, 0.95, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[r * 2.4, r * 2.4, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={ringTex()} transparent opacity={(1 - t / 1.3) * 0.95} color={new THREE.Color(C.blue).multiplyScalar(3)} blending={ADD} depthWrite={false} />
        </mesh>
      );
    })}
  </>
);

const QUAD_LABELS = ["known knowns", "known unknowns", "unknown knowns", "unknown unknowns"];
// Pulses clear quadrants in this order; each label lies on its quadrant.
const GroundText: React.FC<{ s: number }> = ({ s }) => {
  if (s < CUE.pulses[0] || s > CUE.slice + 0.3) return null;
  return (
    <>
      {QUAD_LABELS.map((label, quad) => {
        const at = CUE.pulses[quad] + 0.12;
        const p = spring(s, at, 2.2, 0.5);
        if (p <= 0) return null;
        const out = prog(s, CUE.slice - 0.2, CUE.slice + 0.2);
        const a = -Math.PI + (quad + 0.5) * (Math.PI / 2);
        const r = quad === 3 ? 5.2 : 5.6;
        const { pos } = cameraAt(at + 0.6);
        const theta = Math.atan2(pos[0], pos[2]);
        const slide = (1 - p) * 3;
        return (
          <group key={label} position={[Math.cos(a) * r, 1.05, Math.sin(a) * r]} rotation={[0, theta, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-slide, 0, 0]}>
              <planeGeometry args={[7.2, 0.9]} />
              <meshBasicMaterial map={groundTextTex(label)} color={C.ink} transparent opacity={clamp(p * 2) * (1 - out)} depthWrite={false} />
            </mesh>
          </group>
        );
      })}
    </>
  );
};

// ---------- slicing ----------
const Lasers: React.FC<{ s: number }> = ({ s }) => (
  <>
    {CUE.lasers.map((t, i) => {
      const p = inOutCubic(prog(s, t - 0.12, t + 0.2));
      const fade = 1 - prog(s, t + 0.2, t + 0.7);
      if (s < t - 0.12 || fade <= 0) return null;
      if (i === 3) {
        return (
          <group key={i} position={[0, 1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh>
              <torusGeometry args={[2.75, 0.045, 8, 96, Math.max(0.01, p * Math.PI * 2)]} />
              <meshBasicMaterial color={new THREE.Color(5, 5, 5)} transparent opacity={fade} />
            </mesh>
            <mesh>
              <torusGeometry args={[2.75, 0.22, 8, 96, Math.max(0.01, p * Math.PI * 2)]} />
              <meshBasicMaterial color={C.blue} transparent opacity={fade * 0.5} blending={ADD} depthWrite={false} />
            </mesh>
          </group>
        );
      }
      const a = (i * 60 * Math.PI) / 180;
      const len = 24 * p;
      const mid = -12 + len / 2;
      const tip = -12 + len;
      return (
        <group key={i} rotation={[0, -a, 0]} position={[0, 1.1, 0]}>
          <mesh position={[mid, 0, 0]}>
            <boxGeometry args={[Math.max(0.01, len), 0.06, 0.06]} />
            <meshBasicMaterial color={new THREE.Color(5, 5, 5)} transparent opacity={fade} />
          </mesh>
          <mesh position={[mid, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[Math.max(0.01, len), 0.6]} />
            <meshBasicMaterial color={C.blue} transparent opacity={fade * 0.55} blending={ADD} depthWrite={false} />
          </mesh>
          {p < 1 && (
            <sprite position={[tip, 0, 0]} scale={[1.6, 1.6, 1]}>
              <spriteMaterial map={glowTex()} color="#ffffff" blending={ADD} transparent depthWrite={false} />
            </sprite>
          )}
        </group>
      );
    })}
  </>
);

// The stale territory gets cut in two along its own axis.
const ResliceLaser: React.FC<{ s: number }> = ({ s }) => {
  const t = CUE.reslice;
  const p = inOutCubic(prog(s, t - 0.15, t + 0.05));
  const fade = 1 - prog(s, t + 0.05, t + 0.5);
  if (s < t - 0.15 || fade <= 0) return null;
  const L = LANDS[RESLICE_LAND];
  const [x, z] = landPos(RESLICE_LAND, s);
  const a = Math.atan2(L.dir[1], L.dir[0]);
  const len = 7 * p;
  return (
    <group position={[x, landTop(RESLICE_LAND, s) + 0.15, z]} rotation={[0, -a, 0]}>
      <mesh position={[-3.5 + len / 2, 0, 0]}>
        <boxGeometry args={[Math.max(0.01, len), 0.07, 0.07]} />
        <meshBasicMaterial color={new THREE.Color(5, 5, 5)} transparent opacity={fade} />
      </mesh>
      <mesh position={[-3.5 + len / 2, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[Math.max(0.01, len), 0.8]} />
        <meshBasicMaterial color="#b9a8ff" transparent opacity={fade * 0.7} blending={ADD} depthWrite={false} />
      </mesh>
    </group>
  );
};

const Flags: React.FC<{ s: number }> = ({ s }) => (
  <>
    {LANDS.map((_, land) => {
      const p = spring(s, CUE.flags[land], 3, 0.33);
      if (p <= 0) return null;
      const [x, z] = landPos(land, s);
      const y = landTop(land, s) + hexLiftAt(x, z, s);
      const wave = Math.sin(s * 7 + land) * 0.25;
      return (
        <group key={land} position={[x + 0.55, y, z + 0.3]} scale={[p, p, p]}>
          <mesh position={[0, 0.75, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 1.5, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.32, 1.3, 0]} rotation={[0, wave, 0]} castShadow>
            <planeGeometry args={[0.64, 0.4]} />
            <meshStandardMaterial color={C.blue} side={THREE.DoubleSide} emissive={C.blue} emissiveIntensity={0.25} />
          </mesh>
        </group>
      );
    })}
  </>
);
const hexLiftAt = (x: number, z: number, s: number) => {
  const d = Math.hypot(x, z);
  return ripple(s, CUE.slam, d, 0.9, 15);
};

// ---------- building ----------
const BOX = new RoundedBoxGeometry(1, 1, 1, 3, 0.07);
const Buildings: React.FC<{ s: number; n: number }> = ({ s, n }) => {
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#ffffff", map: facadeDayTex(), roughness: 0.28, metalness: 0.15, clearcoat: 0.8, clearcoatRoughness: 0.15, emissive: "#ffffff", emissiveMap: facadeTex() }), []);
  const flash = s >= CUE.slam ? Math.exp(-(s - CUE.slam) / 0.5) : 0;
  mat.color.copy(col("#ffffff", "#28336e", n));
  mat.emissiveIntensity = lerp(0.05, 1.5, n) + flash * 2.5 + kick(s) * 0.25 * n;
  return (
    <>
      {BUILDINGS.map((b, i) => {
        const g = spring(s, passTime(b.land) + 0.05 + b.k * 0.07, 2.2, 0.4);
        if (g <= 0.001) return null;
        const h = HEXES[b.hex];
        const [ox, oz] = hexOffset(h, s);
        const top = hexHeight(h, s) + hexLift(h, s);
        const hh = b.h * Math.max(0, g);
        return <mesh key={i} geometry={BOX} material={mat} position={[h.x + ox, top + hh / 2, h.z + oz]} scale={[b.w * (2 - Math.min(1.2, g)) * 0.9, Math.max(0.001, hh), b.w * 0.9]} castShadow receiveShadow />;
      })}
    </>
  );
};

// ---------- agent + verification ----------
const START = CUE.night + 0.1;
function agentAt(s: number): [number, number, number] {
  const way = [{ t: START, land: 0 }, ...CUE.visits.map((v) => ({ t: v.t, land: v.land }))];
  if (s >= CUE.timelapse[0]) {
    // Time-lapse: laps around the ring, faster and faster.
    const u = s - CUE.timelapse[0];
    const laps = u * (1.2 + u * 1.6);
    const a = laps * Math.PI * 2 - Math.PI / 2;
    const r = 5.6 + Math.sin(laps * 9) * 0.6;
    return [Math.cos(a) * r, 2.2 + Math.sin(laps * 6) * 0.3, Math.sin(a) * r];
  }
  let i = 0;
  while (i < way.length - 1 && s >= way[i + 1].t) i++;
  const [ax, az] = landPos(way[i].land, s);
  const ay = landTop(way[i].land, s) + 0.8;
  if (i === way.length - 1) return [ax, ay, az];
  const next = way[i + 1];
  const u = inOutCubic(prog(s, next.t - 0.38, next.t));
  const [bx, bz] = landPos(next.land, s);
  const by = landTop(next.land, s) + 0.8;
  return [lerp(ax, bx, u), lerp(ay, by, u) + Math.sin(Math.PI * u) * 1.4 + Math.sin(s * 5) * 0.08, lerp(az, bz, u)];
}
const Agent: React.FC<{ s: number }> = ({ s }) => {
  if (s < START || s > CUE.slam) return null;
  const p = spring(s, START, 3, 0.4);
  const [x, y, z] = agentAt(s);
  const lapse = prog(s, CUE.timelapse[0], CUE.timelapse[1]);
  const trailN = 36;
  const step = lerp(0.03, 0.012, lapse);
  return (
    <>
      <mesh position={[x, y, z]} scale={[p, p, p]}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshBasicMaterial color={new THREE.Color(6, 6, 8)} />
      </mesh>
      <sprite position={[x, y, z]} scale={[2.2 * p, 2.2 * p, 1]}>
        <spriteMaterial map={glowTex()} color={C.periwinkle} blending={ADD} transparent depthWrite={false} />
      </sprite>
      <pointLight position={[x, y + 0.4, z]} intensity={10 * p} distance={7} color={C.periwinkle} />
      {Array.from({ length: trailN }, (_, k) => {
        const ts = s - (k + 1) * step;
        if (ts < START) return null;
        const [tx, ty, tz] = agentAt(ts);
        const f = 1 - k / trailN;
        return (
          <sprite key={k} position={[tx, ty, tz]} scale={[0.7 * f, 0.7 * f, 1]}>
            <spriteMaterial map={glowTex()} color={C.periwinkle} blending={ADD} transparent opacity={0.8 * f} depthWrite={false} />
          </sprite>
        );
      })}
    </>
  );
};

const BEAM_GEO = new THREE.CylinderGeometry(0.7, 0.7, 18, 24, 1, true);
const Beams: React.FC<{ s: number }> = ({ s }) => {
  const beams = [
    ...CUE.visits.map((v) => ({ t: v.t, land: v.land, color: v.ok ? "#5fe39a" : C.red, w: 1 })),
    ...LANDS.map((_, land) => ({ t: CUE.slam + land * 0.03, land, color: C.periwinkle, w: 1.5 })),
  ];
  return (
    <>
      {beams.map((b, i) => {
        const t = s - b.t;
        if (t < 0 || t > 0.9) return null;
        const [x, z] = landPos(b.land, s);
        const o = Math.exp(-t / 0.3);
        const w = b.w * (0.4 + t * 1.6);
        return (
          <mesh key={i} geometry={BEAM_GEO} position={[x, landTop(b.land, s) + 9, z]} scale={[w, 1, w]}>
            <meshBasicMaterial map={beamTex()} color={new THREE.Color(b.color).multiplyScalar(3)} transparent opacity={o} blending={ADD} depthWrite={false} side={THREE.DoubleSide} fog={false} />
          </mesh>
        );
      })}
    </>
  );
};

const Stamps: React.FC<{ s: number }> = ({ s }) => (
  <>
    {CUE.visits.map((v, i) => {
      if (s < v.t) return null;
      const superseded = CUE.visits.some((o) => o.land === v.land && o.t > v.t && s >= o.t);
      const outFail = !v.ok ? prog(s, CUE.reslice, CUE.reslice + 0.15) : 0;
      const outAll = prog(s, CUE.slam, CUE.slam + 0.15);
      if (superseded && v.ok) return null;
      const p = spring(s, v.t, 3.2, 0.3) * (1 - outFail) * (1 - outAll) * lerp(1, 0.55, prog(s, v.t + 0.5, v.t + 0.8));
      if (p <= 0.001) return null;
      const [x, z] = landPos(v.land, s);
      const wob = v.ok ? 0 : Math.sin((s - v.t) * 60) * 0.25 * Math.exp(-(s - v.t) / 0.15);
      const y = landTop(v.land, s) + 2.6 + hexLiftAt(x, z, s);
      return (
        <sprite key={i} position={[x + wob, y, z]} scale={[0.075 * p, 0.075 * p, 1]}>
          <spriteMaterial map={stampTex(v.ok)} transparent depthWrite={false} fog={false} sizeAttenuation={false} />
        </sprite>
      );
    })}
  </>
);

const ShockRing: React.FC<{ s: number; at: number; color: string; speed: number }> = ({ s, at, color, speed }) => {
  const t = s - at;
  if (t < 0 || t > 1.4) return null;
  const r = 1 + t * speed;
  return (
    <mesh position={[0, 1.4, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[r * 2.4, r * 2.4, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={ringTex()} color={new THREE.Color(color).multiplyScalar(2.5)} transparent opacity={(1 - t / 1.4) * 0.9} blending={ADD} depthWrite={false} />
    </mesh>
  );
};

// ---------- words in the world ----------
const INTRO_WORDS = [
  { text: "You know the goal.", z: 4.5, w: 8 },
  { text: "The path is", z: 1.5, w: 7 },
  { text: "unknown.", z: -1.5, w: 9.5 },
];
const IntroWords: React.FC<{ s: number }> = ({ s }) => {
  if (s >= CUE.drop) return null;
  return (
    <>
      {INTRO_WORDS.map((w, i) => {
        const t = CUE.fogWords[i];
        const p = spring(s, t, 2.2, 0.5);
        if (p <= 0) return null;
        const last = i === INTRO_WORDS.length - 1;
        // Each word stands up to face the lens, holds, then sinks as the next arrives.
        const stand = lerp(0.62, 1, inOutCubic(prog(s, t, t + 0.5)));
        const next = CUE.fogWords[i + 1];
        const leave = next === undefined ? 0 : inCubic(prog(s, next - 0.1, next + 0.25));
        const dissolve = last ? prog(s, 3.3, 3.9) : leave;
        return (
          <group key={w.text} position={[0, lerp(-0.5, 0.35, clamp(p)) + (w.w * 0.1875) / 2 - leave * 1.5 + (last ? dissolve * 0.8 : 0), w.z]}>
            <mesh renderOrder={20} rotation={[-Math.PI / 2 + stand * (Math.PI / 2 - 0.2), 0, 0]} scale={[1 + (last ? dissolve * 0.4 : 0), 1 + (last ? dissolve * 0.4 : 0), 1]}>
              <planeGeometry args={[w.w, w.w * 0.1875]} />
              <meshBasicMaterial map={wordTex(w.text)} color={C.ink} transparent opacity={clamp(p * 2) * (1 - dissolve)} depthWrite={false} depthTest={false} fog={false} />
            </mesh>
          </group>
        );
      })}
    </>
  );
};

// Step titles projected onto the board as each shot begins.
const TITLES = [
  { text: "map the fog", at: CUE.explore, until: CUE.pulses[0] + 0.3 },
  { text: "slice it", at: CUE.slice, until: CUE.lasers[0] + 0.25 },
  { text: "build", at: CUE.night, until: CUE.visits[0].t - 0.1 },
];
const Titles: React.FC<{ s: number; n: number }> = ({ s, n }) => (
  <>
    {TITLES.map((t) => {
      if (s < t.at - 0.05 || s > t.until + 0.3) return null;
      const p = spring(s, t.at, 2.4, 0.5);
      const out = prog(s, t.until, t.until + 0.3);
      const { pos } = cameraAt(t.at + 0.4);
      const theta = Math.atan2(pos[0], pos[2]);
      const sc = lerp(1.6, 1, clamp(p)) * (1 + out * 0.3);
      return (
        <group key={t.text} position={[0, 1.6 + out * 1.5, 0]} rotation={[0, theta, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[sc, sc, 1]}>
            <planeGeometry args={[14, 2.63]} />
            <meshBasicMaterial map={wordTex(t.text)} color={n > 0.5 ? "#ffffff" : C.ink} transparent opacity={clamp(p * 2) * (1 - out)} depthWrite={false} depthTest={false} />
          </mesh>
        </group>
      );
    })}
  </>
);

// choices.md rises out of the finished city at dawn.
const DocCard: React.FC<{ s: number }> = ({ s }) => {
  const at = CUE.dawn + 0.9;
  if (s < at || s > CUE.collapse[0] + 0.3) return null;
  const p = spring(s, at, 1.6, 0.5);
  const out = inCubic(prog(s, CUE.collapse[0] - 0.2, CUE.collapse[0] + 0.2));
  const { pos } = cameraAt(s);
  const yaw = Math.atan2(pos[0], pos[2]);
  return (
    <group position={[0, lerp(-3, 6.4, clamp(p)) - out * 8, 0]} rotation={[0, yaw + (1 - clamp(p)) * 2.5, 0]}>
      <mesh rotation={[-0.12, 0, 0]} castShadow>
        <planeGeometry args={[4.2, 5.25]} />
        <meshBasicMaterial map={docTex()} transparent side={THREE.DoubleSide} />
      </mesh>
      <sprite position={[0, -3.2, 0]} scale={[7, 3, 1]}>
        <spriteMaterial map={glowTex()} color={C.green} blending={ADD} transparent opacity={0.5 * clamp(p)} depthWrite={false} />
      </sprite>
    </group>
  );
};

// ---------- atmosphere ----------
const MOTES = Array.from({ length: 220 }, (_, i) => ({
  x: (random(`dx${i}`) - 0.5) * 26,
  y: 0.5 + random(`dy${i}`) * 6,
  z: (random(`dz${i}`) - 0.5) * 26,
  r: random(`dr${i}`),
}));
// Dust motes catching the light; brighter and bluer at night.
const Dust: React.FC<{ s: number; n: number }> = ({ s, n }) => {
  if (s > CUE.collapse[0]) return null;
  const tint = new THREE.Color(col("#ffffff", C.periwinkle, n)).multiplyScalar(lerp(1.2, 2.6, n));
  return (
    <>
      {MOTES.map((m, i) => {
        const x = m.x + Math.sin(s * 0.3 + i) * 0.6;
        const y = m.y + ((s * (0.08 + m.r * 0.12)) % 1.5) + Math.sin(s * 0.7 + i * 1.7) * 0.2;
        const z = m.z + Math.cos(s * 0.25 + i) * 0.6;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(s * (1 + m.r * 2) + i));
        const size = 0.06 + m.r * 0.1;
        return (
          <sprite key={i} position={[x, y, z]} scale={[size, size, 1]}>
            <spriteMaterial map={glowTex()} color={tint} transparent opacity={tw * lerp(0.35, 0.9, n)} blending={ADD} depthWrite={false} />
          </sprite>
        );
      })}
    </>
  );
};

// Sparks burst from each verified territory, and from all of them on the slam.
const BURSTS = [
  ...CUE.visits.map((v) => ({ t: v.t, land: v.land, color: v.ok ? "#7dffb0" : "#ff6b6f", n: 26, power: 1 })),
  ...LANDS.map((_, land) => ({ t: CUE.slam + land * 0.03, land, color: C.periwinkle, n: 30, power: 1.6 })),
];
const Sparks: React.FC<{ s: number }> = ({ s }) => (
  <>
    {BURSTS.flatMap((b, bi) => {
      const t = s - b.t;
      if (t < 0 || t > 1.2) return [];
      const [cx, cz] = landPos(b.land, s);
      const cy = landTop(b.land, s) + 0.4;
      const c = new THREE.Color(b.color).multiplyScalar(4);
      return Array.from({ length: b.n }, (_, i) => {
        const a = random(`sa${bi}${i}`) * Math.PI * 2;
        const up = 3 + random(`su${bi}${i}`) * 5;
        const out = (1 + random(`so${bi}${i}`) * 2.5) * b.power;
        const drag = 1 - Math.exp(-t * 3);
        const x = cx + Math.cos(a) * out * drag;
        const z = cz + Math.sin(a) * out * drag;
        const y = cy + up * t - 7 * t * t;
        const f = 1 - t / 1.2;
        return (
          <sprite key={`${bi}-${i}`} position={[x, Math.max(cy - 0.3, y), z]} scale={[0.14 * f + 0.04, 0.14 * f + 0.04, 1]}>
            <spriteMaterial map={glowTex()} color={c} transparent opacity={f} blending={ADD} depthWrite={false} />
          </sprite>
        );
      });
    })}
  </>
);
