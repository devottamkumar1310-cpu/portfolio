/**
 * CosmicBackground — High-Realism WebGL Space Environment
 * Built with Three.js + React Three Fiber
 * Optimized for cinematic atmosphere, physical rendering, and low GPU usage.
 * 
 * Features:
 *  1. Physical Stars: High-resolution soft-radial point texture to remove square stars.
 *  2. Volumetric Clouds: Custom fragment shader for noise-based gas densities.
 *  3. Atmospheric Scattering: Soft volumetric envelope around gas giant.
 *  4. Advanced Cam Rig: Spring physics, mouse inertia, and persistent noise-based drift.
 */

import { useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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

// ─── PROCEDURAL TEXTURES FOR REALISM ────────────────────────────────────────

/** Soft Point Star Texture (removes square artifacts) */
function makeStarTexture(): THREE.Texture {
  const sz = 64;
  const cv = document.createElement("canvas");
  cv.width = cv.height = sz;
  const ctx = cv.getContext("2d")!;
  const cx = sz / 2, cy = sz / 2;

  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, sz / 2);
  g.addColorStop(0, "rgba(255, 255, 255, 1.0)");
  g.addColorStop(0.15, "rgba(255, 255, 255, 0.9)");
  g.addColorStop(0.4, "rgba(220, 240, 255, 0.25)");
  g.addColorStop(1.0, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, sz, sz);
  return new THREE.CanvasTexture(cv);
}

/** Gas giant ring texture with delicate, high-frequency divisions */
function makeRingTexture(): THREE.Texture {
  const sz = 1024;
  const cv = document.createElement("canvas");
  cv.width = sz;
  cv.height = 1;
  const ctx = cv.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, sz, 0);

  // Physically plausible planetary rings (A, B, C rings with Cassini division)
  g.addColorStop(0.0, "rgba(0,0,0,0)");
  g.addColorStop(0.05, "rgba(100,85,70,0.15)"); // C Ring (faint inner)
  g.addColorStop(0.18, "rgba(140,120,100,0.30)");
  g.addColorStop(0.20, "rgba(0,0,0,0)");        // Inner division
  g.addColorStop(0.25, "rgba(215,195,165,0.75)"); // B Ring (bright, dense)
  g.addColorStop(0.55, "rgba(185,165,135,0.85)");
  g.addColorStop(0.58, "rgba(200,180,150,0.50)");
  g.addColorStop(0.60, "rgba(0,0,0,0.95)");      // Cassini Division
  g.addColorStop(0.64, "rgba(0,0,0,0)");
  g.addColorStop(0.66, "rgba(155,135,110,0.55)"); // A Ring (outer ring)
  g.addColorStop(0.85, "rgba(135,115,90,0.40)");
  g.addColorStop(0.88, "rgba(90,75,60,0.10)");    // Encke Gap
  g.addColorStop(0.90, "rgba(110,95,75,0.22)");
  g.addColorStop(1.0, "rgba(0,0,0,0)");

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, sz, 1);
  return new THREE.CanvasTexture(cv);
}

// ─── SHADERS FOR VOLUMETRIC GAS CLOUDS ──────────────────────────────────────

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

    // Simple 3D noise helper
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
      // Soft falloff from center (spherical shell thickness)
      vec2 uvCenter = vUv - vec2(0.5);
      float dist = length(uvCenter) * 2.0;
      if (dist > 1.0) discard;

      float rim = smoothstep(1.0, 0.0, dist);

      // Evaluate noise density inside the sphere volume
      vec3 noisePos = vWorldPosition * 0.025 + vec3(0.0, uTime * 0.04, uTime * 0.02);
      float n = fbm(noisePos);

      // Volumetric light absorption / scatter approximation
      float density = smoothstep(0.3, 0.8, n) * rim;
      vec3 finalColor = mix(uColor * 0.3, uColor, density);
      
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

    // Dynamic, organic multi-frequency camera float (inertial drift)
    const driftX = Math.sin(t * 0.05) * 3.5 + Math.cos(t * 0.12) * 1.5;
    const driftY = Math.cos(t * 0.04) * 2.5 + Math.sin(t * 0.09) * 1.0;
    
    // Smooth scroll displacement
    const targetZ = -scrollY.current * 0.05;
    camVel.current.z += (targetZ - camPos.current.z) * 0.025;
    camVel.current.z *= 0.85;
    camPos.current.z += camVel.current.z;

    // Look target updates with heavy inertia
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

// ─── PHYSICALLY-INSPIRED STAR FIELD ──────────────────────────────────────────

