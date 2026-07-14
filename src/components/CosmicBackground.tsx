import { useEffect, useRef, useState } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  vx: number;
  vy: number;
  depth: number;
  shimmerSpeed: number;
  shimmerPhase: number;
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

    // ─── 1. FILM GRAIN PATTERN OVERLAY ────────────────────────────────────
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
      imgData.data[i + 3] = Math.floor(Math.random() * 5 + 1); // Faint HUD monitor noise
    }
    gctx.putImageData(imgData, 0, 0);
    const grainPattern = ctx.createPattern(grainCanvas, "repeat");

    // ─── 2. LAYER 1: DISTANT DRIFTING STARS ────────────────────────────────
    const starCount = isMobile ? 220 : 550;
    const stars: Star[] = Array.from({ length: starCount }, () => {
      const sizeRoll = Math.random();
      const depth = sizeRoll > 0.95 ? 0.9 : sizeRoll > 0.7 ? 0.6 : 0.3; // 3 distinct depth levels
      return {
        x: Math.random(),
        y: Math.random(),
        size: sizeRoll > 0.95 ? 0.85 + Math.random() * 0.5 : 0.2 + Math.random() * 0.35,
        opacity: sizeRoll > 0.95 ? 0.25 + Math.random() * 0.35 : 0.06 + Math.random() * 0.18,
        // Extremely slow star drift
        vx: (Math.random() - 0.5) * 0.000015,
        vy: (Math.random() - 0.5) * 0.00001 - 0.000008, // subtle upward drift
        depth,
        shimmerSpeed: sizeRoll > 0.85 ? 0.12 + Math.random() * 0.25 : 0,
        shimmerPhase: Math.random() * Math.PI * 2,
      };
    });

    // ─── 3. RENDER LOOP ───────────────────────────────────────────────────
    const render = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = (time - startTimeRef.current) * 0.001;

      // Mouse Parallax Lerping
      mouseRef.current.x += (mouseTargetRef.current.x - mouseRef.current.x) * 0.035;
      mouseRef.current.y += (mouseTargetRef.current.y - mouseRef.current.y) * 0.035;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const scrollY = scrollYRef.current;

      // Base solid void
      ctx.fillStyle = "#020204";
      ctx.fillRect(0, 0, width, height);

      // Deep Space Baseline Ambient Glow
      const ambientGlow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        0,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.85
      );
      ambientGlow.addColorStop(0, "rgba(2, 6, 22, 0.4)");
      ambientGlow.addColorStop(0.65, "rgba(1, 3, 10, 0.12)");
      ambientGlow.addColorStop(1.0, "#020204");
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height);

      // ─── LAYER 2: NEBULA HAZE (Subtle movement) ──────────────────────────
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      {
        // Cyan Nebula Haze - drifting slowly in a circular orbit
        const cx1 = width * (0.15 + Math.sin(elapsed * 0.015) * 0.03) + (mx - 0.5) * 20;
        const cy1 = height * (0.35 + Math.cos(elapsed * 0.01) * 0.02) - scrollY * 0.012;
        const radius1 = Math.max(width, height) * (isMobile ? 0.55 : 0.42);
        const grad1 = ctx.createRadialGradient(cx1, cy1, 0, cx1, cy1, radius1);
        grad1.addColorStop(0, "rgba(6, 182, 212, 0.05)"); 
        grad1.addColorStop(0.5, "rgba(6, 95, 115, 0.015)");
        grad1.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad1;
        ctx.beginPath();
        ctx.arc(cx1, cy1, radius1, 0, Math.PI * 2);
        ctx.fill();

        // Electric Blue Nebula Haze - drifting slowly
        const cx2 = width * (0.82 + Math.cos(elapsed * 0.012) * 0.03) + (mx - 0.5) * 18;
        const cy2 = height * (0.28 + Math.sin(elapsed * 0.014) * 0.02) - scrollY * 0.012;
        const radius2 = Math.max(width, height) * (isMobile ? 0.6 : 0.45);
        const grad2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, radius2);
        grad2.addColorStop(0, "rgba(59, 130, 246, 0.06)"); 
        grad2.addColorStop(0.5, "rgba(30, 58, 138, 0.015)");
        grad2.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.arc(cx2, cy2, radius2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // ─── LAYER 3: LIGHT BEAMS & ATMOSPHERIC GRADIENTS (Slow shifting) ────
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      {
        // Volumetric Light Beam 1: Swinging slowly from top-right
        const angle1 = Math.sin(elapsed * 0.05) * 0.03;
        ctx.save();
        ctx.translate(width * 0.85, -50);
        ctx.rotate(angle1);
        const beamGrad1 = ctx.createLinearGradient(0, 0, -width * 0.45, height * 0.8);
        beamGrad1.addColorStop(0, "rgba(6, 182, 212, 0.025)"); // cyan highlight
        beamGrad1.addColorStop(0.5, "rgba(59, 130, 246, 0.008)");
        beamGrad1.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = beamGrad1;
        ctx.beginPath();
        ctx.moveTo(-120, 0);
        ctx.lineTo(120, 0);
        ctx.lineTo(-width * 0.1, height);
        ctx.lineTo(-width * 0.6, height);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Volumetric Light Beam 2: Swinging slowly from top-left
        const angle2 = Math.cos(elapsed * 0.04) * 0.04;
        ctx.save();
        ctx.translate(width * 0.12, -80);
        ctx.rotate(angle2);
        const beamGrad2 = ctx.createLinearGradient(0, 0, width * 0.4, height * 0.85);
        beamGrad2.addColorStop(0, "rgba(59, 130, 246, 0.025)"); // blue highlight
        beamGrad2.addColorStop(0.5, "rgba(6, 182, 212, 0.008)");
        beamGrad2.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = beamGrad2;
        ctx.beginPath();
        ctx.moveTo(-100, 0);
        ctx.lineTo(100, 0);
        ctx.lineTo(width * 0.6, height);
        ctx.lineTo(width * 0.1, height);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();

      // ─── LAYER 5: SOFT ILLUMINATION (Hero & EVE sections backlight) ──────
      {
        // Hero Illumination
        const hX = width * 0.5 + (mx - 0.5) * 15;
        const hY = height * 0.26 + (my - 0.5) * 10 - scrollY * 0.15;
        const hRad = Math.max(width, height) * (isMobile ? 0.65 : 0.42);
        const heroGrad = ctx.createRadialGradient(hX, hY, 0, hX, hY, hRad);
        heroGrad.addColorStop(0, "rgba(6, 182, 212, 0.055)"); // soft cyan
        heroGrad.addColorStop(0.5, "rgba(59, 130, 246, 0.02)"); // electric blue
        heroGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = heroGrad;
        ctx.beginPath();
        ctx.arc(hX, hY, hRad, 0, Math.PI * 2);
        ctx.fill();

        // EVE Flagship Illumination (Soft violet backlight, violet reserved for EVE)
        const eX = width * 0.5 + (mx - 0.5) * 12;
        const eY = height * 0.88 + (my - 0.5) * 8 - scrollY * 0.22;
        const eRad = Math.max(width, height) * (isMobile ? 0.62 : 0.4);
        const eveGrad = ctx.createRadialGradient(eX, eY, 0, eX, eY, eRad);
        eveGrad.addColorStop(0, "rgba(139, 92, 246, 0.045)"); // soft violet backlight
        eveGrad.addColorStop(0.5, "rgba(6, 182, 212, 0.015)"); // cyan fade
        eveGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = eveGrad;
        ctx.beginPath();
        ctx.arc(eX, eY, eRad, 0, Math.PI * 2);
        ctx.fill();
      }

      // ─── LAYER 1 & 4: STAR DRIFT & MOUSE-BASED PARALLAX ──────────────────
      stars.forEach((star) => {
        // Drift movement
        star.x += star.vx;
        star.y += star.vy;

        // Wrap stars
        if (star.x < 0) star.x = 1;
        if (star.x > 1) star.x = 0;
        if (star.y < 0) star.y = 1;
        if (star.y > 1) star.y = 0;

        // Layer-based Parallax calculations
        const pX = (mx - 0.5) * star.depth * 30;
        const pY = (my - 0.5) * star.depth * 22 - scrollY * star.depth * 0.5;

        const sx = (star.x * width + pX + width) % width;
        const sy = (star.y * height + pY + height) % height;

        let currentOpacity = star.opacity;
        if (star.shimmerSpeed > 0) {
          currentOpacity = star.opacity * (0.65 + 0.35 * Math.sin(elapsed * star.shimmerSpeed + star.shimmerPhase));
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // ─── FILM GRAIN MONITOR OVERLAY ──────────────────────────────────────
      if (grainPattern) {
        ctx.save();
        ctx.globalCompositeOperation = "overlay";
        ctx.fillStyle = grainPattern;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // Vignette Framing for visual depth
      const centerGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        Math.min(width, height) * 0.22,
        width * 0.5,
        height * 0.45,
        Math.max(width, height) * 0.8
      );
      centerGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
      centerGrad.addColorStop(0.65, "rgba(0, 0, 0, 0.15)");
      centerGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.65)"); // soft OS CRT lens outline
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
    <div className="fixed inset-0 w-full h-full pointer-events-none select-none -z-40 print:hidden overflow-hidden">
      <div className="absolute inset-0 bg-[#020204] -z-50" />
      <canvas ref={canvasRef} className="w-full h-full block" id="cosmic-canvas" />
    </div>
  );
}
