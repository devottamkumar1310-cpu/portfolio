import { useEffect, useRef, useState } from "react";

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface Star {
  x: number; y: number; z: number;
  size: number; brightness: number;
  twinkleSpeed: number; twinklePhase: number;
  colorType: 0 | 1 | 2;
  vx: number; vy: number;
}

// ─── SEEDED RNG ──────────────────────────────────────────────────────────────
function mkRand(seed: number) {
  let s = seed | 0;
  return () => {
    s = (Math.imul(s, 747796405) + 2891336453) | 0;
    return ((s >>> 18) ^ s) / 0xffffffff + 0.5;
  };
}

// ─── PERSPECTIVE PROJECTION ──────────────────────────────────────────────────
// Near objects (high z) move dramatically. Far objects (low z) barely move.
// This is the mathematical foundation of the 3D feel.
function perspOff(cam: number, z: number): number {
  const depth = 1.05 - z * 0.96; // z=0 → 1.05 (far), z=1 → 0.09 (near)
  return (cam * 1.55) / depth;
}

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef    = useRef<number | null>(null);
  const t0Ref     = useRef<number | null>(null);
  const [ready, setReady] = useState(false);

  const mouseTargetRef = useRef({ x: 0.5, y: 0.5 });
  const scrollRef      = useRef(0);
  const scrollVelRef   = useRef(0);

  useEffect(() => { setReady(true); }, []);

  useEffect(() => {
    if (!ready) return;
    let lastSY = 0;
    const onMove = (e: MouseEvent) => {
      mouseTargetRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    const onScroll = () => {
      const sy = window.scrollY;
      scrollVelRef.current = sy - lastSY;
      lastSY = sy;
      scrollRef.current = sy;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
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

    // ── SPRING CAMERA ─────────────────────────────────────────────────────────
    const cam = { x: 0, y: 0, vx: 0, vy: 0, tilt: 0, tiltV: 0 };
    const CAM_SPRING  = 0.028;
    const CAM_DAMPING = 0.80;
    const CAM_RANGE   = isMobile ? 12 : 22;
    const TILT_RANGE  = 0.0055;

    // ── STARS (secondary element, embedded in the scene) ──────────────────────
    const STAR_COUNT = isMobile ? 380 : 1000;
    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const pop = rand();
      const z = pop < 0.65
        ? rand() * 0.28
        : pop < 0.90
        ? 0.28 + rand() * 0.44
        : 0.72 + rand() * 0.28;
      const ct = rand() < 0.60 ? 0 : rand() < 0.78 ? 1 : 2;
      stars.push({
        x: rand(), y: rand(), z,
        size: z < 0.28 ? 0.10 + rand() * 0.18 : z < 0.72 ? 0.22 + rand() * 0.42 : 0.52 + rand() * 0.95,
        brightness: z < 0.28 ? 0.012 + rand() * 0.048 : z < 0.72 ? 0.055 + rand() * 0.15 : 0.18 + rand() * 0.58,
        twinkleSpeed: z > 0.62 ? 0.35 + rand() * 1.3 : 0,
        twinklePhase: rand() * Math.PI * 2,
        colorType: ct as 0 | 1 | 2,
        vx: (rand() - 0.5) * 0.000006 * (0.3 + z),
        vy: (rand() - 0.5) * 0.000004 * (0.3 + z) - 0.0000025,
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER LOOP
    // ─────────────────────────────────────────────────────────────────────────
    let scrollVelSmooth = 0;

    const render = (ts: number) => {
      if (!t0Ref.current) t0Ref.current = ts;
      const elapsed = (ts - t0Ref.current) * 0.001;

      // ── Camera spring physics ───────────────────────────────────────────────
      const idleX = Math.sin(elapsed * 0.062) * (isMobile ? 2.5 : 5.5);
      const idleY = Math.cos(elapsed * 0.047) * (isMobile ? 1.5 : 3.5);
      const mx = mouseTargetRef.current.x;
      const my = mouseTargetRef.current.y;
      const targetX = (mx - 0.5) * CAM_RANGE * 2 + idleX;
      const targetY = (my - 0.5) * CAM_RANGE * 1.4 + idleY;
      cam.vx += (targetX - cam.x) * CAM_SPRING; cam.vx *= CAM_DAMPING; cam.x += cam.vx;
      cam.vy += (targetY - cam.y) * CAM_SPRING; cam.vy *= CAM_DAMPING; cam.y += cam.vy;
      const tTilt = (mx - 0.5) * TILT_RANGE * 2;
      cam.tiltV += (tTilt - cam.tilt) * 0.016; cam.tiltV *= 0.85; cam.tilt += cam.tiltV;

      scrollVelSmooth += (scrollVelRef.current - scrollVelSmooth) * 0.08;
      scrollVelRef.current *= 0.82;
      const scrollY = scrollRef.current;

      const S = Math.max(W, H); // scene scale reference

      // ── BASE VOID ──────────────────────────────────────────────────────────
      ctx.fillStyle = "#010108";
      ctx.fillRect(0, 0, W, H);

      // ════════════════════════════════════════════════════════════════════════
      // THE NEBULA ANCHOR SYSTEM
      //
      // The primary structure (stellar nursery nebula) is anchored to a point
      // in normalized screen space. Each depth-layer of the structure gets its
      // own screen-space anchor, computed by applying perspective projection
      // at that layer's z-depth.
      //
      // When the camera moves, closer layers (higher z) shift MORE than distant
      // layers (lower z). This makes the layers SEPARATE from each other,
      // creating the sensation of looking into layered 3D depth — not looking
      // at a flat image.
      // ════════════════════════════════════════════════════════════════════════
      
      // The structure lives in the upper-left quadrant with slight organic drift
      const breatheX = Math.sin(elapsed * 0.055) * 0.010;
      const breatheY = Math.cos(elapsed * 0.042) * 0.007;
      const NX = 0.36 + breatheX; // normalized nebula center X
      const NY = 0.41 + breatheY; // normalized nebula center Y

      // Per-layer anchors (each layer at a different depth → parallax separation)
      const aFar  = { x: NX * W + perspOff(cam.x, 0.025), y: NY * H + perspOff(cam.y, 0.025) - scrollY * 0.022 };
      const aMid  = { x: NX * W + perspOff(cam.x, 0.060), y: NY * H + perspOff(cam.y, 0.060) - scrollY * 0.058 };
      const aNear = { x: NX * W + perspOff(cam.x, 0.100), y: NY * H + perspOff(cam.y, 0.100) - scrollY * 0.092 };
      const aCore = { x: NX * W + perspOff(cam.x, 0.145), y: NY * H + perspOff(cam.y, 0.145) - scrollY * 0.130 };
      // Dust lanes are IN FRONT of the nebula (closer to viewer → more parallax)
      const aDust = { x: perspOff(cam.x, 0.210), y: perspOff(cam.y, 0.210) - scrollY * 0.180 };

      // ── Apply canvas tilt (camera rotation feeling) ────────────────────────
      ctx.save();
      ctx.translate(W * 0.5, H * 0.5);
      ctx.rotate(cam.tilt);
      ctx.translate(-W * 0.5, -H * 0.5);

      // ════════════════════════════════════════════════════════════════════════
      // LAYER A: VAST COSMIC HAZE
      // The universe is not black. This creates the ambient color of deep space
      // — a faint blue-violet glow that extends beyond all edges.
      // Being at z≈0.02 (virtually infinite distance), it barely moves.
      // The scale of this haze is LARGER than the screen → you are inside it.
      // ════════════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      {
        // Primary cyan expanse — upper-left dominant
        const h1 = ctx.createRadialGradient(aFar.x * 0.88, aFar.y * 0.82, 0, aFar.x * 0.88, aFar.y * 0.82, S * 1.10);
        h1.addColorStop(0,   "rgba(6,182,212,0.050)");
        h1.addColorStop(0.28,"rgba(4,128,158,0.028)");
        h1.addColorStop(0.60,"rgba(2,65,85,0.010)");
        h1.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = h1; ctx.fillRect(0, 0, W, H);

        // Blue arm sweeping to the right
        const h2 = ctx.createRadialGradient(W * 0.80, H * 0.26, 0, W * 0.80, H * 0.26, S * 0.85);
        h2.addColorStop(0,   "rgba(59,130,246,0.046)");
        h2.addColorStop(0.32,"rgba(32,82,186,0.024)");
        h2.addColorStop(0.68,"rgba(16,42,108,0.008)");
        h2.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = h2; ctx.fillRect(0, 0, W, H);

        // Deep violet base — bottom depth
        const h3 = ctx.createRadialGradient(W * 0.54, H * 1.08, 0, W * 0.54, H * 0.88, S * 0.78);
        h3.addColorStop(0,   "rgba(72,42,165,0.038)");
        h3.addColorStop(0.42,"rgba(42,24,102,0.016)");
        h3.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = h3; ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();

      // ════════════════════════════════════════════════════════════════════════
      // LAYER B: PRIMARY NEBULA CLOUD BODY (z≈0.06)
      // The main structural mass. Three overlapping cloud formations that
      // together read as ONE enormous connected structure.
      // The upper-left pillar + right-arm + lower extension create the
      // "galactic arm" composition.
      // ════════════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      {
        // Main pillar — the dominant left cloud mass
        const c1 = ctx.createRadialGradient(aMid.x * 0.87, aMid.y * 0.90, S * 0.010, aMid.x * 0.87, aMid.y * 0.90, S * 0.64);
        c1.addColorStop(0,   "rgba(8,204,234,0.125)");
        c1.addColorStop(0.17,"rgba(6,172,202,0.086)");
        c1.addColorStop(0.40,"rgba(4,112,148,0.040)");
        c1.addColorStop(0.70,"rgba(2,58,80,0.014)");
        c1.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = c1; ctx.fillRect(0, 0, W, H);

        // Right arm — sweeps across the upper right
        const c2 = ctx.createRadialGradient(W * 0.72, H * 0.20, 0, W * 0.72, H * 0.20, S * 0.52);
        c2.addColorStop(0,   "rgba(46,118,234,0.108)");
        c2.addColorStop(0.26,"rgba(28,76,182,0.060)");
        c2.addColorStop(0.58,"rgba(14,38,100,0.020)");
        c2.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = c2; ctx.fillRect(0, 0, W, H);

        // Lower extension — the "tail" of the structure
        const c3 = ctx.createRadialGradient(aMid.x * 1.18, aMid.y * 1.38, 0, aMid.x * 1.18, aMid.y * 1.38, S * 0.46);
        c3.addColorStop(0,   "rgba(82,46,205,0.082)");
        c3.addColorStop(0.33,"rgba(52,28,140,0.038)");
        c3.addColorStop(0.68,"rgba(28,14,78,0.012)");
        c3.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = c3; ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();

      // ════════════════════════════════════════════════════════════════════════
      // LAYER C: INNER NEBULA DENSITY (z≈0.10)
      // Denser, brighter inner cloud that sits "in front of" the outer haze.
      // With parallax, this layer separates from Layer B when the camera moves,
      // revealing depth INSIDE the structure itself.
      // ════════════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      {
        const d1 = ctx.createRadialGradient(aNear.x, aNear.y, S * 0.008, aNear.x, aNear.y, S * 0.37);
        d1.addColorStop(0,   "rgba(12,224,252,0.175)");
        d1.addColorStop(0.13,"rgba(8,198,228,0.125)");
        d1.addColorStop(0.36,"rgba(5,148,178,0.062)");
        d1.addColorStop(0.66,"rgba(3,86,110,0.020)");
        d1.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = d1; ctx.fillRect(0, 0, W, H);

        // Offset blob — real nebulae are asymmetric
        const d2 = ctx.createRadialGradient(aNear.x * 1.15, aNear.y * 0.85, 0, aNear.x * 1.15, aNear.y * 0.85, S * 0.29);
        d2.addColorStop(0,   "rgba(52,114,244,0.120)");
        d2.addColorStop(0.28,"rgba(30,72,186,0.068)");
        d2.addColorStop(0.60,"rgba(15,36,106,0.022)");
        d2.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = d2; ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();

      // ════════════════════════════════════════════════════════════════════════
      // LAYER D: STELLAR CORE — THE FOCAL POINT (z≈0.145)
      // A brilliant star-forming region at the heart of the nebula.
      // The eye is naturally drawn to this point.
      // Diffraction spikes signal an intensely bright stellar object.
      // Chromatic fringe adds photorealism (telescope optic aberration).
      // This is the SCALE-establishing element — stars this bright have
      // halos that span light-years.
      // ════════════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      {
        // Vast outer glow — the nebula lit by the core
        const env = ctx.createRadialGradient(aCore.x, aCore.y, 0, aCore.x, aCore.y, S * 0.22);
        env.addColorStop(0,   "rgba(225,250,255,0.38)");
        env.addColorStop(0.05,"rgba(140,228,255,0.26)");
        env.addColorStop(0.16,"rgba(75,195,244,0.14)");
        env.addColorStop(0.38,"rgba(38,135,205,0.055)");
        env.addColorStop(0.68,"rgba(16,72,132,0.016)");
        env.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = env; ctx.fillRect(0, 0, W, H);

        // Brilliant point source — the actual stellar cluster
        const hot = ctx.createRadialGradient(aCore.x, aCore.y, 0, aCore.x, aCore.y, S * 0.060);
        hot.addColorStop(0,   "rgba(255,255,255,0.96)");
        hot.addColorStop(0.07,"rgba(242,250,255,0.82)");
        hot.addColorStop(0.20,"rgba(185,228,255,0.48)");
        hot.addColorStop(0.48,"rgba(102,178,255,0.16)");
        hot.addColorStop(0.78,"rgba(52,112,222,0.04)");
        hot.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = hot; ctx.fillRect(0, 0, W, H);

        // Chromatic aberration — wavelength separation through the nebula gas
        const pulse = 0.86 + 0.14 * Math.sin(elapsed * 0.38);
        const chromR = ctx.createRadialGradient(aCore.x + S * 0.011, aCore.y, 0, aCore.x + S * 0.011, aCore.y, S * 0.052);
        chromR.addColorStop(0.58,"rgba(0,0,0,0)");
        chromR.addColorStop(0.82,`rgba(255,68,48,${0.058 * pulse})`);
        chromR.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = chromR; ctx.fillRect(0, 0, W, H);

        const chromB = ctx.createRadialGradient(aCore.x - S * 0.011, aCore.y, 0, aCore.x - S * 0.011, aCore.y, S * 0.052);
        chromB.addColorStop(0.58,"rgba(0,0,0,0)");
        chromB.addColorStop(0.82,`rgba(48,68,255,${0.058 * pulse})`);
        chromB.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = chromB; ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();

      // Diffraction spikes — drawn separately for precise control
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.translate(aCore.x, aCore.y);
      const pulse = 0.86 + 0.14 * Math.sin(elapsed * 0.38);
      const spikeLen = S * (isMobile ? 0.12 : 0.17);
      // Primary cross (horizontal + vertical)
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
        const ex = Math.cos(a) * spikeLen;
        const ey = Math.sin(a) * spikeLen;
        const g = ctx.createLinearGradient(0, 0, ex, ey);
        g.addColorStop(0,   `rgba(255,255,255,${0.45 * pulse})`);
        g.addColorStop(0.08,`rgba(210,238,255,${0.28 * pulse})`);
        g.addColorStop(0.28,`rgba(150,200,255,${0.10 * pulse})`);
        g.addColorStop(0.55,`rgba(90,155,255,${0.03 * pulse})`);
        g.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ex, ey); ctx.stroke();
      }
      // Diagonal spikes (shorter, secondary)
      for (let a = Math.PI / 4; a < Math.PI * 2; a += Math.PI / 2) {
        const ex = Math.cos(a) * spikeLen * 0.55;
        const ey = Math.sin(a) * spikeLen * 0.55;
        const g = ctx.createLinearGradient(0, 0, ex, ey);
        g.addColorStop(0,   `rgba(200,232,255,${0.22 * pulse})`);
        g.addColorStop(0.4, `rgba(140,190,255,${0.06 * pulse})`);
        g.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ex, ey); ctx.stroke();
      }
      ctx.restore();

      // ════════════════════════════════════════════════════════════════════════
      // LAYER E: DARK DUST LANES (z≈0.21 — closest element, most parallax)
      // Dense opaque gas clouds that block the light of the nebula behind them.
      // This is the single most important element for communicating SCALE.
      //
      // When the camera moves, the dust lanes shift MORE than the nebula behind
      // them — the silhouette slides against the glowing backdrop, creating
      // an unmistakable sense of foreground/background separation.
      //
      // The technique: draw dark filled bezier paths in source-over mode.
      // They darken the regions where foreground gas blocks background light.
      // ════════════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      {
        // PRIMARY DUST LANE — sweeps diagonally from upper-right toward lower-left
        // Separates the bright right arm from the main pillar
        ctx.beginPath();
        ctx.moveTo(W * 0.54 + aDust.x * 0.30, -50 + aDust.y * 0.50);
        ctx.bezierCurveTo(
          W * 0.45 + aDust.x * 0.24, H * 0.18 + aDust.y * 0.40,
          W * 0.32 + aDust.x * 0.18, H * 0.35 + aDust.y * 0.30,
          W * 0.09 + aDust.x * 0.14, H * 0.50 + aDust.y * 0.22
        );
        ctx.bezierCurveTo(
          W * 0.03 + aDust.x * 0.10, H * 0.58 + aDust.y * 0.16,
          -30    + aDust.x * 0.07, H * 0.70 + aDust.y * 0.12,
          -65    + aDust.x * 0.04, H * 0.82 + aDust.y * 0.08
        );
        ctx.lineTo(-80, H + 80);
        ctx.lineTo(-80, -80);
        ctx.closePath();
        const dl1 = ctx.createLinearGradient(W * 0.52, 0, W * 0.12, H * 0.52);
        dl1.addColorStop(0,   "rgba(1,2,8,0)");
        dl1.addColorStop(0.18,"rgba(1,2,8,0.60)");
        dl1.addColorStop(0.52,"rgba(1,2,8,0.74)");
        dl1.addColorStop(0.84,"rgba(1,2,8,0.48)");
        dl1.addColorStop(1,   "rgba(1,2,8,0.12)");
        ctx.fillStyle = dl1;
        ctx.fill();

        // SECONDARY DUST LANE — right side, separates right arm from edge
        ctx.beginPath();
        ctx.moveTo(W * 0.81 + aDust.x * 0.18, -30 + aDust.y * 0.38);
        ctx.bezierCurveTo(
          W * 0.77 + aDust.x * 0.14, H * 0.28 + aDust.y * 0.28,
          W * 0.73 + aDust.x * 0.10, H * 0.52 + aDust.y * 0.18,
          W * 0.67 + aDust.x * 0.07, H * 0.74 + aDust.y * 0.12
        );
        ctx.bezierCurveTo(
          W * 0.64 + aDust.x * 0.05, H * 0.84 + aDust.y * 0.08,
          W * 0.61 + aDust.x * 0.03, H * 0.93 + aDust.y * 0.04,
          W * 0.59 + aDust.x * 0.01, H + 60
        );
        ctx.lineTo(W + 60, H + 60);
        ctx.lineTo(W + 60, -60);
        ctx.closePath();
        const dl2 = ctx.createLinearGradient(W * 0.79, H * 0.08, W * 0.63, H * 0.78);
        dl2.addColorStop(0,   "rgba(1,2,8,0)");
        dl2.addColorStop(0.20,"rgba(1,2,8,0.50)");
        dl2.addColorStop(0.58,"rgba(1,2,8,0.65)");
        dl2.addColorStop(0.86,"rgba(1,2,8,0.36)");
        dl2.addColorStop(1,   "rgba(1,2,8,0.08)");
        ctx.fillStyle = dl2;
        ctx.fill();

        // TERTIARY DARK FILAMENT — thin dark tendril near the core
        // Creates the "Pillars of Creation" layered look
        ctx.beginPath();
        ctx.moveTo(W * 0.40 + aDust.x * 0.22, H * 0.20 + aDust.y * 0.35);
        ctx.bezierCurveTo(
          W * 0.36 + aDust.x * 0.18, H * 0.30 + aDust.y * 0.28,
          W * 0.30 + aDust.x * 0.14, H * 0.42 + aDust.y * 0.20,
          W * 0.22 + aDust.x * 0.10, H * 0.58 + aDust.y * 0.14
        );
        ctx.bezierCurveTo(
          W * 0.18 + aDust.x * 0.07, H * 0.68 + aDust.y * 0.10,
          W * 0.14 + aDust.x * 0.05, H * 0.80 + aDust.y * 0.06,
          W * 0.10 + aDust.x * 0.03, H + 50
        );
        ctx.lineTo(W * 0.28 + aDust.x * 0.03, H + 50);
        ctx.bezierCurveTo(
          W * 0.32 + aDust.x * 0.06, H * 0.78 + aDust.y * 0.08,
          W * 0.36 + aDust.x * 0.10, H * 0.64 + aDust.y * 0.14,
          W * 0.40 + aDust.x * 0.14, H * 0.52 + aDust.y * 0.20
        );
        ctx.bezierCurveTo(
          W * 0.44 + aDust.x * 0.16, H * 0.40 + aDust.y * 0.26,
          W * 0.46 + aDust.x * 0.18, H * 0.30 + aDust.y * 0.30,
          W * 0.44 + aDust.x * 0.20, H * 0.20 + aDust.y * 0.34
        );
        ctx.closePath();
        const dl3 = ctx.createLinearGradient(W * 0.4, H * 0.2, W * 0.24, H * 0.6);
        dl3.addColorStop(0,   "rgba(1,2,8,0)");
        dl3.addColorStop(0.25,"rgba(1,2,8,0.42)");
        dl3.addColorStop(0.6, "rgba(1,2,8,0.55)");
        dl3.addColorStop(1,   "rgba(1,2,8,0.18)");
        ctx.fillStyle = dl3;
        ctx.fill();
      }
      ctx.restore();

      // ════════════════════════════════════════════════════════════════════════
      // LAYER F: STARS
      // Stars are secondary to the nebula composition.
      // Near stars (high z) move strongly with the camera — parallax
      // makes them feel embedded in the 3D scene, not painted on glass.
      // ════════════════════════════════════════════════════════════════════════
      const warpFX = Math.min(Math.abs(scrollVelSmooth) * 0.040, 0.38);
      stars.forEach((s) => {
        s.x += s.vx; s.y += s.vy;
        if (s.x < 0) s.x = 1; if (s.x > 1) s.x = 0;
        if (s.y < 0) s.y = 1; if (s.y > 1) s.y = 0;

        const px = perspOff(cam.x, s.z);
        const py = perspOff(cam.y, s.z) - scrollY * s.z * 0.48;
        const sx = ((s.x * W + px) % W + W) % W;
        const sy = ((s.y * H + py) % H + H) % H;

        let b = s.brightness;
        if (s.twinkleSpeed > 0) b *= 0.55 + 0.45 * Math.sin(elapsed * s.twinkleSpeed + s.twinklePhase);
        b = Math.min(1, b + warpFX * s.z);

        let sr = 255, sg = 255, sb = 255;
        if (s.colorType === 1) { sr = 210; sg = 228; sb = 255; }
        else if (s.colorType === 2) { sr = 255; sg = 225; sb = 172; }

        // Diffraction spikes + halos for near bright stars
        if (s.z > 0.76 && b > 0.18) {
          const spike = s.size * 4.2;
          ctx.strokeStyle = `rgba(${sr},${sg},${sb},${b * 0.24})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(sx - spike, sy); ctx.lineTo(sx + spike, sy); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(sx, sy - spike * 0.72); ctx.lineTo(sx, sy + spike * 0.72); ctx.stroke();
        }
        if (s.z > 0.66 && b > 0.11) {
          const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.size * 4.8);
          halo.addColorStop(0, `rgba(${sr},${sg},${sb},${b * 0.13})`);
          halo.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = halo;
          ctx.beginPath(); ctx.arc(sx, sy, s.size * 4.8, 0, Math.PI * 2); ctx.fill();
        }

        ctx.fillStyle = `rgba(${sr},${sg},${sb},${b})`;
        ctx.beginPath(); ctx.arc(sx, sy, s.size, 0, Math.PI * 2); ctx.fill();
      });

      // ════════════════════════════════════════════════════════════════════════
      // LAYER G: VOLUMETRIC ATMOSPHERIC FOG
      // Foreground haze that obscures the distant structure.
      // Creates the sense of looking through light-years of gas.
      // The bottom haze makes the nebula feel like it rises from below.
      // ════════════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      {
        // Bottom atmospheric glow
        const botFog = ctx.createLinearGradient(0, H * 0.52, 0, H);
        botFog.addColorStop(0, "rgba(0,0,0,0)");
        botFog.addColorStop(0.65, "rgba(2,6,18,0)");
        botFog.addColorStop(1, "rgba(3,10,32,0.048)");
        ctx.fillStyle = botFog; ctx.fillRect(0, 0, W, H);

        // Left edge atmospheric scatter (light from off-screen structure)
        const leftEdge = ctx.createLinearGradient(0, 0, W * 0.10, 0);
        leftEdge.addColorStop(0, "rgba(4,16,42,0.058)");
        leftEdge.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = leftEdge; ctx.fillRect(0, 0, W, H);

        // Lens bloom — upper right (simulates telescope internal reflection)
        const bloomX = W * 0.76 + cam.x * 0.18;
        const bloomY = H * 0.07  + cam.y * 0.12;
        const bloom = ctx.createRadialGradient(bloomX, bloomY, 0, bloomX, bloomY, S * 0.30);
        bloom.addColorStop(0, "rgba(188,222,255,0.016)");
        bloom.addColorStop(0.45, "rgba(105,162,255,0.005)");
        bloom.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = bloom; ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();

      // Restore canvas tilt transform
      ctx.restore();

      // ════════════════════════════════════════════════════════════════════════
      // CONTENT READABILITY ZONES (fixed to screen — no tilt applied)
      // Dark zones ensure portfolio text remains legible over the nebula.
      // ════════════════════════════════════════════════════════════════════════
      const heroX = W * 0.5 + cam.x * 0.28;
      const heroY = H * 0.32 + cam.y * 0.20 - scrollY * 0.13;
      const heroBg = ctx.createRadialGradient(heroX, heroY, 0, heroX, heroY, S * 0.46);
      heroBg.addColorStop(0,   "rgba(1,3,12,0.46)");
      heroBg.addColorStop(0.42,"rgba(1,2,8,0.14)");
      heroBg.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = heroBg; ctx.fillRect(0, 0, W, H);

      // EVE section backlight (violet reserved)
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const eveX = W * 0.5 + cam.x * 0.22;
      const eveY = H * 0.90 + cam.y * 0.18 - scrollY * 0.26;
      const evG = ctx.createRadialGradient(eveX, eveY, 0, eveX, eveY, S * 0.35);
      evG.addColorStop(0,   "rgba(139,92,246,0.038)");
      evG.addColorStop(0.48,"rgba(79,70,229,0.012)");
      evG.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = evG; ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // ── CINEMATIC VIGNETTE ─────────────────────────────────────────────────
      // Shifts slightly with camera — reinforces perspective depth.
      // Darker edges frame the composition and focus the eye on the nebula.
      const vigX = W * 0.5 + cam.x * 0.09;
      const vigY = H * 0.5 + cam.y * 0.06;
      const vig  = ctx.createRadialGradient(vigX, vigY, Math.min(W, H) * 0.18, vigX, vigY, Math.max(W, H) * 0.90);
      vig.addColorStop(0,   "rgba(0,0,0,0)");
      vig.addColorStop(0.50,"rgba(0,0,0,0.055)");
      vig.addColorStop(0.76,"rgba(0,0,0,0.26)");
      vig.addColorStop(1,   "rgba(0,0,0,0.72)");
      ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

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
