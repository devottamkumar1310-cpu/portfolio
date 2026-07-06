import { CERTIFICATES } from "../data";
import { Award, ArrowUpRight, GraduationCap, Calendar, Download } from "lucide-react";
import { motion } from "motion/react";

export default function Certificates() {
  return (
    <section id="certificates" className="py-16 border-t border-white/5 print:hidden text-left relative z-10">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-left space-y-4 max-w-xl">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">/ Proven Capabilities</span>
              <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight flex items-center gap-3">
                <GraduationCap className="h-8 w-8 text-cyan-400" />
                Certificates & Recognition
              </h2>
            </div>
            <p className="text-sm text-gray-400 font-sans leading-relaxed">
              Official recognitions and certifications proving my technical capabilities and competitive milestones in software engineering and artificial intelligence.
            </p>
          </div>
        </div>

        {CERTIFICATES.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl">
            <p className="text-gray-500 text-sm font-sans">No certificates added yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-8">
              {CERTIFICATES.map((cert, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  key={cert.id}
                  className="p-8 sm:p-10 rounded-3xl bg-cyan-950/10 border border-cyan-500/20 shadow-[0_0_40px_-15px_rgba(6,182,212,0.1)] hover:bg-cyan-950/20 hover:border-cyan-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] pointer-events-none rounded-full" />
                  
                  <div className="space-y-6 relative z-10 flex-1">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold px-2 py-1 bg-cyan-400/10 rounded border border-cyan-500/20">
                          {cert.category}
                        </span>
                        <div className="flex items-center space-x-1.5 text-xs font-mono text-gray-400">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{cert.date}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                        {cert.title}
                      </h3>
                      
                      <div className="flex items-center space-x-2 text-sm text-cyan-100/70 font-medium">
                        <Award className="h-4 w-4 text-amber-400" />
                        <span>{cert.recognition}</span>
                        <span className="text-gray-600 px-1">•</span>
                        <span>Issued by {cert.issuer}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 font-sans leading-relaxed max-w-2xl">
                      {cert.description}
                    </p>
                  </div>

                  <div className="shrink-0 relative z-10">
                    {cert.fileUrl ? (
                      <a
                        href={cert.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-white text-black hover:bg-gray-100 font-bold text-sm transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] active:scale-95"
                      >
                        <Download className="h-4 w-4" />
                        <span>View Certificate</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-500 font-bold text-sm cursor-not-allowed">
                        <span>Certificate Unavailable</span>
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
