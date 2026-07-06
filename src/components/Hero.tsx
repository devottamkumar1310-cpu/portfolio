import { motion } from "motion/react";
import { ArrowRight, FileText, ArrowUpRight, Github } from "lucide-react";
import { BIO_SUMMARY } from "../data";

interface HeroProps {
  onTabChange: (tab: any) => void;
}

export default function Hero({ onTabChange }: HeroProps) {
  return (
    <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden print:hidden flex flex-col items-center justify-center text-center">
      
      {/* Decorative Grid Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_65%,transparent_100%)] pointer-events-none -z-10" />

      {/* Main container */}
      <div className="max-w-4xl mx-auto flex flex-col items-center px-4 relative z-10">
        
        {/* Intro Label */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/[0.02] border border-white/5 shadow-inner text-[11px] font-mono text-gray-400 mb-8 font-semibold select-none backdrop-blur-sm"
        >
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#22d3ee]" />
          <span>{BIO_SUMMARY.institution} // {BIO_SUMMARY.educationDegree}</span>
        </motion.div>

        {/* Main typography display */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.0, ease: "easeOut" }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight max-w-4xl"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500">{BIO_SUMMARY.title}</span>
        </motion.h1>

        {/* Specialized descriptive sublabel / Name */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.2, ease: "easeOut" }}
          className="mt-6 text-cyan-400 text-sm tracking-[0.2em] font-mono uppercase font-bold"
        >
          {BIO_SUMMARY.name}
        </motion.p>

        {/* Sub-paragraph describing focus */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.4, ease: "easeOut" }}
          className="mt-6 text-gray-300 text-sm sm:text-base max-w-2xl leading-relaxed font-sans space-y-4"
        >
          <p className="whitespace-pre-wrap">
            {BIO_SUMMARY.subtitle}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest mr-2">Current Focus:</span>
            {BIO_SUMMARY.currentFocus.map((focus, i) => (
              <span key={i} className="px-2 py-1 bg-white/[0.03] border border-white/5 rounded text-xs font-mono text-cyan-100">
                {focus}
              </span>
            ))}
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.6, ease: "easeOut" }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <button
            onClick={() => onTabChange("projects")}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-white text-black hover:bg-gray-150 font-bold text-xs transition-all shadow-lg active:scale-98 cursor-pointer border border-white"
          >
            <span>Explore My Work</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          
          <a
            href={BIO_SUMMARY.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs transition-all active:scale-98 cursor-pointer"
          >
            <FileText className="h-4 w-4 text-blue-400" />
            <span>LinkedIn</span>
          </a>

          <a
            href={BIO_SUMMARY.github}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-transparent hover:bg-white/5 text-gray-400 hover:text-white border border-transparent hover:border-white/5 font-bold text-xs transition-all"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </motion.div>

      </div>
    </section>
  );
}
