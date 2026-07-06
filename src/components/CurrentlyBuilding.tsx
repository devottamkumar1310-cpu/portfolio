import { motion } from "motion/react";
import { Sparkles, ArrowRight, CornerDownRight, CheckCircle2 } from "lucide-react";
import { PROJECTS } from "../data";

export default function CurrentlyBuilding() {
  // Dynamically find FRIDAY project
  const activeProj = PROJECTS.find(p => p.id === "friday");

  if (!activeProj) return null;

  // Key focus areas mapping
  const focusAreas = [
    "Matching Engine",
    "Assessment Framework",
    "Recommendation System",
    "Analytics Dashboard",
    "Educational Intelligence Layer"
  ];

  return (
    <section className="py-12 border-t border-white/5 text-left">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <div className="space-y-1 mb-6">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
            / Active Engineering
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Currently Building
          </h2>
        </div>

        {/* Premium bento-style card showcasing the active build */}
        <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-white/[0.015] via-transparent to-transparent border border-white/5 hover:border-white/10 transition-colors duration-300 overflow-hidden">
          {/* Subtle decorative atmosphere */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[60px] pointer-events-none -y-5" />

          <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-6">
            
            {/* Info details */}
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  🚧 {activeProj.status || "Currently Building"}
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {activeProj.period || "2026 - Present"}
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {activeProj.title}
                </h3>
                <p className="text-xs font-mono text-cyan-400/80 mt-1">
                  {activeProj.tagline}
                </p>
              </div>

              <p className="text-sm text-gray-350 leading-relaxed font-sans">
                {activeProj.description}
              </p>

              {/* Technologies */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeProj.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded bg-white/[0.02] border border-white/5 text-xs text-gray-350 font-mono"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Current Focus Bullets Card */}
            <div className="w-full md:w-80 p-5 rounded-xl bg-white/[0.01] border border-white/5 space-y-3.5 shrink-0">
              <div className="flex items-center space-x-2 text-xs font-mono text-gray-400 font-bold border-b border-white/5 pb-2">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>Current Focus</span>
              </div>

              <ul className="space-y-2.5 text-xs text-gray-300 font-sans">
                {focusAreas.map((focus, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CornerDownRight className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
                    <span className="font-semibold">{focus}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
