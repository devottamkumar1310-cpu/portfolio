/**
 * CosmicBackground — High-Fidelity Constellation & Deep Space Environment
 * Built with Three.js + React Three Fiber
 * 
 * Scene layers:
 *  1. Physical Starfield — Soft radial stars across depth layers.
 *  2. High-Visibility Constellations — Hand-authored recognizable geometric star groupings
 *     (Orion-inspired, Cassiopeia-inspired, Cygnus-inspired, and abstract diamond structures)
 *     with visible glowing lines and nodes that pulse gently.
 *  3. Shooting Stars — Randomized, pooled lines with soft trail envelopes.
 *  4. Faint Nebulae & Dust — Subtle background glows (Cyan, Violet, Magenta) to support content readability.
 *  5. CameraRig — Multi-frequency noise drift, spring look-at, and scroll travel.
 */

import { useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const MOBILE = typeof window !== "undefined" && window.innerWidth < 768;

// Seeded RNG
function mkRand(seed: number) {
  let s = seed | 0;
  return () => {
    s = (Math.imul(s, 747796405) + 2891336453) | 0;
    return ((s >>> 18) ^ s) / 0xffffffff + 0.5;
  };
}

// ─── PROCEDURAL TEXTURE FOR STARS & NODES ───────────────────────────────────

function makeStarTexture(): THREE.Texture {
  const sz = 64;
  const cv = document.createElement("canvas");
  cv.width = cv.height = sz;
  const ctx = cv.getContext("2d")!;
  const cx = sz / 2, cy = sz / 2;

  // Soft glowing point
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, sz / 2);
  g.addColorStop(0, "rgba(255, 255, 255, 1.0)");
  g.addColorStop(0.18, "rgba(255, 255, 255, 0.9)");
  g.addColorStop(0.42, "rgba(200, 240, 255, 0.3)");
  g.addColorStop(1.0, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, sz, sz);
  return new THREE.CanvasTexture(cv);
}

// ─── CAMERA RIG ──────────────────────────────────────────────────────────────

function CameraRig() {
  const mouse = useRef({ x: 0, y: 0 });
  const camPos = useRef(new THREE.Vector3(0, 0, 0));
  const camVel = useRef(new THREE.Vector3(0, 0, 0));
  const lookTarget = useRef(new THREE.Vector3(0, 0, -100));
  const lookVel = useRef(new THREE.Vector3(0, 0, 0));
  const scrollY = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => { scrollY.current = window.scrollY; };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();
    const frameLimit = Math.min(dt, 0.1);

    // Sinusoidal camera drift
    const driftX = Math.sin(t * 0.04) * 3.5 + Math.cos(t * 0.08) * 1.5;
    const driftY = Math.cos(t * 0.035) * 2.5 + Math.sin(t * 0.07) * 1.0;
    
    // Scroll depth traversal
    const targetZ = -scrollY.current * 0.04;
    camVel.current.z += (targetZ - camPos.current.z) * 0.022;
    camVel.current.z *= 0.86;
    camPos.current.z += camVel.current.z;

    // Smooth spring look-at
    const targetLookX = mouse.current.x * 20 + driftX;
    const targetLookY = mouse.current.y * -15 + driftY;
    lookVel.current.x += (targetLookX - lookTarget.current.x) * 0.015;
    lookVel.current.y += (targetLookY - lookTarget.current.y) * 0.015;
    lookVel.current.multiplyScalar(0.85);
    lookTarget.current.x += lookVel.current.x;
    lookTarget.current.y += lookVel.current.y;
    lookTarget.current.z = -100 + camPos.current.z;

    state.camera.position.set(0, 0, camPos.current.z);
    state.camera.lookAt(lookTarget.current);
  });

  return null;
}

// ─── STAR FIELD ──────────────────────────────────────────────────────────────

