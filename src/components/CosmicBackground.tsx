import { useEffect, useRef, useState } from "react";

interface ParallaxStar {
  x: number; // Normalized coordinate (0 to 1) for responsive positioning
  y: number; // Normalized coordinate (0 to 1) for responsive positioning
  layer: "far" | "mid" | "near";
  size: number;
  baseOpacity: number;
  color: string;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface FloatingDust {
  x: number; // Normalized
  y: number; // Normalized
  size: number;
  phase: number;
  speed: number;
  baseOpacity: number;
}

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetScrollY = useRef(0);
  const currentScrollY = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync scroll position with passive scroll listener
  useEffect(() => {
    if (!isClient) return;

    const handleScroll = () => {
      targetScrollY.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Responsive document height tracking
    let docHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight, 3000);

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      docHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight, 3000);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const isMobile = window.innerWidth < 768;

    // Precompute stars
    const stars: ParallaxStar[] = [];
    const countFar = isMobile ? 120 : 350;
    const countMid = isMobile ? 80 : 200;
    const countNear = isMobile ? 10 : 25;

    // Star color templates (highly realistic astronomical colors)
    const farColors = ["rgba(165, 180, 252, ", "rgba(186, 230, 253, ", "rgba(255, 255, 255, "];
    const midColors = ["rgba(255, 255, 255, ", "rgba(224, 242, 254, ", "rgba(253, 230, 138, "];

    // Far Stars: twinkle subtly
    for (let i = 0; i < countFar; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        layer: "far",
        size: Math.random() * 0.7 + 0.3,
        baseOpacity: Math.random() * 0.4 + 0.25,
        color: farColors[Math.floor(Math.random() * farColors.length)],
        twinkleSpeed: Math.random() * 0.003 + 0.001,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    // Mid Stars: crisp, no twinkle
    for (let i = 0; i < countMid; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        layer: "mid",
        size: Math.random() * 0.8 + 0.4,
        baseOpacity: Math.random() * 0.5 + 0.3,
        color: midColors[Math.floor(Math.random() * midColors.length)],
        twinkleSpeed: 0,
        twinklePhase: 0,
      });
    }

