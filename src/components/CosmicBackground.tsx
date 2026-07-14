import { useEffect, useRef, useState } from "react";

// ─── TYPES ─────────────────────────────────────────────────────────────────
interface Star {
  x: number; y: number;
  z: number;           // depth: 0.0 = infinitely far, 1.0 = right in front
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinklePhase: number;
  colorType: 0 | 1 | 2; // 0=white, 1=blue-white, 2=warm
  vx: number; vy: number;
}

interface Nebula {
  cx: number; cy: number; // normalized 0-1
  rx: number; ry: number;
  r: number; g: number; b: number;
  opacity: number;
  z: number;           // depth for parallax
  driftFreqX: number; driftFreqY: number;
  driftAmpX: number;  driftAmpY: number;
  phase: number;
}

interface DustCloud {
  x: number; y: number;
  size: number; opacity: number;
  z: number;
  vx: number; vy: number;
  angle: number; rotSpeed: number;
}

interface Galaxy {
  x: number; y: number;
  size: number; tilt: number;
  opacity: number; z: number;
  rotation: number; rotSpeed: number;
  r: number; g: number; b: number;
}

interface CosmoRay {
  x1: number; y1: number;
  x2: number; y2: number;
  opacity: number;
  life: number; maxLife: number;
}

// ─── SEEDED RNG ─────────────────────────────────────────────────────────────
function mkRand(seed: number) {
  let s = seed | 0;
  return () => { s = (Math.imul(s, 747796405) + 2891336453) | 0; return ((s >>> 18) ^ s) / 0xffffffff + 0.5; };
}

