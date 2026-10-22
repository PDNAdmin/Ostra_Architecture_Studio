import React, { useMemo } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';

// Walkthrough of the courtyard house as a rendered 3D sketch: a white model on paper, toon-shaded,
// with ink edges, floorboards, paving joints and wall strata drawn as lines, and real sun and shadow.
// The camera walks at eye height from the lane, through the gap in the garden wall, across the court,
// through the sliding glass wall, past the reading chair, into the kitchen.
// Nothing is baked in for the site (no labels, no markers). It is also the master for AI video conversion.
//
// World units are metres: x east, y north, z up (as in site/js/house.js). three.js is y-up, so v() maps.
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, z, -y);
type V3 = [number, number, number];

// Eye-height walk: position, look-at target and time (fraction of the clip).
// Caption timings in site/case-study.html follow these times.
const KEYS: { t: number; pos: V3; tgt: V3 }[] = [
  { t: 0.0, pos: [3.0, -15.0, 1.7], tgt: [7.0, 6.0, 2.3] },
  { t: 0.16, pos: [4.6, -9.5, 1.68], tgt: [6.5, 6.0, 2.2] },
  { t: 0.3, pos: [5.8, -3.6, 1.66], tgt: [6.0, 6.0, 2.0] },
  { t: 0.37, pos: [6.0, 0.2, 1.65], tgt: [6.0, 8.0, 1.8] },
  { t: 0.47, pos: [6.0, 4.2, 1.65], tgt: [5.4, 10.0, 1.6] },
  { t: 0.56, pos: [5.4, 7.8, 1.65], tgt: [5.0, 12.0, 1.5] },
  { t: 0.64, pos: [5.0, 9.8, 1.65], tgt: [3.2, 11.0, 1.2] },
  { t: 0.72, pos: [4.4, 10.6, 1.62], tgt: [2.4, 10.5, 0.7] },
  { t: 0.83, pos: [6.2, 11.4, 1.65], tgt: [10.8, 12.4, 1.0] },
  { t: 1.0, pos: [8.4, 11.0, 1.65], tgt: [11.0, 12.6, 0.95] },
];

const cat = (p0: number, p1: number, p2: number, p3: number, f: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (-p0 + 3 * p1 - 3 * p2 + p3) * f * f * f);

function pathAt(p: number) {
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].t) i++;
  const k0 = KEYS[Math.max(0, i - 1)], k1 = KEYS[i], k2 = KEYS[i + 1], k3 = KEYS[Math.min(KEYS.length - 1, i + 2)];
  const f = Math.min(1, Math.max(0, (p - k1.t) / (k2.t - k1.t)));
  const at = (key: 'pos' | 'tgt') => [0, 1, 2].map((c) => cat(k0[key][c], k1[key][c], k2[key][c], k3[key][c], f)) as V3;
  return { pos: at('pos'), tgt: at('tgt') };
}

// ---------------------------------------------------------------- look
const PAPER = '#F3EEE4';
const INK = '#26221D';
const T = { white: '#FBF8F2', earth: '#F1EADD', floor: '#EFE6D6', soft: '#F6F1E8', dark: '#3A342D', glass: '#E3ECEC' };

function useToonRamp() {
  return useMemo(() => {
    const tex = new THREE.DataTexture(new Uint8Array([178, 222, 255]), 3, 1, THREE.RedFormat);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
  }, []);
}
const RampCtx = React.createContext<THREE.Texture | null>(null);

