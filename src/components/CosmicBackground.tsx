import { useEffect, useRef, useState } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  shimmerSpeed: number;
  shimmerPhase: number;
}

interface DustParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  vx: number;
  vy: number;
  depth: number;
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
      imgData.data[i + 3] = Math.floor(Math.random() * 10 + 2); // Subtle grain
    }
    gctx.putImageData(imgData, 0, 0);
    const grainPattern = ctx.createPattern(grainCanvas, "repeat");

    // ─── 2. PRECOMPUTE DUST PARTICLES (Layer 3 & 6) ───────────────────────
    const dustCount = isMobile ? 25 : 60;
    const dustParticles: DustParticle[] = Array.from({ length: dustCount }, () => {
      const depth = Math.random(); // 0 = far, 1 = close
      return {
        x: Math.random(),
        y: Math.random(),
        size: depth * 1.5 + 0.6,
        opacity: depth * 0.15 + 0.05,
        vx: (Math.random() - 0.5) * 0.0004,
        vy: (Math.random() - 0.5) * 0.0004 - 0.0002, // Faint upward bias
        depth,
      };
    });

    // ─── 3. PRECOMPUTE ASTRONOMICAL STARFIELD ──────────────────────────────
    const starCount = isMobile ? 350 : 750;
    const stars: Star[] = [];

    // Clustered star densities
    const clusters = [
      { cx: 0.12, cy: 0.25, spread: 0.18 },
      { cx: 0.85, cy: 0.30, spread: 0.15 },
      { cx: 0.75, cy: 0.80, spread: 0.22 },
      { cx: 0.30, cy: 0.70, spread: 0.20 },
    ];

    for (let i = 0; i < starCount; i++) {
      let x = Math.random();
      let y = Math.random();

      // 55% of stars reside in clustered regions
      if (Math.random() < 0.55) {
        const cluster = clusters[Math.floor(Math.random() * clusters.length)];
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.pow(Math.random(), 1.8) * cluster.spread;
        x = (cluster.cx + Math.cos(angle) * distance + 1) % 1;
        y = (cluster.cy + Math.sin(angle) * distance + 1) % 1;
      }

      const sizeRoll = Math.random();
      let size = 0.25 + Math.random() * 0.35;
      let opacity = 0.08 + Math.random() * 0.35;

      if (sizeRoll > 0.94) {
        size = 0.7 + Math.random() * 0.45; // Prominent stars
        opacity = 0.4 + Math.random() * 0.45;
      } else if (sizeRoll < 0.3) {
        size = 0.1 + Math.random() * 0.15; // Tiny background points
        opacity = 0.04 + Math.random() * 0.2;
      }

      stars.push({
        x,
        y,
        size,
        opacity,
        shimmerSpeed: sizeRoll > 0.88 ? 0.25 + Math.random() * 0.6 : 0,
        shimmerPhase: Math.random() * Math.PI * 2,
      });
    }

    // ─── 4. RENDER LOOP ───────────────────────────────────────────────────
    const render = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = (time - startTimeRef.current) * 0.001;

      // Mouse Parallax smoothing
      mouseRef.current.x += (mouseTargetRef.current.x - mouseRef.current.x) * 0.025;
      mouseRef.current.y += (mouseTargetRef.current.y - mouseRef.current.y) * 0.025;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const scrollY = scrollYRef.current;

      // ── Layer 1: PURE DEEP SPACE VOID ────────────────────────────────────
      ctx.fillStyle = "#010103";
      ctx.fillRect(0, 0, width, height);

      // Deep space ambient baseline (Very subtle Navy/Midnight blue atmosphere)
      const ambientGlow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        0,
        width * 0.5,
        height * 0.4,
        Math.max(width, height) * 0.85
      );
      ambientGlow.addColorStop(0, "rgba(2, 6, 20, 0.45)");
      ambientGlow.addColorStop(0.55, "rgba(1, 3, 10, 0.15)");
      ambientGlow.addColorStop(1.0, "#010103");
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height);

      // ── Layer 2: DISTANT STAR FIELD (Clustered & Sparse) ────────────────
      stars.forEach((star, i) => {
        // Multi-depth parallax offsets
        const depth = star.size < 0.3 ? 0.006 : star.size > 0.85 ? 0.022 : 0.012;
        const pX = (mx - 0.5) * depth * width;
        const pY = (my - 0.5) * depth * height - scrollY * depth * 0.6;

        const sx = (star.x * width + pX + width) % width;
        const sy = (star.y * height + pY + height) % height;

        // Apply slow shimmer/glimmer to selected stars
        let currentOpacity = star.opacity;
        if (star.shimmerSpeed > 0) {
          currentOpacity = star.opacity * (0.65 + 0.35 * Math.sin(elapsed * star.shimmerSpeed + star.shimmerPhase));
        }

        // Color temperature distribution (White, Steel Blue, Pale Cyan)
        let starColor = `rgba(255, 255, 255, ${currentOpacity})`;
        if (i % 7 === 0) {
          starColor = `rgba(180, 215, 255, ${currentOpacity})`; // Steel Blue
        } else if (i % 11 === 0) {
          starColor = `rgba(200, 242, 255, ${currentOpacity})`; // Pale Cyan
        }

        ctx.fillStyle = starColor;
        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Layer 3: SOFT VOLUMETRIC NEBULAE (Framing borders organically) ──
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // Nebula drifts
      const drift1 = elapsed * 0.012;
      const drift2 = elapsed * 0.008;

      // 1. LEFT NEBULA SYSTEM (Deep Navy / Soft Cyan)
      {
        const cx = width * (0.05 + Math.sin(drift1) * 0.025) + (mx - 0.5) * 16;
        const cy = height * (0.35 + Math.cos(drift2) * 0.02) - scrollY * 0.02;
        const radius = Math.max(width, height) * (isMobile ? 0.5 : 0.42);

        // Volumetric deep navy core
        const grad1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad1.addColorStop(0, "rgba(8, 25, 95, 0.32)"); // Framed deep volume
        grad1.addColorStop(0.35, "rgba(4, 15, 60, 0.15)");
        grad1.addColorStop(0.7, "rgba(1, 4, 25, 0.04)");
        grad1.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad1;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Soft pale cyan gas overlay (Asymmetric, offset)
        const ox = cx + width * 0.05;
        const oy = cy - height * 0.08;
        const oRadius = radius * 0.65;
        const grad2 = ctx.createRadialGradient(ox, oy, 0, ox, oy, oRadius);
        grad2.addColorStop(0, "rgba(0, 140, 195, 0.18)"); // Faint atmospheric glow
        grad2.addColorStop(0.4, "rgba(0, 65, 100, 0.07)");
        grad2.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.arc(ox, oy, oRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. RIGHT NEBULA SYSTEM (Steel Blue / Pale Cyan)
      {
        const cx = width * (0.92 + Math.cos(drift1 * 0.9) * 0.02) + (mx - 0.5) * 14;
        const cy = height * (0.22 + Math.sin(drift2 * 1.1) * 0.025) - scrollY * 0.015;
        const radius = Math.max(width, height) * (isMobile ? 0.45 : 0.38);

        const grad1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad1.addColorStop(0, "rgba(0, 100, 145, 0.24)"); // Volumetric steel blue
        grad1.addColorStop(0.4, "rgba(0, 50, 85, 0.11)");
        grad1.addColorStop(0.75, "rgba(0, 20, 40, 0.03)");
        grad1.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad1;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Asymmetric diffuse indigo cloud
        const ox = cx - width * 0.09;
        const oy = cy + height * 0.14;
        const oRadius = radius * 0.85;
        const grad2 = ctx.createRadialGradient(ox, oy, 0, ox, oy, oRadius);
        grad2.addColorStop(0, "rgba(10, 35, 95, 0.16)");
        grad2.addColorStop(0.55, "rgba(3, 12, 45, 0.05)");
        grad2.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.arc(ox, oy, oRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. SOUTHERN DEEP-SPACE FOG (Tying composition at the bottom)
      {
        const cx = width * 0.5;
        const cy = height * 1.1 - scrollY * 0.01;
        const radius = Math.max(width, height) * 0.65;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, "rgba(6, 18, 55, 0.22)");
        grad.addColorStop(0.5, "rgba(2, 6, 22, 0.07)");
        grad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // ── Layer 4: COSMIC DUST & ATMOSPHERIC PARTICLES ────────────────────
      dustParticles.forEach((dust) => {
        dust.x += dust.vx;
        dust.y += dust.vy;

        // Wrap around boundaries
        if (dust.x < 0) dust.x = 1;
        if (dust.x > 1) dust.x = 0;
        if (dust.y < 0) dust.y = 1;
        if (dust.y > 1) dust.y = 0;

        // Mouse responsive movement mapping based on depth layer
        const pX = (mx - 0.5) * (dust.depth * 20 + 5);
        const pY = (my - 0.5) * (dust.depth * 15 + 5) - scrollY * 0.04;

        const dx = dust.x * width + pX;
        const dy = dust.y * height + pY;

        const dustGrad = ctx.createRadialGradient(dx, dy, 0, dx, dy, dust.size);
        dustGrad.addColorStop(0, `rgba(180, 220, 255, ${dust.opacity})`);
        dustGrad.addColorStop(0.5, `rgba(100, 160, 220, ${dust.opacity * 0.3})`);
        dustGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = dustGrad;
        ctx.beginPath();
        ctx.arc(dx, dy, dust.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Layer 5: PREMIUM NOISE PATTERN OVERLAY ───────────────────────────
      if (grainPattern) {
        ctx.save();
        ctx.globalCompositeOperation = "overlay";
        ctx.fillStyle = grainPattern;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // ── Layer 6: CENTER SAFE ZONE VIGNETTE ───────────────────────────────
      const centerGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        Math.min(width, height) * 0.15,
        width * 0.5,
        height * 0.45,
        Math.max(width, height) * 0.8
      );
      centerGrad.addColorStop(0, "rgba(0, 0, 0, 0)"); // Perfect black void for readability
      centerGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.08)");
      centerGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.45)"); // Soft vignette framing
      ctx.fillStyle = centerGrad;
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
