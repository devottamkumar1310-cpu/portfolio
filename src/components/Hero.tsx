import { motion } from "motion/react";
import { ArrowRight, FileText, ArrowUpRight, Github } from "lucide-react";
import { BIO_SUMMARY } from "../data";

interface HeroProps {
  onTabChange: (tab: any) => void;
}

export default function Hero({ onTabChange }: HeroProps) {
  return (
    <section className="relative pt-16 pb-12 overflow-hidden flex flex-col items-center text-center print:hidden">
      
      {/* Decorative Grid Mesh (Clean structural design) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Intro Label with subtle border */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 shadow-inner text-[11px] font-mono text-gray-400 mb-6 font-semibold"
      >
        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
        <span>B.Sc. Computer Science & Data Analytics // IIT Patna</span>
      </motion.div>

      {/* Main typography display */}
      <motion.h1 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.3 }}
        className="text-4xl sm:text-6xl font-semibold tracking-tight text-white max-w-4xl leading-tight"
      >
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/95 to-gray-400 font-bold">{BIO_SUMMARY.name}</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.6 }}
        className="mt-6 text-cyan-400 text-sm sm:text-base tracking-widest font-mono uppercase font-bold"
      >
        Backend Developer // Software Engineer // AI Builder
      </motion.p>

      {/* Sub-paragraph describing current project */}
      <motion.p 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.9 }}
        className="mt-4 text-gray-300 text-sm sm:text-base max-w-2xl leading-relaxed font-sans"
      >
        Studying Computer Science & Data Analytics at the Indian Institute of Technology Patna. Currently constructing <span className="text-white hover:text-cyan-400 transition-colors font-semibold">EVE</span>, an intelligent business orchestrating engine, while designing stable API architectures and high-throughput backend services.
      </motion.p>

      {/* Primary, Secondary, and Tertiary Call to Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 2.2 }}
        className="mt-10 flex flex-col sm:flex-row items-center gap-4"
      >
        {/* Primary CTA: View Projects */}
        <button
          onClick={() => onTabChange("projects")}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-white text-black hover:bg-gray-100 font-semibold text-xs transition-colors shadow-lg cursor-pointer"
        >
          <span>View Projects</span>
          <ArrowRight className="h-4 w-4" />
        </button>
        
        {/* Secondary CTA: Resume */}
        <button
          onClick={() => onTabChange("resume")}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold text-xs transition-colors cursor-pointer"
        >
          <FileText className="h-4 w-4 text-gray-400" />
          <span>Resume</span>
        </button>

        {/* Tertiary CTA: GitHub */}
        <a
          href={BIO_SUMMARY.github}
          target="_blank"
          referrerPolicy="no-referrer"
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-transparent hover:bg-white/5 text-gray-450 hover:text-white border border-transparent hover:border-white/5 font-semibold text-xs transition-colors"
        >
          <Github className="h-4 w-4" />
          <span>GitHub</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </motion.div>

    </section>
  );
}
