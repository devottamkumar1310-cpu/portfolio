import { TIMELINE_EVENTS } from "../data";
import { Sparkles, Code, Laptop, Brain, Compass, BookOpen, Rocket, Cpu } from "lucide-react";
import { motion } from "motion/react";

export default function Timeline() {
  
  // Icon selector based on timeline index
  const getTimelineIcon = (idx: number) => {
    const icons = [
      <BookOpen className="h-3.5 w-3.5 text-blue-400" />,
      <Code className="h-3.5 w-3.5 text-cyan-400" />,
      <Rocket className="h-3.5 w-3.5 text-pink-400" />,
      <Brain className="h-3.5 w-3.5 text-cyan-400" />,
      <Cpu className="h-3.5 w-3.5 text-emerald-400" />,
      <Sparkles className="h-3.5 w-3.5 text-indigo-400" />,
      <Laptop className="h-3.5 w-3.5 text-cyan-400" />,
      <Compass className="h-3.5 w-3.5 text-blue-400" />,
    ];
    return icons[idx % icons.length];
  };

  return (
    <section id="journey" className="py-12 border-t border-white/5 print:hidden">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-left space-y-2"
        >
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">/ Progression</span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight font-sans">
            My Journey & Key Milestones
          </h2>
          <p className="text-xs text-gray-400 max-w-xl font-sans leading-relaxed">
            A linear progression detailing my development, from study, backend scripts, to orchestrating operational logic.
          </p>
        </motion.div>

        {/* Dynamic Vertical Timeline */}
        <div className="relative border-l border-white/5 ml-4 md:ml-32 space-y-8 py-4">
          
          {TIMELINE_EVENTS.map((event, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="relative pl-6 md:pl-10"
            >
              
              {/* Dot bullet indicator */}
              <div className="absolute -left-[14px] top-1.5 w-7 h-7 rounded-full bg-[#020308] border border-white/10 flex items-center justify-center shadow-lg">
                {getTimelineIcon(idx)}
              </div>

              {/* Side period indicator */}
              <div className="hidden md:block absolute -left-32 top-2 text-right w-24">
                <span className="text-[10.5px] font-mono text-cyan-400 font-semibold uppercase tracking-wider bg-white/[0.02] border border-white/5 px-2 py-1 rounded">
                  {event.period}
                </span>
              </div>

              {/* Mobile Period tag */}
              <div className="md:hidden mb-1 inline-block">
                <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded">
                  {event.period}
                </span>
              </div>

              {/* Event Content card */}
              <div className="space-y-1.5 text-left">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-white tracking-tight">{event.title}</h3>
                  <p className="text-[11px] text-gray-500 font-sans font-medium">{event.subtitle}</p>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed font-sans max-w-xl">
                  {event.description}
                </p>
              </div>

            </motion.div>
          ))}

        </div>

      </div>
    </section>
  );
}
