/**
 * CosmicBackground — Real-time 3D cosmic environment
 * Built with Three.js + React Three Fiber
 *
 * Scene layers (back → front):
 *  1. Starfield         — 3200 stars across a spherical volume
 *  2. Galaxy sprites    — 6 distant procedural galaxies
 *  3. Nebula clouds     — 5 large volumetric transparent spheres
 *  4. Ringed gas planet — procedural planet + dual ring system
 *  5. Small planet      — secondary body (desktop only)
 *  6. Asteroid belt     — 85 orbiting rocks (InstancedMesh)
 *  7. Cosmic dust       — 700 close-range particles
 *  8. Shooting stars    — pooled LINE objects, sporadic appearance
 *  9. CameraRig         — spring-physics look-at, idle drift, scroll travel
 */

import { useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const MOBILE =
  typeof window !== "undefined" && window.innerWidth < 768;

// ─── SEEDED RNG ──────────────────────────────────────────────────────────────
function mkRand(seed: number) {
  let s = seed | 0;
  return () => {
    s = (Math.imul(s, 747796405) + 2891336453) | 0;
    return ((s >>> 18) ^ s) / 0xffffffff + 0.5;
  };
}

// ─── TEXTURE FACTORIES ───────────────────────────────────────────────────────

/** Procedural galaxy texture: glowing disk + bright core */
function makeGalaxyTex(r: number, g: number, b: number): THREE.Texture {
  const sz = 256;
  const cv = document.createElement("canvas");
  cv.width = cv.height = sz;
  const ctx = cv.getContext("2d")!;
  const cx = sz / 2, cy = sz / 2;

  // Outer diffuse halo
  const outer = ctx.createRadialGradient(cx, cy, 0, cx, cy, sz * 0.5);
  outer.addColorStop(0,    `rgba(${r},${g},${b},1.0)`);
  outer.addColorStop(0.22, `rgba(${r},${g},${b},0.55)`);
  outer.addColorStop(0.52, `rgba(${r},${g},${b},0.16)`);
  outer.addColorStop(0.82, `rgba(${r},${g},${b},0.04)`);
  outer.addColorStop(1,    "rgba(0,0,0,0)");
  ctx.fillStyle = outer;
  ctx.fillRect(0, 0, sz, sz);

  // Flattened disk (galaxy tilt illusion)
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, 0.26);
  ctx.translate(-cx, -cy);
  const disk = ctx.createRadialGradient(cx, cy, 0, cx, cy, sz * 0.38);
  disk.addColorStop(0,   `rgba(${r},${g},${b},0.50)`);
  disk.addColorStop(0.5, `rgba(${r},${g},${b},0.12)`);
  disk.addColorStop(1,   "rgba(0,0,0,0)");
  ctx.fillStyle = disk;
  ctx.fillRect(0, 0, sz, sz);
  ctx.restore();

  // Brilliant core
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, sz * 0.09);
  core.addColorStop(0,   "rgba(255,255,255,1.0)");
  core.addColorStop(0.5, `rgba(${r},${g},${b},0.75)`);
  core.addColorStop(1,   "rgba(0,0,0,0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, sz, sz);

  return new THREE.CanvasTexture(cv);
}

/** Procedural ring texture: multiple band lanes */
function makeRingTex(): THREE.Texture {
  const sz = 512;
  const cv = document.createElement("canvas");
  cv.width = sz;
  cv.height = 1;
  const ctx = cv.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, sz, 0);
  const stops: [number, string][] = [
    [0.00, "rgba(0,0,0,0)"],
    [0.06, "rgba(160,140,110,0.28)"],
    [0.13, "rgba(205,182,142,0.72)"],
    [0.21, "rgba(178,158,118,0.38)"],
    [0.29, "rgba(228,208,168,0.88)"],
    [0.38, "rgba(195,172,132,0.36)"],
    [0.46, "rgba(248,228,188,0.92)"],
    [0.55, "rgba(212,192,150,0.56)"],
    [0.63, "rgba(190,170,130,0.82)"],
    [0.73, "rgba(168,148,108,0.28)"],
    [0.83, "rgba(205,185,142,0.56)"],
    [0.93, "rgba(162,142,105,0.14)"],
    [1.00, "rgba(0,0,0,0)"],
  ];
  stops.forEach(([t, c]) => g.addColorStop(t, c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, sz, 1);
  return new THREE.CanvasTexture(cv);
}

