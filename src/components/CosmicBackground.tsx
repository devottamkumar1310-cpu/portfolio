/**
 * CosmicBackground — 3D Real-time Constellation & Nebula Space Environment
 * Built with Three.js + React Three Fiber
 * 
 * Scene features:
 *  1. Physical Stars: Soft radial textured points, varying size/depth.
 *  2. Volumetric Shaded Nebulae: Electric Cyan, Deep Violet, and Accent Magenta gas clouds.
 *  3. Dynamic Constellations: Thin glowing line segments connecting key constellation nodes.
 *  4. Sporadic Shooting Stars: Pooled line objects with smooth fade envelopes.
 *  5. Inertial Camera: Multi-frequency noise drift, spring inertia, and scroll depth travel.
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

// ─── PROCEDURAL TEXTURES ────────────────────────────────────────────────────

function makeStarTexture(): THREE.Texture {
  const sz = 64;
  const cv = document.createElement("canvas");
  cv.width = cv.height = sz;
  const ctx = cv.getContext("2d")!;
  const cx = sz / 2, cy = sz / 2;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, sz / 2);
  g.addColorStop(0, "rgba(255, 255, 255, 1.0)");
  g.addColorStop(0.18, "rgba(255, 255, 255, 0.85)");
  g.addColorStop(0.42, "rgba(200, 240, 255, 0.22)");
  g.addColorStop(1.0, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, sz, sz);
  return new THREE.CanvasTexture(cv);
}

// ─── NEBULA SHADER ──────────────────────────────────────────────────────────

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
      vec3 noisePos = vWorldPosition * 0.015 + vec3(0.0, uTime * 0.02, uTime * 0.008);
      float n = fbm(noisePos);
      float density = smoothstep(0.3, 0.78, n) * rim;
      vec3 finalColor = mix(uColor * 0.2, uColor, density);
      gl_FragColor = vec4(finalColor, density * uOpacity);
    }
  `
};

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

    // Multi-frequency camera drift
    const driftX = Math.sin(t * 0.04) * 4.0 + Math.cos(t * 0.09) * 1.8;
    const driftY = Math.cos(t * 0.035) * 3.0 + Math.sin(t * 0.075) * 1.2;
    
    // Scroll depth traversal
    const targetZ = -scrollY.current * 0.045;
    camVel.current.z += (targetZ - camPos.current.z) * 0.022;
    camVel.current.z *= 0.86;
    camPos.current.z += camVel.current.z;

    // Heavy inertia camera tracking
    const targetLookX = mouse.current.x * 25 + driftX;
    const targetLookY = mouse.current.y * -18 + driftY;
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
  const COUNT = MOBILE ? 600 : 1600;
  const starTex = useMemo(() => makeStarTexture(), []);
  const pointsRef = useRef<THREE.Points>(null);

  const [geo, mat] = useMemo(() => {
    const rand = mkRand(77);
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      const r = 250 + rand() * 1200;

      pos[i3] = Math.sin(ph) * Math.cos(th) * r;
      pos[i3 + 1] = Math.sin(ph) * Math.sin(th) * r * 0.7;
      pos[i3 + 2] = Math.cos(ph) * r;

      const roll = rand();
      if (roll < 0.40) {
        // Cyan-tinted stars
        col[i3] = 0.65; col[i3+1] = 0.95; col[i3+2] = 1.0;
      } else if (roll < 0.75) {
        // Pure White
        col[i3] = 0.98; col[i3+1] = 0.98; col[i3+2] = 0.98;
      } else {
        // Soft violet/magenta stars
        col[i3] = 0.95; col[i3+1] = 0.68; col[i3+2] = 1.0;
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));

    const m = new THREE.PointsMaterial({
      size: 4.5,
      map: starTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return [g, m];
  }, [starTex]);

  useEffect(() => () => starTex.dispose(), [starTex]);

  useFrame((_, dt) => {
    if (pointsRef.current) pointsRef.current.rotation.y += dt * 0.0006;
  });

  return <points ref={pointsRef} geometry={geo} material={mat} />;
}

// ─── CONSTELLATIONS ──────────────────────────────────────────────────────────

function Constellations() {
  const NODE_COUNT = MOBILE ? 22 : 48;
  const lineRef = useRef<THREE.LineSegments>(null);

  const [geo, mat] = useMemo(() => {
    const rand = mkRand(234);
    const nodes: THREE.Vector3[] = [];

    // Generate random star constellation nodes in a box-volume ahead of camera
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push(new THREE.Vector3(
        (rand() - 0.5) * 160,
        (rand() - 0.5) * 100,
        -50 - rand() * 250
      ));
    }

    const linePoints: THREE.Vector3[] = [];

    // Connect nodes within a maximum distance threshold to form elegant minimal webs
    const maxDist = 38;
    for (let i = 0; i < NODE_COUNT; i++) {
      let connections = 0;
      for (let j = i + 1; j < NODE_COUNT; j++) {
        if (connections >= 2) break; // Limit links per node for elegant sparse lines
        if (nodes[i].distanceTo(nodes[j]) < maxDist) {
          linePoints.push(nodes[i], nodes[j]);
          connections++;
        }
      }
    }

    const g = new THREE.BufferGeometry().setFromPoints(linePoints);
    const m = new THREE.LineBasicMaterial({
      color: "#22d3ee", // Cyan
      transparent: true,
      opacity: 0.075,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return [g, m];
  }, []);

  useFrame((state, dt) => {
    if (lineRef.current) {
      // Very slow constellation rotation
      lineRef.current.rotation.y += dt * 0.001;
      // Pulse brightness slightly over time
      const t = state.clock.getElapsedTime();
      (lineRef.current.material as THREE.LineBasicMaterial).opacity = 0.065 + Math.sin(t * 0.5) * 0.02;
    }
  });

  return <lineSegments ref={lineRef} geometry={geo} material={mat} />;
}

// ─── VOLUMETRIC GAS NEBULA CLOUDS ───────────────────────────────────────────

function Nebula() {
  const clouds = useMemo(() => [
    // Cyan Nebula Cloud
    { pos: [-45, 12, -180] as [number, number, number], scale: 140, color: new THREE.Color("#06b6d4"), opacity: 0.045 },
    // Deep Violet Nebula Cloud
    { pos: [52, -22, -220] as [number, number, number], scale: 175, color: new THREE.Color("#8b5cf6"), opacity: 0.038 },
    // Magenta Accent Nebula Cloud
    { pos: [-15, -38, -150] as [number, number, number], scale: 110, color: new THREE.Color("#ec4899"), opacity: 0.028 }
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
            <sphereGeometry args={[c.scale, 16, 16]} />
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
  const nextSpawn = useRef(6 + Math.random() * 12);

  useEffect(() => {
    const grp = groupRef.current;
    if (!grp) return;
    const ls: THREE.Line[] = [];
    const ms: THREE.LineBasicMaterial[] = [];

    for (let i = 0; i < STAR_POOL; i++) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
      const mat = new THREE.LineBasicMaterial({
        color: 0x22d3ee, // Cyan glow streak
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
    const angle = -Math.PI * 0.3 - Math.random() * Math.PI * 0.15;
    let dx = Math.cos(angle) * 0.95;
    let dy = Math.sin(angle) * 0.62;
    let dz = (Math.random() - 0.5) * 0.12;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    dx /= len; dy /= len; dz /= len;

    slot.active = true;
    slot.elapsed = 0;
    slot.speed = 40 + Math.random() * 45;
    slot.duration = 0.8 + Math.random() * 0.6;
    slot.trail = 8 + Math.random() * 12;
    slot.sx = (Math.random() - 0.3) * 140;
    slot.sy = 25 + Math.random() * 45;
    slot.sz = -15 - Math.random() * 60;
    slot.dx = dx; slot.dy = dy; slot.dz = dz;
  };

  useFrame((_, dt) => {
    timer.current += dt;
    if (timer.current >= nextSpawn.current) {
      timer.current = 0;
      nextSpawn.current = 8 + Math.random() * 15; // Slow spawn interval
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
  const COUNT = 80;
  const dustTex = useMemo(() => makeStarTexture(), []);
  const pointsRef = useRef<THREE.Points>(null);

  const [geo, mat] = useMemo(() => {
    const rand = mkRand(112);
    const pos = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = (rand() - 0.5) * 85;
      pos[i3+1] = (rand() - 0.5) * 50;
      pos[i3+2] = -5 - rand() * 95;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    const m = new THREE.PointsMaterial({
      size: 0.60,
      map: dustTex,
      color: "#8ab2da",
      transparent: true,
      opacity: 0.28,
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
      arr[i3+2] += dt * 1.6; // Moves independently forward
      arr[i3] += Math.sin(state.clock.getElapsedTime() * 0.18 + i) * 0.0035;
      if (arr[i3+2] > 5) {
        arr[i3+2] = -95;
      }
    }
    posAttr.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geo} material={mat} />;
}

// ─── LIGHT BLEED ────────────────────────────────────────────────────────────

function LightBleedFrame() {
  return (
    <mesh position={[0, 0, -5]} scale={[12, 8, 1]}>
      <planeGeometry />
      <meshBasicMaterial
        color="#050a1b"
        transparent
        opacity={0.05}
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
      <color attach="background" args={["#020308"]} />
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
      style={{ zIndex: -40 }}
    >
      <Canvas
        camera={{ position: [0, 0, 0], fov: 60, near: 0.1, far: 2000 }}
        gl={{
          alpha: false,
          antialias: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, MOBILE ? 1 : 1.5]}
        style={{ background: "#020308" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