function StarField() {
  const COUNT = 1200; // Reduced by 60% for realism and performance
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
      const r = 250 + rand() * 1500; // Far space shell

      pos[i3] = Math.sin(ph) * Math.cos(th) * r;
      pos[i3 + 1] = Math.sin(ph) * Math.sin(th) * r * 0.7;
      pos[i3 + 2] = Math.cos(ph) * r;

      // Real star classifications (O/B blue, G/F white, K/M orange/red)
      const roll = rand();
      if (roll < 0.35) {
        // Blue giant stars
        col[i3] = 0.75; col[i3+1] = 0.85; col[i3+2] = 1.0;
      } else if (roll < 0.75) {
        // Class G/F main sequence (white/yellow-white)
        col[i3] = 0.98; col[i3+1] = 0.96; col[i3+2] = 0.92;
      } else {
        // M-type Red Dwarf/Orange stars
        col[i3] = 1.0; col[i3+1] = 0.70; col[i3+2] = 0.50;
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
    if (pointsRef.current) {
      pointsRef.current.rotation.y += dt * 0.0008;
    }
  });

  return <points ref={pointsRef} geometry={geo} material={mat} />;
}

// ─── VOLUMETRIC NEBULA CLOUDS ───────────────────────────────────────────────

function Nebula() {
  const COUNT = 3; // Kept low for high fidelity rendering
  const clouds = useMemo(() => [
    { pos: [-35, 10, -180] as [number, number, number], scale: 120, color: new THREE.Color("#0c6095"), opacity: 0.12 },
    { pos: [45, -20, -220] as [number, number, number], scale: 150, color: new THREE.Color("#2a127a"), opacity: 0.10 },
    { pos: [-10, -35, -150] as [number, number, number], scale: 95, color: new THREE.Color("#0885a0"), opacity: 0.14 }
  ], []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

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

// ─── PLANETARY ATMOSPHERIC SCATTERING ────────────────────────────────────────

function RingedPlanet() {
  const ringTex = useMemo(() => makeRingTexture(), []);
  const groupRef = useRef<THREE.Group>(null);
  
  useEffect(() => () => ringTex.dispose(), [ringTex]);

  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.010;
    }
  });

  return (
    <group ref={groupRef} position={[22, -6, -55]} rotation={[0.26, 0.45, 0.12]}>
      {/* Volumetric Rayleigh Scattering Atmospheric Envelope */}
      <mesh>
        <sphereGeometry args={[8.8, 32, 32]} />
        <meshBasicMaterial
          color="#3c7cf2"
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Primary Gas Giant Planet Body */}
      <mesh>
        <sphereGeometry args={[7.8, 64, 64]} />
        <meshStandardMaterial
          color="#0d244f"
          emissive="#040b1a"
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>

      {/* Atmospheric horizontal cloud band layers */}
      <mesh>
        <sphereGeometry args={[7.84, 32, 16]} />
        <meshBasicMaterial
          color="#2a6cd9"
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer Rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[10.5, 24.0, 128]} />
        <meshBasicMaterial
          map={ringTex}
          transparent
          opacity={0.88}
          side={THREE.DoubleSide}
          depthWrite={false}
          color="#ebd4b0"
        />
      </mesh>
    </group>
  );
}

// ─── INDEPENDENT FOREGROUND COSMIC DUST ─────────────────────────────────────

function CosmicDust() {
  const COUNT = 180;
  const dustTex = useMemo(() => makeStarTexture(), []);
  const pointsRef = useRef<THREE.Points>(null);

  const [geo, mat] = useMemo(() => {
    const rand = mkRand(112);
    const pos = new Float32Array(COUNT * 3);
    const speed = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = (rand() - 0.5) * 80;
      pos[i3+1] = (rand() - 0.5) * 45;
      pos[i3+2] = -10 - rand() * 80; // High-depth foreground placement
      speed[i] = 0.05 + rand() * 0.15;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    const m = new THREE.PointsMaterial({
      size: 0.65,
      map: dustTex,
      color: "#8ab2da",
      transparent: true,
      opacity: 0.38,
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
      // Drift dust slowly forward (toward camera)
      arr[i3+2] += dt * 1.8;
      // Drift slightly horizontally
      arr[i3] += Math.sin(state.clock.getElapsedTime() * 0.2 + i) * 0.005;

      // Recycle particles behind the camera
      if (arr[i3+2] > 5) {
        arr[i3+2] = -90;
      }
    }
    posAttr.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geo} material={mat} />;
}

// ─── BLOOM & LIGHT BLEED FRAME ──────────────────────────────────────────────

/**
 * Creates subtle edge screen overlay for ambient lens light-bleed & bloom effect
 * fixed relative to camera focal planes.
 */
function LightBleedFrame() {
  const { size } = useThree();
  return (
    <mesh position={[0, 0, -5]} scale={[size.width / 100, size.height / 100, 1]}>
      <planeGeometry />
      <meshBasicMaterial
        color="#08183a"
        transparent
        opacity={0.065}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── ROOT SCENE ASSEMBLY ─────────────────────────────────────────────────────

function Scene() {
  return (
    <>
      <color attach="background" args={["#010106"]} />

      <ambientLight intensity={0.03} color="#0c255e" />
      <pointLight
        position={[22, -6, -55]}
        intensity={2.8}
        color="#2268ff"
        distance={90}
        decay={2}
      />

      <CameraRig />
      <StarField />
      <Nebula />
      <RingedPlanet />
      <CosmicDust />
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
        style={{ background: "#010106" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
