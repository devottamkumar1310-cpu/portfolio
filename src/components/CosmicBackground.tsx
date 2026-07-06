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

    // ─── PRECOMPUTE GRAIN TEXTURE ─────────────────────────────────────────
    const grainSize = 256;
    const grainCanvas = document.createElement("canvas");
    grainCanvas.width = grainSize;
    grainCanvas.height = grainSize;
    const gctx = grainCanvas.getContext("2d")!;
    const imgData = gctx.createImageData(grainSize, grainSize);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      imgData.data[i]     = v;
      imgData.data[i + 1] = v;
      imgData.data[i + 2] = v;
      imgData.data[i + 3] = Math.floor(Math.random() * 28 + 4);
    }
    gctx.putImageData(imgData, 0, 0);
    const grainPattern = ctx.createPattern(grainCanvas, "repeat");

    // ─── PRECOMPUTE STAR FIELD ────────────────────────────────────────────
    const STAR_COUNT = isMobile ? 280 : 480;
    const stars: Star[] = [];
    const starColorPalette = [
      "rgba(255,255,255,",
      "rgba(220,238,255,",
      "rgba(190,215,255,",
      "rgba(170,205,255,",
      "rgba(255,252,230,",  // slightly warm (rare)
    ];

    for (let i = 0; i < STAR_COUNT; i++) {
      const roll = Math.random();
      let size: number, opacity: number;
      if (roll < 0.65) {
        // Majority: tiny distant stars
        size = Math.random() * 0.45 + 0.18;
        opacity = Math.random() * 0.4 + 0.12;
      } else if (roll < 0.90) {
        // Mid: slightly brighter
        size = Math.random() * 0.65 + 0.45;
        opacity = Math.random() * 0.5 + 0.25;
      } else {
        // Few: prominent with micro-bloom
        size = Math.random() * 0.9 + 0.9;
        opacity = Math.random() * 0.4 + 0.5;
      }
      stars.push({
        x: Math.random(),
        y: Math.random(),
        size,
        opacity,
        color: starColorPalette[Math.floor(Math.random() * starColorPalette.length)],
      });
    }

    // ─── RENDER LOOP ──────────────────────────────────────────────────────
    const render = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = (time - startTimeRef.current) * 0.001; // seconds

      // Smooth mouse parallax
      mouseRef.current.x += (mouseTargetRef.current.x - mouseRef.current.x) * 0.03;
      mouseRef.current.y += (mouseTargetRef.current.y - mouseRef.current.y) * 0.03;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // ── 1. BASE: PURE BLACK SPACE ────────────────────────────────────────
      ctx.fillStyle = "#000005";
      ctx.fillRect(0, 0, width, height);

      // ── 2. STAR FIELD ────────────────────────────────────────────────────
      stars.forEach((star, i) => {
        const layer = i < STAR_COUNT * 0.6 ? 0 : i < STAR_COUNT * 0.9 ? 1 : 2;
        const mScale = layer === 0 ? 5 : layer === 1 ? 12 : 22;

        const sx = (star.x * width  + (mx - 0.5) * mScale  + width)  % width;
        const sy = (star.y * height + (my - 0.5) * mScale * 0.75 + height) % height;

        // Micro-bloom for bright stars
        if (star.size > 1.1) {
          const bloom = ctx.createRadialGradient(sx, sy, 0, sx, sy, star.size * 5);
          bloom.addColorStop(0,   `${star.color}${star.opacity * 0.45})`);
          bloom.addColorStop(0.5, `${star.color}${star.opacity * 0.12})`);
          bloom.addColorStop(1.0, "rgba(0,0,0,0)");
          ctx.fillStyle = bloom;
          ctx.beginPath();
          ctx.arc(sx, sy, star.size * 5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `${star.color}${star.opacity})`;
        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── 3. NEBULA WISPS (right side, diagonal — like the reference) ──────
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // Primary diagonal wisp — upper right going top-right to center
      {
        ctx.save();
        const tx = width * 0.76 + (mx - 0.5) * 14;
        const ty = height * 0.30 + (my - 0.5) * 9;
        ctx.translate(tx, ty);
        ctx.rotate(-0.52); // ~-30 degrees diagonal
        ctx.scale(0.14, 1.0); // very narrow = wispy

        const wg = ctx.createRadialGradient(0, -height * 0.08, 0, 0, 0, height * 0.48);
        wg.addColorStop(0,   "rgba(180, 215, 255, 0.22)");
        wg.addColorStop(0.25,"rgba(150, 190, 255, 0.14)");
        wg.addColorStop(0.6, "rgba(100, 155, 245, 0.06)");
        wg.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = wg;
        ctx.fillRect(-height * 0.6, -height * 0.6, height * 1.2, height * 1.2);
        ctx.restore();
      }

      // Secondary wisp — further right, slightly different angle
      {
        ctx.save();
        const tx = width * 0.88 + (mx - 0.5) * 10;
        const ty = height * 0.16 + (my - 0.5) * 7;
        ctx.translate(tx, ty);
        ctx.rotate(-0.40);
        ctx.scale(0.11, 1.0);

        const wg = ctx.createRadialGradient(0, 0, 0, 0, 0, height * 0.36);
        wg.addColorStop(0,   "rgba(200, 228, 255, 0.18)");
        wg.addColorStop(0.35,"rgba(160, 200, 255, 0.09)");
        wg.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = wg;
        ctx.fillRect(-height * 0.45, -height * 0.45, height * 0.9, height * 0.9);
        ctx.restore();
      }

      // Tertiary faint upper-center wisp (adds depth)
      {
        ctx.save();
        const tx = width * 0.60 + (mx - 0.5) * 8;
        const ty = height * 0.08 + (my - 0.5) * 5;
        ctx.translate(tx, ty);
        ctx.rotate(-0.60);
        ctx.scale(0.09, 1.0);

        const wg = ctx.createRadialGradient(0, 0, 0, 0, 0, height * 0.28);
        wg.addColorStop(0,   "rgba(170, 205, 255, 0.12)");
        wg.addColorStop(0.5, "rgba(130, 170, 250, 0.05)");
        wg.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = wg;
        ctx.fillRect(-height * 0.35, -height * 0.35, height * 0.7, height * 0.7);
        ctx.restore();
      }

      // Left background nebula cloud (depth fill)
      {
        const lx = width * 0.10 + (mx - 0.5) * 10 + Math.sin(elapsed * 0.05) * 6;
        const ly = height * 0.38 + (my - 0.5) * 7;
        const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, width * 0.52);
        lg.addColorStop(0,    "rgba(25, 70, 180, 0.14)");
        lg.addColorStop(0.40, "rgba(15, 50, 140, 0.06)");
        lg.addColorStop(0.80, "rgba(8, 25, 80, 0.02)");
        lg.addColorStop(1.0,  "rgba(0, 0, 0, 0)");
        ctx.fillStyle = lg;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.restore();

      // ── 4. PLANET BODY (dark, occludes stars behind it) ──────────────────
      {
        const pMX = (mx - 0.5) * 20;
        const pMY = (my - 0.5) * 14;
        // Planet center: off-screen bottom-left
        const pCX = width * (isMobile ? -0.14 : -0.10) + pMX;
        const pCY = height * (isMobile ? 1.20 : 1.14) + pMY;
        const pR  = Math.max(width, height) * (isMobile ? 0.95 : 0.85);

        // Draw the dark planet body (occludes stars)
        ctx.save();
        ctx.beginPath();
        ctx.arc(pCX, pCY, pR, 0, Math.PI * 2);

        // Planet surface: nearly black, slight blue tint toward lit side
        const planetGrad = ctx.createRadialGradient(
          pCX + pR * 0.35, pCY - pR * 0.45, 0,
          pCX, pCY, pR
        );
        planetGrad.addColorStop(0,   "rgba(12, 22, 52, 0.97)"); // barely visible lit side
        planetGrad.addColorStop(0.25,"rgba(6, 12, 28, 0.99)");
        planetGrad.addColorStop(0.7, "rgba(2, 4, 10, 1.0)");
        planetGrad.addColorStop(1.0, "rgba(0, 1, 4, 1.0)");
        ctx.fillStyle = planetGrad;
        ctx.fill();
        ctx.restore();
      }

      // ── 5. PLANET ATMOSPHERIC RIM GLOW ───────────────────────────────────
      {
        const pMX = (mx - 0.5) * 20;
        const pMY = (my - 0.5) * 14;
        const pCX = width * (isMobile ? -0.14 : -0.10) + pMX;
        const pCY = height * (isMobile ? 1.20 : 1.14) + pMY;
        const pR  = Math.max(width, height) * (isMobile ? 0.95 : 0.85);

        ctx.save();
        ctx.globalCompositeOperation = "screen";

        // Wide outer atmospheric scatter
        const outerAtm = ctx.createRadialGradient(pCX, pCY, pR * 0.82, pCX, pCY, pR * 1.12);
        outerAtm.addColorStop(0,    "rgba(0, 0, 0, 0)");
        outerAtm.addColorStop(0.42, "rgba(15, 65, 175, 0.18)");
        outerAtm.addColorStop(0.68, "rgba(45, 140, 255, 0.38)");
        outerAtm.addColorStop(0.84, "rgba(110, 200, 255, 0.28)");
        outerAtm.addColorStop(0.95, "rgba(170, 235, 255, 0.12)");
        outerAtm.addColorStop(1.0,  "rgba(0, 0, 0, 0)");
        ctx.fillStyle = outerAtm;
        ctx.fillRect(0, 0, width, height);

        // Sharp inner limb — the bright atmospheric edge
        const limb = ctx.createRadialGradient(pCX, pCY, pR * 0.93, pCX, pCY, pR * 1.02);
        limb.addColorStop(0,   "rgba(0, 0, 0, 0)");
        limb.addColorStop(0.4, "rgba(150, 220, 255, 0.28)");
        limb.addColorStop(0.75,"rgba(200, 240, 255, 0.18)");
        limb.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = limb;
        ctx.fillRect(0, 0, width, height);

        // Sunlight scatter — bright spot on upper-right arc edge
        // (where the "sun" would be behind/above)
        const bx = pCX + pR * 0.48;
        const by = pCY - pR * 0.54;
        const sunscatter = ctx.createRadialGradient(bx, by, 0, bx, by, pR * 0.42);
        sunscatter.addColorStop(0,   "rgba(210, 240, 255, 0.25)");
        sunscatter.addColorStop(0.35,"rgba(140, 200, 255, 0.14)");
        sunscatter.addColorStop(0.70,"rgba(80, 155, 240, 0.06)");
        sunscatter.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = sunscatter;
        ctx.fillRect(0, 0, width, height);

        // Atmospheric halo — thin blue ring at the very edge (terminator glow)
        const halo = ctx.createRadialGradient(pCX, pCY, pR * 0.96, pCX, pCY, pR * 1.05);
        halo.addColorStop(0,   "rgba(0, 0, 0, 0)");
        halo.addColorStop(0.5, "rgba(130, 210, 255, 0.22)");
        halo.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = halo;
        ctx.fillRect(0, 0, width, height);

        ctx.restore();
      }

      // ── 6. CINEMATIC LIGHT VOLUME (from upper-right "sun") ───────────────
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      {
        const lx = width * 0.92 + (mx - 0.5) * 18;
        const ly = height * -0.04 + (my - 0.5) * 12;
        const lg = ctx.createLinearGradient(lx, ly, lx - width * 0.65, ly + height * 1.0);
        lg.addColorStop(0,   "rgba(200, 230, 255, 0.055)");
        lg.addColorStop(0.35,"rgba(140, 185, 255, 0.025)");
        lg.addColorStop(0.7, "rgba(80, 130, 220, 0.01)");
        lg.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = lg;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.restore();

      // ── 7. FILM GRAIN ────────────────────────────────────────────────────
      if (grainPattern) {
        ctx.save();
        ctx.globalAlpha = 0.038;
        ctx.globalCompositeOperation = "overlay";
        ctx.fillStyle = grainPattern;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // ── 8. EDGE VIGNETTE ─────────────────────────────────────────────────
      {
        const vig = ctx.createRadialGradient(
          width * 0.50, height * 0.42, height * 0.18,
          width * 0.50, height * 0.50, height * 0.92
        );
        vig.addColorStop(0,   "rgba(0,0,0,0)");
        vig.addColorStop(0.7, "rgba(0,0,0,0.18)");
        vig.addColorStop(1.0, "rgba(0,0,0,0.62)");
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
    return <div className="fixed inset-0 w-full h-full bg-[#000005] pointer-events-none -z-40" />;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none -z-40 print:hidden block"
      id="cosmic-cinematic-bg"
    />
  );
}
