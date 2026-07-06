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

    // ─── STAR FIELD ────────────────────────────────────────────────────────
    const stars: Star[] = [];
    const starColors = [
      "rgba(255,255,255,",
      "rgba(186,230,253,",
      "rgba(165,180,252,",
      "rgba(253,230,138,",
    ];

    // Far layer — tiny, sparse
    for (let i = 0; i < (isMobile ? 120 : 220); i++) {
      stars.push({
        x: Math.random(), y: Math.random(),
        size: Math.random() * 0.6 + 0.3,
        opacity: Math.random() * 0.35 + 0.15,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }
    // Mid layer
    for (let i = 0; i < (isMobile ? 50 : 90); i++) {
      stars.push({
        x: Math.random(), y: Math.random(),
        size: Math.random() * 0.8 + 0.5,
        opacity: Math.random() * 0.4 + 0.25,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }
    // Near bokeh
    for (let i = 0; i < (isMobile ? 8 : 15); i++) {
      stars.push({
        x: Math.random(), y: Math.random(),
        size: Math.random() * 2.0 + 1.5,
        opacity: Math.random() * 0.25 + 0.15,
        color: "rgba(186,230,253,",
      });
    }

    const FAR_COUNT = isMobile ? 120 : 220;
    const MID_COUNT = isMobile ? 50 : 90;

    const render = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = (time - startTimeRef.current) * 0.001;

      // Smooth mouse
      mouseRef.current.x += (mouseTargetRef.current.x - mouseRef.current.x) * 0.035;
      mouseRef.current.y += (mouseTargetRef.current.y - mouseRef.current.y) * 0.035;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const scrollY = scrollYRef.current;

      // ─── 1. BASE BACKGROUND ──────────────────────────────────────────────
      const base = ctx.createLinearGradient(0, 0, 0, height);
      base.addColorStop(0.0,  "#020510");
      base.addColorStop(0.45, "#050a1e");
      base.addColorStop(1.0,  "#010208");
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, width, height);

      // ─── 2. NEBULA CLOUDS ─────────────────────────────────────────────────
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      const drift = elapsed * 0.018;

      // ── Blue nebula — large, center-left
      {
        const bx = width * (0.15 + Math.sin(drift * 0.7) * 0.015) + (mx - 0.5) * 14;
        const by = height * (0.42 + Math.cos(drift * 0.5) * 0.01) - scrollY * 0.02 + (my - 0.5) * 10;
        const r = width * 1.0;
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, r);
        g.addColorStop(0,    "rgba(30, 80, 220, 0.22)");   // boosted 4x
        g.addColorStop(0.35, "rgba(20, 55, 160, 0.10)");
        g.addColorStop(0.7,  "rgba(10, 30, 100, 0.04)");
        g.addColorStop(1.0,  "rgba(0, 0, 0, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      }

      // ── Cyan nebula — upper-right
      {
        const cx = width * (0.80 + Math.cos(drift * 0.6) * 0.012) + (mx - 0.5) * 10;
        const cy = height * (0.16 + Math.sin(drift * 0.4) * 0.01) - scrollY * 0.015 + (my - 0.5) * 8;
        const r = width * 0.80;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0,    "rgba(0, 190, 230, 0.16)");   // boosted ~4x
        g.addColorStop(0.4,  "rgba(0, 145, 185, 0.07)");
        g.addColorStop(0.8,  "rgba(0, 80, 130, 0.025)");
        g.addColorStop(1.0,  "rgba(0, 0, 0, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      }

      // ── Indigo/violet nebula — lower center
      {
        const vx = width * (0.50 + Math.sin(drift * 0.5) * 0.01) + (mx - 0.5) * 8;
        const vy = height * (0.70 + Math.cos(drift * 0.35) * 0.012) - scrollY * 0.03 + (my - 0.5) * 6;
        const r = width * 0.90;
        const g = ctx.createRadialGradient(vx, vy, 0, vx, vy, r);
        g.addColorStop(0,    "rgba(100, 40, 220, 0.18)");  // boosted ~4x
        g.addColorStop(0.45, "rgba(75, 25, 160, 0.07)");
        g.addColorStop(0.8,  "rgba(40, 10, 90, 0.025)");
        g.addColorStop(1.0,  "rgba(0, 0, 0, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.restore();

      // ─── 3. STAR FIELD ────────────────────────────────────────────────────
      stars.forEach((star, i) => {
        const isFar  = i < FAR_COUNT;
        const isMid  = i >= FAR_COUNT && i < FAR_COUNT + MID_COUNT;
        const parallax = isFar ? 0.015 : isMid ? 0.04 : 0.09;
        const mShiftX  = (mx - 0.5) * (isFar ? 5 : isMid ? 10 : 18);
        const mShiftY  = (my - 0.5) * (isFar ? 4 : isMid ? 8  : 13);

        const sx = (star.x * width + mShiftX + width) % width;
        const sy = star.y * height - scrollY * parallax + mShiftY;

        if (sy < -10 || sy > height + 10) return;

        if (!isFar && !isMid) {
          // Near bokeh
          const bg = ctx.createRadialGradient(sx, sy, 0, sx, sy, star.size);
          bg.addColorStop(0,   `${star.color}${star.opacity})`);
          bg.addColorStop(0.4, `${star.color}${star.opacity * 0.3})`);
          bg.addColorStop(1.0, "rgba(0,0,0,0)");
          ctx.fillStyle = bg;
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

      // ─── 4. HORIZON GLOW — planetary arc from bottom-left ────────────────
      {
        ctx.save();
        const hShiftX = (mx - 0.5) * 24;
        const hShiftY = (my - 0.5) * 14;

        // Planet body fill — very dark, just presence
        const hcx = width * -0.08 + hShiftX;
        const hcy = height * 1.12 + hShiftY;
        const hradius = width * (isMobile ? 1.05 : 0.92);

        // Atmospheric glow — the bright ring
        const atmGrad = ctx.createRadialGradient(hcx, hcy, hradius * 0.55, hcx, hcy, hradius);
        atmGrad.addColorStop(0,    "rgba(0, 0, 0, 0)");
        atmGrad.addColorStop(0.62, "rgba(5, 50, 130, 0.12)");
        atmGrad.addColorStop(0.80, "rgba(10, 120, 220, 0.22)");  // boosted heavily
        atmGrad.addColorStop(0.91, "rgba(60, 190, 255, 0.18)");  // bright atmospheric rim
        atmGrad.addColorStop(0.97, "rgba(140, 220, 255, 0.08)");
        atmGrad.addColorStop(1.0,  "rgba(0, 0, 0, 0)");
        ctx.fillStyle = atmGrad;
        ctx.fillRect(0, 0, width, height);

        // Limb highlight — sharp bright edge
        const limbGrad = ctx.createRadialGradient(hcx, hcy, hradius * 0.87, hcx, hcy, hradius * 0.98);
        limbGrad.addColorStop(0,   "rgba(0, 0, 0, 0)");
        limbGrad.addColorStop(0.5, "rgba(120, 210, 255, 0.12)");
        limbGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = limbGrad;
        ctx.fillRect(0, 0, width, height);

        ctx.restore();
      }

      // ─── 5. CINEMATIC LIGHT VOLUMES ──────────────────────────────────────
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // Diagonal beam from top-right
      {
        const lx = width * 0.88 + (mx - 0.5) * 18;
        const ly = -height * 0.05 + (my - 0.5) * 12;
        const lg = ctx.createLinearGradient(lx, ly, lx - width * 0.5, ly + height * 0.8);
        lg.addColorStop(0,   "rgba(120, 190, 255, 0.08)");  // boosted ~3x
        lg.addColorStop(0.5, "rgba(70, 140, 230, 0.04)");
        lg.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = lg;
        ctx.fillRect(0, 0, width, height);
      }

      // Vertical god-ray behind hero text
      {
        const rayX = width * 0.5 + (mx - 0.5) * 12;
        const rayW = width * 0.40;
        const rg = ctx.createLinearGradient(rayX, 0, rayX, height * 0.65);
        rg.addColorStop(0,   "rgba(160, 220, 255, 0.045)"); // boosted ~3.5x
        rg.addColorStop(0.5, "rgba(90, 160, 255, 0.02)");
        rg.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = rg;
        ctx.fillRect(rayX - rayW / 2, 0, rayW, height * 0.65);
      }

      ctx.restore();

      // ─── 6. FOCAL STAR — upper-right, breathing ──────────────────────────
      {
        const fsx = width * 0.78 + (mx - 0.5) * 20;
        const fsy = height * 0.20 - scrollY * 0.04 + (my - 0.5) * 14;

        if (fsy > -120 && fsy < height + 120) {
          const pulse = 1 + 0.06 * Math.sin(elapsed * 0.65);
          const pOp   = 0.95 + 0.05 * Math.sin(elapsed * 0.65);

          ctx.beginPath();
          ctx.arc(fsx, fsy, 1.8 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();

          const ig = ctx.createRadialGradient(fsx, fsy, 0, fsx, fsy, 20 * pulse);
          ig.addColorStop(0,   "rgba(255,255,255,0.85)");
          ig.addColorStop(0.4, "rgba(186,230,253,0.35)");
          ig.addColorStop(1.0, "rgba(0,0,0,0)");
          ctx.fillStyle = ig;
          ctx.beginPath(); ctx.arc(fsx, fsy, 20 * pulse, 0, Math.PI * 2); ctx.fill();

          const og = ctx.createRadialGradient(fsx, fsy, 0, fsx, fsy, 100 * pulse);
          og.addColorStop(0,   "rgba(200,235,255,0.22)");
          og.addColorStop(0.5, "rgba(14,56,122,0.07)");
          og.addColorStop(1.0, "rgba(0,0,0,0)");
          ctx.fillStyle = og;
          ctx.beginPath(); ctx.arc(fsx, fsy, 100 * pulse, 0, Math.PI * 2); ctx.fill();

          // Diffraction spikes
          ctx.save();
          ctx.translate(fsx, fsy);
          ctx.rotate(elapsed * 0.012);
          const sLen = (isMobile ? 55 : 100) * pulse;
          const sg = ctx.createLinearGradient(-sLen, 0, sLen, 0);
          sg.addColorStop(0,   "rgba(255,255,255,0)");
          sg.addColorStop(0.5, `rgba(220,240,255,${0.28 * pOp})`);
          sg.addColorStop(1.0, "rgba(255,255,255,0)");
          ctx.strokeStyle = sg;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(-sLen, 0); ctx.lineTo(sLen, 0);
          ctx.moveTo(0, -sLen); ctx.lineTo(0, sLen);
          ctx.stroke();
          ctx.restore();
        }
      }

      // ─── 7. EDGE VIGNETTE ────────────────────────────────────────────────
      const vig = ctx.createRadialGradient(
        width / 2, height / 2, height * 0.28,
        width / 2, height / 2, height * 0.95
      );
      vig.addColorStop(0,   "rgba(0,0,0,0)");
      vig.addColorStop(1.0, "rgba(0,0,0,0.5)");
      ctx.fillStyle = vig;
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