// ─── CAMERA RIG ──────────────────────────────────────────────────────────────
/**
 * Spring-physics camera that looks at a world-space point.
 * Mouse moves the look-target. Scroll pushes the camera forward.
 * Idle sinusoidal drift keeps the scene alive without interaction.
 */
function CameraRig() {
  const mouse   = useRef({ x: 0, y: 0 });
  const lookPos = useRef(new THREE.Vector3(0, 0, -100));
  const lookVel = useRef(new THREE.Vector3());
  const scrollY = useRef(0);
  const camZ    = useRef(0);
  const camZVel = useRef(0);
  const elapsed = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => { scrollY.current = window.scrollY; };
    window.addEventListener("mousemove", onMove,   { passive: true });
    window.addEventListener("scroll",    onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll",    onScroll);
    };
  }, []);

  useFrame((state, dt) => {
    elapsed.current += dt;
    const t = elapsed.current;

    // Idle atmospheric drift — scene always alive
    const idleX = Math.sin(t * 0.080) * 4.5 + Math.sin(t * 0.135) * 2.2;
    const idleY = Math.cos(t * 0.062) * 2.8 + Math.cos(t * 0.105) * 1.2;

    // Target look-at in world space
    const tx = mouse.current.x * 30 + idleX;
    const ty = mouse.current.y * -22 + idleY;

    // Spring physics on look position (overshoot → weighty, floating feel)
    lookVel.current.x += (tx - lookPos.current.x) * 0.020;
    lookVel.current.y += (ty - lookPos.current.y) * 0.020;
    lookVel.current.multiplyScalar(0.80);
    lookPos.current.add(lookVel.current);

    // Scroll → forward travel through the scene
    const targetZ = -scrollY.current * 0.06;
    camZVel.current += (targetZ - camZ.current) * 0.018;
    camZVel.current *= 0.88;
    camZ.current    += camZVel.current;

    state.camera.position.set(0, 0, camZ.current);
    state.camera.lookAt(
      lookPos.current.x,
      lookPos.current.y,
      -100 + camZ.current,
    );
  });

  return null;
}

// ─── STAR FIELD ──────────────────────────────────────────────────────────────
/**
 * 3200 stars distributed across a spherical volume at three depth tiers.
 * Near stars are brighter and larger (perspective attenuation makes them
 * feel genuinely closer). Color variation matches real stellar temperature
 * distribution: blue-white, neutral white, and warm yellow-orange.
 */
