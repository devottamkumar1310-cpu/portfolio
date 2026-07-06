import { useEffect, useRef, useState } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  shimmerSpeed: number;
  shimmerPhase: number;
  isCluster: boolean;
}

interface DustParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  vx: number;
  vy: number;
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

    // ─── PRECOMPUTE GRAIN PATTERN ─────────────────────────────────────────
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
      imgData.data[i + 3] = Math.floor(Math.random() * 12 + 2); // Extremely subtle
    }
    gctx.putImageData(imgData, 0, 0);
    const grainPattern = ctx.createPattern(grainCanvas, "repeat");

    // ─── INITIALIZE STARS WITH NATURAL CLUSTERING ──────────────────────────
    const starCount = isMobile ? 300 : 650;
    const stars: Star[] = [];

    // Define 3 cluster center coordinates to simulate realistic nebular clusters
    const clusters = [
      { cx: 0.15, cy: 0.25, radius: 0.25 },
      { cx: 0.85, cy: 0.35, radius: 0.20 },
      { cx: 0.70, cy: 0.80, radius: 0.30 },
    ];

    for (let i = 0; i < starCount; i++) {
      let x = Math.random();
      let y = Math.random();
      let isCluster = false;

      // 40% of stars cluster around specific zones
      if (Math.random() < 0.45) {
        const targetCluster = clusters[Math.floor(Math.random() * clusters.length)];
        // Gaussian-like distribution around cluster center
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.pow(Math.random(), 2) * targetCluster.radius;
        x = (targetCluster.cx + Math.cos(angle) * dist + 1) % 1;
        y = (targetCluster.cy + Math.sin(angle) * dist + 1) % 1;
        isCluster = true;
      }

      const sizeRoll = Math.random();
      let size = 0.3 + Math.random() * 0.4;
      let opacity = 0.1 + Math.random() * 0.45;

      if (sizeRoll > 0.95) {
        size = 0.9 + Math.random() * 0.6; // Slightly larger stars
        opacity = 0.5 + Math.random() * 0.4;
      } else if (sizeRoll < 0.25) {
        size = 0.15 + Math.random() * 0.15; // Tiny background stars
        opacity = 0.05 + Math.random() * 0.2;
      }

      stars.push({
        x,
        y,
        size,
        opacity,
        shimmerSpeed: sizeRoll > 0.90 ? 0.2 + Math.random() * 0.6 : 0,
        shimmerPhase: Math.random() * Math.PI * 2,
        isCluster,
      });
    }

    // ─── INITIALIZE SPACE DUST PARTICLES ──────────────────────────────────
    const dustCount = isMobile ? 15 : 35;
    const dustParticles: DustParticle[] = Array.from({ length: dustCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 1.0 + Math.random() * 2.0,
      opacity: 0.05 + Math.random() * 0.2,
      vx: (Math.random() - 0.5) * 0.003, // Slow drift
      vy: (Math.random() - 0.5) * 0.003 - 0.002, // Upward bias
    }));

    // ─── RENDER LOOP ──────────────────────────────────────────────────────
    const render = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = (time - startTimeRef.current) * 0.001; // Seconds

      // Interpolate mouse coordinates (subtle parallax smoothing)
      mouseRef.current.x += (mouseTargetRef.current.x - mouseRef.current.x) * 0.025;
      mouseRef.current.y += (mouseTargetRef.current.y - mouseRef.current.y) * 0.025;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const scrollY = scrollYRef.current;

      // ── Layer 1: DEEP COSMIC VOID (Deep space baseline) ──────────────────
      ctx.fillStyle = "#010103";
      ctx.fillRect(0, 0, width, height);

      // Deep space ambient glow (simulating distant unresolvable cosmic clouds)
      const ambientGlow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        0,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.7
      );
      ambientGlow.addColorStop(0, "rgba(2, 6, 20, 0.45)");
      ambientGlow.addColorStop(0.5, "rgba(1, 3, 10, 0.2)");
      ambientGlow.addColorStop(1.0, "#010103");
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height);

      // ── Layer 2: DISTANT STAR FIELD ─────────────────────────────────────
      stars.forEach((star, i) => {
        // Multi-level parallax mapping
        const depth = star.size < 0.3 ? 0.005 : star.size > 0.95 ? 0.03 : 0.015;
        const pX = (mx - 0.5) * depth * width;
        const pY = (my - 0.5) * depth * height - scrollY * depth * 0.8;

        const sx = (star.x * width + pX + width) % width;
        const sy = (star.y * height + pY + height) % height;

        // Apply extremely subtle atmospheric shimmer to brighter/larger stars
        let currentOpacity = star.opacity;
        if (star.shimmerSpeed > 0) {
          currentOpacity = star.opacity * (0.7 + 0.3 * Math.sin(elapsed * star.shimmerSpeed + star.shimmerPhase));
        }

        // Star colors: Soft white, pale cyan, steel blue
        let starColor = `rgba(255, 255, 255, ${currentOpacity})`;
        if (i % 8 === 0) {
          starColor = `rgba(180, 218, 255, ${currentOpacity})`; // Steel Blue
        } else if (i % 12 === 0) {
          starColor = `rgba(200, 245, 255, ${currentOpacity})`; // Pale Cyan
        }

        ctx.fillStyle = starColor;
        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Layer 3: NEBULA FORMATIONS (Framing the edges) ──────────────────
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // Nebula Slow Drift calculation
      const driftSpeed1 = elapsed * 0.015;
      const driftSpeed2 = elapsed * 0.01;

      // 1. LEFT NEBULA SYSTEM (Deep Blue & Indigo) - Framing top-left to middle-left
      {
        const cx = width * (0.05 + Math.sin(driftSpeed1) * 0.02) + (mx - 0.5) * 18;
        const cy = height * (0.35 + Math.cos(driftSpeed2) * 0.015) - scrollY * 0.02;
        const radius = Math.max(width, height) * (isMobile ? 0.5 : 0.4);

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, "rgba(10, 35, 120, 0.28)"); // Volumetric core
        gradient.addColorStop(0.35, "rgba(6, 20, 75, 0.14)");
        gradient.addColorStop(0.7, "rgba(2, 8, 35, 0.05)");
        gradient.addColorStop(1.0, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Overlapping Cyan gas filament layer for texture/depth
        const cyX = cx + width * 0.04;
        const cyY = cy - height * 0.08;
        const cyRadius = radius * 0.65;
        const cyanGrad = ctx.createRadialGradient(cyX, cyY, 0, cyX, cyY, cyRadius);
        cyanGrad.addColorStop(0, "rgba(0, 160, 210, 0.16)"); // Soft cyan
        cyanGrad.addColorStop(0.4, "rgba(0, 80, 120, 0.06)");
        cyanGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = cyanGrad;
        ctx.beginPath();
        ctx.arc(cyX, cyY, cyRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. RIGHT NEBULA SYSTEM (Pale Cyan & Steel Blue) - Framing top-right to bottom-right
      {
        const cx = width * (0.9 + Math.cos(driftSpeed1 * 0.8) * 0.015) + (mx - 0.5) * 15;
        const cy = height * (0.2 + Math.sin(driftSpeed2 * 1.2) * 0.02) - scrollY * 0.015;
        const radius = Math.max(width, height) * (isMobile ? 0.45 : 0.35);

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, "rgba(0, 120, 160, 0.22)"); // Steel Blue/Cyan core
        gradient.addColorStop(0.4, "rgba(0, 60, 95, 0.1)");
        gradient.addColorStop(0.75, "rgba(0, 25, 45, 0.03)");
        gradient.addColorStop(1.0, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Additional faint diffuse layer to break symmetry
        const dfX = cx - width * 0.08;
        const dfY = cy + height * 0.12;
        const dfRadius = radius * 0.8;
        const diffGrad = ctx.createRadialGradient(dfX, dfY, 0, dfX, dfY, dfRadius);
        diffGrad.addColorStop(0, "rgba(15, 45, 110, 0.14)");
        diffGrad.addColorStop(0.5, "rgba(5, 15, 50, 0.05)");
        diffGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = diffGrad;
        ctx.beginPath();
        ctx.arc(dfX, dfY, dfRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. SOUTHERN ATMOSPHERIC LAYER (Deep Navy/Indigo) - Soft foundation gradient
      {
        const cx = width * 0.5;
        const cy = height * 1.1 - scrollY * 0.01;
        const radius = Math.max(width, height) * 0.65;

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, "rgba(8, 20, 65, 0.25)");
        gradient.addColorStop(0.5, "rgba(2, 6, 25, 0.08)");
        gradient.addColorStop(1.0, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // ── Layer 4: FAINT COSMIC DUST & PARTICLES (Subtle drift) ────────────
      dustParticles.forEach((dust) => {
        // Drift coordinates
        dust.x += dust.vx;
        dust.y += dust.vy;

        // Wrap around boundaries
        if (dust.x < 0) dust.x = 1;
        if (dust.x > 1) dust.x = 0;
        if (dust.y < 0) dust.y = 1;
        if (dust.y > 1) dust.y = 0;

        const dx = dust.x * width + (mx - 0.5) * 25;
        const dy = dust.y * height + (my - 0.5) * 20 - scrollY * 0.05;

        const dustGrad = ctx.createRadialGradient(dx, dy, 0, dx, dy, dust.size);
        dustGrad.addColorStop(0, `rgba(180, 220, 255, ${dust.opacity})`);
        dustGrad.addColorStop(0.5, `rgba(100, 160, 220, ${dust.opacity * 0.3})`);
        dustGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = dustGrad;
        ctx.beginPath();
        ctx.arc(dx, dy, dust.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Layer 5: PREMIUM NOISE/GRAIN PATTERN ─────────────────────────────
      if (grainPattern) {
        ctx.save();
        ctx.globalCompositeOperation = "overlay";
        ctx.fillStyle = grainPattern;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // ── Layer 6: CENTRAL SAFE ZONE & CORNER VIGNETTE ──────────────────────
      // Apply a subtle vignette that naturally clears up the center area
      const centerGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        Math.min(width, height) * 0.15,
        width * 0.5,
        height * 0.45,
        Math.max(width, height) * 0.8
      );
      centerGrad.addColorStop(0, "rgba(0, 0, 0, 0)"); // Perfect readability in the center
      centerGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.1)");
      centerGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.45)"); // Deep darken on outer bounds
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

  if (!isClient) {
    return <div className="fixed inset-0 w-full h-full bg-[#010103] pointer-events-none -z-40" />;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none -z-40 print:hidden block"
      id="cosmic-universe-bg"
    />
  );
}
