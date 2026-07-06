import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function CosmicBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
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
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !containerRef.current) return;

    const container = containerRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // ─── 1. SETUP SCENE, CAMERA, & RENDERER ─────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#000003");
    
    // Add subtle global deep space fog to blend layers into black void
    scene.fog = new THREE.FogExp2("#000003", 0.00085);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    camera.position.z = 300;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // ─── 2. TEXTURE GENERATORS ─────────────────────────────────────────────
    // Helper to generate soft radial textures procedurally
    const createStarTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.25, "rgba(255, 255, 255, 0.8)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
      return new THREE.CanvasTexture(canvas);
    };

    const createNebulaTexture = (color: string, coreColor: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;
      const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
      grad.addColorStop(0, coreColor);
      grad.addColorStop(0.25, color);
      grad.addColorStop(0.6, "rgba(2, 6, 28, 0.08)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
      return new THREE.CanvasTexture(canvas);
    };

    const starTexture = createStarTexture();
    const nebulaBlue = createNebulaTexture("rgba(15, 45, 135, 0.28)", "rgba(45, 115, 240, 0.22)");
    const nebulaCyan = createNebulaTexture("rgba(0, 75, 120, 0.22)", "rgba(0, 160, 215, 0.16)");

    // ─── 3. STAR FIELD LAYERS ──────────────────────────────────────────────
    const starLayers: THREE.Points[] = [];

    // Layer 1: Far star field (Deep background, tiny, high density)
    const farCount = 2000;
    const farGeometry = new THREE.BufferGeometry();
    const farPositions = new Float32Array(farCount * 3);
    for (let i = 0; i < farCount * 3; i += 3) {
      farPositions[i] = (Math.random() - 0.5) * 1600;
      farPositions[i + 1] = (Math.random() - 0.5) * 1200;
      farPositions[i + 2] = -Math.random() * 800 - 300; // Far back
    }
    farGeometry.setAttribute("position", new THREE.BufferAttribute(farPositions, 3));
    const farMaterial = new THREE.PointsMaterial({
      size: 1.5,
      map: starTexture,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const farStars = new THREE.Points(farGeometry, farMaterial);
    scene.add(farStars);
    starLayers.push(farStars);

    // Layer 2: Mid star field (Crisp parallax layer, medium density)
    const midCount = 800;
    const midGeometry = new THREE.BufferGeometry();
    const midPositions = new Float32Array(midCount * 3);
    for (let i = 0; i < midCount * 3; i += 3) {
      midPositions[i] = (Math.random() - 0.5) * 1200;
      midPositions[i + 1] = (Math.random() - 0.5) * 900;
      midPositions[i + 2] = -Math.random() * 400 - 50; // Midground
    }
    midGeometry.setAttribute("position", new THREE.BufferAttribute(midPositions, 3));
    const midMaterial = new THREE.PointsMaterial({
      size: 2.2,
      map: starTexture,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const midStars = new THREE.Points(midGeometry, midMaterial);
    scene.add(midStars);
    starLayers.push(midStars);

    // Layer 3: Near bokeh stars (Large, sparse, drifting foreground)
    const nearCount = 45;
    const nearGeometry = new THREE.BufferGeometry();
    const nearPositions = new Float32Array(nearCount * 3);
    for (let i = 0; i < nearCount * 3; i += 3) {
      nearPositions[i] = (Math.random() - 0.5) * 800;
      nearPositions[i + 1] = (Math.random() - 0.5) * 600;
      nearPositions[i + 2] = -Math.random() * 200 + 100; // Close to camera
    }
    nearGeometry.setAttribute("position", new THREE.BufferAttribute(nearPositions, 3));
    const nearMaterial = new THREE.PointsMaterial({
      size: 4.5,
      map: starTexture,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const nearStars = new THREE.Points(nearGeometry, nearMaterial);
    scene.add(nearStars);
    starLayers.push(nearStars);

    // ─── 4. VOLUMETRIC NEBULA FORMATIONS ──────────────────────────────────
    // Create multiple large planes rotated and placed asymmetrically to frame the screen
    const nebulaPlanes: THREE.Mesh[] = [];
    const nebulaCount = 5;

    // Define positions that frame the edges (leaving center clear)
    const nebulaConfigs = [
      { x: -280, y: 150, z: -150, scale: 380, texture: nebulaBlue, speed: 0.05 },  // Top-Left
      { x: 300, y: 180, z: -250, scale: 350, texture: nebulaCyan, speed: -0.03 },  // Top-Right
      { x: -350, y: -180, z: -300, scale: 420, texture: nebulaBlue, speed: 0.04 }, // Bottom-Left
      { x: 350, y: -150, z: -100, scale: 320, texture: nebulaCyan, speed: -0.06 }, // Bottom-Right
      { x: 100, y: 250, z: -350, scale: 450, texture: nebulaBlue, speed: 0.02 }    // Far Top-Center
    ];

    nebulaConfigs.forEach((config) => {
      const geometry = new THREE.PlaneGeometry(1, 1);
      const material = new THREE.MeshBasicMaterial({
        map: config.texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(config.x, config.y, config.z);
      mesh.scale.set(config.scale, config.scale, 1);
      mesh.rotation.z = Math.random() * Math.PI * 2;
      scene.add(mesh);
      nebulaPlanes.push(mesh);
    });

    // ─── 5. COSMIC DUST & ATMOSPHERIC PARTICLES ───────────────────────────
    const dustCount = 80;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 1000;
      dustPositions[i + 1] = (Math.random() - 0.5) * 800;
      dustPositions[i + 2] = (Math.random() - 0.5) * 400; // Drifts through all depths
      
      dustVelocities.push({
        x: (Math.random() - 0.5) * 0.08,
        y: (Math.random() - 0.5) * 0.05 + 0.03, // Slight upward bias
        z: (Math.random() - 0.5) * 0.05
      });
    }
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustMaterial = new THREE.PointsMaterial({
      size: 3.5,
      map: starTexture,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dustPoints = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustPoints);

    // ─── 6. INTERACTION & ANIMATION STATE ──────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const targetMouse = { x: 0, y: 0 };
    const scroll = { y: 0 };

    const handleMouseMove = (event: MouseEvent) => {
      targetMouse.x = (event.clientX / window.innerWidth - 0.5) * 2;
      targetMouse.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // ─── 7. ANIMATION LOOP ─────────────────────────────────────────────────
    const animate = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = (time - startTimeRef.current) * 0.001;

      // Smooth mouse interpolation
      mouse.x += (targetMouse.x - mouse.x) * 0.035;
      mouse.y += (targetMouse.y - mouse.y) * 0.035;

      // Track scroll position
      scroll.y = scrollYRef.current;

      // Camera parallax responsiveness
      camera.position.x = mouse.x * 60;
      camera.position.y = -mouse.y * 45 - scroll.y * 0.06;
      camera.lookAt(new THREE.Vector3(mouse.x * 15, -mouse.y * 10 - scroll.y * 0.06, 0));

      // Extremely slow rotation of nebula gas clouds to keep them alive
      nebulaPlanes.forEach((mesh, index) => {
        const config = nebulaConfigs[index];
        mesh.rotation.z += config.speed * 0.0015;
        // Minor breathing scale effect
        const scaleMod = 1 + Math.sin(elapsed * 0.2 + index) * 0.015;
        mesh.scale.set(config.scale * scaleMod, config.scale * scaleMod, 1);
      });

      // Animate background star layers slowly
      farStars.rotation.y = elapsed * 0.0008;
      midStars.rotation.y = -elapsed * 0.0012;
      nearStars.rotation.y = elapsed * 0.002;

      // Animate and update drifting cosmic dust particles
      const positions = dustGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < dustCount; i++) {
        const i3 = i * 3;
        const vel = dustVelocities[i];
        
        positions[i3] += vel.x;
        positions[i3 + 1] += vel.y;
        positions[i3 + 2] += vel.z;

        // Wrap around boundaries
        if (Math.abs(positions[i3]) > 600) positions[i3] = -positions[i3];
        if (Math.abs(positions[i3 + 1]) > 500) positions[i3 + 1] = -positions[i3 + 1];
        if (Math.abs(positions[i3 + 2]) > 300) positions[i3 + 2] = -positions[i3 + 2];
      }
      dustGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // ─── 8. RESIZE & CLEANUP ───────────────────────────────────────────────
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Clean up WebGL resources to prevent memory leaks
      renderer.dispose();
      starTexture.dispose();
      nebulaBlue.dispose();
      nebulaCyan.dispose();
      
      farGeometry.dispose();
      farMaterial.dispose();
      midGeometry.dispose();
      midMaterial.dispose();
      nearGeometry.dispose();
      nearMaterial.dispose();
      
      dustGeometry.dispose();
      dustMaterial.dispose();
      
      nebulaPlanes.forEach((mesh) => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }
      });
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isClient]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none -z-40 print:hidden overflow-hidden"
      id="cosmic-universe-3d-container"
    >
      {/* Absolute dark screen backup */}
      <div className="absolute inset-0 bg-[#000003] -z-50" />
      
      {/* Subtly overlayed vignetting mask to darken center zone for text readability */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_18%,rgba(0,0,0,0.12)_45%,rgba(0,0,0,0.65)_100%)]" />
    </div>
  );
}