function StarField() {
  const COUNT = MOBILE ? 1500 : 3200;
  const ptsRef = useRef<THREE.Points>(null);

  const geo = useMemo(() => {
    const rand = mkRand(42);
    const pos  = new Float32Array(COUNT * 3);
    const col  = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const i3  = i * 3;
      const pop = rand();
      const th  = rand() * Math.PI * 2;
      const ph  = Math.acos(2 * rand() - 1);

      // Three depth tiers: far (background), mid, near
      const r = pop < 0.60 ? 380 + rand() * 2500   // far
              : pop < 0.88 ? 95  + rand() * 320     // mid
              :               28 + rand() * 95;     // near (brightest, largest)

      pos[i3]     = Math.sin(ph) * Math.cos(th) * r;
      pos[i3 + 1] = Math.sin(ph) * Math.sin(th) * r * 0.60; // slightly flattened equator
      pos[i3 + 2] = Math.cos(ph) * r;

      // Stellar color temperature
      const ct = rand();
      if (ct < 0.58) {
        // Blue-white (O/B type)
        col[i3] = 0.82 + rand() * 0.18;
        col[i3+1] = 0.88 + rand() * 0.12;
        col[i3+2] = 1.0;
      } else if (ct < 0.80) {
        // Neutral white (A/F type)
        col[i3] = 0.94 + rand() * 0.06;
        col[i3+1] = 0.94 + rand() * 0.06;
        col[i3+2] = 0.96 + rand() * 0.04;
      } else {
        // Warm yellow-orange (K/M type)
        col[i3] = 1.0;
        col[i3+1] = 0.82 + rand() * 0.18;
        col[i3+2] = 0.55 + rand() * 0.45;
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color",    new THREE.BufferAttribute(col, 3));
    return g;
  }, []);

  const mat = useMemo(() => new THREE.PointsMaterial({
    vertexColors: true,
    size: 1.9,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  useFrame((_, dt) => {
    if (!ptsRef.current) return;
    // Very slow autonomous rotation — star field always drifting
    ptsRef.current.rotation.y += dt * 0.0014;
    ptsRef.current.rotation.x += dt * 0.0006;
  });

  return <points ref={ptsRef} geometry={geo} material={mat} />;
}

// ─── DISTANT GALAXIES ────────────────────────────────────────────────────────
interface GDef {
  pos:   [number, number, number];
  scale: number;
  r: number; g: number; b: number;
  rot:   number; // initial tilt + rotation sign
}

const GALAXY_DEFS: GDef[] = [
  { pos: [-182,  62, -1220], scale: 282, r: 200, g: 178, b: 138, rot:  0.30 },
  { pos: [ 225, -42,  -840], scale: 215, r: 148, g: 178, b: 255, rot: -0.22 },
  { pos: [ -82,-122, -1520], scale: 350, r: 255, g: 175, b: 195, rot:  0.52 },
  { pos: [ 305,  98,  -640], scale: 178, r: 175, g: 145, b: 255, rot: -0.38 },
  { pos: [-252,  30,  -945], scale: 240, r: 218, g: 195, b: 155, rot:  0.12 },
  { pos: [ 112, -80, -1870], scale: 420, r: 155, g: 215, b: 255, rot:  0.82 },
];

/**
 * Galaxy billboard sprite. Always faces the camera (THREE.Sprite).
 * Procedural canvas texture with halo + disk + core.
 * Rotates its texture slowly to suggest galactic spin.
 */
function GalaxySprite({ pos, scale, r, g, b, rot }: GDef) {
  const tex    = useMemo(() => makeGalaxyTex(r, g, b), [r, g, b]);
  const matRef = useRef<THREE.SpriteMaterial>(null);

  useFrame((_, dt) => {
    if (matRef.current) matRef.current.rotation += dt * Math.sign(rot) * 0.005;
  });

  useEffect(() => () => { tex.dispose(); }, [tex]);

  return (
    <sprite position={pos} scale={[scale, scale, 1]}>
      <spriteMaterial
        ref={matRef}
        map={tex}
        transparent
        opacity={0.62}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        rotation={rot}
      />
    </sprite>
  );
}

// ─── NEBULA CLOUDS ────────────────────────────────────────────────────────────
interface NDef {
  position: [number, number, number];
  radius:   number;
  color:    string;
  opacity:  number;
  drift:    [number, number, number]; // drift frequencies
  phase:    number;
}

const NEBULA_DEFS: NDef[] = [
  { position: [-32,  10, -168], radius:  85, color: "#0a80c0", opacity: 0.040, drift: [0.012, 0.009, 0.007], phase: 0.0 },
  { position: [ 54, -18, -208], radius: 118, color: "#3818c8", opacity: 0.032, drift: [0.009, 0.011, 0.006], phase: 1.8 },
  { position: [-20, -24, -140], radius:  68, color: "#0ca8c4", opacity: 0.048, drift: [0.015, 0.008, 0.010], phase: 3.2 },
  { position: [ 30,  34, -262], radius: 148, color: "#5825d2", opacity: 0.024, drift: [0.007, 0.010, 0.005], phase: 5.0 },
  { position: [-65, -14, -188], radius:  95, color: "#1855c5", opacity: 0.034, drift: [0.011, 0.007, 0.009], phase: 2.4 },
];

/**
 * Large transparent sphere that drifts slowly.
 * With AdditiveBlending + low opacity, overlapping nebulae
 * create a convincing volumetric glow effect.
 */
function NebulaCloud({ position, radius, color, opacity, drift, phase }: NDef) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.x = position[0] + Math.sin(t * drift[0] + phase) * 9;
    ref.current.position.y = position[1] + Math.cos(t * drift[1] + phase) * 5.5;
    ref.current.position.z = position[2] + Math.sin(t * drift[2] + phase) * 4.0;
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[radius, 10, 10]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ─── RINGED GAS PLANET ────────────────────────────────────────────────────────
/**
 * The dominant foreground object. A blue-purple gas giant with:
 *  - Outer atmosphere glow (two nested transparent spheres)
 *  - Solid planet body (MeshStandardMaterial)
 *  - Atmospheric band overlay
 *  - Inner + outer ring system (RingGeometry + procedural texture)
 * The whole group rotates slowly. The atmosphere glow pulses subtly.
 */
function RingedPlanet() {
  const ringTex  = useMemo(() => makeRingTex(), []);
  const groupRef = useRef<THREE.Group>(null);
  const atmRef   = useRef<THREE.Mesh>(null);

  useEffect(() => () => { ringTex.dispose(); }, [ringTex]);

  useFrame((state, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.014;
    if (atmRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 0.95) * 0.008;
      atmRef.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={groupRef} position={[20, -5, -48]} rotation={[0.28, 0.5, 0.14]}>
      {/* Outer atmosphere halo — largest, most transparent */}
      <mesh ref={atmRef}>
        <sphereGeometry args={[9.8, 24, 24]} />
        <meshBasicMaterial color="#3062b2" transparent opacity={0.09} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Inner atmosphere shell */}
      <mesh>
        <sphereGeometry args={[8.4, 24, 24]} />
        <meshBasicMaterial color="#2252a2" transparent opacity={0.07} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Planet body */}
      <mesh>
        <sphereGeometry args={[7.5, 64, 64]} />
        <meshStandardMaterial color="#12305e" emissive="#060e26" roughness={0.72} metalness={0.08} />
      </mesh>

      {/* Atmospheric band overlay */}
      <mesh>
        <sphereGeometry args={[7.54, 32, 18]} />
        <meshBasicMaterial color="#2254aa" transparent opacity={0.20} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Inner ring system — dense, detailed */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[10.8, 22.5, 128]} />
        <meshBasicMaterial
          map={ringTex}
          transparent
          opacity={0.84}
          side={THREE.DoubleSide}
          depthWrite={false}
          color="#c8b082"
        />
      </mesh>

      {/* Outer ring system — faint, wide */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[23.5, 30, 80]} />
        <meshBasicMaterial
          map={ringTex}
          transparent
          opacity={0.26}
          side={THREE.DoubleSide}
          depthWrite={false}
          color="#a89065"
        />
      </mesh>
    </group>
  );
}

// ─── SMALL PLANET ─────────────────────────────────────────────────────────────
/** Secondary body — gives the scene compositional depth (desktop only). */
function SmallPlanet() {
  const bodyRef = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (bodyRef.current) bodyRef.current.rotation.y += dt * 0.022;
  });

  return (
    <group position={[-40, 15, -128]}>
      {/* Atmosphere */}
      <mesh>
        <sphereGeometry args={[3.6, 20, 20]} />
        <meshBasicMaterial color="#8028c2" transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Body */}
      <mesh ref={bodyRef}>
        <sphereGeometry args={[3.0, 36, 36]} />
        <meshStandardMaterial color="#38185e" emissive="#140825" roughness={0.70} metalness={0.06} />
      </mesh>
    </group>
  );
}

