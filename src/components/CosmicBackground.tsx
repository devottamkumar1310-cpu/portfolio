import { useEffect, useRef, useState } from "react";

interface Star { x: number; y: number; size: number; opacity: number; tint: number; }

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef    = useRef<number | null>(null);
  const tRef       = useRef<number | null>(null);
  const mouseRef   = useRef({ x: 0.5, y: 0.5 });
  const mouseTgt   = useRef({ x: 0.5, y: 0.5 });
  const [ready, setReady] = useState(false);

  useEffect(() => { setReady(true); }, []);

  useEffect(() => {
    if (!ready) return;
    const onMouse = (e: MouseEvent) => {
      mouseTgt.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };
    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => window.removeEventListener("mousemove", onMouse);
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let W = 0, H = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const mobile = W < 768;

    // ── Grain texture (once) ───────────────────────────────────────────────
    const gc = document.createElement("canvas");
    gc.width = 256; gc.height = 256;
    const gx = gc.getContext("2d")!;
    const gi = gx.createImageData(256, 256);
    for (let i = 0; i < gi.data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      gi.data[i] = v; gi.data[i+1] = v; gi.data[i+2] = v;
      gi.data[i+3] = Math.floor(Math.random() * 20 + 2);
    }
    gx.putImageData(gi, 0, 0);
    const grain = ctx.createPattern(gc, "repeat");

    // ── Stars (varied density, no glow) ───────────────────────────────────
    const N = mobile ? 280 : 500;
    const stars: Star[] = Array.from({ length: N }, (_, i) => {
      const far = i < N * 0.75;
      return {
        x:       Math.random(),
        y:       Math.random(),
        size:    far ? Math.random() * 0.40 + 0.12 : Math.random() * 0.65 + 0.38,
        opacity: far ? Math.random() * 0.30 + 0.08 : Math.random() * 0.42 + 0.28,
        tint:    Math.random(), // 0=white, 1=blue-white
      };
    });

    // ── Helper: draw a radial ellipse (volumetric cloud blob) ─────────────
    const ellipseBlob = (
      cx: number, cy: number,
      rx: number, ry: number,
      r0: number, r1: number,
      c0: string, c1: string,
      angle = 0
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.scale(rx / ry, 1);
      const g = ctx.createRadialGradient(0, 0, r0, 0, 0, r1);
      g.addColorStop(0, c0);
      g.addColorStop(1, c1);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, r1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // ── Render loop ───────────────────────────────────────────────────────
    const draw = (time: number) => {
      if (!tRef.current) tRef.current = time;
      const t = (time - tRef.current) * 0.001;

      mouseRef.current.x += (mouseTgt.current.x - mouseRef.current.x) * 0.025;
      mouseRef.current.y += (mouseTgt.current.y - mouseRef.current.y) * 0.025;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // ── 1. VOID ────────────────────────────────────────────────────────
      ctx.fillStyle = "#000004";
      ctx.fillRect(0, 0, W, H);

      // ── 2. DEEP SPACE COLOUR TEMPERATURE ─────────────────────────────
      // Very faint warm-cold gradient to make the void feel enormous
      {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const bg = ctx.createRadialGradient(W * 0.5, H * 0.35, 0, W * 0.5, H * 0.5, H * 0.85);
        bg.addColorStop(0,   "rgba(8, 18, 48, 0.55)");
        bg.addColorStop(0.5, "rgba(4, 10, 28, 0.28)");
        bg.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // ── 3. STARS ───────────────────────────────────────────────────────
      stars.forEach((s, i) => {
        const p  = i < N * 0.5 ? 0 : i < N * 0.85 ? 1 : 2;
        const ms = p === 0 ? 3 : p === 1 ? 9 : 18;
        const sx = (s.x * W + (mx - 0.5) * ms + W) % W;
        const sy = (s.y * H + (my - 0.5) * ms * 0.7 + H) % H;
        const col = s.tint > 0.7
          ? `rgba(190,218,255,${s.opacity})`
          : `rgba(255,255,255,${s.opacity})`;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── 4. VOLUMETRIC NEBULAE ─────────────────────────────────────────
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      const nd = Math.sin(t * 0.025) * 0.008; // slow drift factor

      // ── LEFT NEBULA — upper-left quadrant, large volumetric mass ─────
      {
        const lx = W * (0.10 + nd) + (mx - 0.5) * 20;
        const ly = H * (0.32 - nd * 0.5) + (my - 0.5) * 13;

        // Outer envelope — huge, defines the mass
        ellipseBlob(lx, ly, 1.45, 1.0, 0, H * 0.62,
          "rgba(22, 65, 175, 0.30)", "rgba(0, 0, 0, 0)", -0.20);

        // Core cloud — brighter, smaller
        ellipseBlob(lx + W * 0.03, ly - H * 0.04, 1.20, 1.0, 0, H * 0.38,
          "rgba(40, 105, 220, 0.36)", "rgba(0, 0, 0, 0)", -0.15);

        // Bright sub-region — gives sense of internal illumination
        ellipseBlob(lx - W * 0.02, ly - H * 0.08, 0.70, 1.0, 0, H * 0.18,
          "rgba(80, 155, 245, 0.28)", "rgba(0, 0, 0, 0)", -0.10);

        // Top wisp extending diagonally toward center
        ellipseBlob(lx + W * 0.10, ly - H * 0.15, 0.14, 1.0, 0, H * 0.35,
          "rgba(140, 200, 255, 0.22)", "rgba(0, 0, 0, 0)", 0.55);

        // Bottom diffuse scatter toward planet
        ellipseBlob(lx - W * 0.05, ly + H * 0.12, 1.60, 1.0, 0, H * 0.45,
          "rgba(15, 50, 145, 0.18)", "rgba(0, 0, 0, 0)", -0.25);
      }

      // ── RIGHT NEBULA — upper-right quadrant, mirrored structure ──────
      {
        const rx = W * (0.88 - nd * 0.7) + (mx - 0.5) * 14;
        const ry = H * (0.28 + nd * 0.4) + (my - 0.5) * 10;

        // Outer envelope
        ellipseBlob(rx, ry, 1.40, 1.0, 0, H * 0.58,
          "rgba(20, 62, 168, 0.28)", "rgba(0, 0, 0, 0)", 0.18);

        // Core
        ellipseBlob(rx - W * 0.03, ry - H * 0.05, 1.15, 1.0, 0, H * 0.34,
          "rgba(38, 100, 215, 0.34)", "rgba(0, 0, 0, 0)", 0.14);

        // Bright sub-region
        ellipseBlob(rx + W * 0.02, ry - H * 0.09, 0.65, 1.0, 0, H * 0.16,
          "rgba(75, 150, 240, 0.26)", "rgba(0, 0, 0, 0)", 0.08);

        // Top wisp
        ellipseBlob(rx - W * 0.09, ry - H * 0.14, 0.12, 1.0, 0, H * 0.32,
          "rgba(135, 195, 252, 0.20)", "rgba(0, 0, 0, 0)", -0.52);

        // Diffuse scatter
        ellipseBlob(rx + W * 0.04, ry + H * 0.10, 1.55, 1.0, 0, H * 0.40,
          "rgba(12, 46, 138, 0.16)", "rgba(0, 0, 0, 0)", 0.22);
      }

      // ── ATMOSPHERIC HAZE — ties both nebulae together ─────────────────
      // Faint upper atmosphere connecting left & right across the top
      {
        const hg = ctx.createLinearGradient(0, 0, 0, H * 0.50);
        hg.addColorStop(0,    "rgba(8, 22, 80, 0.22)");
        hg.addColorStop(0.45, "rgba(4, 12, 45, 0.10)");
        hg.addColorStop(1.0,  "rgba(0, 0, 0, 0)");
        ctx.fillStyle = hg;
        ctx.fillRect(0, 0, W, H * 0.50);
      }

      ctx.restore();

      // ── 5. PLANET BODY ────────────────────────────────────────────────
      {
        const pMX = (mx - 0.5) * 14;
        const pMY = (my - 0.5) * 9;
        const pCX = W  * (mobile ? -0.42 : -0.36) + pMX;
        const pCY = H  * (mobile ? 1.45  : 1.42)  + pMY;
        const pR  = Math.max(W, H) * (mobile ? 0.82 : 0.76);

        // Black planet body — occludes stars completely
        ctx.save();
        ctx.beginPath();
        ctx.arc(pCX, pCY, pR, 0, Math.PI * 2);
        const pg = ctx.createRadialGradient(pCX, pCY, 0, pCX, pCY, pR);
        pg.addColorStop(0,   "rgba(5, 9, 20, 0.99)");
        pg.addColorStop(0.7, "rgba(2, 4, 9, 1.0)");
        pg.addColorStop(1.0, "rgba(0, 1, 3, 1.0)");
        ctx.fillStyle = pg;
        ctx.fill();
        ctx.restore();

        // ── Atmospheric rim glow — 5-layer build-up ──────────────────
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        // Layer A: Wide outer atmosphere scatter
        const a1 = ctx.createRadialGradient(pCX, pCY, pR * 0.84, pCX, pCY, pR * 1.14);
        a1.addColorStop(0,    "rgba(0, 0, 0, 0)");
        a1.addColorStop(0.30, "rgba(8, 42, 140, 0.22)");
        a1.addColorStop(0.58, "rgba(28, 110, 230, 0.38)");
        a1.addColorStop(0.78, "rgba(85, 185, 255, 0.30)");
        a1.addColorStop(0.93, "rgba(150, 225, 255, 0.14)");
        a1.addColorStop(1.0,  "rgba(0, 0, 0, 0)");
        ctx.fillStyle = a1;
        ctx.fillRect(0, 0, W, H);

        // Layer B: Sharp limb edge
        const a2 = ctx.createRadialGradient(pCX, pCY, pR * 0.93, pCX, pCY, pR * 1.03);
        a2.addColorStop(0,   "rgba(0, 0, 0, 0)");
        a2.addColorStop(0.4, "rgba(165, 225, 255, 0.36)");
        a2.addColorStop(0.75,"rgba(210, 242, 255, 0.24)");
        a2.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = a2;
        ctx.fillRect(0, 0, W, H);

        // Layer C: Terminator halo (thin bright ring)
        const a3 = ctx.createRadialGradient(pCX, pCY, pR * 0.97, pCX, pCY, pR * 1.006);
        a3.addColorStop(0,   "rgba(0, 0, 0, 0)");
        a3.addColorStop(0.5, "rgba(235, 250, 255, 0.36)");
        a3.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = a3;
        ctx.fillRect(0, 0, W, H);

        // Layer D: Backlit sun-scatter spot (upper-right arc is where sun is)
        const bx = pCX + pR * 0.44;
        const by = pCY - pR * 0.50;
        const a4 = ctx.createRadialGradient(bx, by, 0, bx, by, pR * 0.40);
        a4.addColorStop(0,   "rgba(215, 242, 255, 0.28)");
        a4.addColorStop(0.4, "rgba(140, 205, 255, 0.15)");
        a4.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = a4;
        ctx.fillRect(0, 0, W, H);

        // Layer E: Atmospheric glow UP from horizon, illuminates bottom of scene
        // This creates the sense that the planet is a light source
        const hx = pCX + pR * 0.32;
        const hy = pCY - pR * 0.62;
        const a5 = ctx.createRadialGradient(hx, hy, 0, hx, hy, pR * 0.75);
        a5.addColorStop(0,   "rgba(55, 140, 255, 0.12)");
        a5.addColorStop(0.4, "rgba(20, 80, 200, 0.06)");
        a5.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = a5;
        ctx.fillRect(0, 0, W, H);

        ctx.restore();
      }

      // ── 6. GRAIN ──────────────────────────────────────────────────────
      if (grain) {
        ctx.save();
        ctx.globalAlpha = 0.032;
        ctx.globalCompositeOperation = "overlay";
        ctx.fillStyle = grain;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // ── 7. VIGNETTE — strong at corners, completely clear at center ───
      {
        // Top-left corner darkness (nebula is there but vignette anchors it)
        const vtl = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.55);
        vtl.addColorStop(0,   "rgba(0,0,0,0.30)");
        vtl.addColorStop(1.0, "rgba(0,0,0,0)");
        ctx.fillStyle = vtl;
        ctx.fillRect(0, 0, W, H);

        // Top-right corner
        const vtr = ctx.createRadialGradient(W, 0, 0, W, 0, W * 0.55);
        vtr.addColorStop(0,   "rgba(0,0,0,0.28)");
        vtr.addColorStop(1.0, "rgba(0,0,0,0)");
        ctx.fillStyle = vtr;
        ctx.fillRect(0, 0, W, H);

        // Central radial — keeps centre black
        const vc = ctx.createRadialGradient(
          W * 0.50, H * 0.44, H * 0.10,
          W * 0.50, H * 0.48, H * 0.92
        );
        vc.addColorStop(0,    "rgba(0,0,0,0)");
        vc.addColorStop(0.68, "rgba(0,0,0,0.10)");
        vc.addColorStop(1.0,  "rgba(0,0,0,0.55)");
        ctx.fillStyle = vc;
        ctx.fillRect(0, 0, W, H);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [ready]);

  if (!ready) return <div className="fixed inset-0 bg-[#000004] pointer-events-none -z-40" />;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none -z-40 print:hidden"
      id="cosmic-bg"
    />
  );
}