type BoxProps = { min: number[]; max: number[]; color?: string; opacity?: number; edges?: boolean; cast?: boolean };
const Box: React.FC<BoxProps> = ({ min, max, color = T.white, opacity = 1, edges = true, cast = true }) => {
  const ramp = React.useContext(RampCtx);
  const size = [max[0] - min[0], max[2] - min[2], max[1] - min[1]];
  const centre = v((min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2);
  const geo = useMemo(() => new THREE.BoxGeometry(size[0], size[1], size[2]), [size[0], size[1], size[2]]);
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);
  return (
    <group position={centre}>
      <mesh geometry={geo} castShadow={cast && opacity > 0.9} receiveShadow>
        <meshToonMaterial color={color} gradientMap={ramp} transparent={opacity < 1} opacity={opacity} />
      </mesh>
      {edges && (
        <lineSegments geometry={edgeGeo}>
          <lineBasicMaterial color={INK} transparent opacity={opacity < 1 ? 0.55 : 0.9} />
        </lineSegments>
      )}
    </group>
  );
};

// Loose ink lines: floorboards, paving joints, strata in the earth walls, cladding boards.
const Lines: React.FC<{ segs: [V3, V3][]; opacity?: number }> = ({ segs, opacity = 0.35 }) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr: number[] = [];
    segs.forEach(([a, b]) => { const A = v(...a), B = v(...b); arr.push(A.x, A.y, A.z, B.x, B.y, B.z); });
    g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
    return g;
  }, [segs]);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color={INK} transparent opacity={opacity} />
    </lineSegments>
  );
};

const Tree: React.FC<{ at: number[]; h: number; r: number }> = ({ at, h, r }) => {
  const ramp = React.useContext(RampCtx);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(r, 1), [r]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);
  return (
    <group>
      <Box min={[at[0] - 0.08, at[1] - 0.08, 0]} max={[at[0] + 0.08, at[1] + 0.08, h - r * 0.6]} color={T.dark} edges={false} />
      <group position={v(at[0], at[1], h)}>
        <mesh geometry={geo} castShadow receiveShadow>
          <meshToonMaterial color={T.white} gradientMap={ramp} />
        </mesh>
        <lineSegments geometry={edges}>
          <lineBasicMaterial color={INK} transparent opacity={0.6} />
        </lineSegments>
      </group>
    </group>
  );
};

const Rig: React.FC<{ p: number }> = ({ p }) => {
  const { camera } = useThree();
  const { pos, tgt } = pathAt(p);
  camera.position.copy(v(...pos));
  (camera as THREE.PerspectiveCamera).fov = 58;
  camera.lookAt(v(...tgt));
  camera.updateProjectionMatrix();
  return null;
};

