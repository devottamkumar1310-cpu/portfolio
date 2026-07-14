import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Github, 
  ArrowUpRight, 
  ArrowLeft, 
  Layers, 
  Database, 
  Brain, 
  Activity, 
  Trophy, 
  Sparkles, 
  ShieldCheck, 
  GraduationCap, 
  AlertCircle, 
  Eye, 
  Check, 
  Server, 
  Layout, 
  Terminal, 
  Map, 
  Laptop, 
  FileCode,
  Gauge,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from "lucide-react";
import { PROJECTS } from "../data";

const SectionHeading = ({ title, icon: Icon, color = "text-cyan-400" }: { title: string, icon?: any, color?: string }) => (
  <div className="flex items-center space-x-2 mb-4 border-b border-white/5 pb-2">
    {Icon && <Icon className={`h-4 w-4 ${color}`} />}
    <span className={`text-[11px] font-mono uppercase tracking-widest font-bold ${color}`}>
      {title}
    </span>
  </div>
);

const TechBadge = ({ tech }: { tech: string }) => (
  <span className="px-2.5 py-1 rounded bg-white/[0.02] border border-white/5 text-[10px] text-gray-300 font-mono tracking-tight">
    {tech}
  </span>
);

export default function Projects() {
  const { slug } = useParams<{ slug: string }>();

  // If a slug is specified in the URL, render the case study page
  if (slug) {
    const project = PROJECTS.find((p) => p.id === slug);

    if (!project || project.id !== "eve") {
      return (
        <div className="py-24 text-center space-y-6">
          <h2 className="text-3xl font-bold text-white">Case Study Not Available</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            This project does not have a dedicated case study page.
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-black hover:bg-gray-150 text-xs font-bold rounded-lg transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Showcase</span>
          </Link>
        </div>
      );
    }

    return <CaseStudyView project={project} />;
  }

  // Otherwise, render the Homepage Showcase
  return <ShowcaseGrid />;
}