    // Near Stars: bokeh radial gradient circles, no twinkle
    for (let i = 0; i < countNear; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        layer: "near",
        size: Math.random() * 2.0 + 1.5,
        baseOpacity: Math.random() * 0.3 + 0.2,
        color: "rgba(224, 242, 254, ",
        twinkleSpeed: 0,
        twinklePhase: 0,
      });
    }

    // Cosmic Dust: extremely subtle and sparse
    const dustParticles: FloatingDust[] = [];
    const countDust = isMobile ? 8 : 20;
    for (let i = 0; i < countDust; i++) {
      dustParticles.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 3.0 + 2.0,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.0004 + 0.0001,
        baseOpacity: Math.random() * 0.03 + 0.015,
      });
    }

    // Render loop
    const render = (time: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = time;
      }
      const elapsed = time - startTimeRef.current;

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // Smooth scroll lerping for cinematic feeling
      currentScrollY.current += (targetScrollY.current - currentScrollY.current) * 0.08;
      const scrollY = currentScrollY.current;

      // 1. Layer 1 — Deep Space Gradient (Deep navy -> Dark blue -> Near-black)
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#030611");      // Top: Deep navy
      gradient.addColorStop(0.5, "#060a1d");    // Center: Dark blue
      gradient.addColorStop(1.0, "#010206");    // Bottom: Near-black
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Layer 2 — Large Nebula Structures (Drifting & Blurred)
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // Super slow, almost imperceptible nebula drift
      const nebulaDriftX = Math.sin(time * 0.00002) * 20;
      const nebulaDriftY = Math.cos(time * 0.000015) * 15;

      // Blue Nebula (~1.0x width) - Center/Left
      const blueX = width * 0.2 + nebulaDriftX;
      const blueY = height * 0.45 - scrollY * 0.04 + nebulaDriftY;
      const blueRadius = width * 1.0;
      const blueGrad = ctx.createRadialGradient(blueX, blueY, 0, blueX, blueY, blueRadius);
      blueGrad.addColorStop(0, "rgba(29, 78, 216, 0.06)"); // Deep blue aura
      blueGrad.addColorStop(0.5, "rgba(30, 58, 138, 0.02)");
      blueGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = blueGrad;
      ctx.fillRect(0, 0, width, height);

      // Cyan Nebula (~0.85x width) - Upper/Right
      const cyanX = width * 0.8 + nebulaDriftY;
      const cyanY = height * 0.2 - scrollY * 0.03 + nebulaDriftX;
      const cyanRadius = width * 0.85;
      const cyanGrad = ctx.createRadialGradient(cyanX, cyanY, 0, cyanX, cyanY, cyanRadius);
      cyanGrad.addColorStop(0, "rgba(6, 182, 212, 0.04)"); // Vibrant cyan core
      cyanGrad.addColorStop(0.4, "rgba(8, 145, 178, 0.015)");
      cyanGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = cyanGrad;
      ctx.fillRect(0, 0, width, height);

      // Violet Nebula (~0.9x width) - Bottom/Center
      const violetX = width * 0.5 + nebulaDriftX * 0.8;
      const violetY = height * 0.75 - scrollY * 0.05 + nebulaDriftY * 0.8;
      const violetRadius = width * 0.9;
      const violetGrad = ctx.createRadialGradient(violetX, violetY, 0, violetX, violetY, violetRadius);
      violetGrad.addColorStop(0, "rgba(109, 40, 217, 0.05)"); // Deep violet glow
      violetGrad.addColorStop(0.5, "rgba(88, 28, 135, 0.015)");
      violetGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = violetGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.restore();

      // 3. Layer 3 — Star Field Depth (Far, Mid, Near)
      stars.forEach((star) => {
        // Compute parallax offset
        let parallaxOffset = 0;
        if (star.layer === "far") {
          parallaxOffset = scrollY * 0.02;
        } else if (star.layer === "mid") {
          parallaxOffset = scrollY * 0.06;
        } else {
          parallaxOffset = scrollY * 0.15;
        }

        // Calculate positioning inside scrollable document space, then wrap to viewport
        const starWorldY = star.y * docHeight - parallaxOffset;
        const wrappedY = ((starWorldY % docHeight) + docHeight) % docHeight;

        // Only draw if visible on viewport
        if (wrappedY >= -20 && wrappedY <= height + 20) {
          const screenX = star.x * width;

          if (star.layer === "far") {
            // Far stars twinkle subtly (±20% max opacity variation)
            const twinkle = Math.sin(elapsed * star.twinkleSpeed + star.twinklePhase) * 0.2;
            const opacity = Math.max(0.05, star.baseOpacity + twinkle);
            ctx.fillStyle = `${star.color}${opacity})`;
            ctx.beginPath();
            ctx.arc(screenX, wrappedY, star.size, 0, Math.PI * 2);
            ctx.fill();
          } else if (star.layer === "mid") {
            // Mid stars: crisp, stable opacity
            ctx.fillStyle = `${star.color}${star.baseOpacity})`;
            ctx.beginPath();
            ctx.arc(screenX, wrappedY, star.size, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Near stars: bokeh radial gradient circles for a premium lens-defocus feel without filter overhead
            const bokehGrad = ctx.createRadialGradient(
              screenX,
              wrappedY,
              0,
              screenX,
              wrappedY,
              star.size
            );
            bokehGrad.addColorStop(0, `${star.color}${star.baseOpacity})`);
            bokehGrad.addColorStop(0.3, `${star.color}${star.baseOpacity * 0.4})`);
            bokehGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");

            ctx.fillStyle = bokehGrad;
            ctx.beginPath();
            ctx.arc(screenX, wrappedY, star.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // 4. Layer 4 — Hero Focal Star (Upper-Right region)
      // Placed vertically stable to remain near the hero text section
      const heroStarX = width * 0.78;
      const heroStarY = height * 0.22 - scrollY * 0.05;

      if (heroStarY >= -150 && heroStarY <= height + 150) {
        // Slow breathing pulse for expanding and contracting glow (period of ~7.8 seconds)
        const pulse = 1.0 + 0.06 * Math.sin(elapsed * 0.0008);
        const pulseOpacity = 0.95 + 0.05 * Math.sin(elapsed * 0.0008);

        // Core White point
        ctx.beginPath();
        ctx.arc(heroStarX, heroStarY, 1.6 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        // Inner core blue-white glow
        const innerGlow = ctx.createRadialGradient(
          heroStarX,
          heroStarY,
          0,
          heroStarX,
          heroStarY,
          18 * pulse
        );
        innerGlow.addColorStop(0, "rgba(255, 255, 255, 0.75)");
        innerGlow.addColorStop(0.4, "rgba(186, 230, 253, 0.3)");
        innerGlow.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.arc(heroStarX, heroStarY, 18 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Outer ambient glow
        const outerGlow = ctx.createRadialGradient(
          heroStarX,
          heroStarY,
          0,
          heroStarX,
          heroStarY,
          90 * pulse
        );
        outerGlow.addColorStop(0, "rgba(224, 242, 254, 0.18)");
        outerGlow.addColorStop(0.5, "rgba(14, 56, 122, 0.05)");
        outerGlow.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(heroStarX, heroStarY, 90 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Premium diffraction spikes (slowly rotating)
        ctx.save();
        ctx.translate(heroStarX, heroStarY);
        ctx.rotate(elapsed * 0.000015);

        const spikeLen = (isMobile ? 50 : 90) * pulse;
        const spikeGrad = ctx.createLinearGradient(-spikeLen, 0, spikeLen, 0);
        spikeGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        spikeGrad.addColorStop(0.5, `rgba(224, 242, 254, ${0.2 * pulseOpacity})`);
        spikeGrad.addColorStop(1.0, "rgba(255, 255, 255, 0)");

        ctx.strokeStyle = spikeGrad;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        // H spike
        ctx.moveTo(-spikeLen, 0);
        ctx.lineTo(spikeLen, 0);
        // V spike
        ctx.moveTo(0, -spikeLen);
        ctx.lineTo(0, spikeLen);
        ctx.stroke();

        ctx.restore();
      }

      // 5. Layer 5 — Cosmic Dust (Subtle drifting particles)
      dustParticles.forEach((dust) => {
        // Slow organic wave motion
        dust.phase += dust.speed;
        const driftX = Math.sin(dust.phase) * 10;
        const driftY = Math.cos(dust.phase * 0.8) * 8;

        const dustWorldY = dust.y * docHeight - scrollY * 0.03 + driftY;
        const wrappedY = ((dustWorldY % docHeight) + docHeight) % docHeight;

        if (wrappedY >= -20 && wrappedY <= height + 20) {
          const screenX = ((dust.x * width + driftX) % width + width) % width;
          const pulse = Math.sin(elapsed * 0.0005 + dust.phase) * 0.2 + 0.8;

          const dustGrad = ctx.createRadialGradient(
            screenX,
            wrappedY,
            0,
            screenX,
            wrappedY,
            dust.size
          );
          dustGrad.addColorStop(0, `rgba(165, 243, 252, ${dust.baseOpacity * pulse})`);
          dustGrad.addColorStop(0.6, `rgba(129, 140, 248, ${dust.baseOpacity * 0.3 * pulse})`);
          dustGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");

          ctx.fillStyle = dustGrad;
          ctx.beginPath();
          ctx.arc(screenX, wrappedY, dust.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

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
    return <div className="fixed inset-0 w-full h-full bg-[#030611] pointer-events-none -z-40" />;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none -z-40 print:hidden block"
      id="cosmic-cinematic-bg"
    />
  );
}
