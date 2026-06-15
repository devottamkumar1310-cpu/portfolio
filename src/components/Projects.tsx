import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Github, Check, CornerDownRight, ArrowUpRight, ArrowRight } from "lucide-react";
import { PROJECTS } from "../data";
import { Project } from "../types";

export default function Projects() {
  const [filter, setFilter] = useState<string>("All");
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Derive categories dynamically from the data file, always with "All" first
  const categories = ["All", ...Array.from(new Set(PROJECTS.map(p => p.category)))];
  
  const filteredProjects = filter === "All" 
    ? PROJECTS 
    : PROJECTS.filter(p => p.category === filter);

  return (
    <section id="projects" className="py-12 border-t border-white/5 text-left">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <AnimatePresence mode="wait">
          {!activeProject ? (
            
            // PROJECTS LIST VIEW
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Category Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">/ Project Portfolio</span>
                  <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Technical Works & Builds</h2>
                </div>
                
                {/* Visual Pill Filters */}
                <div className="flex flex-wrap gap-1 bg-white/[0.02] border border-white/5 rounded-lg p-1 text-xs self-start md:self-center">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilter(cat)}
                      className={`px-3 py-1.5 rounded-md font-semibold font-mono tracking-tight transition-colors cursor-pointer ${
                        filter === cat 
                          ? "bg-white/5 text-cyan-400 border border-white/10" 
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid deck */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProjects.map((project) => (
                  <div 
                    key={project.id}
                    className="p-6 rounded-2xl bg-white/[0.012] border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-colors duration-300 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                          {project.category}
                        </span>
                        
                        {project.status && (
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-tight ${
                            project.status === "In Development"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20"
                          } border`}>
                            {project.status}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-white tracking-tight">{project.title}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed font-sans">{project.description}</p>
                      
                      {/* Built with pills */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {project.techStack.map((tech) => (
                          <span 
                            key={tech} 
                            className="px-2 py-0.5 rounded text-[9.5px] font-mono bg-white/[0.02] text-gray-450 border border-white/5"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveProject(project)}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs rounded-xl border border-white/5 flex items-center justify-center space-x-2 transition-colors cursor-pointer mt-4"
                    >
                      <span>Project Details</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

            </motion.div>
          ) : (
            
            // PROJECT DETAIL PAGES (Fully dynamic, reading present keys)
            <motion.div 
              key="detail"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Navigation Back button */}
              <button 
                onClick={() => setActiveProject(null)}
                className="inline-flex items-center space-x-1 py-1 px-3.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-semibold font-mono text-xs border border-white/10 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>BACK TO PROJECTS</span>
              </button>

              {/* Title & Tagline Header */}
              <div className="border-b border-white/5 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest px-2 py-0.5 rounded bg-white/[0.03] border border-white/5 font-bold">
                      {activeProject.category}
                    </span>
                    {activeProject.status && (
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-tight ${
                        activeProject.status === "In Development"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20"
                      } border`}>
                        {activeProject.status}
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-semibold tracking-tight text-white">{activeProject.title}</h1>
                  {activeProject.tagline && (
                    <p className="text-gray-400 text-sm font-sans">{activeProject.tagline}</p>
                  )}
                </div>

                {/* Dynamic links configuration */}
                <div className="flex gap-2">
                  {activeProject.githubLink && (
                    <a
                      href={activeProject.githubLink}
                      target="_blank"
                      className="inline-flex items-center space-x-1.5 px-4.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white font-semibold transition-all"
                    >
                      <Github className="h-4 w-4" />
                      <span>View GitHub</span>
                    </a>
                  )}
                  {activeProject.liveLink && (
                    <a
                      href={activeProject.liveLink}
                      target="_blank"
                      className="inline-flex items-center space-x-1.5 px-4.5 py-2 rounded-xl bg-white text-black hover:bg-gray-100 text-xs font-semibold transition-all"
                    >
                      <span>Launch App</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Dynamic Sections rendering depending on data keys present */}
              <div className="space-y-6">
                
                {/* Intro Description Block */}
                <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-2">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold block">
                    Project Overview
                  </span>
                  <p className="text-sm text-gray-300 leading-relaxed font-sans">
                    {activeProject.description}
                  </p>
                </div>

                {/* Problem vs. Solution (Conditional check) */}
                {(activeProject.problem || activeProject.solution) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {activeProject.problem && (
                      <div className="p-6 rounded-2xl bg-red-950/[0.015] border border-red-500/10 space-y-3">
                        <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold block">
                          The Problem
                        </span>
                        <p className="text-xs text-gray-300 leading-relaxed font-sans">
                          {activeProject.problem}
                        </p>
                      </div>
                    )}
                    {activeProject.solution && (
                      <div className="p-6 rounded-2xl bg-emerald-950/[0.015] border border-emerald-500/10 space-y-3">
                        <span className="text-[10px] font-mono text-emerald-450 uppercase tracking-widest font-bold block">
                          Engineering Solution
                        </span>
                        <p className="text-xs text-gray-300 leading-relaxed font-sans">
                          {activeProject.solution}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* EVE-specific parameters: Vision / Current Progress */}
                {activeProject.vision && (
                  <div className="p-6 rounded-2xl bg-[#030610]/50 border border-blue-500/10 space-y-2.5">
                    <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-bold block">
                      Core Vision
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">
                      {activeProject.vision}
                    </p>
                  </div>
                )}

                {activeProject.currentProgress && (
                  <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-2.5">
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold block">
                      Current Development Progress
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">
                      {activeProject.currentProgress}
                    </p>
                  </div>
                )}

                {/* Project Features vs. Planned Features */}
                {activeProject.features && activeProject.features.length > 0 && (
                  <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold block">
                      Key Capabilities & Features
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeProject.features.map((feat, i) => (
                        <div key={i} className="flex items-start space-x-2 text-xs">
                          <CornerDownRight className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
                          <span className="text-gray-300 font-sans leading-relaxed">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeProject.plannedFeatures && activeProject.plannedFeatures.length > 0 && (
                  <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold block">
                      Planned Features (In Roadmap)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeProject.plannedFeatures.map((feat, i) => (
                        <div key={i} className="flex items-start space-x-2 text-xs">
                          <CornerDownRight className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
                          <span className="text-gray-300 font-sans leading-relaxed">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Responsibilities list (NASA challenge) */}
                {activeProject.responsibilities && activeProject.responsibilities.length > 0 && (
                  <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold block">
                      Role & Key Responsibilities
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeProject.responsibilities.map((resp, i) => (
                        <div key={i} className="flex items-start space-x-2 text-xs">
                          <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-gray-300 font-sans leading-relaxed">{resp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tech specifications list & learnings */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  
                  {/* Tech specs */}
                  <div className="md:col-span-5 p-5 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold block">
                      Technologies Used
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeProject.techStack.map((tech) => (
                        <span 
                          key={tech} 
                          className="px-2.5 py-1 rounded bg-white/[0.02] border border-white/5 text-xs text-white font-mono"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Learnings */}
                  {(activeProject.learnings || activeProject.learningJourney) && (
                    <div className="md:col-span-7 p-5 rounded-2xl bg-white/[0.012] border border-white/5 space-y-3">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold block">
                        Learning Takeaways
                      </span>
                      <p className="text-xs text-gray-400 leading-relaxed font-sans italic">
                        "{activeProject.learnings || activeProject.learningJourney}"
                      </p>
                    </div>
                  )}

                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
