import { motion } from "motion/react";
import { ArrowRight, FileText, ArrowUpRight, Github } from "lucide-react";
import { BIO_SUMMARY } from "../data";

interface HeroProps {
  onTabChange: (tab: any) => void;
}

export default function Hero({ onTabChange }: HeroProps) {
  // Motion settings - clean fade up without visual skew
  const FADE_UP = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: (delay: number) => ({
      duration: 0.6,
      delay,
      ease: [0.16, 1, 0.3, 1] as const // premium easeOutExpo
    })
  };

  return (
    <section className="relative pt-20 pb-20 sm:pt-28 sm:pb-28 overflow-hidden print:hidden flex flex-col items-center justify-center text-center">
      
      {/* Decorative Grid Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_65%,transparent_100%)] pointer-events-none -z-10" />

      {/* Main container - Perfectly centered */}
      <div className="max-w-4xl mx-auto flex flex-col items-center px-4 relative z-10 w-full">
        
        {/* 1. Badge */}
        <motion.div 
          initial={FADE_UP.initial}
          animate={FADE_UP.animate}
          transition={FADE_UP.transition(0.1)}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/[0.02] border border-white/5 shadow-inner text-[11px] font-mono text-gray-400 mb-8 font-semibold select-none backdrop-blur-sm"
        >
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#22d3ee]" />
          <span>{BIO_SUMMARY.institution} // {BIO_SUMMARY.educationDegree}</span>
        </motion.div>

        {/* 2. Headline */}
        <motion.h1 
          initial={FADE_UP.initial}
          animate={FADE_UP.animate}
          transition={FADE_UP.transition(0.22)}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mb-6"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500">
            {BIO_SUMMARY.title}
          </span>
        </motion.h1>

        {/* 3. Name */}
        <motion.p
          initial={FADE_UP.initial}
          animate={FADE_UP.animate}
          transition={FADE_UP.transition(0.32)}
          className="text-cyan-400 text-sm tracking-[0.25em] font-mono uppercase font-bold mb-6"
        >
          {BIO_SUMMARY.name}
        </motion.p>

        {/* 4. Description */}
        <motion.p 
          initial={FADE_UP.initial}
          animate={FADE_UP.animate}
          transition={FADE_UP.transition(0.42)}
          className="text-gray-300 text-sm sm:text-base max-w-2xl leading-relaxed font-sans mb-8 whitespace-pre-wrap"
        >
          {BIO_SUMMARY.subtitle}
        </motion.p>
        
        {/* 5. Focus Tags */}
        <motion.div
          initial={FADE_UP.initial}
          animate={FADE_UP.animate}
          transition={FADE_UP.transition(0.52)}
          className="flex flex-col items-center gap-2.5 mb-10 w-full"
        >
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] font-bold">
            Current Focus
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
            {BIO_SUMMARY.currentFocus.map((focus, i) => (
              <span 
                key={i} 
                className="px-2.5 py-1 bg-white/[0.03] border border-white/5 rounded text-xs font-mono text-cyan-100"
              >
                {focus}
              </span>
            ))}
          </div>
        </motion.div>

        {/* 6. CTA Buttons */}
        <motion.div 
          initial={FADE_UP.initial}
          animate={FADE_UP.animate}
          transition={FADE_UP.transition(0.62)}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <button
            onClick={() => onTabChange("projects")}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl liquid-glass-btn-primary font-bold text-xs cursor-pointer"
          >
            <span>Explore My Work</span>
            <ArrowRight className="h-4 w-4 text-cyan-400" />
          </button>
          
          <a
            href={BIO_SUMMARY.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl liquid-glass-btn text-white font-bold text-xs cursor-pointer group"
          >
            <FileText className="h-4 w-4 text-blue-400 shrink-0 transition-transform group-hover:scale-110" />
            <span>LinkedIn</span>
          </a>

          <a
            href={BIO_SUMMARY.github}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl liquid-glass-btn text-gray-300 hover:text-white font-bold text-xs cursor-pointer group"
          >
            <Github className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
            <span>GitHub</span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
          </a>
        </motion.div>

      </div>
    </section>
  );
}