// ---------------------------------------------------------------- house
const House: React.FC<{ p: number }> = ({ p }) => {
  const slide = Math.min(1, Math.max(0, (p - 0.5) / 0.07)) * 1.6; // the glass panel slides open before you reach it
  const panes = [];
  for (let i = 0; i < 6; i++) {
    const x0 = 1 + i * 1.6;
    const dx = i === 2 ? slide : 0;
    panes.push(<Box key={`g${i}`} min={[x0 + 0.04 + dx, 9.2, 0.05]} max={[x0 + 1.56 + dx, 9.24, 2.76]} color={T.glass} opacity={0.18} cast={false} />);
    panes.push(<Box key={`f${i}`} min={[x0 + dx, 9.18, 0]} max={[x0 + 0.06 + dx, 9.26, 2.8]} color={T.dark} edges={false} />);
  }

  const detail = useMemo(() => {
    const floor: [V3, V3][] = [];
    for (let y = 9.6; y < 13.5; y += 0.19) floor.push([[0.45, y, 0.051], [13.55, y, 0.051]]);
    const court: [V3, V3][] = [];
    for (let x = 0.35 + 0.9; x < 13.55; x += 0.9) court.push([[x, 0.35, 0.032], [x, 9, 0.032]]);
    for (let y = 0.35 + 0.9; y < 9; y += 0.9) court.push([[0.35, y, 0.032], [13.55, y, 0.032]]);
    const strata: [V3, V3][] = [];
    for (let z = 0.22; z < 1.38; z += 0.21) strata.push([[0, -0.002, z], [5, -0.002, z]], [[7, -0.002, z], [14, -0.002, z]]);
    for (let z = 0.3; z < 6.1; z += 0.26) strata.push([[-0.002, 9, z], [-0.002, 14, z]]);
    const larch: [V3, V3][] = [];
    for (let y = 0.2; y < 14; y += 0.24) larch.push([[20.002, y, 0], [20.002, y, 3.6]]);
    for (let x = 14.2; x < 20; x += 0.24) larch.push([[x, -0.002, 0], [x, -0.002, 3.6]]);
    return { floor, court, strata, larch };
  }, []);

  return (
    <group>
      {/* site */}
      <Box min={[-60, -60, -0.1]} max={[80, 80, 0]} color={PAPER} edges={false} cast={false} />
      <Box min={[0.35, 0.35, 0]} max={[13.55, 9, 0.03]} color={T.soft} edges={false} cast={false} />
      <Lines segs={detail.court} opacity={0.28} />
      <Box min={[2, 2, 0.03]} max={[5.2, 6.4, 0.14]} />
      {[[-0.95, -0.45], [-1.75, -1.25], [-2.55, -2.05], [-3.35, -2.85]].map(([y0, y1], i) => (
        <Box key={`s${i}`} min={[5.3, y0, 0]} max={[6.7, y1, 0.04]} cast={false} />
      ))}
      {/* the lane edge */}
      <Lines segs={[[[-20, -6, 0.01], [40, -6, 0.01]], [[-20, -6.15, 0.01], [40, -6.15, 0.01]]]} opacity={0.45} />
      {/* garden walls, with the gap you walk through */}
      <Box min={[0, 0.35, 0]} max={[0.35, 9, 1.4]} color={T.earth} />
      <Box min={[0, 0, 0]} max={[5, 0.35, 1.4]} color={T.earth} />
      <Box min={[7, 0, 0]} max={[14, 0.35, 1.4]} color={T.earth} />
      <Lines segs={detail.strata} opacity={0.22} />
      {/* north wing: rammed earth, a glass wall to the court */}
      <Box min={[0, 13.55, 0]} max={[14, 14, 6.2]} color={T.earth} />
      <Box min={[0, 9, 0]} max={[0.45, 13.55, 6.2]} color={T.earth} />
      <Box min={[13.55, 9, 0]} max={[14, 13.55, 6.2]} color={T.earth} />
      <Box min={[0, 9, 3.2]} max={[14, 9.45, 6.2]} color={T.earth} />
      <Box min={[0.45, 9, 0]} max={[1, 9.45, 3.2]} color={T.earth} />
      <Box min={[10.6, 9, 0]} max={[13.55, 9.45, 3.2]} color={T.earth} />
      <Box min={[1, 9, 2.8]} max={[10.6, 9.45, 3.2]} color={T.earth} />
      <Box min={[1.6, 8.98, 3.7]} max={[4.4, 9.0, 5.6]} color={T.glass} opacity={0.5} cast={false} />
      <Box min={[9.4, 8.98, 3.7]} max={[12.6, 9.0, 5.6]} color={T.glass} opacity={0.5} cast={false} />
      {panes}
      <Box min={[0.45, 9.45, 0]} max={[13.55, 13.55, 0.05]} color={T.floor} edges={false} />
      <Lines segs={detail.floor} opacity={0.18} />
      <Box min={[0.45, 9.45, 3.15]} max={[13.55, 13.55, 3.2]} edges={false} cast={false} />
      <Box min={[-0.8, 7.6, 6.2]} max={[14.6, 14.4, 6.5]} />
      {/* east wing, larch clad */}
      <Box min={[14, 0, 0]} max={[20, 14, 3.6]} color={T.earth} />
      <Lines segs={detail.larch} opacity={0.2} />
      <Box min={[13.96, 1.2, 0.05]} max={[14, 8.2, 2.6]} color={T.glass} opacity={0.4} cast={false} />
      {/* inside: rug, reading chair, side table, sofa, bookcase, dining table, kitchen, island, shelf, pendant */}
      <Box min={[1.4, 9.8, 0.05]} max={[4.4, 12.2, 0.07]} color={T.soft} />
      <Box min={[2, 10, 0.05]} max={[2.9, 10.9, 0.45]} />
      <Box min={[2, 10.72, 0.45]} max={[2.9, 10.9, 1.05]} />
      <Box min={[1.88, 10, 0.05]} max={[2, 10.9, 0.68]} />
      <Box min={[2.9, 10, 0.05]} max={[3.02, 10.9, 0.68]} />
      <Box min={[3.2, 10.6, 0.05]} max={[3.6, 11, 0.55]} />
      <Box min={[4.6, 12, 0.05]} max={[7.4, 12.9, 0.5]} />
      <Box min={[4.6, 12.7, 0.5]} max={[7.4, 12.9, 0.85]} />
      <Box min={[0.45, 11.2, 0.05]} max={[0.8, 13.4, 2.2]} />
      <Box min={[8.2, 10.3, 0.72]} max={[10.4, 11.3, 0.78]} />
      {[[8.3, 10.4], [10.26, 10.4], [8.3, 11.16], [10.26, 11.16]].map(([x, y], i) => (
        <Box key={`l${i}`} min={[x, y, 0.05]} max={[x + 0.06, y + 0.06, 0.72]} edges={false} color={T.dark} />
      ))}
      <Box min={[8, 13, 0.05]} max={[13.4, 13.55, 0.9]} />
      <Box min={[8, 12.95, 0.9]} max={[13.4, 13.55, 0.95]} />
      <Box min={[9.2, 11.9, 0.05]} max={[12.2, 12.55, 0.92]} />
      <Box min={[9.15, 11.85, 0.92]} max={[12.25, 12.6, 0.97]} />
      <Box min={[8, 13.2, 1.6]} max={[13.4, 13.55, 1.64]} />
      <Box min={[9.25, 10.75, 2.2]} max={[9.35, 10.85, 3.15]} color={T.dark} edges={false} />
      <Box min={[9.1, 10.6, 1.95]} max={[9.5, 11.0, 2.2]} />
      {/* trees */}
      <Tree at={[10.4, 4.4]} h={4.6} r={1.9} />
      <Tree at={[-3.2, 1.6]} h={5.2} r={2.2} />
      <Tree at={[3.6, 4.2]} h={2.2} r={0.9} />
      <Tree at={[-8, -9]} h={6} r={2.6} />
      <Tree at={[17, -9.5]} h={5.4} r={2.3} />
    </group>
  );
};

