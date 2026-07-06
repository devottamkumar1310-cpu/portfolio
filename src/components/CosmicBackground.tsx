import { useEffect, useRef, useState } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  layer: number;
}

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
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
      imgData.data[i + 3] = Math.floor(Math.random() * 10 + 2); // Ultra subtle
    }
    gctx.putImageData(imgData, 0, 0);
    const grainPattern = ctx.createPattern(grainCanvas, "repeat");

    // ─── 2. PRECOMPUTE NATURAL STARFIELD ───────────────────────────────────
    const starCount = isMobile ? 250 : 550;
    const stars: Star[] = [];

    // Simulate clusters to make star fields feel realistic
    const clusters = [
      { cx: 0.20, cy: 0.30, r: 0.25 },
      { cx: 0.80, cy: 0.40, r: 0.20 },
      { cx: 0.65, cy: 0.75, r: 0.25 }
    ];

    for (let i = 0; i < starCount; i++) {
      let x = Math.random();
      let y = Math.random();
      const layer = Math.random() < 0.70 ? 0 : Math.random() < 0.85 ? 1 : 2; // 0: Far, 1: Mid, 2: Near

      if (Math.random() < 0.40) {
        const cluster = clusters[Math.floor(Math.random() * clusters.length)];
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.pow(Math.random(), 2) * cluster.r;
        x = (cluster.cx + Math.cos(angle) * dist + 1) % 1;
        y = (cluster.cy + Math.sin(angle) * dist + 1) % 1;
      }

      // Small sharp pinpoints
      const size = layer === 0 ? 0.2 + Math.random() * 0.25
                 : layer === 1 ? 0.4 + Math.random() * 0.35
                 :               0.7 + Math.random() * 0.55;

      const opacity = layer === 0 ? 0.08 + Math.random() * 0.22
                    : layer === 1 ? 0.18 + Math.random() * 0.32
                    :               0.28 + Math.random() * 0.38;

      stars.push({ x, y, size, opacity, layer });
    }

    // ─── 3. RENDER LOOP ───────────────────────────────────────────────────
    const render = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;

      // Mouse Parallax Lerping
      mouseRef.current.x += (mouseTargetRef.current.x - mouseRef.current.x) * 0.025;
      mouseRef.current.y += (mouseTargetRef.current.y - mouseRef.current.y) * 0.025;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const scrollY = scrollYRef.current;

      // Layer 1: Pitch Black Void
      ctx.fillStyle = "#010103";
      ctx.fillRect(0, 0, width, height);

      // Layer 2: Ultra-subtle deep space ambient (reduced 80% to avoid glow columns/auroras)
      const ambientGrad = ctx.createRadialGradient(
        width * 0.5, height * 0.4, 0,
        width * 0.5, height * 0.4, Math.max(width, height) * 0.8
      );
      ambientGrad.addColorStop(0, "rgba(2, 6, 22, 0.15)"); // Extremely faint background dark-blue
      ambientGrad.addColorStop(0.6, "rgba(1, 2, 8, 0.05)");
      ambientGrad.addColorStop(1.0, "#010103");
      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, width, height);

      // Layer 3: Star Field Parallax
      stars.forEach((star, i) => {
        const speedMultiplier = star.layer === 0 ? 3 : star.layer === 1 ? 8 : 16;
        const sx = (star.x * width + (mx - 0.5) * speedMultiplier + width) % width;
        const sy = (star.y * height + (my - 0.5) * speedMultiplier * 0.75 - scrollY * (star.layer === 0 ? 0.015 : star.layer === 1 ? 0.035 : 0.065) + height) % height;

        const colorVal = i % 10 === 0
          ? `rgba(180, 210, 255, ${star.opacity})` // Steel Blue Tint
          : `rgba(255, 255, 255, ${star.opacity})`;

        ctx.fillStyle = colorVal;
        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Layer 4: Deep Space Haze & Volumetric Dust (Monochromatic, dark & framing)
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // Slowly drifting deep space haze
      const driftX = Math.sin(time * 0.000015) * 12;
      const driftY = Math.cos(time * 0.000010) * 8;

      // Left framing haze (Faint steel blue)
      {
        const hx = width * 0.12 + driftX + (mx - 0.5) * 10;
        const hy = height * 0.35 + driftY - scrollY * 0.02;
        const hRadius = width * 0.45;
        const hGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, hRadius);
        hGrad.addColorStop(0, "rgba(10, 30, 85, 0.06)"); // Reduced 80%+ opacity
        hGrad.addColorStop(0.5, "rgba(4, 12, 40, 0.02)");
        hGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = hGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // Right framing haze (Faint steel blue)
      {
        const hx = width * 0.88 - driftX + (mx - 0.5) * 8;
        const hy = height * 0.25 - driftY - scrollY * 0.015;
        const hRadius = width * 0.40;
        const hGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, hRadius);
        hGrad.addColorStop(0, "rgba(8, 25, 75, 0.05)");
        hGrad.addColorStop(0.5, "rgba(3, 10, 35, 0.015)");
        hGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = hGrad;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.restore();

      // Layer 5: Film Grain Texture
      if (grainPattern) {
        ctx.save();
        ctx.globalCompositeOperation = "overlay";
        ctx.fillStyle = grainPattern;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // Layer 6: Center Safe Zone Vignette (Ensures headline dominates)
      const vignetteGrad = ctx.createRadialGradient(
        width * 0.5, height * 0.42, height * 0.12,
        width * 0.5, height * 0.48, Math.max(width, height) * 0.8
      );
      vignetteGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
      vignetteGrad.addColorStop(0.65, "rgba(0, 0, 0, 0.08)");
      vignetteGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.45)");
      ctx.fillStyle = vignetteGrad;
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
    <div
      className="fixed inset-0 w-full h-full pointer-events-none select-none -z-40 print:hidden overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#010103] -z-50" />
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        id="cosmic-canvas"
      />
    </div>
  );
}