function StarField() {
  const COUNT = MOBILE ? 400 : 900;
  const starTex = useMemo(() => makeStarTexture(), []);
  const pointsRef = useRef<THREE.Points>(null);

  const [geo, mat] = useMemo(() => {
    const rand = mkRand(99);
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      const r = 200 + rand() * 800; // Multi-depth stars

      pos[i3] = Math.sin(ph) * Math.cos(th) * r;
      pos[i3 + 1] = Math.sin(ph) * Math.sin(th) * r * 0.7;
      pos[i3 + 2] = Math.cos(ph) * r;

      const roll = rand();
      if (roll < 0.40) {
        // Cyan tint
        col[i3] = 0.70; col[i3+1] = 0.95; col[i3+2] = 1.0;
      } else if (roll < 0.80) {
        // Soft white
        col[i3] = 0.98; col[i3+1] = 0.98; col[i3+2] = 0.98;
      } else {
        // Violet tint
        col[i3] = 0.92; col[i3+1] = 0.75; col[i3+2] = 1.0;
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));

    const m = new THREE.PointsMaterial({
      size: 3.5,
      map: starTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return [g, m];
  }, [starTex]);

  useEffect(() => () => starTex.dispose(), [starTex]);

  useFrame((state, dt) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += dt * 0.0004;
      // Add very subtle twinkling to background stars
      const t = state.clock.getElapsedTime();
      (pointsRef.current.material as THREE.PointsMaterial).opacity = 0.65 + Math.sin(t * 0.8) * 0.1;
    }
  });

  return <points ref={pointsRef} geometry={geo} material={mat} />;
}

// ─── HIGH-VISIBILITY CONSTELLATION SYSTEM ────────────────────────────────────

interface ConstellationDef {
  name: string;
  color: string;
  baseZ: number;
  scale: number;
  center: [number, number]; // X, Y offset in 3D screen space coordinates
  nodes: [number, number][]; // Relative offsets from center
  edges: [number, number][]; // Node index pairs to connect
}

const CONSTELLATIONS_CONFIG: ConstellationDef[] = [
  {
    // Orion-inspired grouping (brighter, foreground)
    name: "Orion",
    color: "#22d3ee", // Electric Cyan
    baseZ: -80,
    scale: 7.0,
    center: [-25, 12],
    nodes: [
      [-1.5, 3.0],   // Betelgeuse (0)
      [1.5, 2.5],    // Bellatrix (1)
      [-0.5, 0.2],   // Alnilam (Belt center) (2)
      [-1.2, 0.3],   // Alnitak (Belt left) (3)
      [0.2, 0.1],    // Mintaka (Belt right) (4)
      [-1.8, -2.5],  // Saiph (5)
      [1.6, -3.0],   // Rigel (6)
    ],
    edges: [
      [0, 1], [0, 3], [1, 4], [3, 2], [2, 4], [3, 5], [4, 6], [5, 6]
    ]
  },
  {
    // Cassiopeia-inspired (midground, top-right)
    name: "Cassiopeia",
    color: "#a78bfa", // Deep Violet
    baseZ: -140,
    scale: 14.0,
    center: [28, 16],
    nodes: [
      [-2.0, 1.0],   // Segin (0)
      [-0.8, -0.5],  // Ruchbah (1)
      [0.2, 0.8],    // Gamma Cas (2)
      [1.2, -0.6],   // Schedar (3)
      [2.2, 1.2],    // Caph (4)
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4]
    ]
  },
  {
    // Cygnus/Northern Cross (deeper background, center-left)
    name: "Cygnus",
    color: "#22d3ee", // Cyan
    baseZ: -190,
    scale: 18.0,
    center: [-15, -15],
    nodes: [
      [0.0, 3.0],    // Deneb (0)
      [0.0, 0.5],    // Sadr (1)
      [-2.5, 0.8],   // Gienah (2)
      [2.5, 0.2],    // Delta Cyg (3)
      [0.0, -2.5],   // Albireo (4)
    ],
    edges: [
      [0, 1], [1, 2], [1, 3], [1, 4]
    ]
  },
  {
    // Abstract geometric diamond cluster (midground, right)
    name: "GeminiAbstract",
    color: "#ec4899", // Magenta accent
    baseZ: -110,
    scale: 10.0,
    center: [22, -10],
    nodes: [
      [0.0, 2.0],
      [-1.8, 0.0],
      [1.8, 0.0],
      [0.0, -2.0],
      [-3.0, -1.0],
      [3.0, -1.0]
    ],
    edges: [
      [0, 1], [0, 2], [1, 3], [2, 3], [1, 4], [2, 5]
    ]
  }
];

