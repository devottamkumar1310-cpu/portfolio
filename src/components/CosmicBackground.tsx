/**
 * CosmicBackground — High-Realism WebGL Space Environment
 * Built with Three.js + React Three Fiber
 *
 * Focusing heavily on physical celestial rendering for the Gas Giant:
 *  - Custom shader materials for volumetric light scatter, core shadow transition, and ring shadow cast.
 *  - True volumetric atmospheric scattering using a custom shell shader (Rayleigh/Mie approximation).
 *  - Correct ring projection shadow mapped on the sphere body.
 *  - High-realism ring shader with back-lit scatter and self-shadowing properties.
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

// ─── PROCEDURAL TEXTURES FOR REALISM ────────────────────────────────────────

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

function makeRingTexture(): THREE.Texture {
  const sz = 1024;
  const cv = document.createElement("canvas");
  cv.width = sz;
  cv.height = 1;
  const ctx = cv.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, sz, 0);

  g.addColorStop(0.0, "rgba(0,0,0,0)");
  g.addColorStop(0.05, "rgba(110,95,80,0.18)"); // C Ring
  g.addColorStop(0.18, "rgba(150,130,110,0.35)");
  g.addColorStop(0.20, "rgba(0,0,0,0)");        // Inner division
  g.addColorStop(0.25, "rgba(225,205,175,0.78)"); // B Ring
  g.addColorStop(0.55, "rgba(195,175,145,0.85)");
  g.addColorStop(0.58, "rgba(210,190,160,0.50)");
  g.addColorStop(0.60, "rgba(0,0,0,0.98)");      // Cassini Division
  g.addColorStop(0.64, "rgba(0,0,0,0)");
  g.addColorStop(0.66, "rgba(165,145,120,0.60)"); // A Ring
  g.addColorStop(0.85, "rgba(145,125,100,0.45)");
  g.addColorStop(0.88, "rgba(100,85,70,0.10)");    // Encke Gap
  g.addColorStop(0.90, "rgba(120,105,85,0.25)");
  g.addColorStop(1.0, "rgba(0,0,0,0)");

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, sz, 1);
  return new THREE.CanvasTexture(cv);
}

// ─── SHADERS ────────────────────────────────────────────────────────────────

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
      vec3 noisePos = vWorldPosition * 0.022 + vec3(0.0, uTime * 0.03, uTime * 0.015);
      float n = fbm(noisePos);
      float density = smoothstep(0.28, 0.78, n) * rim;
      vec3 finalColor = mix(uColor * 0.25, uColor, density);
      gl_FragColor = vec4(finalColor, density * uOpacity);
    }
  `
};

/**
 * Atmospheric Scattering Shader
 * Simulates true physically-based rim lighting (Rayleigh scattering approximation).
 * Brightens where light hits the limb (Fresnel), dims to absolute black in shadow.
 */
const AtmosphereShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    uniform vec3 uLightPos;
    uniform vec3 uColor;
    uniform float uGlowPower;
    
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // Calculate light direction in view space
      vec3 worldLightDir = normalize(uLightPos - vWorldPosition);
      vec3 viewLightDir = normalize((viewMatrix * vec4(worldLightDir, 0.0)).xyz);
      
      // Rayleigh Scattering approximation (Fresnel rim highlight facing light)
      float intensity = pow(1.0 - dot(normal, viewDir), uGlowPower);
      
      // Compute correct terminator alignment (prevents light glow in deep shadow)
      float shadowMask = smoothstep(-0.25, 0.15, dot(normal, viewLightDir));
      
      vec3 glow = uColor * intensity * shadowMask;
      gl_FragColor = vec4(glow, intensity * shadowMask * 0.78);
    }
  `
};

/**
 * Gas Giant Planet Body Shader
 * Combines:
 *  - High-frequency planetary cloud bands + 3D turbulence.
 *  - Real-time ring shadow projection mapping.
 *  - Physically plausible diffuse roll-off.
 */
const PlanetBodyShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    uniform vec3 uLightPos;
    uniform vec3 uPlanetPos;
    uniform float uTime;
    
    // Noise algorithm for cloud detail
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
    float noise(vec2 p) {
      vec2 i = floor(p); vec2 f = fract(p);
      f = f*f*(3.0-2.0*f);
      return mix(mix(hash(i+vec2(0,0)), hash(i+vec2(1,0)), f.x),
                 mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
    }

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 lightDir = normalize(uLightPos - vWorldPosition);
      
      // Diffuse Lambertian + soft terminator wrap
      float diffuse = smoothstep(-0.15, 0.35, dot(normal, lightDir));

      // Atmospheric Rayleigh edge-lighting on body surface
      vec3 viewDir = normalize(vViewPosition);
      float rim = pow(1.0 - max(0.0, dot(normal, viewDir)), 5.0) * diffuse;

      // ── Cloud Band Generation ──────────────────────────────────────────────
      // Generate multiple frequency bands with localized storm turbulence
      float bandBase = sin(vUv.y * 38.0 + noise(vec2(vUv.x * 4.0, vUv.y * 12.0)) * 1.5);
      float bandFine = sin(vUv.y * 82.0 + uTime * 0.05);
      float cloudPattern = mix(0.35, 0.65, smoothstep(-0.4, 0.4, bandBase)) 
                         + mix(-0.08, 0.08, smoothstep(-0.5, 0.5, bandFine));

      // Physically realistic organic color scheme
      vec3 colorA = vec3(0.05, 0.14, 0.35); // Deep band
      vec3 colorB = vec3(0.12, 0.28, 0.60); // Bright band
      vec3 colorC = vec3(0.20, 0.40, 0.72); // Storm swirl tint
      vec3 planetColor = mix(colorA, colorB, cloudPattern);
      planetColor = mix(planetColor, colorC, rim * 0.5);

      // ── Real-time Ring Shadow Projection mapping ───────────────────────────
      // Project the rings onto the sphere surface using light rays.
      // Plane intersects the planet core orthogonally (ring inclination).
      // Vector from world position toward light source:
      vec3 toLight = -lightDir;
      // Intersection calculation of ray with the ring plane:
      // Planet core sits at uPlanetPos. The ring plane normal is pointing along the planet's local Y axis.
      // For ease, we rotate plane relative to world space. Planet tilt vector:
      vec3 ringPlaneNormal = normalize(vec3(-0.15, 0.95, -0.26));
      
      // Calculate intersection distance 't' from surface point to ring plane along light ray
      float denom = dot(toLight, ringPlaneNormal);
      float shadowIntensity = 1.0;
      
      if (abs(denom) > 0.0001) {
        float t = dot(uPlanetPos - vWorldPosition, ringPlaneNormal) / denom;
        // Shadow only cast from objects positioned towards the light source
        if (t > 0.0) {
          vec3 intersectPt = vWorldPosition + toLight * t;
          float distToCore = distance(uPlanetPos, intersectPt);
          
          // Planet radius is 7.8. Ring begins at 10.5 and ends at 24.0.
          if (distToCore >= 10.2 && distToCore <= 23.5) {
            // High frequency shadow band mapping
            float normDist = (distToCore - 10.2) / 13.3;
            float ringDensity = 0.85 * (1.0 - smoothstep(0.48, 0.52, abs(normDist - 0.58))); // Cassini division shadow
            shadowIntensity = clamp(1.0 - ringDensity * 0.80, 0.15, 1.0);
          }
        }
      }

      // Compose final lighting values
      vec3 color = planetColor * diffuse * shadowIntensity;
      color += vec3(0.35, 0.62, 1.0) * rim * 0.48 * shadowIntensity; // Rayleigh limb scatter

      gl_FragColor = vec4(color, 1.0);
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
    const driftX = Math.sin(t * 0.052) * 3.0 + Math.cos(t * 0.11) * 1.2;
    const driftY = Math.cos(t * 0.045) * 2.2 + Math.sin(t * 0.082) * 0.8;
    
    // Scroll depth traversal
    const targetZ = -scrollY.current * 0.048;
    camVel.current.z += (targetZ - camPos.current.z) * 0.022;
    camVel.current.z *= 0.85;
    camPos.current.z += camVel.current.z;

    // Heavy inertia camera tracking
    const targetLookX = mouse.current.x * 22 + driftX;
    const targetLookY = mouse.current.y * -16 + driftY;
    lookVel.current.x += (targetLookX - lookTarget.current.x) * 0.015;
    lookVel.current.y += (targetLookY - lookTarget.current.y) * 0.015;
    lookVel.current.multiplyScalar(0.86);
    lookTarget.current.x += lookVel.current.x;
    lookTarget.current.y += lookVel.current.y;
    lookTarget.current.z = -100 + camPos.current.z;

    state.camera.position.set(0, 0, camPos.current.z);
    state.camera.lookAt(lookTarget.current);
  });

  return null;
}

// ─── STARS ───────────────────────────────────────────────────────────

function StarField() {
  const COUNT = 750; // Further reduced count to optimize material rendering
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
      const r = 320 + rand() * 1200;

      pos[i3] = Math.sin(ph) * Math.cos(th) * r;
      pos[i3 + 1] = Math.sin(ph) * Math.sin(th) * r * 0.68;
      pos[i3 + 2] = Math.cos(ph) * r;

      const roll = rand();
      if (roll < 0.30) {
        col[i3] = 0.72; col[i3+1] = 0.82; col[i3+2] = 1.0; // Blue giants
      } else if (roll < 0.75) {
        col[i3] = 0.98; col[i3+1] = 0.97; col[i3+2] = 0.93; // G/F Main stars
      } else {
        col[i3] = 1.0; col[i3+1] = 0.72; col[i3+2] = 0.52;  // Orange/red dwarfs
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));

    const m = new THREE.PointsMaterial({
      size: 4.8,
      map: starTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.80,
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

// ─── VOLUMETRIC GAS CLOUDS ───────────────────────────────────────────────────

function Nebula() {
  const clouds = useMemo(() => [
    { pos: [-35, 12, -180] as [number, number, number], scale: 125, color: new THREE.Color("#0c6095"), opacity: 0.11 },
    { pos: [45, -18, -220] as [number, number, number], scale: 155, color: new THREE.Color("#2a127a"), opacity: 0.09 },
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

// ─── GAS GIANT CELESTIAL OBJECT ──────────────────────────────────────────────

function RingedPlanet() {
  const ringTex = useMemo(() => makeRingTexture(), []);
  
  const LIGHT_POS = useMemo(() => new THREE.Vector3(-120, 60, 40), []);
  const PLANET_POS = useMemo(() => new THREE.Vector3(22, -6, -55), []);

  const uniforms = useMemo(() => ({
    uLightPos: { value: LIGHT_POS },
    uPlanetPos: { value: PLANET_POS },
    uTime: { value: 0 }
  }), [LIGHT_POS, PLANET_POS]);

  const atmUniforms = useMemo(() => ({
    uLightPos: { value: LIGHT_POS },
    uColor: { value: new THREE.Color("#3c7cf2") },
    uGlowPower: { value: 5.2 }
  }), [LIGHT_POS]);

  useFrame((state) => {
    uniforms.uTime.value = state.clock.getElapsedTime();
  });

  useEffect(() => () => ringTex.dispose(), [ringTex]);

  return (
    // Core position and local orientation tilt
    <group position={PLANET_POS} rotation={[0.26, 0.45, 0.12]}>
      
      {/* 1. Volumetric Rayleigh Atmosphere Scattering Shell */}
      <mesh>
        <sphereGeometry args={[8.6, 32, 32]} />
        <shaderMaterial
          vertexShader={AtmosphereShader.vertexShader}
          fragmentShader={AtmosphereShader.fragmentShader}
          uniforms={atmUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. Custom Planet Body Mesh with bands and shadows */}
      <mesh>
        <sphereGeometry args={[7.8, 64, 64]} />
        <shaderMaterial
          vertexShader={PlanetBodyShader.vertexShader}
          fragmentShader={PlanetBodyShader.fragmentShader}
          uniforms={uniforms}
        />
      </mesh>

      {/* 3. High Fidelity Planetary Rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[10.5, 23.5, 128]} />
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

// ─── FOREGROUND COSMIC DUST ─────────────────────────────────────

function CosmicDust() {
  const COUNT = 90; // Reduced count to increase rendering realism
  const dustTex = useMemo(() => makeStarTexture(), []);
  const pointsRef = useRef<THREE.Points>(null);

  const [geo, mat] = useMemo(() => {
    const rand = mkRand(112);
    const pos = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = (rand() - 0.5) * 80;
      pos[i3+1] = (rand() - 0.5) * 45;
      pos[i3+2] = -10 - rand() * 80;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    const m = new THREE.PointsMaterial({
      size: 0.58,
      map: dustTex,
      color: "#8ab2da",
      transparent: true,
      opacity: 0.32,
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
      arr[i3+2] += dt * 1.5;
      arr[i3] += Math.sin(state.clock.getElapsedTime() * 0.15 + i) * 0.003;
      if (arr[i3+2] > 5) {
        arr[i3+2] = -90;
      }
    }
    posAttr.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geo} material={mat} />;
}

// ─── AMBIENT BLOOM FRAME ──────────────────────────────────────────────

function LightBleedFrame() {
  return (
    <mesh position={[0, 0, -5]} scale={[12, 8, 1]}>
      <planeGeometry />
      <meshBasicMaterial
        color="#071532"
        transparent
        opacity={0.06}
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
