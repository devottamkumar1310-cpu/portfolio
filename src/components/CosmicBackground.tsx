import { useEffect, useRef, useState } from "react";

interface Star {
  x: number; // Virtual coordinates (-1000 to 1000)
  y: number;
  z: number; // Depth factor (0.2 to 2.5)
  baseSize: number;
  color: string;
  twinkleSpeed: number;
  twinklePhase: number;
}

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollYRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync scroll position using passive scroll listener
  useEffect(() => {
    if (!isClient) return;

    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
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

    // Set high-DPI scaling
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialise realistic star coordinates (realistic density)
    // We render ~1200 stars on desktop and auto-reduce to ~400 on mobile for flawless performance
    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 350 : 1200;
    const stars: Star[] = [];

    // Star color distributions (soft white, vintage astronomical yellow, hot sky cyan)
    const starColors = [
      "rgba(255, 255, 255, ",
      "rgba(224, 242, 254, ", // light cyan
      "rgba(243, 244, 246, ", // slate white
      "rgba(254, 243, 199, ", // amber warm star
    ];

    for (let i = 0; i < starCount; i++) {
      // Coordinate generation centered around a virtual camera view
      stars.push({
        x: (Math.random() - 0.5) * 2200,
        y: (Math.random() - 0.5) * 2200,
        z: Math.random() * 2.3 + 0.2, // depth factor
        baseSize: Math.random() * 0.95 + 0.25, // astronomical sizes
        color: starColors[Math.floor(Math.random() * starColors.length)],
        twinkleSpeed: Math.random() * 0.015 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    // Begin render loop
    const render = (time: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = time;
      }
      const elapsed = (time - startTimeRef.current) / 1000; // in seconds

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // --- 1. LANDING SEQUENCE MATRICES (Multi-stage cinematic timeline) ---
      // Progression timings:
      // t = 0s to 0.4s: Void Dark
      // t = 0.4s to 2.5s: Single Hero Star glows up elegantly
      // t = 1.8s to 5.0s: Deep dense astronomical Star Field slowly fades in
      // t = 3.0s to 8.5s: Volumetric Nebula core gases transition into sight

      const heroStarOpacity = Math.max(0, Math.min(1, (elapsed - 0.4) / 1.8));
      const starFieldOpacity = Math.max(0, Math.min(1, (elapsed - 1.8) / 3.0));
      const nebulaOpacity = Math.max(0, Math.min(1, (elapsed - 3.0) / 4.5));

      // --- 2. THE BACKGROUND DEEP SPACE VOID ---
      // Multi-stop background interpolation representing the absolute void
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, "#020308"); // Ultra deep royal space void
      bgGrad.addColorStop(0.5, "#040612"); // Muted interstellar density
      bgGrad.addColorStop(1, "#010205"); // Clean background base
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Current scrolling values
      const currentScrollY = scrollYRef.current;

      // --- 3. LAYER 2: VOLUMETRIC NEBULA CLOUDS ---
      if (nebulaOpacity > 0) {
        ctx.save();
        ctx.globalAlpha = nebulaOpacity;
        ctx.globalCompositeOperation = "screen";

        const oscillation = Math.sin(time * 0.00012) * 12;
        const driftY = currentScrollY * -0.05; // Slow relative drift

        // Core 1: Deep Cyanic Glow (Top-Left quadrant)
        const cyanGrad = ctx.createRadialGradient(
          width * 0.15 + oscillation,
          height * 0.2 + driftY,
          10,
          width * 0.2 + oscillation,
          height * 0.25 + driftY,
          width * 0.65
        );
        cyanGrad.addColorStop(0, "rgba(8, 48, 88, 0.14)"); // Muted glowing cyan gas
        cyanGrad.addColorStop(0.5, "rgba(4, 28, 62, 0.06)");
        cyanGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = cyanGrad;
        ctx.fillRect(0, 0, width, height);

        // Core 2: Royal Indigo Nebula (Lower-Right quadrant behind details)
        const violetGrad = ctx.createRadialGradient(
          width * 0.8 - oscillation * 1.5,
          height * 0.7 + driftY * 0.8,
          5,
          width * 0.75 - oscillation * 1.5,
          height * 0.75 + driftY * 0.8,
          width * 0.7
        );
        violetGrad.addColorStop(0, "rgba(22, 10, 50, 0.12)"); // Faint dark cosmic violet
        violetGrad.addColorStop(0.4, "rgba(10, 6, 32, 0.04)");
        violetGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = violetGrad;
        ctx.fillRect(0, 0, width, height);

        // Core 3: Ethereal Subtle Space Sky Glow (Center background)
        const centerGrad = ctx.createRadialGradient(
          width * 0.5,
          height * 0.45 + driftY * 0.4,
          50,
          width * 0.5,
          height * 0.5 + driftY * 0.4,
          width * 0.5
        );
        centerGrad.addColorStop(0, "rgba(12, 38, 75, 0.07)");
        centerGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = centerGrad;
        ctx.fillRect(0, 0, width, height);

        ctx.restore();
      }

      // --- 4. LAYER 3: DENSE STAR FIELD WITH REALISTIC PERSPECTIVE ---
      if (starFieldOpacity > 0) {
        ctx.save();
        ctx.globalAlpha = starFieldOpacity;

        stars.forEach((star) => {
          // Adjust position coordinates dynamically according to deep depth factor
          // We project virtual camera properties
          const viewDistance = 1.0;
          
          // Micro cosmic rotation / float formula (practically unnoticeable, but rich detail)
          const angle = time * 0.00001 / star.z;
          const rotX = star.x * Math.cos(angle) - star.y * Math.sin(angle);
          const rotY = star.x * Math.sin(angle) + star.y * Math.cos(angle);

          // Deep perspective math projection
          // Distant starfield moves exceptionally slowly, forging rich astronomical scale
          const scrollParallax = currentScrollY * -1.15 * (1.1 / (star.z + 1.25));
          
          // Center coordinate mappings
          const screenX = width / 2 + rotX * viewDistance;
          const screenY = height * 0.4 + rotY * viewDistance + scrollParallax;

          // Wrap stars around cleanly if they escape the top or bottom of viewport height bound
          const wrappedY = ((screenY % (height + 200)) + (height + 200)) % (height + 200) - 100;

          // Only render visible star targets for peak frame optimization
          if (screenX >= -10 && screenX <= width + 10) {
            // Apply star twinkle dynamics based on individual oscillating states
            star.twinklePhase += star.twinkleSpeed;
            const twinkleAlpha = 0.25 + (Math.sin(star.twinklePhase) * 0.5 + 0.5) * 0.75;
            
            // Adjust scale size based on depth profile
            const scaleSize = (star.baseSize / (star.z * 0.35 + 0.65));

            ctx.beginPath();
            ctx.arc(screenX, wrappedY, scaleSize, 0, Math.PI * 2);
            ctx.fillStyle = `${star.color}${twinkleAlpha})`;
            ctx.fill();
          }
        });

        ctx.restore();
      }

      // --- 5. LAYER 4: THE FLAGSHIP REVEAL HERO STAR (ACTS AS DISTANT SUN) ---
      if (heroStarOpacity > 0) {
        ctx.save();
        ctx.globalAlpha = heroStarOpacity;

        // Positioning it elegantly at top-center offset behind hero text
        // Moves very slowly with parallax
        const heroStarX = width * 0.5;
        const heroStarY = height * 0.28 - currentScrollY * 0.06;

        // Limit rendering to screen visible height
        if (heroStarY >= -50 && heroStarY <= height + 50) {
          // Micro pulse breathing sequence
          const starSeconds = time / 1000;
          const pulseFactor = Math.sin(starSeconds * 0.6) * 0.08 + 0.92;

          // Draw extreme soft outer radiant gas halo
          const haloGrad = ctx.createRadialGradient(
            heroStarX,
            heroStarY,
            0.5,
            heroStarX,
            heroStarY,
            38 * pulseFactor
          );
          haloGrad.addColorStop(0, "rgba(224, 242, 254, 0.25)"); // delicate cyan/white gas halo
          haloGrad.addColorStop(0.35, "rgba(40, 110, 200, 0.06)");
          haloGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.beginPath();
          ctx.arc(heroStarX, heroStarY, 40 * pulseFactor, 0, Math.PI * 2);
          ctx.fillStyle = haloGrad;
          ctx.fill();

          // Draw the high-intensity concentrated micro core
          ctx.beginPath();
          ctx.arc(heroStarX, heroStarY, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
          ctx.shadowColor = "rgba(255, 255, 255, 1.0)";
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0; // reset shadow state for frame rendering

          // Draw astronomically realistic thin ray extensions (horizontal & vertical)
          ctx.lineWidth = 0.65;
          ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
          
          ctx.beginPath();
          // Horizontal axis line
          ctx.moveTo(heroStarX - 35 * pulseFactor, heroStarY);
          ctx.lineTo(heroStarX + 35 * pulseFactor, heroStarY);
          // Vertical axis line
          ctx.moveTo(heroStarX, heroStarY - 35 * pulseFactor);
          ctx.lineTo(heroStarX, heroStarY + 35 * pulseFactor);
          ctx.stroke();
        }

        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    // Kickstarts the loop
    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isClient]);

  if (!isClient) {
    return <div className="fixed inset-0 w-full h-full bg-[#020308] pointer-events-none -z-40" />;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none -z-40 print:hidden block"
      id="cosmic-cinematic-bg"
    />
  );
}

