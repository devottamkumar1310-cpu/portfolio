import { useEffect, useRef, useState } from "react";

interface Star { x: number; y: number; r: number; a: number; }

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef    = useRef<number | null>(null);
  const mouseRef  = useRef({ x: 0.5, y: 0.5 });
  const mouseTgt  = useRef({ x: 0.5, y: 0.5 });
  const [ready, setReady] = useState(false);

  useEffect(() => { setReady(true); }, []);

  useEffect(() => {
    if (!ready) return;
    const onM = (e: MouseEvent) => {
      mouseTgt.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };
    window.addEventListener("mousemove", onM, { passive: true });
    return () => window.removeEventListener("mousemove", onM);
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let W = 0, H = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const mobile = W < 768;

    // ── Grain (once) ──────────────────────────────────────────────────────
    const gc = document.createElement("canvas");
    gc.width = 256; gc.height = 256;
    const gx = gc.getContext("2d")!;
    const gi = gx.createImageData(256, 256);
    for (let i = 0; i < gi.data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      gi.data[i] = v; gi.data[i+1] = v; gi.data[i+2] = v;
      gi.data[i+3] = Math.floor(Math.random() * 16 + 2);
    }
    gx.putImageData(gi, 0, 0);
    const grain = ctx.createPattern(gc, "repeat");

    // ── Stars — sparse, sharp, no glow ───────────────────────────────────
    const S = mobile ? 220 : 400;
    const stars: Star[] = Array.from({ length: S }, (_, i) => ({
      x: Math.random(), y: Math.random(),
      r: i < S * 0.82 ? Math.random() * 0.38 + 0.12 : Math.random() * 0.60 + 0.36,
      a: i < S * 0.82 ? Math.random() * 0.28 + 0.07 : Math.random() * 0.38 + 0.30,
    }));

    // ── Draw one filament tendril (thin wispy arm from an origin) ─────────
    // angle: direction the arm goes, len: how far, thinness: scale factor
    const tendril = (
      ox: number, oy: number,
      angle: number, len: number, thinness: number,
      col: string, peak: number
    ) => {
      ctx.save();
      ctx.translate(ox, oy);
      ctx.rotate(angle);
      ctx.scale(thinness, 1.0); // squish horizontally → thin thread

      // gradient runs along the arm (Y axis after rotation)
      const g = ctx.createRadialGradient(0, 0, 0, 0, len * 0.30, len);
      g.addColorStop(0,    `${col}${peak})`);
      g.addColorStop(0.25, `${col}${peak * 0.65})`);
      g.addColorStop(0.55, `${col}${peak * 0.25})`);
      g.addColorStop(1.0,  "rgba(0,0,0,0)");
      ctx.fillStyle = g;

      // Draw in the rotated/squished space
      ctx.beginPath();
      ctx.ellipse(0, len * 0.30, len * thinness, len * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // ── Bright star-node at filament core ─────────────────────────────────
    const starNode = (cx: number, cy: number, sz: number) => {
      // Core white point
      ctx.beginPath();
      ctx.arc(cx, cy, sz, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(245, 252, 255, 0.92)";
      ctx.fill();

      // Inner cyan-white halo
      const h1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, sz * 8);
      h1.addColorStop(0,   "rgba(200, 238, 255, 0.55)");
      h1.addColorStop(0.3, "rgba(160, 215, 255, 0.22)");
      h1.addColorStop(0.7, "rgba(100, 175, 235, 0.07)");
      h1.addColorStop(1.0, "rgba(0,0,0,0)");
      ctx.fillStyle = h1;
      ctx.beginPath(); ctx.arc(cx, cy, sz * 8, 0, Math.PI * 2); ctx.fill();

      // Outer soft bloom
      const h2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, sz * 24);
      h2.addColorStop(0,   "rgba(140, 200, 255, 0.12)");
      h2.addColorStop(0.5, "rgba(80, 155, 235, 0.05)");
      h2.addColorStop(1.0, "rgba(0,0,0,0)");
      ctx.fillStyle = h2;
      ctx.beginPath(); ctx.arc(cx, cy, sz * 24, 0, Math.PI * 2); ctx.fill();
    };

    // ── Render ────────────────────────────────────────────────────────────
    const draw = () => {
      mouseRef.current.x += (mouseTgt.current.x - mouseRef.current.x) * 0.025;
      mouseRef.current.y += (mouseTgt.current.y - mouseRef.current.y) * 0.025;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // ─ 1. VOID ─────────────────────────────────────────────────────────
      ctx.fillStyle = "#000003";
      ctx.fillRect(0, 0, W, H);

      // ─ 2. STARS — sharp pinpoints only ─────────────────────────────────
      stars.forEach((s, i) => {
        const ms = i < S * 0.6 ? 2.5 : i < S * 0.88 ? 7 : 16;
        const sx = (s.x * W + (mx - 0.5) * ms + W) % W;
        const sy = (s.y * H + (my - 0.5) * ms * 0.75 + H) % H;
        // Cool white or faint steel-blue
        const col = i % 6 === 0
          ? `rgba(180, 210, 255, ${s.a})`
          : `rgba(255, 255, 255, ${s.a})`;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // ─ 3. FILAMENTS ────────────────────────────────────────────────────
      // Using screen blend so they only add light, never darken
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      const filmColor = "rgba(130, 190, 245, "; // steel-blue/cyan — no purple

      // ── LEFT FILAMENT — node at ~(26%, 36%) ────────────────────────────
      {
        const fx = W * 0.26 + (mx - 0.5) * 20;
        const fy = H * 0.36 + (my - 0.5) * 13;

        // Primary arm: upper-left (NW direction)
        tendril(fx, fy, -2.30, H * 0.42, 0.055, filmColor, 0.28);
        // Secondary arm: slightly offset NW
        tendril(fx - W * 0.01, fy + H * 0.01, -2.48, H * 0.32, 0.038, filmColor, 0.18);
        // Arm going upper-right (NE-ish, shorter)
        tendril(fx, fy, -0.88, H * 0.28, 0.045, filmColor, 0.20);
        // Arm going down-right toward center (SE)
        tendril(fx, fy, 0.72, H * 0.36, 0.050, filmColor, 0.22);
        // Faint branch off the main NW arm
        tendril(fx - W * 0.04, fy - H * 0.08, -2.10, H * 0.22, 0.030, filmColor, 0.14);
        // Diffuse background volume (wide, very faint)
        {
          const dg = ctx.createRadialGradient(fx, fy, 0, fx, fy, W * 0.28);
          dg.addColorStop(0,   "rgba(60, 120, 210, 0.10)");
          dg.addColorStop(0.4, "rgba(30, 80, 175, 0.04)");
          dg.addColorStop(1.0, "rgba(0,0,0,0)");
          ctx.fillStyle = dg;
          ctx.fillRect(0, 0, W, H);
        }
        // Bright node
        starNode(fx, fy, 1.4);
      }

      // ── RIGHT FILAMENT — node at ~(76%, 41%) ───────────────────────────
      // Asymmetric to left — different angles, different arm weights
      {
        const fx = W * 0.76 + (mx - 0.5) * 15;
        const fy = H * 0.41 + (my - 0.5) * 10;

        // Primary arm: upper-right (NE)
        tendril(fx, fy, -0.78, H * 0.38, 0.050, filmColor, 0.26);
        // Secondary arm: going down-left (SW toward center-bottom)
        tendril(fx, fy, 2.20, H * 0.30, 0.042, filmColor, 0.20);
        // Arm going up-left (NW, shorter)
        tendril(fx, fy, -2.55, H * 0.24, 0.038, filmColor, 0.16);
        // Short arm going right (E)
        tendril(fx, fy, 0.12, H * 0.20, 0.035, filmColor, 0.14);
        // Faint branch off NE arm
        tendril(fx + W * 0.04, fy - H * 0.06, -0.55, H * 0.18, 0.028, filmColor, 0.12);
        // Diffuse background volume
        {
          const dg = ctx.createRadialGradient(fx, fy, 0, fx, fy, W * 0.24);
          dg.addColorStop(0,   "rgba(55, 115, 205, 0.09)");
          dg.addColorStop(0.4, "rgba(28, 75, 168, 0.035)");
          dg.addColorStop(1.0, "rgba(0,0,0,0)");
          ctx.fillStyle = dg;
          ctx.fillRect(0, 0, W, H);
        }
        // Bright node (slightly smaller than left — asymmetry)
        starNode(fx, fy, 1.15);
      }

      ctx.restore();

      // ─ 4. PLANET BODY ─────────────────────────────────────────────────
      // Center precisely tuned: arc enters left edge at ~0.50H,
      // exits bottom at ~0.50W — matches reference composition
      {
        const pMX = (mx - 0.5) * 10;
        const pMY = (my - 0.5) * 7;
        const pCX = W * (mobile ? 0.04  : 0.00) + pMX;  // at or near left edge
        const pCY = H * (mobile ? 1.58  : 1.55) + pMY;  // well below viewport
        const pR  = H * (mobile ? 1.08  : 1.05);         // arc geometry per reference

        // Dark planet body
        ctx.save();
        ctx.beginPath();
        ctx.arc(pCX, pCY, pR, 0, Math.PI * 2);
        const pg = ctx.createRadialGradient(pCX, pCY, 0, pCX, pCY, pR);
        pg.addColorStop(0,    "rgba(6, 10, 22, 0.99)");
        pg.addColorStop(0.65, "rgba(2, 4, 9, 1.0)");
        pg.addColorStop(1.0,  "rgba(0, 1, 3, 1.0)");
        ctx.fillStyle = pg;
        ctx.fill();
        ctx.restore();

        // ── Atmospheric rim — thin, elegant, cyan-white ────────────────
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        // Outer atmospheric scatter (wider, softer)
        const atm = ctx.createRadialGradient(pCX, pCY, pR * 0.91, pCX, pCY, pR * 1.09);
        atm.addColorStop(0,    "rgba(0,0,0,0)");
        atm.addColorStop(0.30, "rgba(8, 42, 145, 0.20)");
        atm.addColorStop(0.58, "rgba(28, 115, 235, 0.36)");
        atm.addColorStop(0.78, "rgba(90, 190, 255, 0.28)");
        atm.addColorStop(0.94, "rgba(155, 228, 255, 0.12)");
        atm.addColorStop(1.0,  "rgba(0,0,0,0)");
        ctx.fillStyle = atm;
        ctx.fillRect(0, 0, W, H);

        // Sharp inner limb (the bright white-cyan edge)
        const limb = ctx.createRadialGradient(pCX, pCY, pR * 0.955, pCX, pCY, pR * 1.018);
        limb.addColorStop(0,    "rgba(0,0,0,0)");
        limb.addColorStop(0.40, "rgba(175, 228, 255, 0.38)");
        limb.addColorStop(0.72, "rgba(218, 245, 255, 0.28)");
        limb.addColorStop(1.0,  "rgba(0,0,0,0)");
        ctx.fillStyle = limb;
        ctx.fillRect(0, 0, W, H);

        // Terminator ring — very thin, brightest element of planet
        const term = ctx.createRadialGradient(pCX, pCY, pR * 0.978, pCX, pCY, pR * 1.004);
        term.addColorStop(0,   "rgba(0,0,0,0)");
        term.addColorStop(0.5, "rgba(238, 252, 255, 0.42)");
        term.addColorStop(1.0, "rgba(0,0,0,0)");
        ctx.fillStyle = term;
        ctx.fillRect(0, 0, W, H);

        ctx.restore();
      }

      // ─ 5. GRAIN ────────────────────────────────────────────────────────
      if (grain) {
        ctx.save();
        ctx.globalAlpha = 0.028;
        ctx.globalCompositeOperation = "overlay";
        ctx.fillStyle = grain;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // ─ 6. VIGNETTE — corners only, NEVER center ────────────────────────
      // Corner darkening (keeps filaments from being too bright at edges)
      const corners: [number, number][] = [[0, 0], [W, 0], [W, H], [0, H]];
      corners.forEach(([cx, cy]) => {
        const cv = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.48);
        cv.addColorStop(0,   "rgba(0,0,0,0.38)");
        cv.addColorStop(0.5, "rgba(0,0,0,0.10)");
        cv.addColorStop(1.0, "rgba(0,0,0,0)");
        ctx.fillStyle = cv;
        ctx.fillRect(0, 0, W, H);
      });

      // Center preservation — explicit: no darkening in hero text zone
      // (Just a very mild overall radial from extreme edges)
      const ve = ctx.createRadialGradient(W*0.5, H*0.45, H*0.25, W*0.5, H*0.48, H*0.95);
      ve.addColorStop(0,   "rgba(0,0,0,0)");
      ve.addColorStop(0.8, "rgba(0,0,0,0.08)");
      ve.addColorStop(1.0, "rgba(0,0,0,0.45)");
      ctx.fillStyle = ve;
      ctx.fillRect(0, 0, W, H);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [ready]);

  if (!ready) return <div className="fixed inset-0 bg-[#000003] pointer-events-none -z-40" />;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none -z-40 print:hidden"
      id="cosmic-bg"
    />
  );
}