// ─── ASTEROID BELT ────────────────────────────────────────────────────────────
/**
 * 85 asteroids orbiting the gas planet using InstancedMesh.
 * Each has a unique orbital radius, speed, Y offset, and rotation axes.
 * Updated per-frame with setMatrixAt — efficient GPU instancing.
 */
function AsteroidBelt() {
  const COUNT   = MOBILE ? 45 : 85;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy   = useMemo(() => new THREE.Object3D(), []);

  const data = useMemo(() => {
    const rand = mkRand(99);
    return Array.from({ length: COUNT }, (_, i) => ({
      baseAngle: (i / COUNT) * Math.PI * 2 + (rand() - 0.5) * 0.55,
      radius:    26 + rand() * 16,
      speed:     0.007 + rand() * 0.015,
      y:         (rand() - 0.5) * 3.5 - 5,
      rx:        rand() * Math.PI,
      ry:        rand() * Math.PI,
      rz:        rand() * Math.PI,
      rxS:       (rand() - 0.5) * 0.38,
      ryS:       (rand() - 0.5) * 0.28,
      scale:     0.07 + rand() * 0.30,
    }));
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    data.forEach((d, i) => {
      const angle = d.baseAngle + t * d.speed;
      // Orbit centred on the planet at (20, y, -48)
      dummy.position.set(
        Math.cos(angle) * d.radius + 20,
        d.y,
        Math.sin(angle) * d.radius - 48,
      );
      dummy.rotation.set(
        d.rx + t * d.rxS,
        d.ry + t * d.ryS,
        d.rz,
      );
      dummy.scale.setScalar(d.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#524858" roughness={0.96} metalness={0.10} />
    </instancedMesh>
  );
}

// ─── COSMIC DUST ──────────────────────────────────────────────────────────────
/** Dense near-field dust cloud that rotates slowly — gives foreground depth. */
function CosmicDust() {
  const COUNT   = MOBILE ? 350 : 700;
  const dustRef = useRef<THREE.Points>(null);

  const geo = useMemo(() => {
    const rand = mkRand(55);
    const pos  = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      pos[i3]     = (rand() - 0.5) * 95;
      pos[i3 + 1] = (rand() - 0.5) * 48;
      pos[i3 + 2] = -15 - rand() * 90;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  const mat = useMemo(() => new THREE.PointsMaterial({
    size: 0.30,
    color: "#8ab2da",
    transparent: true,
    opacity: 0.30,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  useFrame((state) => {
    if (!dustRef.current) return;
    const t = state.clock.elapsedTime;
    dustRef.current.rotation.y = t * 0.0028;
    dustRef.current.rotation.x = t * 0.0012;
  });

  return <points ref={dustRef} geometry={geo} material={mat} />;
}

// ─── SHOOTING STARS ───────────────────────────────────────────────────────────
/**
 * Object pool of 5 THREE.Line instances.
 * Stars spawn every 4–15 seconds, streak diagonally, and fade out.
 * No React state updates in the render loop — purely ref-based.
 */
interface ShotSlot {
  active:   boolean;
  sx: number; sy: number; sz: number; // start position
  dx: number; dy: number; dz: number; // normalised direction
  speed:    number;
  elapsed:  number;
  duration: number;
  trail:    number; // trail length
}

const STAR_POOL = 5;

function ShootingStars() {
  const groupRef  = useRef<THREE.Group>(null);
  const linesRef  = useRef<THREE.Line[]>([]);
  const matsRef   = useRef<THREE.LineBasicMaterial[]>([]);
  const slots     = useRef<ShotSlot[]>([]);
  const timer     = useRef(0);
  const nextSpawn = useRef(5 + Math.random() * 8);

  useEffect(() => {
    const grp = groupRef.current;
    if (!grp) return;
    const ls: THREE.Line[] = [];
    const ms: THREE.LineBasicMaterial[] = [];

    for (let i = 0; i < STAR_POOL; i++) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(6), 3),
      );
      const mat = new THREE.LineBasicMaterial({
        color: 0xe8f4ff,
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
    matsRef.current  = ms;
    slots.current    = Array.from({ length: STAR_POOL }, () => ({
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
    const angle = -Math.PI * 0.28 - Math.random() * Math.PI * 0.22;
    let dx = Math.cos(angle) * 0.95;
    let dy = Math.sin(angle) * 0.62;
    let dz = (Math.random() - 0.5) * 0.18;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    dx /= len; dy /= len; dz /= len;

    slot.active   = true;
    slot.elapsed  = 0;
    slot.speed    = 38 + Math.random() * 55;
    slot.duration = 0.9 + Math.random() * 0.75;
    slot.trail    = 6  + Math.random() * 16;
    slot.sx = (Math.random() - 0.3) * 165;
    slot.sy = 20 + Math.random() * 55;
    slot.sz = -8 - Math.random() * 58;
    slot.dx = dx; slot.dy = dy; slot.dz = dz;
  };

  useFrame((_, dt) => {
    timer.current += dt;
    if (timer.current >= nextSpawn.current) {
      timer.current = 0;
      nextSpawn.current = 4 + Math.random() * 12;
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

      // Fade in at start, bright during travel, fade out at end
      const env = p < 0.12 ? p / 0.12 : p > 0.72 ? (1 - p) / 0.28 : 1;
      const dist = slot.elapsed * slot.speed;

      const hx = slot.sx + slot.dx * dist;
      const hy = slot.sy + slot.dy * dist;
      const hz = slot.sz + slot.dz * dist;
      const tx = hx - slot.dx * slot.trail;
      const ty = hy - slot.dy * slot.trail;
      const tz = hz - slot.dz * slot.trail;

      const arr = linesRef.current[i].geometry.attributes.position
        .array as Float32Array;
      arr[0] = tx; arr[1] = ty; arr[2] = tz;
      arr[3] = hx; arr[4] = hy; arr[5] = hz;
      linesRef.current[i].geometry.attributes.position.needsUpdate = true;
      matsRef.current[i].opacity = 0.90 * env;
    });
  });

  return <group ref={groupRef} />;
}

// ─── SCENE ───────────────────────────────────────────────────────────────────
function Scene() {
  return (
    <>
      {/* Background colour — replaced canvas default */}
      <color attach="background" args={["#010108"]} />

      {/* Lighting — very faint. Planets/asteroids are dark by design. */}
      <ambientLight intensity={0.05} color="#1040a2" />
      <pointLight
        position={[20, -5, -48]}
        intensity={1.8}
        color="#2268ff"
        distance={110}
        decay={2}
      />

      <CameraRig />
      <StarField />

      {GALAXY_DEFS.map((g, i) => (
        <GalaxySprite key={i} {...g} />
      ))}

      {NEBULA_DEFS.map((n, i) => (
        <NebulaCloud key={i} {...n} />
      ))}

      <RingedPlanet />
      {!MOBILE && <SmallPlanet />}

      <AsteroidBelt />
      <CosmicDust />
      <ShootingStars />
    </>
  );
}

// ─── ROOT EXPORT ─────────────────────────────────────────────────────────────
export default function CosmicBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none select-none print:hidden"
      style={{ zIndex: -40 }}
    >
      <Canvas
        camera={{ position: [0, 0, 0], fov: 62, near: 0.1, far: 4200 }}
        gl={{
          alpha: false,
          antialias: false,
          powerPreference: "high-performance",
        }}
        dpr={[1, MOBILE ? 1 : 1.5]}
        style={{ background: "#010108" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
