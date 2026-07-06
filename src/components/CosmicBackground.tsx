import { useEffect, useRef, useState } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
}

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const mouseTargetRef = useRef({ x: 0.5, y: 0.5 });
  const scrollYRef = useRef(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (!isClient) return;
    const handleScroll = () => { scrollYRef.current = window.scrollY; };
    const handleMouse = (e: MouseEvent) => {
      mouseTargetRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouse);
    };
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
      const dpr = window.devicePixelRatio || 1;
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

    // ─── GRAIN TEXTURE (precomputed once) ─────────────────────────────────
    const grainCanvas = document.createElement("canvas");
    grainCanvas.width = 256; grainCanvas.height = 256;
    const gctx = grainCanvas.getContext("2d")!;
    const imgData = gctx.createImageData(256, 256);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      imgData.data[i] = v; imgData.data[i+1] = v; imgData.data[i+2] = v;
      imgData.data[i+3] = Math.floor(Math.random() * 22 + 3);
    }
    gctx.putImageData(imgData, 0, 0);
    const grainPattern = ctx.createPattern(grainCanvas, "repeat");

    // ─── STAR FIELD (precomputed) ─────────────────────────────────────────
    const STAR_COUNT = isMobile ? 260 : 440;
    const stars: Star[] = [];
    const starColors = [
      "rgba(255,255,255,", "rgba(220,238,255,",
      "rgba(190,215,255,", "rgba(255,252,230,",
    ];
    for (let i = 0; i < STAR_COUNT; i++) {
      const roll = Math.random();
      const size    = roll < 0.68 ? Math.random() * 0.42 + 0.18
                    : roll < 0.92 ? Math.random() * 0.60 + 0.44
                    :               Math.random() * 0.85 + 0.90;
      const opacity = roll < 0.68 ? Math.random() * 0.38 + 0.12
                    : roll < 0.92 ? Math.random() * 0.45 + 0.22
                    :               Math.random() * 0.38 + 0.48;
      stars.push({
        x: Math.random(), y: Math.random(), size, opacity,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    // ─── RENDER ──────────────────────────────────────────────────────────
    const render = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = (time - startTimeRef.current) * 0.001;

      mouseRef.current.x += (mouseTargetRef.current.x - mouseRef.current.x) * 0.03;
      mouseRef.current.y += (mouseTargetRef.current.y - mouseRef.current.y) * 0.03;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // ── LAYER 1: BLACK SPACE ──────────────────────────────────────────
      ctx.fillStyle = "#000004";
      ctx.fillRect(0, 0, width, height);

      // ── LAYER 2: STAR FIELD ───────────────────────────────────────────
      stars.forEach((star, i) => {
        const layer   = i < STAR_COUNT * 0.65 ? 0 : i < STAR_COUNT * 0.92 ? 1 : 2;
        const mScale  = layer === 0 ? 4 : layer === 1 ? 10 : 20;
        const sx = (star.x * width  + (mx - 0.5) * mScale + width)  % width;
        const sy = (star.y * height + (my - 0.5) * mScale * 0.75 + height) % height;
        if (sy < 0 || sy > height) return;
        if (star.size > 1.05) {
          const bl = ctx.createRadialGradient(sx, sy, 0, sx, sy, star.size * 4.5);
          bl.addColorStop(0, `${star.color}${star.opacity * 0.5})`);
          bl.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = bl;
          ctx.beginPath(); ctx.arc(sx, sy, star.size * 4.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = `${star.color}${star.opacity})`;
        ctx.beginPath(); ctx.arc(sx, sy, star.size, 0, Math.PI * 2); ctx.fill();
      });

      // ── LAYER 3: NEBULAE (left + right volumetric clouds) ─────────────
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // ─ LEFT NEBULA — large, centered left-third, fills upper-left area
      {
        const lx = width * 0.08 + (mx - 0.5) * 16 + Math.sin(elapsed * 0.04) * 5;
        const ly = height * 0.38 + (my - 0.5) * 10 + Math.cos(elapsed * 0.03) * 4;

        // Outer volume — wide soft glow
        const lg1 = ctx.createRadialGradient(lx, ly, 0, lx, ly, width * 0.55);
        lg1.addColorStop(0,    "rgba(30, 75, 190, 0.28)");
        lg1.addColorStop(0.30, "rgba(20, 55, 160, 0.16)");
        lg1.addColorStop(0.60, "rgba(12, 35, 115, 0.07)");
        lg1.addColorStop(1.0,  "rgba(0, 0, 0, 0)");
        ctx.fillStyle = lg1;
        ctx.fillRect(0, 0, width, height);

        // Inner brighter core (makes it look volumetric)
        const lg2 = ctx.createRadialGradient(lx + width * 0.04, ly - height * 0.05, 0, lx, ly, width * 0.28);
        lg2.addColorStop(0,    "rgba(60, 130, 240, 0.20)");
        lg2.addColorStop(0.40, "rgba(40, 95, 210, 0.10)");
        lg2.addColorStop(1.0,  "rgba(0, 0, 0, 0)");
        ctx.fillStyle = lg2;
        ctx.fillRect(0, 0, width, height);

        // Wispy extension toward upper-left
        {
          ctx.save();
          ctx.translate(lx - width * 0.10, ly - height * 0.18);
          ctx.rotate(-0.30);
          ctx.scale(0.30, 1.0);
          const wg = ctx.createRadialGradient(0, 0, 0, 0, 0, height * 0.35);
          wg.addColorStop(0,   "rgba(80, 150, 255, 0.14)");
          wg.addColorStop(0.5, "rgba(40, 100, 220, 0.06)");
          wg.addColorStop(1.0, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = wg;
          ctx.fillRect(-height * 0.45, -height * 0.45, height * 0.9, height * 0.9);
          ctx.restore();
        }
      }

      // ─ RIGHT NEBULA — diagonal wisps, upper-right quadrant
      {
        const rx = width * 0.82 + (mx - 0.5) * 12;
        const ry = height * 0.28 + (my - 0.5) * 8;

        // Outer soft volume
        const rg1 = ctx.createRadialGradient(rx, ry, 0, rx, ry, width * 0.48);
        rg1.addColorStop(0,    "rgba(30, 90, 210, 0.22)");
        rg1.addColorStop(0.35, "rgba(20, 65, 175, 0.12)");
        rg1.addColorStop(0.70, "rgba(10, 35, 120, 0.05)");
        rg1.addColorStop(1.0,  "rgba(0, 0, 0, 0)");
        ctx.fillStyle = rg1;
        ctx.fillRect(0, 0, width, height);

        // Bright inner core
        const rg2 = ctx.createRadialGradient(rx - width * 0.03, ry - height * 0.04, 0, rx, ry, width * 0.24);
        rg2.addColorStop(0,    "rgba(100, 175, 255, 0.22)");
        rg2.addColorStop(0.35, "rgba(65, 135, 245, 0.11)");
        rg2.addColorStop(1.0,  "rgba(0, 0, 0, 0)");
        ctx.fillStyle = rg2;
        ctx.fillRect(0, 0, width, height);

        // Primary diagonal wisp — thin, long, characteristic streak
        {
          ctx.save();
          ctx.translate(rx - width * 0.04, ry + height * 0.02);
          ctx.rotate(-0.52);
          ctx.scale(0.12, 1.0);
          const wg = ctx.createRadialGradient(0, -height * 0.06, 0, 0, 0, height * 0.44);
          wg.addColorStop(0,    "rgba(180, 218, 255, 0.26)");
          wg.addColorStop(0.28, "rgba(140, 188, 255, 0.14)");
          wg.addColorStop(0.60, "rgba(90, 145, 245, 0.06)");
          wg.addColorStop(1.0,  "rgba(0, 0, 0, 0)");
          ctx.fillStyle = wg;
          ctx.fillRect(-height * 0.55, -height * 0.55, height * 1.1, height * 1.1);
          ctx.restore();
        }

        // Secondary wisp — further upper right
        {
          ctx.save();
          ctx.translate(width * 0.93 + (mx - 0.5) * 8, height * 0.12 + (my - 0.5) * 6);
          ctx.rotate(-0.38);
          ctx.scale(0.10, 1.0);
          const wg = ctx.createRadialGradient(0, 0, 0, 0, 0, height * 0.30);
          wg.addColorStop(0,   "rgba(200, 228, 255, 0.20)");
          wg.addColorStop(0.4, "rgba(155, 198, 255, 0.09)");
          wg.addColorStop(1.0, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = wg;
          ctx.fillRect(-height * 0.38, -height * 0.38, height * 0.76, height * 0.76);
          ctx.restore();
        }
      }

      ctx.restore();

      // ── LAYER 4: PLANET BODY — small, bottom-left corner only ─────────
      // Center pushed far off-screen so only a thin arc shows
      {
        const pMX = (mx - 0.5) * 14;
        const pMY = (my - 0.5) * 10;
        // Aggressively push center out: -50% left, 155% down
        const pCX = width  * (isMobile ? -0.55 : -0.50) + pMX;
        const pCY = height * (isMobile ? 1.60  : 1.55)  + pMY;
        // Use height (not max) as base so arc is proportionally smaller on wide screens
        const pR  = height * (isMobile ? 1.05 : 1.00);

        // Dark planet body (occludes stars beneath the arc)
        ctx.save();
        ctx.beginPath();
        ctx.arc(pCX, pCY, pR, 0, Math.PI * 2);
        const bodyGrad = ctx.createRadialGradient(
          pCX + pR * 0.32, pCY - pR * 0.42, 0,
          pCX, pCY, pR
        );
        bodyGrad.addColorStop(0,    "rgba(10, 18, 42, 0.96)");
        bodyGrad.addColorStop(0.30, "rgba(5, 10, 24, 0.99)");
        bodyGrad.addColorStop(0.75, "rgba(2, 4, 9, 1.0)");
        bodyGrad.addColorStop(1.0,  "rgba(1, 2, 5, 1.0)");
        ctx.fillStyle = bodyGrad;
        ctx.fill();
        ctx.restore();

        // Atmospheric rim glow layers
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        // Wide outer scatter
        const outerAtm = ctx.createRadialGradient(pCX, pCY, pR * 0.86, pCX, pCY, pR * 1.10);
        outerAtm.addColorStop(0,    "rgba(0, 0, 0, 0)");
        outerAtm.addColorStop(0.40, "rgba(12, 55, 165, 0.20)");
        outerAtm.addColorStop(0.68, "rgba(40, 135, 255, 0.38)");
        outerAtm.addColorStop(0.84, "rgba(105, 200, 255, 0.26)");
        outerAtm.addColorStop(0.95, "rgba(165, 232, 255, 0.10)");
        outerAtm.addColorStop(1.0,  "rgba(0, 0, 0, 0)");
        ctx.fillStyle = outerAtm;
        ctx.fillRect(0, 0, width, height);

        // Sharp limb highlight
        const limb = ctx.createRadialGradient(pCX, pCY, pR * 0.94, pCX, pCY, pR * 1.02);
        limb.addColorStop(0,   "rgba(0, 0, 0, 0)");
        limb.addColorStop(0.4, "rgba(145, 215, 255, 0.30)");
        limb.addColorStop(0.75,"rgba(200, 240, 255, 0.18)");
        limb.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = limb;
        ctx.fillRect(0, 0, width, height);

        // Sunlight backscatter at arc peak
        const bx = pCX + pR * 0.46;
        const by = pCY - pR * 0.52;
        const bs = ctx.createRadialGradient(bx, by, 0, bx, by, pR * 0.36);
        bs.addColorStop(0,    "rgba(200, 238, 255, 0.22)");
        bs.addColorStop(0.40, "rgba(130, 195, 255, 0.12)");
        bs.addColorStop(1.0,  "rgba(0, 0, 0, 0)");
        ctx.fillStyle = bs;
        ctx.fillRect(0, 0, width, height);

        ctx.restore();
      }

      // ── LAYER 5: LIGHT VOLUME (faint diagonal from upper-right) ──────────
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      {
        const lx = width * 0.94 + (mx - 0.5) * 16;
        const ly = height * -0.06 + (my - 0.5) * 10;
        const lg = ctx.createLinearGradient(lx, ly, lx - width * 0.65, ly + height * 1.0);
        lg.addColorStop(0,   "rgba(190, 225, 255, 0.05)");
        lg.addColorStop(0.4, "rgba(120, 175, 255, 0.022)");
        lg.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = lg;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.restore();

      // ── LAYER 6: FILM GRAIN ───────────────────────────────────────────────
      if (grainPattern) {
        ctx.save();
        ctx.globalAlpha = 0.036;
        ctx.globalCompositeOperation = "overlay";
        ctx.fillStyle = grainPattern;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // ── LAYER 7: VIGNETTE — keeps center open and dark ───────────────────
      {
        // Stronger on top/right to let nebulae fade naturally
        const vig = ctx.createRadialGradient(
          width * 0.50, height * 0.40, height * 0.15,
          width * 0.50, height * 0.48, height * 0.90
        );
        vig.addColorStop(0,   "rgba(0,0,0,0)");
        vig.addColorStop(0.65,"rgba(0,0,0,0.14)");
        vig.addColorStop(1.0, "rgba(0,0,0,0.58)");
        ctx.fillStyle = vig;
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
    return <div className="fixed inset-0 w-full h-full bg-[#000004] pointer-events-none -z-40" />;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none -z-40 print:hidden block"
      id="cosmic-cinematic-bg"
    />
  );
}
