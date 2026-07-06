import { motion } from "motion/react";
import { Github, ArrowUpRight, Check, CornerDownRight, Rocket, Code2, Presentation, Layers, Activity, Database, Cloud, AlertCircle, Eye, ShieldCheck, GraduationCap } from "lucide-react";
import { PROJECTS } from "../data";
import { Project } from "../types";

const SectionHeading = ({ title, icon: Icon, color = "text-cyan-400" }: { title: string, icon?: any, color?: string }) => (
  <div className="flex items-center space-x-2 mb-4 border-b border-white/5 pb-2">
    {Icon && <Icon className={`h-4 w-4 ${color}`} />}
    <span className={`text-[11px] font-mono uppercase tracking-widest font-bold ${color}`}>
      {title}
    </span>
  </div>
);

const TechBadge = ({ tech }: { tech: string }) => (
  <span className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/10 text-[10px] text-gray-300 font-mono tracking-tight">
    {tech}
  </span>
);

export default function Projects({ activeProjectSlug }: { activeProjectSlug?: string | null }) {
  return (
    <section id="projects" className="py-16 border-t border-white/5 text-left relative z-10">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
            / Selected Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            Products & Systems
          </h2>
          <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
            A showcase of production-grade SaaS platforms, AI systems, and technical builds reflecting a focus on scalable architecture and premium user experiences.
          </p>
        </div>

        {/* Project Case Studies */}
        <div className="space-y-20">
          {PROJECTS.map((project, index) => {
            const isFlagship = project.importanceLevel === "flagship";
            const isMajor = project.importanceLevel === "major";
            const isCondensed = project.importanceLevel === "condensed";
            const isSupporting = project.importanceLevel === "supporting";

            return (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`rounded-3xl border flex flex-col overflow-hidden relative ${
                  isFlagship 
                    ? "bg-[#020512]/80 border-cyan-500/20 shadow-[0_0_40px_-15px_rgba(6,182,212,0.15)]" 
                    : isMajor
                      ? "bg-white/[0.015] border-white/10"
                      : "bg-white/[0.01] border-white/5"
                }`}
              >
                {/* Decorative background glow for flagship */}
                {isFlagship && (
                  <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-cyan-500/10 blur-[80px] pointer-events-none rounded-full" />
                )}

                {/* --- HEADER --- */}
                <div className={`p-6 sm:p-8 md:p-10 ${isFlagship ? "border-b border-cyan-500/10" : "border-b border-white/5"}`}>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-3">
                        <span className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded border font-bold ${
                          isFlagship ? "bg-cyan-950/30 text-cyan-400 border-cyan-500/20" : "bg-white/[0.03] text-gray-300 border-white/10"
                        }`}>
                          {project.category}
                        </span>
                        {project.status && (
                          <span className={`px-2 py-1 rounded text-[9px] font-mono font-bold tracking-tight border ${
                            project.status === "In Progress" || project.status === "Currently Building" || project.status === "In Development"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-450 border-emerald-500/20"
                          }`}>
                            {project.status}
                          </span>
                        )}
                      </div>
                      
                      <div>
                        <h3 className={`font-bold tracking-tight text-white ${isFlagship ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}`}>
                          {project.title}
                        </h3>
                        {project.tagline && (
                          <p className={`mt-1 font-sans ${isFlagship ? "text-lg text-cyan-100/70" : "text-base text-gray-400"}`}>
                            {project.tagline}
                          </p>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-400 font-sans max-w-2xl leading-relaxed mt-2">
                        {project.description}
                      </p>
                    </div>

                    {/* Action Links */}
                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                      {project.githubLink && (
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noreferrer"
                          className={`inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            isFlagship 
                              ? "bg-white/5 hover:bg-white/10 border border-white/10 text-white" 
                              : "bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                          }`}
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
                          className={`inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            isFlagship 
                              ? "bg-cyan-500 hover:bg-cyan-400 text-cyan-950 shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)]" 
                              : "bg-white text-black hover:bg-gray-100"
                          }`}
                        >
                          <span>Live Demo</span>
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* --- BODY --- */}
                <div className="p-6 sm:p-8 md:p-10 space-y-10">
                  
                  {/* General Detailed Description (for non-flagship mostly) */}
                  {project.detailedDescription && project.detailedDescription.length > 0 && (
                    <div className="space-y-4 max-w-3xl">
                      {project.detailedDescription.map((p, i) => (
                        <p key={i} className="text-sm sm:text-base text-gray-300 font-sans leading-relaxed">
                          {p}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Flagship (EVE) Specific Sections */}
                  {isFlagship && (
                    <div className="space-y-12">
                      
                      {/* Problem & Vision */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {project.problem && (
                          <div>
                            <SectionHeading title="The Problem" icon={AlertCircle} color="text-red-400" />
                            <div className="space-y-3">
                              {project.problem.map((p, i) => <p key={i} className="text-sm text-gray-300 leading-relaxed">{p}</p>)}
                            </div>
                          </div>
                        )}
                        {project.visionArr && (
                          <div>
                            <SectionHeading title="The Vision" icon={Eye} color="text-indigo-400" />
                            <div className="space-y-3">
                              {project.visionArr.map((v, i) => <p key={i} className="text-sm text-gray-300 leading-relaxed">{v}</p>)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Architecture & Deployment */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {project.architecture && (
                          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                            <SectionHeading title="System Architecture" icon={Database} color="text-blue-400" />
                            <ul className="space-y-2">
                              {project.architecture.map((item, i) => (
                                <li key={i} className="flex items-start space-x-2 text-sm text-gray-300">
                                  <CornerDownRight className="h-4 w-4 shrink-0 mt-0.5 text-blue-500/70" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {project.deploymentArchitecture && (
                          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                            <SectionHeading title="Deployment Architecture" icon={Cloud} color="text-teal-400" />
                            <ul className="space-y-2">
                              {project.deploymentArchitecture.map((item, i) => (
                                <li key={i} className="flex items-start space-x-2 text-sm text-gray-300">
                                  <CornerDownRight className="h-4 w-4 shrink-0 mt-0.5 text-teal-500/70" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Features & AI COO & Inventory Intelligence */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {project.features && (
                          <div>
                            <SectionHeading title="Core Features" icon={Layers} color="text-cyan-400" />
                            <ul className="space-y-2">
                              {project.features.map((item, i) => (
                                <li key={i} className="flex items-start space-x-2 text-sm text-gray-300">
                                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-cyan-500/70" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {project.aiCooSystem && (
                          <div>
                            <SectionHeading title="AI COO System" icon={Rocket} color="text-purple-400" />
                            <ul className="space-y-2">
                              {project.aiCooSystem.map((item, i) => (
                                <li key={i} className="flex items-start space-x-2 text-sm text-gray-300">
                                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-purple-500/70" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {project.inventoryIntelligence && (
                          <div>
                            <SectionHeading title="Inventory Intelligence" icon={Activity} color="text-emerald-400" />
                            <ul className="space-y-2">
                              {project.inventoryIntelligence.map((item, i) => (
                                <li key={i} className="flex items-start space-x-2 text-sm text-gray-300">
                                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500/70" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* Major Projects (FRIDAY) Grid layout */}
                  {isMajor && !isFlagship && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                      {/* Features column */}
                      <div className="space-y-6">
                        {(project.features || project.plannedFeatures) && (
                          <div>
                            <SectionHeading 
                              title={project.features ? "Core Features" : "Planned Features"} 
                              icon={Layers} 
                              color="text-gray-300" 
                            />
                            <ul className="space-y-2.5">
                              {(project.features || project.plannedFeatures || []).map((feat, i) => (
                                <li key={i} className="flex items-start space-x-3 text-sm">
                                  <CornerDownRight className="h-4 w-4 shrink-0 mt-0.5 text-gray-500" />
                                  <span className="text-gray-300 leading-relaxed font-sans">{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {project.currentProgress && (
                          <div>
                            <SectionHeading title="Current Progress" icon={Presentation} color="text-amber-400" />
                            <p className="text-sm text-gray-300 font-sans leading-relaxed">
                              {project.currentProgress}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Technical column */}
                      <div className="space-y-6">
                        {project.techHighlights && (
                          <div>
                            <SectionHeading title="Technical Architecture" icon={Code2} color="text-gray-300" />
                            <ul className="space-y-2.5">
                              {project.techHighlights.map((highlight, i) => (
                                <li key={i} className="flex items-start space-x-3 text-sm">
                                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-gray-500" />
                                  <span className="text-gray-300 leading-relaxed font-sans">{highlight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Low Detail Projects (Hackathon, Portfolio) layout */}
                  {(isCondensed || isSupporting) && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                      {project.features && (
                        <div>
                          <SectionHeading title="Key Capabilities" icon={Layers} color="text-gray-300" />
                          <ul className="space-y-2.5">
                            {project.features.map((feat, i) => (
                              <li key={i} className="flex items-start space-x-3 text-sm">
                                <CornerDownRight className="h-4 w-4 shrink-0 mt-0.5 text-gray-500" />
                                <span className="text-gray-300 leading-relaxed font-sans">{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {project.responsibilities && (
                        <div>
                          <SectionHeading title="Role & Responsibilities" icon={Presentation} color="text-emerald-400" />
                          <ul className="space-y-2.5">
                            {project.responsibilities.map((resp, i) => (
                              <li key={i} className="flex items-start space-x-3 text-sm">
                                <Check className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                                <span className="text-gray-300 leading-relaxed font-sans">{resp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                     </div>
                  )}

                  {/* Footer Data: Stack, Challenges, Impact, Learnings */}
                  <div className={`pt-8 border-t ${isFlagship ? "border-cyan-500/10" : "border-white/5"} grid grid-cols-1 lg:grid-cols-12 gap-8`}>
                    
                    {/* Tech Stack */}
                    <div className="lg:col-span-4 space-y-4">
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold block">
                        Tech Stack
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.map(tech => <TechBadge key={tech} tech={tech} />)}
                      </div>
                    </div>

                    {/* Challenges / Impact / Learnings */}
                    <div className="lg:col-span-8 grid grid-cols-1 gap-6">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {project.challenges && (
                          <div className={`p-5 rounded-2xl ${isFlagship ? "bg-red-950/10 border border-red-900/30" : "bg-white/[0.02] border border-white/5"}`}>
                            <SectionHeading title="Technical Challenges" icon={ShieldCheck} color={isFlagship ? "text-red-400" : "text-gray-400"} />
                            <ul className="space-y-2 text-sm text-gray-300">
                              {project.challenges.map((c, i) => (
                                <li key={i} className="flex items-start space-x-2">
                                  <span className="text-gray-500 mt-0.5">•</span>
                                  <span className="font-sans leading-relaxed">{c}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {project.learnings && (
                          <div className={`p-5 rounded-2xl ${isFlagship ? "bg-blue-950/10 border border-blue-900/30" : "bg-white/[0.02] border border-white/5"}`}>
                            <SectionHeading title="Lessons Learned" icon={GraduationCap} color={isFlagship ? "text-blue-400" : "text-gray-400"} />
                            <p className="text-sm text-gray-300 font-sans leading-relaxed">
                              {project.learnings}
                            </p>
                          </div>
                        )}
                      </div>

                      {project.impact && (
                        <div className={`p-5 rounded-2xl ${isFlagship ? "bg-cyan-950/10 border border-cyan-900/30" : "bg-white/[0.02] border border-white/5"}`}>
                          <SectionHeading title="Outcome & Impact" icon={Activity} color={isFlagship ? "text-cyan-400" : "text-gray-400"} />
                          <p className="text-sm text-cyan-100 font-sans leading-relaxed italic">
                            "{project.impact}"
                          </p>
                        </div>
                      )}

                    </div>
                    
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
