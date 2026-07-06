import { useEffect, useRef, useState } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const mouseTargetRef = useRef({ x: 0.5, y: 0.5 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (!isClient) return;
    const handleMouse = (e: MouseEvent) => {
      mouseTargetRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const isMobile = window.innerWidth < 768;

    // ── GRAIN TEXTURE (once) ───────────────────────────────────────────────
    const gc = document.createElement("canvas");
    gc.width = 256; gc.height = 256;
    const gx = gc.getContext("2d")!;
    const gd = gx.createImageData(256, 256);
    for (let i = 0; i < gd.data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      gd.data[i] = v; gd.data[i+1] = v; gd.data[i+2] = v;
      gd.data[i+3] = Math.floor(Math.random() * 18 + 2);
    }
    gx.putImageData(gd, 0, 0);
    const grain = ctx.createPattern(gc, "repeat");

    // ── STAR FIELD (once, sparse) ─────────────────────────────────────────
    // 90% tiny faint, 10% slightly brighter — all sharp pinpoints, no glow
    const STARS = isMobile ? 200 : 360;
    const stars: Star[] = Array.from({ length: STARS }, (_, i) => {
      const faint = i < STARS * 0.88;
      return {
        x: Math.random(),
        y: Math.random(),
        size:    faint ? Math.random() * 0.38 + 0.14 : Math.random() * 0.55 + 0.40,
        opacity: faint ? Math.random() * 0.32 + 0.10 : Math.random() * 0.35 + 0.38,
      };
    });

    // ── RENDER ────────────────────────────────────────────────────────────
    const render = () => {
      // Smooth mouse
      mouseRef.current.x += (mouseTargetRef.current.x - mouseRef.current.x) * 0.025;
      mouseRef.current.y += (mouseTargetRef.current.y - mouseRef.current.y) * 0.025;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // ─ L1: PURE BLACK VOID ─────────────────────────────────────────────
      ctx.fillStyle = "#000003";
      ctx.fillRect(0, 0, width, height);

      // ─ L2: STAR FIELD — sharp pinpoints only, no bloom ─────────────────
      // White/steel-blue only
      stars.forEach((s, i) => {
        const shift = i < STARS * 0.7 ? 3 : 8;
        const sx = (s.x * width  + (mx - 0.5) * shift + width)  % width;
        const sy = (s.y * height + (my - 0.5) * shift * 0.7 + height) % height;
        const col = i % 5 === 0
          ? `rgba(190,215,255,${s.opacity})`   // steel blue tint
          : `rgba(255,255,255,${s.opacity})`;  // white
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // ─ L3: COSMIC DUST — barely perceptible atmospheric scatter ────────
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      // Very faint diffuse blue-gray across the upper half only
      {
        const dg = ctx.createRadialGradient(
          width * 0.50, height * 0.10, 0,
          width * 0.50, height * 0.50, height * 0.75
        );
        dg.addColorStop(0,   "rgba(140,175,210,0.06)");
        dg.addColorStop(0.5, "rgba(80,115,175,0.025)");
        dg.addColorStop(1.0, "rgba(0,0,0,0)");
        ctx.fillStyle = dg;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.restore();

      // ─ L4: NEBULA FILAMENTS ────────────────────────────────────────────
      // Two diagonal thread-like wisps: upper-left → center, upper-right → center
      // Monochromatic cool only: steel blue, pale cyan, soft white
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // ── Upper-left filament ─────────────────────────────────────────────
      // Anchor point upper-left, stretches toward center
      {
        // Main thread axis: rotated ~35° from vertical
        ctx.save();
        const ax = width * 0.12 + (mx - 0.5) * 18;
        const ay = height * 0.04 + (my - 0.5) * 12;
        ctx.translate(ax, ay);
        ctx.rotate(0.62); // ~35 degrees clockwise from up = points toward center

        // Primary thread — extremely thin
        const ft1 = ctx.createRadialGradient(0, 0, 0, 0, height * 0.22, height * 0.42);
        ft1.addColorStop(0,    "rgba(170, 210, 240, 0.24)");
        ft1.addColorStop(0.18, "rgba(130, 178, 225, 0.16)");
        ft1.addColorStop(0.42, "rgba(90, 140, 205, 0.07)");
        ft1.addColorStop(0.70, "rgba(50, 95, 175, 0.025)");
        ft1.addColorStop(1.0,  "rgba(0, 0, 0, 0)");
        // Squish to thread-like width
        ctx.save();
        ctx.scale(0.08, 1.0);
        ctx.fillStyle = ft1;
        ctx.fillRect(-height * 0.5, -height * 0.1, height, height * 0.55);
        ctx.restore();

        // Secondary branching filament — offset slightly, thinner
        ctx.save();
        ctx.translate(width * 0.015, -height * 0.04);
        ctx.rotate(0.12);
        ctx.scale(0.05, 1.0);
        const ft2 = ctx.createRadialGradient(0, 0, 0, 0, height * 0.18, height * 0.32);
        ft2.addColorStop(0,    "rgba(200, 228, 248, 0.18)");
        ft2.addColorStop(0.30, "rgba(155, 195, 230, 0.09)");
        ft2.addColorStop(1.0,  "rgba(0, 0, 0, 0)");
        ctx.fillStyle = ft2;
        ctx.fillRect(-height * 0.38, 0, height * 0.76, height * 0.40);
        ctx.restore();

        // Faint diffuse volume around filament
        ctx.save();
        ctx.scale(0.28, 1.0);
        const fv = ctx.createRadialGradient(0, height * 0.18, 0, 0, height * 0.18, height * 0.38);
        fv.addColorStop(0,   "rgba(100, 150, 210, 0.08)");
        fv.addColorStop(0.6, "rgba(60, 110, 185, 0.03)");
        fv.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = fv;
        ctx.fillRect(-height * 0.5, -height * 0.05, height, height * 0.55);
        ctx.restore();

        ctx.restore();
      }

      // ── Upper-right filament ────────────────────────────────────────────
      // Mirror: anchor upper-right, stretches toward center-left
      {
        ctx.save();
        const ax = width * 0.90 + (mx - 0.5) * 14;
        const ay = height * 0.04 + (my - 0.5) * 10;
        ctx.translate(ax, ay);
        ctx.rotate(-0.58); // ~33 degrees counter-clockwise from up = points toward center

        // Primary thread
        const ft1 = ctx.createRadialGradient(0, 0, 0, 0, height * 0.22, height * 0.44);
        ft1.addColorStop(0,    "rgba(160, 205, 238, 0.26)");
        ft1.addColorStop(0.20, "rgba(120, 172, 220, 0.17)");
        ft1.addColorStop(0.44, "rgba(80, 135, 202, 0.07)");
        ft1.addColorStop(0.72, "rgba(45, 90, 170, 0.025)");
        ft1.addColorStop(1.0,  "rgba(0, 0, 0, 0)");
        ctx.save();
        ctx.scale(0.08, 1.0);
        ctx.fillStyle = ft1;
        ctx.fillRect(-height * 0.5, -height * 0.10, height, height * 0.58);
        ctx.restore();

        // Secondary branch
        ctx.save();
        ctx.translate(-width * 0.012, -height * 0.03);
        ctx.rotate(-0.14);
        ctx.scale(0.05, 1.0);
        const ft2 = ctx.createRadialGradient(0, 0, 0, 0, height * 0.16, height * 0.30);
        ft2.addColorStop(0,    "rgba(195, 225, 248, 0.20)");
        ft2.addColorStop(0.35, "rgba(148, 190, 228, 0.10)");
        ft2.addColorStop(1.0,  "rgba(0, 0, 0, 0)");
        ctx.fillStyle = ft2;
        ctx.fillRect(-height * 0.36, 0, height * 0.72, height * 0.38);
        ctx.restore();

        // Faint diffuse volume
        ctx.save();
        ctx.scale(0.26, 1.0);
        const fv = ctx.createRadialGradient(0, height * 0.20, 0, 0, height * 0.20, height * 0.40);
        fv.addColorStop(0,   "rgba(95, 145, 208, 0.07)");
        fv.addColorStop(0.6, "rgba(55, 105, 182, 0.028)");
        fv.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = fv;
        ctx.fillRect(-height * 0.5, -height * 0.06, height, height * 0.58);
        ctx.restore();

        ctx.restore();
      }

      ctx.restore();

      // ─ L5: PLANET HORIZON — bottom-left, ~15% visible area ────────────
      // Center far off-screen so only thin arc shows
      {
        const pMX = (mx - 0.5) * 12;
        const pMY = (my - 0.5) * 8;
        // Push center deep off-screen: x = -55%, y = 160%
        const pCX = width  * (isMobile ? -0.60 : -0.55) + pMX;
        const pCY = height * (isMobile ? 1.65  : 1.60)  + pMY;
        // Radius: 1× height — controls how much arc is visible
        const pR  = height * (isMobile ? 1.08 : 1.02);

        // Planet body — completely black, occludes stars
        ctx.save();
        ctx.beginPath();
        ctx.arc(pCX, pCY, pR, 0, Math.PI * 2);
        // Near-black surface, not grey
        const pg = ctx.createRadialGradient(pCX, pCY, 0, pCX, pCY, pR);
        pg.addColorStop(0,   "rgba(4, 7, 16, 0.98)");
        pg.addColorStop(0.7, "rgba(2, 3, 8, 1.0)");
        pg.addColorStop(1.0, "rgba(0, 1, 3, 1.0)");
        ctx.fillStyle = pg;
        ctx.fill();
        ctx.restore();

        // Atmospheric rim — thin cyan-white glow along limb
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        // Outer atmospheric scatter (wide, soft)
        const atm = ctx.createRadialGradient(pCX, pCY, pR * 0.90, pCX, pCY, pR * 1.10);
        atm.addColorStop(0,    "rgba(0, 0, 0, 0)");
        atm.addColorStop(0.35, "rgba(10, 50, 150, 0.22)");
        atm.addColorStop(0.62, "rgba(35, 125, 235, 0.40)");
        atm.addColorStop(0.80, "rgba(100, 195, 255, 0.28)");
        atm.addColorStop(0.93, "rgba(160, 228, 255, 0.12)");
        atm.addColorStop(1.0,  "rgba(0, 0, 0, 0)");
        ctx.fillStyle = atm;
        ctx.fillRect(0, 0, width, height);

        // Inner sharp limb (bright cyan-white edge)
        const limb = ctx.createRadialGradient(pCX, pCY, pR * 0.95, pCX, pCY, pR * 1.02);
        limb.addColorStop(0,   "rgba(0, 0, 0, 0)");
        limb.addColorStop(0.4, "rgba(185, 230, 255, 0.32)");
        limb.addColorStop(0.75,"rgba(220, 245, 255, 0.20)");
        limb.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = limb;
        ctx.fillRect(0, 0, width, height);

        // Terminator halo (thinnest, brightest ring at the edge)
        const halo = ctx.createRadialGradient(pCX, pCY, pR * 0.97, pCX, pCY, pR * 1.005);
        halo.addColorStop(0,   "rgba(0, 0, 0, 0)");
        halo.addColorStop(0.5, "rgba(230, 248, 255, 0.30)");
        halo.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = halo;
        ctx.fillRect(0, 0, width, height);

        ctx.restore();
      }

      // ─ GRAIN ───────────────────────────────────────────────────────────
      if (grain) {
        ctx.save();
        ctx.globalAlpha = 0.030;
        ctx.globalCompositeOperation = "overlay";
        ctx.fillStyle = grain;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // ─ VIGNETTE — corners only, center stays dark naturally ────────────
      {
        const v = ctx.createRadialGradient(
          width * 0.5, height * 0.42, height * 0.12,
          width * 0.5, height * 0.48, height * 0.95
        );
        v.addColorStop(0,    "rgba(0,0,0,0)");
        v.addColorStop(0.72, "rgba(0,0,0,0.12)");
        v.addColorStop(1.0,  "rgba(0,0,0,0.62)");
        ctx.fillStyle = v;
        ctx.fillRect(0, 0, width, height);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isClient]);

  if (!isClient) {
    return <div className="fixed inset-0 w-full h-full bg-[#000003] pointer-events-none -z-40" />;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none -z-40 print:hidden block"
      id="cosmic-cinematic-bg"
    />
  );
}