export const Walkthrough: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const p = frame / (durationInFrames - 1);
  const ramp = useToonRamp();
  const sun = v(9 - 18, 7 - 30, 26); // morning sun from the south-west, low enough to reach the reading chair
  return (
    <ThreeCanvas width={width} height={height} shadows style={{ background: PAPER }}
      gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.NoToneMapping }}
      camera={{ fov: 58, near: 0.05, far: 300 }}>
      <RampCtx.Provider value={ramp}>
        <color attach="background" args={[PAPER]} />
        <fog attach="fog" args={[PAPER, 30, 95]} />
        <Rig p={p} />
        <hemisphereLight args={['#FFFFFF', '#E8E0D2', 1.1]} />
        <ambientLight intensity={0.62} />
        {/* soft daylight bounce inside the living room and kitchen */}
        <pointLight position={v(4, 11.5, 2.9)} intensity={4} distance={10} decay={2} />
        <pointLight position={v(10.5, 12, 2.9)} intensity={4} distance={10} decay={2} />
        <directionalLight position={sun} intensity={2.2} castShadow
          shadow-mapSize-width={4096} shadow-mapSize-height={4096} shadow-bias={-0.0012} shadow-normalBias={0.06}
          shadow-camera-left={-30} shadow-camera-right={30} shadow-camera-top={30} shadow-camera-bottom={-30}
          shadow-camera-near={1} shadow-camera-far={100} target-position={v(8, 8, 0)} />
        <House p={p} />
      </RampCtx.Provider>
    </ThreeCanvas>
  );
};
