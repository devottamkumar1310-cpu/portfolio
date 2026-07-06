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

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const handleScroll = () => { scrollYRef.current = window.scrollY; };
    const handleMouse = (e: MouseEvent) => {
      mouseTargetRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
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

    // --- Sparse premium star field ---
    // Low density: ~180 far, ~80 mid, ~12 near
    const stars: Star[] = [];
    const starColors = ["rgba(255,255,255,", "rgba(186,230,253,", "rgba(165,180,252,", "rgba(253,230,138,"];

    const addStars = (count: number, minSize: number, maxSize: number, minOp: number, maxOp: number) => {
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random(),
          y: Math.random(),
          size: Math.random() * (maxSize - minSize) + minSize,
          opacity: Math.random() * (maxOp - minOp) + minOp,
          color: starColors[Math.floor(Math.random() * starColors.length)],
        });
      }
    };

    addStars(isMobile ? 100 : 180, 0.3, 0.8, 0.1, 0.35);  // Far: tiny, low opacity
    addStars(isMobile ? 40 : 80,   0.5, 1.1, 0.2, 0.45);  // Mid
    addStars(isMobile ? 6 : 12,    1.2, 2.2, 0.15, 0.3);  // Near (bokeh)

    const render = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = (time - startTimeRef.current) * 0.001; // seconds

      // Smooth mouse lerp (very subtle)
      mouseRef.current.x += (mouseTargetRef.current.x - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseTargetRef.current.y - mouseRef.current.y) * 0.04;

      const mx = mouseRef.current.x;  // 0..1
      const my = mouseRef.current.y;  // 0..1
      const scrollY = scrollYRef.current;

      // ─── 1. BASE GRADIENT ────────────────────────────────────────────────
      const base = ctx.createLinearGradient(0, 0, 0, height);
      base.addColorStop(0.0,  "#020510");  // Very deep navy
      base.addColorStop(0.5,  "#050920");  // Dark blue-indigo
      base.addColorStop(1.0,  "#010208");  // Near-black
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, width, height);

      // ─── 2. NEBULA ATMOSPHERICS ──────────────────────────────────────────
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      const drift = elapsed * 0.018;

      // Blue nebula — center-left
      const bx = width * (0.18 + Math.sin(drift * 0.7) * 0.015) + (mx - 0.5) * 12;
      const by = height * (0.44 + Math.cos(drift * 0.5) * 0.01) - scrollY * 0.03 + (my - 0.5) * 8;
      const bGrad = ctx.createRadialGradient(bx, by, 0, bx, by, width * 0.95);
      bGrad.addColorStop(0,   "rgba(20,60,200,0.055)");
      bGrad.addColorStop(0.45,"rgba(15,40,130,0.018)");
      bGrad.addColorStop(1.0, "rgba(0,0,0,0)");
      ctx.fillStyle = bGrad;
      ctx.fillRect(0, 0, width, height);

      // Cyan nebula — upper-right
      const cx2 = width * (0.82 + Math.cos(drift * 0.6) * 0.012) + (mx - 0.5) * 8;
      const cy2 = height * (0.18 + Math.sin(drift * 0.4) * 0.01) - scrollY * 0.02 + (my - 0.5) * 6;
      const cGrad = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, width * 0.75);
      cGrad.addColorStop(0,   "rgba(0,170,210,0.035)");
      cGrad.addColorStop(0.4, "rgba(0,130,170,0.012)");
      cGrad.addColorStop(1.0, "rgba(0,0,0,0)");
      ctx.fillStyle = cGrad;
      ctx.fillRect(0, 0, width, height);

      // Indigo nebula — lower-center
      const vx = width * (0.52 + Math.sin(drift * 0.5) * 0.01) + (mx - 0.5) * 6;
      const vy = height * (0.72 + Math.cos(drift * 0.35) * 0.012) - scrollY * 0.04 + (my - 0.5) * 5;
      const vGrad = ctx.createRadialGradient(vx, vy, 0, vx, vy, width * 0.85);
      vGrad.addColorStop(0,   "rgba(80,30,180,0.04)");
      vGrad.addColorStop(0.5, "rgba(60,20,130,0.012)");
      vGrad.addColorStop(1.0, "rgba(0,0,0,0)");
      ctx.fillStyle = vGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.restore();

      // ─── 3. STAR FIELD ───────────────────────────────────────────────────
      stars.forEach((star, i) => {
        const parallax = i < 180 ? 0.015 : i < 260 ? 0.04 : 0.09;
        const mouseShiftX = (mx - 0.5) * (i < 180 ? 4 : i < 260 ? 8 : 14);
        const mouseShiftY = (my - 0.5) * (i < 180 ? 3 : i < 260 ? 6 : 10);

        const sx = (star.x * width + mouseShiftX + width) % width;
        const sy = star.y * height - scrollY * parallax + mouseShiftY;

        if (sy < -10 || sy > height + 10) return;

        const isNear = i >= 260;

        if (isNear) {
          // Bokeh soft circle
          const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, star.size);
          g.addColorStop(0,   `${star.color}${star.opacity})`);
          g.addColorStop(0.4, `${star.color}${star.opacity * 0.35})`);
          g.addColorStop(1.0, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `${star.color}${star.opacity})`;
          ctx.beginPath();
          ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // ─── 4. HORIZON GLOW (bottom-left atmospheric arc) ───────────────────
      // Subtle impression of a distant planetary horizon — no texture, just glow
      ctx.save();
      const horizonShiftX = (mx - 0.5) * 20;
      const horizonShiftY = (my - 0.5) * 10;

      // Primary horizon arc — large radial from below
      const hcx = width * 0.05 + horizonShiftX;
      const hcy = height * 1.08 + horizonShiftY;
      const hradius = width * (isMobile ? 1.2 : 1.0);

      const hGrad = ctx.createRadialGradient(hcx, hcy, hradius * 0.65, hcx, hcy, hradius);
      hGrad.addColorStop(0,   "rgba(0,0,0,0)");
      hGrad.addColorStop(0.6, "rgba(10,60,160,0.04)");
      hGrad.addColorStop(0.82,"rgba(6,140,200,0.06)");
      hGrad.addColorStop(0.93,"rgba(80,200,240,0.035)");
      hGrad.addColorStop(1.0, "rgba(0,0,0,0)");
      ctx.fillStyle = hGrad;
      ctx.fillRect(0, 0, width, height);

      // Thinner atmospheric limb rim — sharper arc highlight
      const rimGrad = ctx.createRadialGradient(hcx, hcy, hradius * 0.90, hcx, hcy, hradius * 1.02);
      rimGrad.addColorStop(0,   "rgba(0,0,0,0)");
      rimGrad.addColorStop(0.5, "rgba(100,210,255,0.022)");
      rimGrad.addColorStop(1.0, "rgba(0,0,0,0)");
      ctx.fillStyle = rimGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.restore();

      // ─── 5. CINEMATIC LIGHT VOLUMES / STREAKS ────────────────────────────
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // Soft volumetric diagonal light — emanates from top-right corner
      const lx1 = width * 0.85 + (mx - 0.5) * 15;
      const ly1 = -height * 0.1 + (my - 0.5) * 10;
      const lGrad1 = ctx.createLinearGradient(lx1, ly1, lx1 - width * 0.4, ly1 + height * 0.7);
      lGrad1.addColorStop(0,   "rgba(100,180,255,0.025)");
      lGrad1.addColorStop(0.5, "rgba(60,130,220,0.010)");
      lGrad1.addColorStop(1.0, "rgba(0,0,0,0)");
      ctx.fillStyle = lGrad1;
      ctx.fillRect(0, 0, width, height);

      // Subtle central vertical god-ray above hero
      const rayX = width * 0.5 + (mx - 0.5) * 10;
      const rayGrad = ctx.createLinearGradient(rayX, 0, rayX, height * 0.6);
      rayGrad.addColorStop(0,   "rgba(180,230,255,0.012)");
      rayGrad.addColorStop(0.5, "rgba(100,170,255,0.006)");
      rayGrad.addColorStop(1.0, "rgba(0,0,0,0)");

      ctx.fillStyle = rayGrad;
      // Narrow column — not a full rect flood
      const rayW = width * 0.35;
      ctx.fillRect(rayX - rayW / 2, 0, rayW, height * 0.6);

      ctx.restore();

      // ─── 6. FOCAL STAR (upper-right, breathing) ──────────────────────────
      const fsx = width * 0.78 + (mx - 0.5) * 18;
      const fsy = height * 0.20 - scrollY * 0.04 + (my - 0.5) * 12;

      if (fsy > -100 && fsy < height + 100) {
        const pulse = 1 + 0.055 * Math.sin(elapsed * 0.65);
        const pOpacity = 0.95 + 0.05 * Math.sin(elapsed * 0.65);

        // Core white dot
        ctx.beginPath();
        ctx.arc(fsx, fsy, 1.5 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        // Inner glow
        const ig = ctx.createRadialGradient(fsx, fsy, 0, fsx, fsy, 16 * pulse);
        ig.addColorStop(0,   "rgba(255,255,255,0.7)");
        ig.addColorStop(0.4, "rgba(186,230,253,0.25)");
        ig.addColorStop(1.0, "rgba(0,0,0,0)");
        ctx.fillStyle = ig;
        ctx.beginPath();
        ctx.arc(fsx, fsy, 16 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Outer ambient
        const og = ctx.createRadialGradient(fsx, fsy, 0, fsx, fsy, 80 * pulse);
        og.addColorStop(0,   "rgba(200,235,255,0.14)");
        og.addColorStop(0.5, "rgba(14,56,122,0.04)");
        og.addColorStop(1.0, "rgba(0,0,0,0)");
        ctx.fillStyle = og;
        ctx.beginPath();
        ctx.arc(fsx, fsy, 80 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Diffraction spikes (slowly rotating)
        ctx.save();
        ctx.translate(fsx, fsy);
        ctx.rotate(elapsed * 0.012);
        const spikeLen = (isMobile ? 45 : 80) * pulse;
        const spikeGrad = ctx.createLinearGradient(-spikeLen, 0, spikeLen, 0);
        spikeGrad.addColorStop(0,   "rgba(255,255,255,0)");
        spikeGrad.addColorStop(0.5, `rgba(220,240,255,${0.18 * pOpacity})`);
        spikeGrad.addColorStop(1.0, "rgba(255,255,255,0)");
        ctx.strokeStyle = spikeGrad;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(-spikeLen, 0); ctx.lineTo(spikeLen, 0);
        ctx.moveTo(0, -spikeLen); ctx.lineTo(0, spikeLen);
        ctx.stroke();
        ctx.restore();
      }

      // ─── 7. VIGNETTE OVERLAY ─────────────────────────────────────────────
      const vignette = ctx.createRadialGradient(
        width / 2, height / 2, height * 0.3,
        width / 2, height / 2, height * 0.9
      );
      vignette.addColorStop(0,   "rgba(0,0,0,0)");
      vignette.addColorStop(1.0, "rgba(0,0,0,0.35)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isClient]);

  if (!isClient) {
    return <div className="fixed inset-0 w-full h-full bg-[#020510] pointer-events-none -z-40" />;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none -z-40 print:hidden block"
      id="cosmic-cinematic-bg"
    />
  );
}