// --------------------------------------------------
// SECTION: HOMEPAGE SHOWCASE
// --------------------------------------------------
function ShowcaseGrid() {
  // Split projects based on layout hierarchy
  const eveProj = PROJECTS.find(p => p.id === "eve");
  const fridayProj = PROJECTS.find(p => p.id === "friday");
  const nasaProj = PROJECTS.find(p => p.id === "nasa-space-apps");

  return (
    <section id="projects" className="py-12 border-t border-white/5 text-left relative z-10">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-2"
        >
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
            / Selected Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            Products & Systems
          </h2>
          <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
            A portfolio of production-grade SaaS engines, cognitive AI tools, and technical architectures built with clean code and high performance.
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* SECTION 1: Featured Product (EVE) */}
          {eveProj && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3"
            >
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold block">
                Featured Product
              </span>
              <div className="relative rounded-3xl overflow-visible group transition-all duration-300">
                {/* Layer 1: Multi-layered background glow */}
                <div className="absolute -top-12 -right-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10 group-hover:bg-cyan-500/15 transition-all duration-300" />
                <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-violet-600/5 rounded-full blur-[85px] pointer-events-none -z-10 group-hover:bg-violet-600/10 transition-all duration-300" />

                {/* Layer 2: Glass container with subtle animated gradient border and premium shadow */}
                <div className="liquid-glass-featured rounded-3xl p-6 sm:p-8 md:p-10 relative overflow-hidden">
                  {/* Subtle inner card border highlight */}
                  <div className="absolute inset-0 border border-white/5 rounded-3xl pointer-events-none" />

                  {/* Layer 3: Content layer (high readability) */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="px-2.5 py-1 rounded-full bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-bold tracking-wider">
                          {eveProj.category}
                        </span>
                        {eveProj.status && (
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-tight bg-emerald-500/10 text-emerald-450 border border-emerald-500/20">
                            {eveProj.status}
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-3xl font-bold text-white tracking-tight">
                          {eveProj.title}
                        </h3>
                        <p className="text-cyan-300/90 font-mono text-xs mt-1 font-medium tracking-wide">
                          {eveProj.tagline}
                        </p>
                      </div>

                      <p className="text-sm text-gray-300 leading-relaxed font-sans max-w-2xl">
                        {eveProj.description}
                      </p>

                      {/* Key Capabilities */}
                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] font-mono text-cyan-400/80 uppercase font-bold tracking-wider block">
                          Key Capabilities
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                          {eveProj.keyCapabilities?.slice(0, 4).map((cap, i) => (
                            <li key={i} className="flex items-start space-x-2 text-xs text-gray-300">
                              <Check className="h-3.5 w-3.5 text-cyan-450 shrink-0 mt-0.5" />
                              <span className="font-sans leading-tight">{cap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Tech Stack tags */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {eveProj.techStack.map(tech => (
                          <span key={tech} className="px-2.5 py-0.5 bg-white/[0.03] border border-white/5 rounded text-[9px] text-gray-400 font-mono">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-row md:flex-col gap-3 md:self-stretch md:justify-center shrink-0">
                      <Link
                        to={`/projects/${eveProj.id}`}
                        className="inline-flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-xl bg-violet-950/20 text-white hover:text-violet-200 border border-violet-500/30 hover:border-violet-500/60 shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_-1px_rgba(139,92,246,0.5)] text-xs font-bold transition-all duration-300 cursor-pointer"
                      >
                        <span>View Case Study</span>
                        <ArrowUpRight className="h-4 w-4 text-violet-400" />
                      </Link>
                      {eveProj.liveLink && (
                        <a
                          href={eveProj.liveLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-xl liquid-glass-btn text-gray-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          <span>Visit Product</span>
                          <ArrowUpRight className="h-4 w-4 text-gray-400" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* LOWER GRID LAYOUT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SECTION 2: Products (FRIDAY) */}
            {fridayProj && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3 flex flex-col"
              >
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold block">
                  Products
                </span>
                <div className="flex-1 rounded-2xl border border-white/5 bg-white/[0.015] p-6 hover:border-white/10 hover:bg-white/[0.02] transition-all duration-300 flex flex-col justify-between group">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/10 text-[9px] text-gray-400 font-mono">
                        {fridayProj.category}
                      </span>
                      {fridayProj.status && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-tight bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {fridayProj.status}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors">
                        {fridayProj.title}
                      </h3>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        {fridayProj.tagline}
                      </p>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed font-sans">
                      {fridayProj.description}
                    </p>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono text-gray-500 uppercase font-bold tracking-wider block">
                        Capabilities
                      </span>
                      <ul className="space-y-1">
                        {fridayProj.keyCapabilities?.slice(0, 3).map((cap, i) => (
                          <li key={i} className="flex items-start space-x-1.5 text-xs text-gray-400">
                            <Check className="h-3 w-3 text-cyan-500 shrink-0 mt-0.5" />
                            <span className="font-sans leading-tight text-[11.5px]">{cap.split(" tracking")[0]}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 flex items-center justify-between border-t border-white/5 mt-4">
                    <div className="flex flex-wrap gap-1">
                      {fridayProj.techStack.map(tech => (
                        <span key={tech} className="px-1.5 py-0.5 bg-white/[0.02] text-[8px] text-gray-450 font-mono border border-white/5 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECTION 3: Achievements & Challenges (NASA Space Apps) */}
            {nasaProj && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3 flex flex-col"
              >
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold block">
                  Achievements & Challenges
                </span>
                <div className="flex-1 rounded-2xl border border-violet-500/10 bg-violet-950/[0.02] p-6 hover:border-violet-500/25 hover:bg-violet-950/[0.04] transition-all duration-300 flex flex-col justify-between group shadow-[0_0_30px_-15px_rgba(139,92,246,0.05)]">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Trophy className="h-3.5 w-3.5 text-violet-400" />
                        <span className="px-2 py-0.5 rounded bg-violet-950/20 border border-violet-500/20 text-[9px] text-violet-300 font-mono font-bold uppercase tracking-wider">
                          COMPETITION
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-tight bg-emerald-500/10 text-emerald-450 border border-emerald-500/20">
                        {nasaProj.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-violet-400 transition-colors">
                        {nasaProj.title}
                      </h3>
                      <p className="text-xs text-violet-300/80 font-mono mt-0.5">
                        {nasaProj.tagline}
                      </p>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed font-sans">
                      {nasaProj.description}
                    </p>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono text-violet-400/80 uppercase font-bold tracking-wider block">
                        Focus Areas
                      </span>
                      <ul className="space-y-1">
                        {nasaProj.keyCapabilities?.slice(0, 3).map((cap, i) => (
                          <li key={i} className="flex items-start space-x-1.5 text-xs text-gray-400">
                            <Sparkles className="h-3 w-3 text-violet-500 shrink-0 mt-0.5" />
                            <span className="font-sans leading-tight text-[11.5px]">{cap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 flex items-center justify-between border-t border-violet-500/10 mt-4">
                    <div className="flex flex-wrap gap-1">
                      {nasaProj.techStack.map(tech => (
                        <span key={tech} className="px-1.5 py-0.5 bg-violet-950/20 text-[8px] text-violet-300 font-mono border border-violet-500/10 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <Link
                        to="/certificates/nasa-space-apps"
                        className="inline-flex items-center justify-center space-x-1 px-3 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 text-[11px] font-bold transition-all cursor-pointer border border-violet-500/20"
                      >
                        <span>View Certificate</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


// --------------------------------------------------
// SECTION: PARALLAX SCREENSHOT AND MEDIA SHOWCASE
// --------------------------------------------------
function ParallaxScreenshot({ 
  src, 
  alt, 
  onClick 
}: { 
  src: string; 
  alt: string; 
  onClick?: () => void; 
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowX, setGlowX] = useState(50);
  const [glowY, setGlowY] = useState(50);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Tilt angle (max 8 degrees for a subtle tilt)
    const rotateYVal = ((x / rect.width) - 0.5) * 8;
    const rotateXVal = ((y / rect.height) - 0.5) * -8;
    
    setRotateX(rotateXVal);
    setRotateY(rotateYVal);
    
    // Glow coordinates
    const glowXVal = (x / rect.width) * 100;
    const glowYVal = (y / rect.height) * 100;
    setGlowX(glowXVal);
    setGlowY(glowYVal);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div 
      className="perspective-1000 w-full"
      style={{ perspective: "1200px" }}
    >
      <motion.div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        animate={{ rotateX, rotateY }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{ transformStyle: "preserve-3d" }}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.01] p-1.5 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.85)] relative group overflow-hidden cursor-pointer"
      >
        {/* Soft glow highlight following cursor */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          style={{
            background: `radial-gradient(circle 350px at ${glowX}% ${glowY}%, rgba(34, 211, 238, 0.12), transparent)`
          }}
        />

        {/* Hover Maximize Icon overlay */}
        <div className="absolute top-4 right-4 z-20 w-8 h-8 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Maximize2 className="h-4 w-4 text-white" />
        </div>

        {/* Screenshot Image */}
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-auto rounded-[10px] object-cover border border-white/5 relative z-0 transition-transform duration-500 group-hover:scale-[1.005]"
        />
      </motion.div>
    </div>
  );
}

function MediaShowcase({ project, glowBorderClass, glowBgClass, isEve }: { 
  project: any; 
  glowBorderClass: string; 
  glowBgClass: string; 
  isEve: boolean; 
}) {
  const screenshots = project.screenshots || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Keyboard navigation for fullscreen preview
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, activeIndex]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1));
  };

  if (screenshots.length > 0) {
    const activeImage = screenshots[activeIndex];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold block">
            Interface & System Preview
          </span>
          {screenshots.length > 1 && (
            <span className="text-[10px] font-mono text-cyan-400/80 font-bold">
              IMAGE {activeIndex + 1} OF {screenshots.length}
            </span>
          )}
        </div>

        {/* Active image with Parallax tilt */}
        <div className="relative">
          <ParallaxScreenshot 
            src={activeImage} 
            alt={`${project.title} Screenshot ${activeIndex + 1}`}
            onClick={() => setIsFullscreen(true)}
          />

          {/* Carousel Arrows (only if multiple images) */}
          {screenshots.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 border border-white/15 flex items-center justify-center text-white z-20 hover:scale-105 transition-all cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 border border-white/15 flex items-center justify-center text-white z-20 hover:scale-105 transition-all cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails Gallery (only if multiple images) */}
        {screenshots.length > 1 && (
          <div className="flex gap-2 justify-center pt-2">
            {screenshots.map((shot: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-16 h-10 rounded border overflow-hidden transition-all relative cursor-pointer ${
                  activeIndex === idx ? "border-cyan-400 ring-1 ring-cyan-400" : "border-white/10 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={shot} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Fullscreen Overlay */}
        <AnimatePresence>
          {isFullscreen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4"
            >
              {/* Close button */}
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Main image container */}
              <div className="relative max-w-5xl max-h-[85vh] flex items-center justify-center">
                <img 
                  src={activeImage} 
                  alt={`${project.title} Fullscreen ${activeIndex + 1}`}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg border border-white/10"
                />

                {/* Fullscreen Arrows */}
                {screenshots.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                      className="absolute -left-16 sm:-left-20 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/70 hover:bg-black/90 border border-white/15 flex items-center justify-center text-white hover:scale-105 transition-all cursor-pointer"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleNext(); }}
                      className="absolute -right-16 sm:-right-20 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/70 hover:bg-black/90 border border-white/15 flex items-center justify-center text-white hover:scale-105 transition-all cursor-pointer"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Title & Index */}
              <div className="mt-4 text-center">
                <span className="text-sm font-semibold text-white tracking-wide block">
                  {project.title} — System Interface View
                </span>
                {screenshots.length > 1 && (
                  <span className="text-xs text-gray-500 font-mono mt-1 block">
                    IMAGE {activeIndex + 1} OF {screenshots.length}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Fallback to MacOS mockup placeholder if no screenshots
  return (
    <div className="space-y-2">
      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold block">
        Interface & System Preview
      </span>
      <div className={`rounded-2xl border ${glowBorderClass} bg-white/[0.01] p-1.5 relative overflow-hidden aspect-video shadow-2xl`}>
        {/* Subtle glow elements */}
        <div className={`absolute top-0 left-0 w-full h-full ${glowBgClass} opacity-10 pointer-events-none blur-[40px]`} />

        {/* MacOS style window controls */}
        <div className="h-8 bg-white/[0.02] border-b border-white/5 px-4 flex items-center justify-between select-none">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <span className="text-[10px] font-mono text-gray-600">localhost/{project.id}</span>
          <div className="w-10" />
        </div>

        {/* Mockup layout */}
        <div className="absolute inset-x-0 bottom-0 top-8 p-4 sm:p-6 grid grid-cols-12 gap-4">
          {/* Sidebar mock */}
          <div className="col-span-3 border border-white/5 rounded-lg p-2.5 hidden sm:flex flex-col space-y-2 bg-white/[0.005]">
            <div className="w-1/2 h-3 bg-white/5 rounded" />
            <div className="h-px bg-white/5 my-1" />
            <div className="w-3/4 h-2.5 bg-white/5 rounded" />
            <div className="w-2/3 h-2.5 bg-white/5 rounded" />
            <div className="w-4/5 h-2.5 bg-white/5 rounded" />
          </div>

          {/* Dashboard main body mock */}
          <div className="col-span-12 sm:col-span-9 border border-white/5 rounded-lg p-4 flex flex-col justify-between bg-white/[0.005]">
            {/* Top stat bars */}
            <div className="grid grid-cols-3 gap-2">
              <div className="border border-dashed border-white/10 rounded p-2 text-center">
                <span className="text-[7px] font-mono text-gray-500 uppercase block">Active Modules</span>
                <span className="text-[11px] font-mono text-white font-bold">{isEve ? "3 Core Modules" : project.id === "friday" ? "5 Profile Dimensions" : "Vanilla Scripting"}</span>
              </div>
              <div className="border border-dashed border-white/10 rounded p-2 text-center">
                <span className="text-[7px] font-mono text-gray-500 uppercase block">Latency Benchmark</span>
                <span className="text-[11px] font-mono text-white font-bold">{isEve ? "Sub-100ms API" : project.id === "friday" ? "Cosine Matching" : "60fps Render"}</span>
              </div>
              <div className="border border-dashed border-white/10 rounded p-2 text-center">
                <span className="text-[7px] font-mono text-gray-500 uppercase block">Database Layer</span>
                <span className="text-[11px] font-mono text-white font-bold">{isEve ? "PostgreSQL / RLS" : project.id === "friday" ? "SQLAlchemy" : "Local Telemetry"}</span>
              </div>
            </div>

            {/* Central text block */}
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <Laptop className="h-8 w-8 text-gray-500 mb-2 animate-pulse" />
              <span className="text-xs font-semibold text-white tracking-wide block">
                Media Placeholder Container
              </span>
              <span className="text-[9.5px] font-mono text-gray-500 mt-1 max-w-sm">
                This template supports future manual uploads of dashboard screenshots. Currently rendering structured system metrics.
              </span>
            </div>

            {/* Bottom breadcrumb line */}
            <div className="h-4 flex items-center justify-between border-t border-white/5 pt-2 select-none">
              <span className="text-[7px] font-mono text-gray-600">STATUS // {project.status?.toUpperCase()}</span>
              <span className="text-[7px] font-mono text-gray-600">IIT PATNA PORTFOLIO v2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------
// SECTION: STANDALONE CASE STUDY VIEW
// --------------------------------------------------
function CaseStudyView({ project }: { project: any }) {
  const isEve = project.id === "eve";
  const accentColor = isEve ? "text-cyan-400" : project.id === "friday" ? "text-cyan-400" : "text-violet-400";
  const glowBorderClass = isEve ? "border-cyan-500/20" : project.id === "friday" ? "border-cyan-500/10" : "border-violet-500/10";
  const glowBgClass = isEve ? "bg-cyan-500/5" : project.id === "friday" ? "bg-cyan-500/5" : "bg-violet-500/5";

  return (
    <div className="py-8 space-y-10 text-left relative z-10">
      
      {/* Back button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer border border-white/5 bg-white/[0.02] px-3.5 py-1.5 rounded-lg font-bold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Products & Systems</span>
        </Link>
      </div>

      {/* 1. OVERVIEW HEADER */}
      <div className="space-y-4 border-b border-white/5 pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-2.5 py-1 rounded bg-white/[0.03] border border-white/10 text-[10px] font-mono font-bold uppercase tracking-widest ${accentColor}`}>
            {project.category}
          </span>
          <span className="text-xs text-gray-500 font-mono">
            {project.period}
          </span>
          {project.status && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight border ${
              project.status.includes("Building") || project.status.includes("Progress")
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-450 border-emerald-500/20"
            }`}>
              {project.status}
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              {project.title}
            </h1>
            <p className="text-lg text-gray-400 font-medium">
              {project.tagline}
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            {project.githubLink && (
              <a
                href={project.githubLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                <Github className="h-4 w-4" />
                <span>Repository</span>
              </a>
            )}
            {project.liveLink && (
              <a
                href={project.liveLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center space-x-2 px-5 py-2 bg-white text-black hover:bg-gray-150 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                <span>Visit Product</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 2. MEDIA SHOWCASE SLOT (Screenshots / Placeholders) */}
      <MediaShowcase 
        project={project} 
        glowBorderClass={glowBorderClass} 
        glowBgClass={glowBgClass} 
        isEve={isEve} 
      />

      {/* 3. PROBLEM & 4. MOTIVATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-red-950/[0.02] border border-red-950/10 space-y-2">
          <SectionHeading title="The Problem" icon={AlertCircle} color="text-red-400" />
          <div className="text-sm text-gray-350 leading-relaxed font-sans space-y-2">
            {Array.isArray(project.problem)
              ? project.problem.map((p: string, i: number) => <p key={i}>{p}</p>)
              : <p>{project.problem}</p>}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-indigo-950/[0.02] border border-indigo-950/10 space-y-2">
          <SectionHeading title="The Motivation" icon={Eye} color="text-indigo-400" />
          <p className="text-sm text-gray-350 leading-relaxed font-sans">
            {project.motivation}
          </p>
        </div>
      </div>

      {/* 5. SOLUTION */}
      <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-2">
        <SectionHeading title="The Solution" icon={Sparkles} color="text-emerald-400" />
        <p className="text-sm text-gray-350 leading-relaxed font-sans">
          {project.solution}
        </p>
      </div>

      {/* KEY CAPABILITIES */}
      <div className="space-y-4">
        <SectionHeading title="Key Capabilities" icon={Layers} color={accentColor} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {project.keyCapabilities?.map((cap: string, i: number) => (
            <div key={i} className="p-4 rounded-xl bg-white/[0.008] border border-white/5 hover:border-white/10 transition-colors flex items-start space-x-3">
              <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                <Check className={`h-3 w-3 ${accentColor}`} />
              </div>
              <span className="text-xs text-gray-300 font-sans leading-relaxed">{cap}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. ENGINEERING HIGHLIGHTS */}
      <div className="space-y-4">
        <SectionHeading title="Engineering Highlights" icon={FileCode} color={accentColor} />
        <div className="grid grid-cols-1 gap-3">
          {project.engineeringHighlights?.map((highlight: string, i: number) => (
            <div key={i} className="p-4 rounded-xl bg-white/[0.005] border border-white/5 flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-cyan-950/20 border border-cyan-500/10 flex items-center justify-center shrink-0 text-xs font-mono text-cyan-400">
                {i + 1}
              </div>
              <span className="text-xs text-gray-350 font-sans leading-relaxed">{highlight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 7. SYSTEM ARCHITECTURE & 8. TECH STACK BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* System Architecture layered visualization */}
        <div className="md:col-span-7 space-y-4">
          <SectionHeading title="System Architecture" icon={Server} color={accentColor} />
          
          <div className="space-y-3">
            {project.techStackBreakdown?.map((layer: any, i: number) => {
              const layerIcons = [Layout, Terminal, Database, Brain, Map];
              const LayerIcon = layerIcons[i % layerIcons.length];

              return (
                <div key={i} className="p-4 rounded-xl bg-gradient-to-r from-white/[0.01] to-transparent border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0">
                      <LayerIcon className={`h-4 w-4 ${accentColor}`} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block tracking-tight">
                        {layer.category} Layer
                      </span>
                      <span className="text-[10px] font-mono text-gray-500">
                        Module component {i + 1}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5 max-w-[200px]">
                    {layer.technologies.slice(0, 2).map((tech: string) => (
                      <span key={tech} className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/10 text-[9px] text-gray-300 font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Structured Tech Stack Breakdown */}
        <div className="md:col-span-5 space-y-4">
          <SectionHeading title="Tech Stack Breakdown" icon={Database} color={accentColor} />
          <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4">
            {project.techStackBreakdown?.map((stack: any) => (
              <div key={stack.category} className="space-y-1 border-b border-white/5 last:border-0 pb-3 last:pb-0">
                <span className="text-[10px] font-mono text-gray-550 uppercase tracking-widest font-bold block">
                  {stack.category}
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {stack.technologies.map((tech: string) => (
                    <TechBadge key={tech} tech={tech} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 9. TECHNICAL CHALLENGES */}
      <div className="space-y-4">
        <SectionHeading title="Technical Challenges" icon={ShieldCheck} color={accentColor} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {project.technicalChallenges?.map((challenge: any, i: number) => (
            <div key={i} className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full shrink-0" />
                  <span>{challenge.title}</span>
                </h4>
                
                <div className="space-y-2 font-sans text-xs">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[9px] text-red-400 font-bold uppercase tracking-wider block">The Challenge:</span>
                    <p className="text-gray-400 leading-relaxed">{challenge.problem}</p>
                  </div>
                  <div className="space-y-0.5 pt-2 border-t border-white/5">
                    <span className="font-mono text-[9px] text-emerald-450 font-bold uppercase tracking-wider block">The Resolution:</span>
                    <p className="text-gray-300 leading-relaxed">{challenge.solution}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 10. RESULTS & 11. LESSONS LEARNED */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Results with metrics */}
        <div className="md:col-span-7 space-y-4">
          <SectionHeading title="Project Results" icon={Gauge} color={accentColor} />
          <div className="grid grid-cols-1 gap-3">
            {project.results?.map((res: string, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.008] border border-white/5 flex items-start space-x-3">
                <div className="w-5 h-5 rounded bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="h-3 w-3 text-cyan-400" />
                </div>
                <span className="text-xs text-gray-300 font-sans leading-relaxed">
                  {res}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Lessons Learned */}
        <div className="md:col-span-5 space-y-4">
          <SectionHeading title="Lessons Learned" icon={GraduationCap} color={accentColor} />
          <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col justify-between h-full">
            <p className="text-xs text-gray-350 leading-relaxed font-sans italic">
              "{project.lessonsLearned}"
            </p>
            <div className="border-t border-white/5 pt-3 mt-4 text-right">
              <span className="text-[9px] font-mono text-gray-500">REFLECTIONS // {project.period}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Return navigation */}
      <div className="pt-8 border-t border-white/5 text-center">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer border border-white/5 bg-white/[0.02] px-5 py-2.5 rounded-xl font-bold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Homepage Showcase</span>
        </Link>
      </div>

    </div>
  );
}
