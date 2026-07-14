import { ACHIEVEMENTS } from "../data";
import { Trophy, Award, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export default function Achievements() {
  return (
    <section id="achievements" className="py-12 border-t border-white/5 print:hidden relative z-10 text-left">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Section Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-1"
        >
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">/ Recognitions</span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Achievements & Milestones
          </h2>
          <p className="text-xs text-gray-400 max-w-xl font-sans leading-relaxed">
            Key honors, competition highlights, and structural checkpoints reached during my academic and engineering journey.
          </p>
        </motion.div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ACHIEVEMENTS.map((item, idx) => {
            const isHighlighted = item.highlight;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className={`p-6 rounded-[24px] liquid-glass-card ${
                  isHighlighted ? "card-ai" : "card-saas"
                } flex flex-col justify-between space-y-4`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                        {isHighlighted ? (
                          <Trophy className="h-4 w-4 text-pink-400" />
                        ) : (
                          <Award className="h-4 w-4 text-cyan-400" />
                        )}
                      </div>
                      <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider font-bold">
                        {isHighlighted ? "Highlight" : "Milestone"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold bg-cyan-950/20 border border-cyan-500/10 px-2 py-0.5 rounded">
                      {item.date}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-white tracking-tight leading-normal font-sans flex items-center gap-1.5">
                      {item.title}
                      {isHighlighted && <Sparkles className="h-3 w-3 text-pink-400 inline" />}
                    </h3>
                    <p className="text-xs text-gray-350 leading-relaxed font-sans">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
