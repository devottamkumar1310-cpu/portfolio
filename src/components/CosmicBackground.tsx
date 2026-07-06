import { useEffect, useRef, useState } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  parallaxFactor: number;
}

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const mouseTargetRef = useRef({ x: 0.5, y: 0.5 });
  const scrollYRef = useRef(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    const handleMouseMove = (e: MouseEvent) => {
      mouseTargetRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
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

    // ─── 1. PRECOMPUTE FILM GRAIN TEXTURE ──────────────────────────────────
    const grainCanvas = document.createElement("canvas");
    grainCanvas.width = 128;
    grainCanvas.height = 128;
    const gctx = grainCanvas.getContext("2d")!;
    const imgData = gctx.createImageData(128, 128);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const val = Math.floor(Math.random() * 255);
      imgData.data[i] = val;
      imgData.data[i + 1] = val;
      imgData.data[i + 2] = val;
      imgData.data[i + 3] = Math.floor(Math.random() * 8 + 2); // Very subtle grain
    }
    gctx.putImageData(imgData, 0, 0);
    const grainPattern = ctx.createPattern(grainCanvas, "repeat");

    // ─── 2. PRECOMPUTE SPARSE PREMIUM STARFIELD ─────────────────────────────
    // Very low density starfield (e.g. 150-300 stars), tiny sizes, no twinkling
    const starCount = isMobile ? 120 : 260;
    const stars: Star[] = [];

    for (let i = 0; i < starCount; i++) {
      // Natural uneven distribution (slightly clustered, mostly sparse)
      const x = Math.random();
      const y = Math.random();
      
      const sizeRoll = Math.random();
      // Keep stars tiny
      const size = sizeRoll > 0.95 ? 0.65 + Math.random() * 0.35
                 : sizeRoll < 0.30 ? 0.15 + Math.random() * 0.15
                 :                   0.30 + Math.random() * 0.25;

      const opacity = sizeRoll > 0.95 ? 0.20 + Math.random() * 0.20
                    : sizeRoll < 0.30 ? 0.05 + Math.random() * 0.10
                    :                   0.10 + Math.random() * 0.15;

      // Parallax factor based on size layer
      const parallaxFactor = sizeRoll > 0.95 ? 0.015 : sizeRoll < 0.30 ? 0.004 : 0.008;

      stars.push({ x, y, size, opacity, parallaxFactor });
    }

    // ─── 3. RENDER LOOP ───────────────────────────────────────────────────
    const render = () => {
      // Mouse Parallax Lerping (Very subtle, almost imperceptible)
      mouseRef.current.x += (mouseTargetRef.current.x - mouseRef.current.x) * 0.02;
      mouseRef.current.y += (mouseTargetRef.current.y - mouseRef.current.y) * 0.02;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const scrollY = scrollYRef.current;

      // Layer 1: Deep Cosmic Void (Solid pitch black base)
      ctx.fillStyle = "#010103";
      ctx.fillRect(0, 0, width, height);

      // Deep space ambient baseline (Extremely faint midnight-blue background glow)
      const ambientGlow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        0,
        width * 0.5,
        height * 0.4,
        Math.max(width, height) * 0.8
      );
      ambientGlow.addColorStop(0, "rgba(2, 6, 20, 0.35)");
      ambientGlow.addColorStop(0.6, "rgba(1, 2, 8, 0.10)");
      ambientGlow.addColorStop(1.0, "#010103");
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height);

      // Layer 2: Sparse Star Field (Sharp pinpoints, no twinkling)
      stars.forEach((star, i) => {
        const pX = (mx - 0.5) * star.parallaxFactor * width;
        const pY = (my - 0.5) * star.parallaxFactor * height - scrollY * star.parallaxFactor * 0.6;

        const sx = (star.x * width + pX + width) % width;
        const sy = (star.y * height + pY + height) % height;

        // Soft white / steel blue tints
        const starColor = i % 8 === 0
          ? `rgba(180, 212, 255, ${star.opacity})` // Steel blue
          : `rgba(255, 255, 255, ${star.opacity})`;

        ctx.fillStyle = starColor;
        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Layer 3: Faint Cosmic Dust / Atmospheric Haze (Extremely subtle framing)
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // Left framing haze (Faint steel blue, barely visible)
      {
        const hx = width * 0.10 + (mx - 0.5) * 8;
        const hy = height * 0.35 - scrollY * 0.015;
        const hRadius = width * 0.45;
        const hGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, hRadius);
        hGrad.addColorStop(0, "rgba(8, 25, 75, 0.05)");
        hGrad.addColorStop(0.5, "rgba(3, 10, 35, 0.015)");
        hGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = hGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // Right framing haze (Faint steel blue/cyan, barely visible)
      {
        const hx = width * 0.90 + (mx - 0.5) * 6;
        const hy = height * 0.20 - scrollY * 0.01;
        const hRadius = width * 0.40;
        const hGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, hRadius);
        hGrad.addColorStop(0, "rgba(6, 20, 65, 0.04)");
        hGrad.addColorStop(0.5, "rgba(2, 8, 30, 0.01)");
        hGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = hGrad;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.restore();

      // Layer 4: Soft Planetary Horizon Glow (Emerging from bottom-left area of hero)
      // Curved atmospheric glow, extremely subtle, no terrain or texture
      {
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        const pX = (mx - 0.5) * 12;
        const pY = (my - 0.5) * 8;

        // Position the planetary center off-screen bottom-left
        const pCX = width * (isMobile ? -0.35 : -0.25) + pX;
        const pCY = height * (isMobile ? 1.40 : 1.30) + pY;
        const pRadius = Math.max(width, height) * (isMobile ? 0.70 : 0.60);

        // Rim glow 1: Wide outer scattering (cyan-blue)
        const glowGrad1 = ctx.createRadialGradient(pCX, pCY, pRadius * 0.85, pCX, pCY, pRadius * 1.15);
        glowGrad1.addColorStop(0, "rgba(0, 0, 0, 0)");
        glowGrad1.addColorStop(0.40, "rgba(10, 45, 140, 0.08)");
        glowGrad1.addColorStop(0.70, "rgba(25, 110, 220, 0.16)"); // Soft cyan-blue rim
        glowGrad1.addColorStop(0.85, "rgba(90, 180, 255, 0.10)");
        glowGrad1.addColorStop(0.98, "rgba(150, 220, 255, 0.03)");
        glowGrad1.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = glowGrad1;
        ctx.fillRect(0, 0, width, height);

        // Rim glow 2: Inner sharp atmospheric limb (cyan-white)
        const glowGrad2 = ctx.createRadialGradient(pCX, pCY, pRadius * 0.94, pCX, pCY, pRadius * 1.02);
        glowGrad2.addColorStop(0, "rgba(0, 0, 0, 0)");
        glowGrad2.addColorStop(0.40, "rgba(160, 220, 255, 0.14)"); // Bright limb highlight
        glowGrad2.addColorStop(0.80, "rgba(220, 245, 255, 0.07)");
        glowGrad2.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = glowGrad2;
        ctx.fillRect(0, 0, width, height);

        ctx.restore();
      }

      // Layer 5: Faint Cinematic Light Streaks / Scattering (Behind hero content)
      {
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        const lX = width * 0.85 + (mx - 0.5) * 15;
        const lY = -height * 0.1 + (my - 0.5) * 10;
        
        // Soft volumetric diagonal ray coming from top-right down toward center-left
        const rayGrad = ctx.createLinearGradient(lX, lY, lX - width * 0.5, lY + height * 0.75);
        rayGrad.addColorStop(0, "rgba(110, 180, 255, 0.03)"); // Extremely faint volumetric light
        rayGrad.addColorStop(0.5, "rgba(60, 130, 220, 0.01)");
        rayGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = rayGrad;
        ctx.fillRect(0, 0, width, height);

        ctx.restore();
      }

      // Layer 6: Film Grain Pattern Overlay
      if (grainPattern) {
        ctx.save();
        ctx.globalCompositeOperation = "overlay";
        ctx.fillStyle = grainPattern;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // Layer 7: Central Safe Zone Vignette (Maximizes typography contrast)
      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        Math.min(width, height) * 0.18,
        width * 0.5,
        height * 0.45,
        Math.max(width, height) * 0.8
      );
      vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
      vignette.addColorStop(0.55, "rgba(0, 0, 0, 0.06)");
      vignette.addColorStop(1.0, "rgba(0, 0, 0, 0.45)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isClient]);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none select-none -z-40 print:hidden overflow-hidden">
      <div className="absolute inset-0 bg-[#010103] -z-50" />
      <canvas ref={canvasRef} className="w-full h-full block" id="cosmic-canvas" />
    </div>
  );
}
