import { useEffect, useRef, useState } from "react";

// ─── TYPE DEFINITIONS ───────────────────────────────────────────────────────
interface Star {
  x: number; y: number; z: number; // z = depth 0.0 (far) to 1.0 (near)
  size: number; brightness: number;
  twinkleSpeed: number; twinklePhase: number;
  color: number; // 0=white, 1=blue-white, 2=warm
  vx: number; vy: number;
}

interface Nebula {
  cx: number; cy: number; // normalised 0-1
  rx: number; ry: number; // normalised radii
  r: number; g: number; b: number; // colour
  opacity: number; depth: number;
  orbitRadius: number; orbitSpeed: number; orbitPhase: number;
}

interface DustCloud {
  x: number; y: number;
  size: number; opacity: number; depth: number;
  vx: number; vy: number; angle: number; rotSpeed: number;
}

interface Galaxy {
  x: number; y: number;
  size: number; tilt: number; opacity: number; depth: number;
  rotation: number; rotSpeed: number;
  arms: number; r: number; g: number; b: number;
}

interface CosmoRay {
  x1: number; y1: number; x2: number; y2: number;
  opacity: number; life: number; maxLife: number; speed: number;
}

// ─── SEEDED RANDOM (deterministic scene every reload) ───────────────────────
function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const mouseTgtRef = useRef({ x: 0.5, y: 0.5 });
  const scrollRef = useRef(0);
  const [ready, setReady] = useState(false);

  useEffect(() => { setReady(true); }, []);

  // Mouse + scroll listeners
  useEffect(() => {
    if (!ready) return;
    const onMove = (e: MouseEvent) => {
      mouseTgtRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };
    const onScroll = () => { scrollRef.current = window.scrollY; };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [ready]);

  // Main render loop
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
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const rand = seededRand(42);

    // ─── LAYER 1: DEEP STARFIELD ─────────────────────────────────────────────
    // Three populations: ultra-distant (tiny, barely visible), mid-range, near
    const STAR_COUNT = isMobile ? 800 : 2200;
    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const pop = rand();
      const z = pop < 0.7 ? rand() * 0.35         // distant
               : pop < 0.92 ? 0.35 + rand() * 0.4  // mid-range
               : 0.75 + rand() * 0.25;             // near-field bright

      const colorRoll = rand();
      const color = colorRoll < 0.65 ? 0 : colorRoll < 0.82 ? 1 : 2;

      const baseBrightness = z < 0.35 ? 0.02 + rand() * 0.07
                            : z < 0.75 ? 0.06 + rand() * 0.18
                            : 0.20 + rand() * 0.55;

      stars.push({
        x: rand(), y: rand(), z,
        size: z < 0.35 ? 0.15 + rand() * 0.3
             : z < 0.75 ? 0.3 + rand() * 0.55
             : 0.7 + rand() * 1.0,
        brightness: baseBrightness,
        twinkleSpeed: z > 0.6 ? 0.3 + rand() * 1.2 : 0,
        twinklePhase: rand() * Math.PI * 2,
        color,
        vx: (rand() - 0.5) * 0.000008 * (1 + z),
        vy: (rand() - 0.5) * 0.000005 * (1 + z) - 0.000004,
      });
    }

    // ─── LAYER 2: NEBULA CLOUDS ──────────────────────────────────────────────
    // Large volumetric glowing regions that orbit slowly
    const nebulae: Nebula[] = [
      // Massive left cyan nebula
      { cx: 0.12, cy: 0.38, rx: 0.55, ry: 0.48, r: 6, g: 182, b: 212, opacity: 0.038, depth: 0.2, orbitRadius: 0.025, orbitSpeed: 0.008, orbitPhase: 0 },
      // Right deep blue nebula
      { cx: 0.88, cy: 0.25, rx: 0.52, ry: 0.50, r: 59, g: 130, b: 246, opacity: 0.042, depth: 0.25, orbitRadius: 0.02, orbitSpeed: 0.011, orbitPhase: 1.8 },
      // Central indigo cloud
      { cx: 0.5, cy: 0.62, rx: 0.70, ry: 0.45, r: 99, g: 102, b: 241, opacity: 0.022, depth: 0.15, orbitRadius: 0.015, orbitSpeed: 0.007, orbitPhase: 3.1 },
      // Lower-right violet bloom
      { cx: 0.78, cy: 0.82, rx: 0.40, ry: 0.38, r: 139, g: 92, b: 246, opacity: 0.030, depth: 0.18, orbitRadius: 0.018, orbitSpeed: 0.009, orbitPhase: 5.0 },
      // Upper-center faint pink/magenta wisp
      { cx: 0.52, cy: 0.08, rx: 0.45, ry: 0.30, r: 236, g: 72, b: 153, opacity: 0.014, depth: 0.12, orbitRadius: 0.012, orbitSpeed: 0.006, orbitPhase: 2.4 },
    ];

    // ─── LAYER 3: COSMIC DUST ────────────────────────────────────────────────
    const DUST_COUNT = isMobile ? 18 : 40;
    const dustClouds: DustCloud[] = [];
    for (let i = 0; i < DUST_COUNT; i++) {
      dustClouds.push({
        x: rand(), y: rand(),
        size: 0.05 + rand() * 0.18,
        opacity: 0.005 + rand() * 0.018,
        depth: 0.05 + rand() * 0.3,
        vx: (rand() - 0.5) * 0.00002,
        vy: (rand() - 0.5) * 0.00001,
        angle: rand() * Math.PI * 2,
        rotSpeed: (rand() - 0.5) * 0.00008,
      });
    }

    // ─── LAYER 4: DISTANT GALAXIES ───────────────────────────────────────────
    const GALAXY_COUNT = isMobile ? 3 : 6;
    const galaxies: Galaxy[] = [];
    const galaxyColors = [
      { r: 255, g: 200, b: 130 }, // warm yellow core
      { r: 180, g: 220, b: 255 }, // blue-white
      { r: 255, g: 180, b: 200 }, // pink
    ];
    for (let i = 0; i < GALAXY_COUNT; i++) {
      const c = galaxyColors[i % galaxyColors.length];
      galaxies.push({
        x: 0.05 + rand() * 0.9,
        y: 0.05 + rand() * 0.75,
        size: (isMobile ? 30 : 50) + rand() * 80,
        tilt: rand() * Math.PI,
        opacity: 0.04 + rand() * 0.08,
        depth: 0.08 + rand() * 0.18,
        rotation: rand() * Math.PI * 2,
        rotSpeed: (rand() - 0.5) * 0.00015,
        arms: Math.floor(2 + rand() * 2),
        r: c.r, g: c.g, b: c.b,
      });
    }

    // ─── LAYER 5: COSMIC RAYS (sporadic streaks of light) ────────────────────
    const rays: CosmoRay[] = [];
    const MAX_RAYS = isMobile ? 3 : 6;
    const spawnRay = () => {
      if (rays.length >= MAX_RAYS) return;
      const life = 80 + rand() * 120;
      const angle = rand() * Math.PI * 2;
      const len = 30 + rand() * 120;
      const sx = rand() * W;
      const sy = rand() * H;
      rays.push({
        x1: sx, y1: sy,
        x2: sx + Math.cos(angle) * len,
        y2: sy + Math.sin(angle) * len,
        opacity: 0.0, life: 0, maxLife: life,
        speed: 0.012 + rand() * 0.02,
      });
    };

    // Spawn initial rays
    for (let i = 0; i < Math.floor(MAX_RAYS / 2); i++) spawnRay();

    // ─── RENDER GALAXY ────────────────────────────────────────────────────────
    const drawGalaxy = (g: Galaxy, elapsed: number, px: number, py: number) => {
      const gx = g.x * W + px;
      const gy = g.y * H + py;
      const rot = g.rotation + elapsed * g.rotSpeed;
      const a = g.opacity;

      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(rot);

      // Core glow
      const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, g.size * 0.25);
      coreGrad.addColorStop(0, `rgba(${g.r},${g.g},${g.b},${a * 1.8})`);
      coreGrad.addColorStop(0.5, `rgba(${g.r},${g.g},${g.b},${a * 0.6})`);
      coreGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, g.size * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Spiral arms (elliptical approach)
      ctx.save();
      ctx.scale(1, 0.35); // flatten to ellipse = galaxy tilt illusion
      const diskGrad = ctx.createRadialGradient(0, 0, g.size * 0.05, 0, 0, g.size);
      diskGrad.addColorStop(0, `rgba(${g.r},${g.g},${g.b},${a * 0.8})`);
      diskGrad.addColorStop(0.4, `rgba(${g.r},${g.g},${g.b},${a * 0.3})`);
      diskGrad.addColorStop(0.75, `rgba(${g.r},${g.g},${g.b},${a * 0.08})`);
      diskGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = diskGrad;
      ctx.beginPath();
      ctx.arc(0, 0, g.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore();
    };

    // ─── RENDER DUST CLOUD ────────────────────────────────────────────────────
    const drawDustCloud = (d: DustCloud, px: number, py: number) => {
      const x = d.x * W + px;
      const y = d.y * H + py;
      const r = d.size * Math.min(W, H);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(d.angle);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, `rgba(180,200,255,${d.opacity * 1.5})`);
      g.addColorStop(0.5, `rgba(130,160,220,${d.opacity * 0.6})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.scale(1, 0.55 + Math.sin(d.angle) * 0.25);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // ─── MAIN RENDER LOOP ─────────────────────────────────────────────────────
    let rayTimer = 0;
    const RAND_LOCAL = seededRand(99); // separate seeded rand for rays

    const render = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = (ts - startRef.current) * 0.001;

      // Smooth mouse lerp
      mouseRef.current.x += (mouseTgtRef.current.x - mouseRef.current.x) * 0.028;
      mouseRef.current.y += (mouseTgtRef.current.y - mouseRef.current.y) * 0.028;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const scrollY = scrollRef.current;

      // Normalised mouse offset (-1 to +1)
      const mox = (mx - 0.5) * 2;
      const moy = (my - 0.5) * 2;

      // ── 0. Base void ───────────────────────────────────────────────────────
      ctx.fillStyle = "#010108";
      ctx.fillRect(0, 0, W, H);

      // ── Ambient deep-space gradient ────────────────────────────────────────
      const amb = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.9);
      amb.addColorStop(0, "rgba(3, 8, 30, 0.6)");
      amb.addColorStop(0.5, "rgba(1, 4, 15, 0.25)");
      amb.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = amb;
      ctx.fillRect(0, 0, W, H);

      // ── LAYER 4: DISTANT GALAXIES (deepest, slowest parallax) ─────────────
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      galaxies.forEach((g) => {
        g.rotation += g.rotSpeed;
        const px = mox * g.depth * 12;
        const py = moy * g.depth * 8 - scrollY * g.depth * 0.08;
        drawGalaxy(g, elapsed, px, py);
      });
      ctx.restore();

      // ── LAYER 2: NEBULA CLOUDS ────────────────────────────────────────────
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      nebulae.forEach((n) => {
        // Slow orbital drift
        const ox = Math.sin(elapsed * n.orbitSpeed + n.orbitPhase) * n.orbitRadius;
        const oy = Math.cos(elapsed * n.orbitSpeed * 0.7 + n.orbitPhase) * n.orbitRadius * 0.6;
        const px = mox * n.depth * 25;
        const py = moy * n.depth * 18 - scrollY * n.depth * 0.1;

        const ncx = (n.cx + ox) * W + px;
        const ncy = (n.cy + oy) * H + py;
        const radiusX = n.rx * W;
        const radiusY = n.ry * H;
        const rad = Math.max(radiusX, radiusY);

        const grad = ctx.createRadialGradient(ncx, ncy, 0, ncx, ncy, rad);
        grad.addColorStop(0, `rgba(${n.r},${n.g},${n.b},${n.opacity * 1.5})`);
        grad.addColorStop(0.35, `rgba(${n.r},${n.g},${n.b},${n.opacity * 0.7})`);
        grad.addColorStop(0.7, `rgba(${n.r},${n.g},${n.b},${n.opacity * 0.2})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;

        // Elliptical nebula shape
        ctx.save();
        ctx.translate(ncx, ncy);
        ctx.scale(radiusX / rad, radiusY / rad);
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        // need to recalculate grad after scale — use a simple large radial
        const grad2 = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
        grad2.addColorStop(0, `rgba(${n.r},${n.g},${n.b},${n.opacity * 1.5})`);
        grad2.addColorStop(0.4, `rgba(${n.r},${n.g},${n.b},${n.opacity * 0.6})`);
        grad2.addColorStop(0.75, `rgba(${n.r},${n.g},${n.b},${n.opacity * 0.15})`);
        grad2.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad2;
        ctx.fill();
        ctx.restore();
      });
      ctx.restore();

      // ── LAYER 3: COSMIC DUST ───────────────────────────────────────────────
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      dustClouds.forEach((d) => {
        d.x += d.vx; d.y += d.vy; d.angle += d.rotSpeed;
        if (d.x < -0.1) d.x = 1.1;
        if (d.x > 1.1)  d.x = -0.1;
        if (d.y < -0.1) d.y = 1.1;
        if (d.y > 1.1)  d.y = -0.1;
        const px = mox * d.depth * 18;
        const py = moy * d.depth * 12 - scrollY * d.depth * 0.07;
        drawDustCloud(d, px, py);
      });
      ctx.restore();

      // ── LAYER 1: STARFIELD ─────────────────────────────────────────────────
      stars.forEach((s) => {
        s.x += s.vx; s.y += s.vy;
        if (s.x < 0) s.x = 1; if (s.x > 1) s.x = 0;
        if (s.y < 0) s.y = 1; if (s.y > 1) s.y = 0;

        // Depth-scaled parallax
        const px = mox * s.z * 35;
        const py = moy * s.z * 24 - scrollY * s.z * 0.45;
        const sx = ((s.x * W + px) % W + W) % W;
        const sy = ((s.y * H + py) % H + H) % H;

        let b = s.brightness;
        if (s.twinkleSpeed > 0) {
          b *= 0.55 + 0.45 * Math.sin(elapsed * s.twinkleSpeed + s.twinklePhase);
        }

        let r = 255, g = 255, bl = 255;
        if (s.color === 1) { r = 210; g = 230; bl = 255; }      // blue-white
        else if (s.color === 2) { r = 255; g = 230; bl = 180; } // warm

        // Cross-diffraction spike for bright near stars
        if (s.z > 0.82 && b > 0.25) {
          const spikeLen = s.size * 3.5;
          ctx.strokeStyle = `rgba(${r},${g},${bl},${b * 0.35})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(sx - spikeLen, sy); ctx.lineTo(sx + spikeLen, sy);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(sx, sy - spikeLen); ctx.lineTo(sx, sy + spikeLen);
          ctx.stroke();
        }

        // Glow halo for bright stars
        if (s.z > 0.7 && b > 0.15) {
          const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.size * 4);
          halo.addColorStop(0, `rgba(${r},${g},${bl},${b * 0.18})`);
          halo.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(sx, sy, s.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(${r},${g},${bl},${b})`;
        ctx.beginPath();
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── LAYER 5: COSMIC RAYS ───────────────────────────────────────────────
      rayTimer += 0.016;
      if (rayTimer > 3.5 + RAND_LOCAL() * 8) {
        rayTimer = 0;
        spawnRay();
      }
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      for (let i = rays.length - 1; i >= 0; i--) {
        const ray = rays[i];
        ray.life++;
        const progress = ray.life / ray.maxLife;
        const envelope = progress < 0.2 ? progress / 0.2 : progress > 0.75 ? (1 - progress) / 0.25 : 1;
        ray.opacity = 0.12 * envelope;
        if (ray.life >= ray.maxLife) { rays.splice(i, 1); continue; }
        const grad = ctx.createLinearGradient(ray.x1, ray.y1, ray.x2, ray.y2);
        grad.addColorStop(0, `rgba(200,230,255,0)`);
        grad.addColorStop(0.4, `rgba(200,230,255,${ray.opacity})`);
        grad.addColorStop(0.6, `rgba(255,255,255,${ray.opacity * 1.4})`);
        grad.addColorStop(1, `rgba(200,230,255,0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(ray.x1, ray.y1);
        ctx.lineTo(ray.x2, ray.y2);
        ctx.stroke();
      }
      ctx.restore();

      // ── SOFT HERO ILLUMINATION ─────────────────────────────────────────────
      // Keeps the hero text zone readable with gentle backlighting
      const heroX = W * 0.5 + mox * 20;
      const heroY = H * 0.32 + moy * 14 - scrollY * 0.18;
      const heroR = Math.max(W, H) * 0.55;
      const heroGlow = ctx.createRadialGradient(heroX, heroY, 0, heroX, heroY, heroR);
      heroGlow.addColorStop(0, "rgba(8,30,60, 0.45)");
      heroGlow.addColorStop(0.45, "rgba(4,15,35, 0.18)");
      heroGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = heroGlow;
      ctx.fillRect(0, 0, W, H);

      // Cyan accent on hero
      const cyanGlow = ctx.createRadialGradient(heroX, heroY, 0, heroX, heroY, heroR * 0.7);
      cyanGlow.addColorStop(0, "rgba(6,182,212, 0.04)");
      cyanGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = cyanGlow;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // EVE violet accent (violet reserved for EVE flagship)
      const eveX = W * 0.5 + mox * 14;
      const eveY = H * 0.88 + moy * 10 - scrollY * 0.25;
      const eveGlow = ctx.createRadialGradient(eveX, eveY, 0, eveX, eveY, Math.max(W, H) * 0.4);
      eveGlow.addColorStop(0, "rgba(139,92,246, 0.04)");
      eveGlow.addColorStop(0.5, "rgba(79,70,229, 0.015)");
      eveGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = eveGlow;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // ── LENS SCATTER / atmospheric glow at screen edges ────────────────────
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      // Top-right lens bloom
      const bloomX = W * (0.75 + mox * 0.02);
      const bloomY = H * (0.05 + moy * 0.01);
      const bloomR = Math.max(W, H) * 0.35;
      const bloom = ctx.createRadialGradient(bloomX, bloomY, 0, bloomX, bloomY, bloomR);
      bloom.addColorStop(0, "rgba(180, 220, 255, 0.018)");
      bloom.addColorStop(0.5, "rgba(100, 160, 255, 0.006)");
      bloom.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(bloomX, bloomY, bloomR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ── VIGNETTE (cinematic framing) ───────────────────────────────────────
      const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.25, W * 0.5, H * 0.5, Math.max(W, H) * 0.82);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(0.55, "rgba(0,0,0,0.08)");
      vig.addColorStop(0.82, "rgba(0,0,0,0.32)");
      vig.addColorStop(1, "rgba(0,0,0,0.68)");
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
      {/* Solid base colour so canvas background is never transparent */}
      <div className="absolute inset-0 bg-[#010108] -z-50" />
      <canvas ref={canvasRef} className="w-full h-full block" id="cosmic-canvas" />
    </div>
  );
}