function Constellations() {
  const nodeTex = useMemo(() => makeStarTexture(), []);
  
  // Memoize geometry & structures
  const data = useMemo(() => {
    return CONSTELLATIONS_CONFIG.map((c) => {
      // Calculate absolute 3D position for each node
      const positions: THREE.Vector3[] = c.nodes.map(
        (n) => new THREE.Vector3(c.center[0] + n[0] * c.scale, c.center[1] + n[1] * c.scale, c.baseZ)
      );

      // Create line segment points from edges list
      const linePoints: THREE.Vector3[] = [];
      c.edges.forEach(([i, j]) => {
        linePoints.push(positions[i], positions[j]);
      });

      // Construct BufferGeometries
      const nodeGeo = new THREE.BufferGeometry().setFromPoints(positions);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);

      // Materials with varying brightness/opacity based on depth
      const alphaDepth = Math.max(0.2, 1.0 - Math.abs(c.baseZ) / 280);
      
      const nodeMat = new THREE.PointsMaterial({
        size: Math.max(4.0, 10.0 * alphaDepth),
        map: nodeTex,
        color: c.color,
        transparent: true,
        opacity: 0.90 * alphaDepth,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const lineMat = new THREE.LineBasicMaterial({
        color: c.color,
        transparent: true,
        opacity: 0.38 * alphaDepth, // High-visibility line strength
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      return { nodeGeo, nodeMat, lineGeo, lineMat };
    });
  }, [nodeTex]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, dt) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Pulse constellations at different frequencies
    groupRef.current.children.forEach((child, i) => {
      const freq = 0.8 + (i * 0.15);
      const pulse = 0.82 + Math.sin(t * freq) * 0.18;
      
      // Twinkle line opacity and point scales
      const lines = child.children[0] as THREE.LineSegments;
      const points = child.children[1] as THREE.Points;
      
      if (lines && lines.material) {
        const baseOpacity = data[i].lineMat.opacity;
        (lines.material as THREE.LineBasicMaterial).opacity = baseOpacity * pulse;
      }
      if (points && points.material) {
        const baseOpacity = data[i].nodeMat.opacity;
        (points.material as THREE.PointsMaterial).opacity = baseOpacity * (0.8 + Math.sin(t * freq * 1.5) * 0.2);
      }
    });

    // Extremely slow, premium rotation tracking
    groupRef.current.rotation.y = Math.sin(t * 0.02) * 0.02;
    groupRef.current.rotation.x = Math.cos(t * 0.015) * 0.01;
  });

  return (
    <group ref={groupRef}>
      {data.map((c, i) => (
        <group key={i}>
          {/* Constellation line links */}
          <lineSegments geometry={c.lineGeo} material={c.lineMat} />
          {/* Constellation star nodes */}
          <points geometry={c.nodeGeo} material={c.nodeMat} />
        </group>
      ))}
    </group>
  );
}

// ─── VOLUMETRIC GAS NEBULA CLOUDS ───────────────────────────────────────────

const NebulaShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    void main() {
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    uniform vec3 uColor;
    uniform float uTime;
    uniform float uOpacity;

    float hash(vec3 p) {
      p = fract(p * 0.3183099 + .1);
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    float noise(in vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)), f.x),
                     mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
                 mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
                     mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z);
    }
    float fbm(vec3 p) {
      float v = 0.0;
      float a = 0.5;
      vec3 shift = vec3(100.0);
      for (int i = 0; i < 4; ++i) {
        v += a * noise(p);
        p = p * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uvCenter = vUv - vec2(0.5);
      float dist = length(uvCenter) * 2.0;
      if (dist > 1.0) discard;
      float rim = smoothstep(1.0, 0.0, dist);
      vec3 noisePos = vWorldPosition * 0.012 + vec3(0.0, uTime * 0.015, uTime * 0.005);
      float n = fbm(noisePos);
      float density = smoothstep(0.32, 0.80, n) * rim;
      vec3 finalColor = mix(uColor * 0.18, uColor, density);
      gl_FragColor = vec4(finalColor, density * uOpacity);
    }
  `
};

function Nebula() {
  const clouds = useMemo(() => [
    { pos: [-38, 8, -170] as [number, number, number], scale: 130, color: new THREE.Color("#0c6095"), opacity: 0.038 },
    { pos: [45, -15, -200] as [number, number, number], scale: 160, color: new THREE.Color("#2a127a"), opacity: 0.032 },
  ], []);

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((state) => {
    uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <group>
      {clouds.map((c, i) => {
        const u = {
          uTime: uniforms.uTime,
          uColor: { value: c.color },
          uOpacity: { value: c.opacity }
        };
        return (
          <mesh key={i} position={c.pos}>
            <sphereGeometry args={[c.scale, 12, 12]} />
            <shaderMaterial
              vertexShader={NebulaShader.vertexShader}
              fragmentShader={NebulaShader.fragmentShader}
              uniforms={u}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── SHOOTING STARS ───────────────────────────────────────────────────────────

interface StarSlot {
  active: boolean;
  sx: number; sy: number; sz: number;
  dx: number; dy: number; dz: number;
  speed: number; elapsed: number; duration: number; trail: number;
}

const STAR_POOL = 3;

function ShootingStars() {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.Line[]>([]);
  const matsRef = useRef<THREE.LineBasicMaterial[]>([]);
  const slots = useRef<StarSlot[]>([]);
  const timer = useRef(0);
  const nextSpawn = useRef(5 + Math.random() * 8);

  useEffect(() => {
    const grp = groupRef.current;
    if (!grp) return;
    const ls: THREE.Line[] = [];
    const ms: THREE.LineBasicMaterial[] = [];

    for (let i = 0; i < STAR_POOL; i++) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
      const mat = new THREE.LineBasicMaterial({
        color: 0x22d3ee, // Cyan streak color
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const line = new THREE.Line(geo, mat);
      grp.add(line);
      ls.push(line);
      ms.push(mat);
    }

    linesRef.current = ls;
    matsRef.current = ms;
    slots.current = Array.from({ length: STAR_POOL }, () => ({
      active: false,
      sx: 0, sy: 0, sz: 0,
      dx: 0, dy: 0, dz: 0,
      speed: 0, elapsed: 0, duration: 0, trail: 0,
    }));

    return () => {
      ls.forEach((l, i) => {
        grp.remove(l);
        l.geometry.dispose();
        ms[i].dispose();
      });
    };
  }, []);

  const spawn = () => {
    const slot = slots.current.find((s) => !s.active);
    if (!slot) return;
    const angle = -Math.PI * 0.32 - Math.random() * Math.PI * 0.12;
    let dx = Math.cos(angle) * 0.95;
    let dy = Math.sin(angle) * 0.62;
    let dz = (Math.random() - 0.5) * 0.10;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    dx /= len; dy /= len; dz /= len;

    slot.active = true;
    slot.elapsed = 0;
    slot.speed = 45 + Math.random() * 40;
    slot.duration = 0.7 + Math.random() * 0.5;
    slot.trail = 10 + Math.random() * 12;
    slot.sx = (Math.random() - 0.3) * 120;
    slot.sy = 20 + Math.random() * 35;
    slot.sz = -15 - Math.random() * 55;
    slot.dx = dx; slot.dy = dy; slot.dz = dz;
  };

  useFrame((_, dt) => {
    timer.current += dt;
    if (timer.current >= nextSpawn.current) {
      timer.current = 0;
      nextSpawn.current = 6 + Math.random() * 10; // Sporadic spawns
      spawn();
    }

    slots.current.forEach((slot, i) => {
      if (!slot.active) return;
      slot.elapsed += dt;
      const p = slot.elapsed / slot.duration;

      if (p >= 1) {
        slot.active = false;
        matsRef.current[i].opacity = 0;
        return;
      }

      const env = p < 0.15 ? p / 0.15 : p > 0.75 ? (1 - p) / 0.25 : 1;
      const dist = slot.elapsed * slot.speed;

      const hx = slot.sx + slot.dx * dist;
      const hy = slot.sy + slot.dy * dist;
      const hz = slot.sz + slot.dz * dist;
      const tx = hx - slot.dx * slot.trail;
      const ty = hy - slot.dy * slot.trail;
      const tz = hz - slot.dz * slot.trail;

      const arr = linesRef.current[i].geometry.attributes.position.array as Float32Array;
      arr[0] = tx; arr[1] = ty; arr[2] = tz;
      arr[3] = hx; arr[4] = hy; arr[5] = hz;
      linesRef.current[i].geometry.attributes.position.needsUpdate = true;
      matsRef.current[i].opacity = 0.85 * env;
    });
  });

  return <group ref={groupRef} />;
}

// ─── FOREGROUND INDEPENDENT COSMIC DUST ─────────────────────────────────────

function CosmicDust() {
  const COUNT = 60;
  const dustTex = useMemo(() => makeStarTexture(), []);
  const pointsRef = useRef<THREE.Points>(null);

  const [geo, mat] = useMemo(() => {
    const rand = mkRand(55);
    const pos = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = (rand() - 0.5) * 80;
      pos[i3+1] = (rand() - 0.5) * 45;
      pos[i3+2] = -5 - rand() * 85;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    const m = new THREE.PointsMaterial({
      size: 0.50,
      map: dustTex,
      color: "#8ab2da",
      transparent: true,
      opacity: 0.22,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return [g, m];
  }, [dustTex]);

  useEffect(() => () => dustTex.dispose(), [dustTex]);

  useFrame((state, dt) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      arr[i3+2] += dt * 1.4;
      arr[i3] += Math.sin(state.clock.getElapsedTime() * 0.12 + i) * 0.003;
      if (arr[i3+2] > 5) {
        arr[i3+2] = -90;
      }
    }
    posAttr.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geo} material={mat} />;
}

// ─── LENS LIGHT BLEED ───────────────────────────────────────────────────────

function LightBleedFrame() {
  return (
    <mesh position={[0, 0, -5]} scale={[12, 8, 1]}>
      <planeGeometry />
      <meshBasicMaterial
        color="#040715"
        transparent
        opacity={0.04}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── SCENE ASSEMBLY ──────────────────────────────────────────────────────────

function Scene() {
  return (
    <>
      <color attach="background" args={["#010206"]} />
      <CameraRig />
      <StarField />
      <Constellations />
      <Nebula />
      <CosmicDust />
      <ShootingStars />
      <LightBleedFrame />
    </>
  );
}

export default function CosmicBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none select-none print:hidden"
      style={{ zIndex: 0 }}
    >
      <Canvas
        camera={{ position: [0, 0, 0], fov: 60, near: 0.1, far: 2000 }}
        gl={{
          alpha: false,
          antialias: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, MOBILE ? 1 : 1.5]}
        style={{ background: "#010206" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