// ─── PERSPECTIVE PROJECTION ──────────────────────────────────────────────────
// This is the core of the 3D feel.
// A camera displacement D at Z-depth produces a screen offset of D * FOCAL / actualDepth.
// Objects close to the viewer (high z) have small actualDepth → move a LOT.
// Objects far away (low z) have large actualDepth → barely move.
const FOCAL = 1.8;
function perspOffset(cameraDisplacement: number, z: number): number {
  // Map z (0=far, 1=near) to actualDepth (large=far, small=near)
  const actualDepth = 1.05 - z * 0.96; // z=0 → 1.05, z=1 → 0.09
  return (cameraDisplacement * FOCAL) / actualDepth;
}

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef    = useRef<number | null>(null);
  const t0Ref     = useRef<number | null>(null);
  const [ready, setReady] = useState(false);

  // ── Input state (raw) ─────────────────────────────────────────────────────
  const mouseTargetRef = useRef({ x: 0.5, y: 0.5 });
  const scrollRef      = useRef(0);
  const scrollVelRef   = useRef(0); // scroll velocity for warp effect

  useEffect(() => { setReady(true); }, []);

  useEffect(() => {
    if (!ready) return;
    let lastScrollY = 0;
    const onMove = (e: MouseEvent) => {
      mouseTargetRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    const onScroll = () => {
      const sy = window.scrollY;
      scrollVelRef.current = sy - lastScrollY;
      lastScrollY = sy;
      scrollRef.current = sy;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll",    onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll",    onScroll);
    };
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const rand = mkRand(42);

    // ── 3D CAMERA with spring physics ────────────────────────────────────────
    // The camera is a virtual entity that follows the mouse with inertia.
    // When you move your mouse, the camera slowly swings toward the target.
    // This is what creates the "floating through space" sensation.
    const cam = {
      x: 0, y: 0,       // current position (pixels of displacement)
      vx: 0, vy: 0,     // velocity for spring physics
      tilt: 0, tiltV: 0, // subtle z-axis rotation
    };
    const CAM_SPRING   = 0.032; // how fast camera accelerates toward target
    const CAM_DAMPING  = 0.82;  // friction (< 1 = slow down, 0.82 = moderate inertia)
    const CAM_RANGE_X  = isMobile ? 12 : 22; // max camera displacement in pixels
    const CAM_RANGE_Y  = isMobile ? 8  : 15;
    const TILT_RANGE   = 0.006; // max canvas rotation in radians
    const TILT_SPRING  = 0.018;
    const TILT_DAMPING = 0.88;

    // ── Idle camera drift (always alive even without mouse input) ─────────────
    // Simulates a camera floating freely in space.
    const IDLE_AMP_X = isMobile ? 3 : 6;
    const IDLE_AMP_Y = isMobile ? 2 : 4;
    const IDLE_FREQ_X = 0.07;
    const IDLE_FREQ_Y = 0.05;

    // ── LAYER 1: STARFIELD ───────────────────────────────────────────────────
    const STAR_COUNT = isMobile ? 700 : 2000;
    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const pop = rand();
      // Three populations with clear depth separation
      const z = pop < 0.68
        ? rand() * 0.28                   // far:  z=0.00–0.28
        : pop < 0.91
        ? 0.28 + rand() * 0.42            // mid:  z=0.28–0.70
        : 0.70 + rand() * 0.30;           // near: z=0.70–1.00

      const colorRoll = rand();
      const colorType = (colorRoll < 0.62 ? 0 : colorRoll < 0.82 ? 1 : 2) as 0 | 1 | 2;

      stars.push({
        x: rand(), y: rand(), z,
        size: z < 0.28 ? 0.12 + rand() * 0.22
            : z < 0.70 ? 0.28 + rand() * 0.50
            : 0.65 + rand() * 1.10,
        brightness: z < 0.28 ? 0.02 + rand() * 0.06
                  : z < 0.70 ? 0.07 + rand() * 0.18
                  : 0.22 + rand() * 0.60,
        twinkleSpeed: z > 0.65 ? 0.4 + rand() * 1.4 : 0,
        twinklePhase: rand() * Math.PI * 2,
        colorType,
        vx: (rand() - 0.5) * 0.000007 * (0.4 + z * 0.8),
        vy: (rand() - 0.5) * 0.000004 * (0.4 + z * 0.8) - 0.000003,
      });
    }

    // ── LAYER 2: NEBULA CLOUDS ────────────────────────────────────────────────
    // Very far background — z is very low so they barely react to camera movement.
    // They're huge structures, so they should feel like "walls" of the universe.
    const nebulae: Nebula[] = [
      { cx: 0.10, cy: 0.40, rx: 0.60, ry: 0.52, r: 6,   g: 182, b: 212, opacity: 0.040, z: 0.04, driftFreqX: 0.008, driftFreqY: 0.006, driftAmpX: 0.022, driftAmpY: 0.014, phase: 0.0 },
      { cx: 0.88, cy: 0.22, rx: 0.55, ry: 0.52, r: 59,  g: 130, b: 246, opacity: 0.044, z: 0.05, driftFreqX: 0.011, driftFreqY: 0.008, driftAmpX: 0.018, driftAmpY: 0.012, phase: 1.8 },
      { cx: 0.50, cy: 0.65, rx: 0.75, ry: 0.48, r: 99,  g: 102, b: 241, opacity: 0.024, z: 0.03, driftFreqX: 0.007, driftFreqY: 0.005, driftAmpX: 0.014, driftAmpY: 0.010, phase: 3.1 },
      { cx: 0.78, cy: 0.80, rx: 0.42, ry: 0.40, r: 139, g:  92, b: 246, opacity: 0.032, z: 0.04, driftFreqX: 0.009, driftFreqY: 0.007, driftAmpX: 0.016, driftAmpY: 0.010, phase: 5.0 },
      { cx: 0.52, cy: 0.06, rx: 0.48, ry: 0.32, r: 236, g:  72, b: 153, opacity: 0.016, z: 0.03, driftFreqX: 0.006, driftFreqY: 0.005, driftAmpX: 0.012, driftAmpY: 0.008, phase: 2.4 },
    ];

    // ── LAYER 3: COSMIC DUST (closer to viewer, strong parallax) ─────────────
    const DUST_COUNT = isMobile ? 16 : 36;
    const dustClouds: DustCloud[] = [];
    for (let i = 0; i < DUST_COUNT; i++) {
      // Dust is in the foreground — z is higher = reacts strongly to camera
      const z = 0.35 + rand() * 0.55;
      dustClouds.push({
        x: rand(), y: rand(),
        size: 0.06 + rand() * 0.16,
        opacity: 0.006 + rand() * 0.016,
        z,
        vx: (rand() - 0.5) * 0.000018,
        vy: (rand() - 0.5) * 0.000010,
        angle: rand() * Math.PI * 2,
        rotSpeed: (rand() - 0.5) * 0.00007,
      });
    }

    // ── LAYER 4: DISTANT GALAXIES (deepest, z very low → barely move) ────────
    const GALAXY_COUNT = isMobile ? 3 : 6;
    const galaxies: Galaxy[] = [];
    const gColors = [{ r: 255, g: 200, b: 130 }, { r: 180, g: 220, b: 255 }, { r: 255, g: 180, b: 200 }];
    for (let i = 0; i < GALAXY_COUNT; i++) {
      const c = gColors[i % gColors.length];
      galaxies.push({
        x: 0.05 + rand() * 0.90, y: 0.05 + rand() * 0.78,
        size: (isMobile ? 30 : 48) + rand() * 75,
        tilt: rand() * Math.PI,
        opacity: 0.045 + rand() * 0.07,
        z: 0.01 + rand() * 0.03,  // extremely far — nearly static
        rotation: rand() * Math.PI * 2,
        rotSpeed: (rand() - 0.5) * 0.00012,
        r: c.r, g: c.g, b: c.b,
      });
    }

    // ── LAYER 5: COSMIC RAYS ──────────────────────────────────────────────────
    const rays: CosmoRay[] = [];
    const MAX_RAYS = isMobile ? 3 : 5;
    const randRay = mkRand(77);
    const spawnRay = () => {
      if (rays.length >= MAX_RAYS) return;
      const angle = randRay() * Math.PI * 2;
      const len   = 40 + randRay() * 100;
      const sx = randRay() * W;
      const sy = randRay() * H;
      rays.push({
        x1: sx, y1: sy,
        x2: sx + Math.cos(angle) * len,
        y2: sy + Math.sin(angle) * len,
        opacity: 0, life: 0, maxLife: 90 + randRay() * 110,
      });
    };
    for (let i = 0; i < 2; i++) spawnRay();
    let rayTimer = 0;

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER HELPERS
    // ─────────────────────────────────────────────────────────────────────────
    const drawGalaxy = (g: Galaxy, px: number, py: number) => {
      const gx = g.x * W + px;
      const gy = g.y * H + py;
      g.rotation += g.rotSpeed;
      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(g.rotation);
      // Core
      const core = ctx.createRadialGradient(0, 0, 0, 0, 0, g.size * 0.22);
      core.addColorStop(0, `rgba(${g.r},${g.g},${g.b},${g.opacity * 1.9})`);
      core.addColorStop(0.5, `rgba(${g.r},${g.g},${g.b},${g.opacity * 0.7})`);
      core.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(0, 0, g.size * 0.22, 0, Math.PI * 2); ctx.fill();
      // Disk
      ctx.save();
      ctx.scale(1, 0.32);
      const disk = ctx.createRadialGradient(0, 0, g.size * 0.04, 0, 0, g.size);
      disk.addColorStop(0, `rgba(${g.r},${g.g},${g.b},${g.opacity * 0.9})`);
      disk.addColorStop(0.45, `rgba(${g.r},${g.g},${g.b},${g.opacity * 0.28})`);
      disk.addColorStop(0.78, `rgba(${g.r},${g.g},${g.b},${g.opacity * 0.07})`);
      disk.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = disk;
      ctx.beginPath(); ctx.arc(0, 0, g.size, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.restore();
    };

    const drawNebula = (n: Nebula, elapsed: number, px: number, py: number) => {
      const ox  = Math.sin(elapsed * n.driftFreqX + n.phase) * n.driftAmpX;
      const oy  = Math.cos(elapsed * n.driftFreqY + n.phase) * n.driftAmpY;
      const ncx = (n.cx + ox) * W + px;
      const ncy = (n.cy + oy) * H + py;
      const rX  = n.rx * W;
      const rY  = n.ry * H;
      const rad = Math.max(rX, rY);
      ctx.save();
      ctx.translate(ncx, ncy);
      ctx.scale(rX / rad, rY / rad);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
      g.addColorStop(0,    `rgba(${n.r},${n.g},${n.b},${n.opacity * 1.6})`);
      g.addColorStop(0.38, `rgba(${n.r},${n.g},${n.b},${n.opacity * 0.65})`);
      g.addColorStop(0.72, `rgba(${n.r},${n.g},${n.b},${n.opacity * 0.15})`);
      g.addColorStop(1,    "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, rad, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    };

    const drawDust = (d: DustCloud, px: number, py: number) => {
      const x = d.x * W + px;
      const y = d.y * H + py;
      const r = d.size * Math.min(W, H);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(d.angle);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0,   `rgba(180,200,255,${d.opacity * 1.6})`);
      g.addColorStop(0.5, `rgba(130,160,220,${d.opacity * 0.55})`);
      g.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.scale(1, 0.50 + Math.abs(Math.sin(d.angle)) * 0.28);
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    };

    // ─────────────────────────────────────────────────────────────────────────
    // MAIN RENDER LOOP
    // ─────────────────────────────────────────────────────────────────────────
    let scrollVelSmooth = 0;

    const render = (ts: number) => {
      if (!t0Ref.current) t0Ref.current = ts;
      const elapsed = (ts - t0Ref.current) * 0.001;

      // ── Camera spring physics ──────────────────────────────────────────────
      // Idle drift: the camera moves even without user input — floating sensation
      const idleX = Math.sin(elapsed * IDLE_FREQ_X) * IDLE_AMP_X;
      const idleY = Math.cos(elapsed * IDLE_FREQ_Y) * IDLE_AMP_Y;

      // Target = mouse position (in pixels around center) + idle drift
      const mx = mouseTargetRef.current.x;
      const my = mouseTargetRef.current.y;
      const targetCamX = (mx - 0.5) * CAM_RANGE_X * 2 + idleX;
      const targetCamY = (my - 0.5) * CAM_RANGE_Y * 2 + idleY;

      // Spring update: accelerate toward target, apply damping
      cam.vx += (targetCamX - cam.x) * CAM_SPRING;
      cam.vy += (targetCamY - cam.y) * CAM_SPRING;
      cam.vx *= CAM_DAMPING;
      cam.vy *= CAM_DAMPING;
      cam.x  += cam.vx;
      cam.y  += cam.vy;

      // Tilt spring (subtle canvas rotation tracks mouse, creates "camera look" feel)
      const targetTilt = (mx - 0.5) * TILT_RANGE * 2;
      cam.tiltV += (targetTilt - cam.tilt) * TILT_SPRING;
      cam.tiltV *= TILT_DAMPING;
      cam.tilt  += cam.tiltV;

      // ── Scroll travel effect ──────────────────────────────────────────────
      // Smooth the raw scroll velocity (prevents jitter on slow scroll)
      scrollVelSmooth += (scrollVelRef.current - scrollVelSmooth) * 0.1;
      scrollVelRef.current *= 0.85; // decay
      const scrollY = scrollRef.current;

      // ── Base void ──────────────────────────────────────────────────────────
      ctx.fillStyle = "#010108";
      ctx.fillRect(0, 0, W, H);

      // Deep space ambient
      const amb = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.9);
      amb.addColorStop(0, "rgba(4,10,35,0.55)");
      amb.addColorStop(0.5, "rgba(2,5,18,0.22)");
      amb.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = amb;
      ctx.fillRect(0, 0, W, H);

      // ── Apply camera tilt to entire scene ────────────────────────────────
      // This is the "camera rotation" feel — the whole scene subtly rotates
      // when you move your mouse, unlike a flat wallpaper shift.
      ctx.save();
      ctx.translate(W * 0.5, H * 0.5);
      ctx.rotate(cam.tilt);
      ctx.translate(-W * 0.5, -H * 0.5);

        // ── LAYER 4: GALAXIES (z~0.01–0.04 → barely move) ────────────────────
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        galaxies.forEach((g) => {
          const px = perspOffset(cam.x, g.z);
          const py = perspOffset(cam.y, g.z) - scrollY * g.z * 0.06;
          drawGalaxy(g, px, py);
        });
        ctx.restore();

        // ── LAYER 2: NEBULAE (z~0.03–0.05 → very slow, massive structures) ──
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        nebulae.forEach((n) => {
          const px = perspOffset(cam.x, n.z);
          const py = perspOffset(cam.y, n.z) - scrollY * n.z * 0.08;
          drawNebula(n, elapsed, px, py);
        });
        ctx.restore();

        // ── LAYER 1: STARFIELD ─────────────────────────────────────────────
        // Stars use full perspective projection.
        // Near stars (z~0.9) move ~10x more than far stars (z~0.05).
        // This creates genuine 3D depth perception.
        const warpBrightness = Math.min(Math.abs(scrollVelSmooth) * 0.04, 0.35);
        stars.forEach((s) => {
          // Drift
          s.x += s.vx; s.y += s.vy;
          if (s.x < 0) s.x = 1; if (s.x > 1) s.x = 0;
          if (s.y < 0) s.y = 1; if (s.y > 1) s.y = 0;

          // Perspective parallax — THE KEY to 3D feel
          const px = perspOffset(cam.x, s.z);
          // Scroll travel: near stars fall behind faster (you're flying forward)
          const py = perspOffset(cam.y, s.z) - scrollY * s.z * 0.55;

          const sx = ((s.x * W + px) % W + W) % W;
          const sy = ((s.y * H + py) % H + H) % H;

          // Twinkle
          let b = s.brightness;
          if (s.twinkleSpeed > 0) {
            b *= 0.55 + 0.45 * Math.sin(elapsed * s.twinkleSpeed + s.twinklePhase);
          }
          // Warp flash: bright pulse when scrolling fast
          b = Math.min(1, b + warpBrightness * s.z);

          // Star color
          let sr = 255, sg = 255, sb = 255;
          if (s.colorType === 1) { sr = 210; sg = 228; sb = 255; }
          else if (s.colorType === 2) { sr = 255; sg = 228; sb = 180; }

          // Near bright stars: diffraction spikes + halo (adds to 3D sense of scale)
          if (s.z > 0.80 && b > 0.20) {
            const spike = s.size * 4.5;
            ctx.save();
            ctx.strokeStyle = `rgba(${sr},${sg},${sb},${b * 0.28})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(sx - spike, sy); ctx.lineTo(sx + spike, sy);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(sx, sy - spike * 0.7); ctx.lineTo(sx, sy + spike * 0.7);
            ctx.stroke();
            ctx.restore();
          }
          if (s.z > 0.72 && b > 0.14) {
            const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.size * 5);
            halo.addColorStop(0, `rgba(${sr},${sg},${sb},${b * 0.16})`);
            halo.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = halo;
            ctx.beginPath(); ctx.arc(sx, sy, s.size * 5, 0, Math.PI * 2); ctx.fill();
          }

          ctx.fillStyle = `rgba(${sr},${sg},${sb},${b})`;
          ctx.beginPath(); ctx.arc(sx, sy, s.size, 0, Math.PI * 2); ctx.fill();
        });

        // ── LAYER 3: DUST (closer than stars → strong parallax) ──────────────
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        dustClouds.forEach((d) => {
          d.x += d.vx; d.y += d.vy; d.angle += d.rotSpeed;
          if (d.x < -0.1) d.x = 1.1; if (d.x > 1.1) d.x = -0.1;
          if (d.y < -0.1) d.y = 1.1; if (d.y > 1.1) d.y = -0.1;
          const px = perspOffset(cam.x, d.z);
          const py = perspOffset(cam.y, d.z) - scrollY * d.z * 0.4;
          drawDust(d, px, py);
        });
        ctx.restore();

        // ── LAYER 5: COSMIC RAYS ───────────────────────────────────────────
        rayTimer += 0.016;
        if (rayTimer > 4 + randRay() * 9) { rayTimer = 0; spawnRay(); }
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        for (let i = rays.length - 1; i >= 0; i--) {
          const ray = rays[i];
          ray.life++;
          const p   = ray.life / ray.maxLife;
          const env = p < 0.15 ? p / 0.15 : p > 0.72 ? (1 - p) / 0.28 : 1;
          ray.opacity = 0.10 * env;
          if (ray.life >= ray.maxLife) { rays.splice(i, 1); continue; }
          const g = ctx.createLinearGradient(ray.x1, ray.y1, ray.x2, ray.y2);
          g.addColorStop(0,   "rgba(200,230,255,0)");
          g.addColorStop(0.4, `rgba(200,230,255,${ray.opacity})`);
          g.addColorStop(0.6, `rgba(255,255,255,${ray.opacity * 1.5})`);
          g.addColorStop(1,   "rgba(200,230,255,0)");
          ctx.strokeStyle = g;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(ray.x1, ray.y1); ctx.lineTo(ray.x2, ray.y2);
          ctx.stroke();
        }
        ctx.restore();

      // ── Restore tilt transform ─────────────────────────────────────────────
      ctx.restore();

      // ── CONTENT BACKLIGHTING (applied after tilt, fixed to screen space) ───
      // Hero section — soft dark-blue fill improves text readability
      const heroX = W * 0.5 + cam.x * 0.4;
      const heroY = H * 0.30 + cam.y * 0.3 - scrollY * 0.15;
      const heroRad = Math.max(W, H) * 0.55;
      const hBg = ctx.createRadialGradient(heroX, heroY, 0, heroX, heroY, heroRad);
      hBg.addColorStop(0, "rgba(5,15,45,0.50)");
      hBg.addColorStop(0.4, "rgba(3,8,25,0.18)");
      hBg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = hBg;
      ctx.fillRect(0, 0, W, H);

      // Subtle cyan accent on hero
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const hCyan = ctx.createRadialGradient(heroX, heroY, 0, heroX, heroY, heroRad * 0.65);
      hCyan.addColorStop(0, "rgba(6,182,212,0.042)");
      hCyan.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = hCyan;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // EVE violet accent (violet reserved for EVE)
      const eveX = W * 0.5 + cam.x * 0.3;
      const eveY = H * 0.88 + cam.y * 0.25 - scrollY * 0.28;
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const evG = ctx.createRadialGradient(eveX, eveY, 0, eveX, eveY, Math.max(W, H) * 0.38);
      evG.addColorStop(0, "rgba(139,92,246,0.042)");
      evG.addColorStop(0.5, "rgba(79,70,229,0.014)");
      evG.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = evG;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // Lens bloom (upper-right, follows camera slightly)
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const bloomX = W * 0.76 + cam.x * 0.2;
      const bloomY = H * 0.06  + cam.y * 0.15;
      const bloom  = ctx.createRadialGradient(bloomX, bloomY, 0, bloomX, bloomY, Math.max(W, H) * 0.32);
      bloom.addColorStop(0, "rgba(180,220,255,0.018)");
      bloom.addColorStop(0.5, "rgba(100,160,255,0.006)");
      bloom.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // ── CINEMATIC VIGNETTE ─────────────────────────────────────────────────
      // Slightly shifts with camera to reinforce 3D perspective
      const vigX = W * 0.5 + cam.x * 0.12;
      const vigY = H * 0.5 + cam.y * 0.08;
      const vig  = ctx.createRadialGradient(vigX, vigY, Math.min(W, H) * 0.22, vigX, vigY, Math.max(W, H) * 0.84);
      vig.addColorStop(0,    "rgba(0,0,0,0)");
      vig.addColorStop(0.52, "rgba(0,0,0,0.07)");
      vig.addColorStop(0.80, "rgba(0,0,0,0.30)");
      vig.addColorStop(1,    "rgba(0,0,0,0.68)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [ready]);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none select-none -z-40 print:hidden overflow-hidden">
      <div className="absolute inset-0 bg-[#010108] -z-50" />
      <canvas ref={canvasRef} className="w-full h-full block" id="cosmic-canvas" />
    </div>
  );
}
