import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Mail, 
  Github, 
  Linkedin, 
  Copy, 
  Check, 
  MapPin, 
  Printer, 
  BookOpen, 
  ArrowUpRight, 
  Sparkles, 
  Cpu, 
  Compass, 
  Layers,
  Phone,
  Globe,
  Briefcase,
  GraduationCap
} from "lucide-react";

export default function Resume() {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const emailAddress = "devottamkumar7@gmail.com";
  const phoneNumber = "+91 9905574163";
  const website = "devottamkumar.in";

  // Copy Email Helper
  const copyToClipboard = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Technical Expertise Data
  const expertise = [
    {
      category: "Frontend",
      skills: ["React.js", "Next.js", "Tailwind CSS"],
    },
    {
      category: "Backend",
      skills: ["FastAPI", "Node.js", "Express.js"],
    },
    {
      category: "Databases",
      skills: ["PostgreSQL", "Supabase", "MySQL"],
    },
    {
      category: "Tools",
      skills: ["Git", "GitHub", "Vercel", "Render", "Google Cloud Run"],
    },
    {
      category: "Concepts",
      skills: [
        "Data Structures & Algorithms",
        "REST APIs",
        "Authentication",
        "Database Design",
        "System Design",
      ],
    }
  ];

  // Areas of Focus Data
  const areasOfFocus = [
    "Software Engineering",
    "AI Systems",
    "Business Intelligence",
    "Product Development"
  ];

  return (
    <section id="executive-resume" className="py-10 text-left relative">
      <div className="max-w-[1200px] mx-auto space-y-10">
        
        {/* Page header (hidden during printing) */}
        <motion.div 
          initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6 print:hidden"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">/ Profile</span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Professional Resume</h2>
            <p className="text-xs text-gray-400">A polished brief of engineering expertise, current builds, and experience.</p>
          </div>
          
          <div className="flex gap-2.5 shrink-0">
            <button
              onClick={copyToClipboard}
              className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              {copiedEmail ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-gray-400" />
                  <span>Copy Email</span>
                </>
              )}
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-white hover:bg-gray-100 text-black rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-md"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </motion.div>

        {/* EXECUTIVE CANVAS (Screen/Print Optimizations) */}
        <motion.div 
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-10 print:bg-white print:text-black print:p-0 print:shadow-none print:block"
        >
          
          {/* ========================================== */}
          {/* 1. HERO SECTION */}
          {/* ========================================== */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-white/5 pb-8 print:border-gray-200 print:pb-6">
            <div className="space-y-4 max-w-xl">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white print:text-black tracking-tight leading-none uppercase">
                  Devottam Kumar
                </h1>
                <div className="space-y-1">
                  <p className="text-cyan-400 print:text-cyan-700 font-semibold font-mono text-xs sm:text-sm tracking-wider uppercase">
                    Software Engineer & AI Systems Builder
                  </p>
                </div>
              </div>
              
              <p className="text-gray-300 print:text-gray-800 text-sm sm:text-base font-light leading-relaxed font-sans">
                Building AI-powered software systems, intelligent decision-support platforms, and data-driven SaaS products. Focused on backend engineering, scalable database architecture, and advanced AI application logic.
              </p>

              {/* Action buttons on screen, clean contacts list for screen & print */}
              <div className="flex flex-wrap items-center gap-3 pt-1.5 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white text-black hover:bg-gray-100 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Download PDF
                </button>
                <Link
                  to="/contact"
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 text-xs font-semibold transition-all cursor-pointer"
                >
                  Contact Me
                </Link>
              </div>
            </div>

            {/* Contacts & Social Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2.5 text-xs font-mono text-gray-400 print:text-gray-700 shrink-0 w-full md:w-auto">
              <div className="flex items-center space-x-2 text-gray-300 print:text-gray-800">
                <Phone className="h-3.5 w-3.5 text-cyan-500 print:text-cyan-700 shrink-0" />
                <a href={`tel:${phoneNumber}`} className="hover:text-white print:hover:text-black transition-colors">
                  {phoneNumber}
                </a>
              </div>
              <div className="flex items-center space-x-2 text-gray-300 print:text-gray-800">
                <Mail className="h-3.5 w-3.5 text-cyan-500 print:text-cyan-700 shrink-0" />
                <a href={`mailto:${emailAddress}`} className="hover:text-white print:hover:text-black hover:underline transition-colors">
                  {emailAddress}
                </a>
              </div>
              <div className="flex items-center space-x-2 text-gray-300 print:text-gray-800">
                <Globe className="h-3.5 w-3.5 text-cyan-500 print:text-cyan-700 shrink-0" />
                <a href={`https://${website}`} target="_blank" rel="noopener noreferrer" className="hover:text-white print:hover:text-black hover:underline transition-colors">
                  {website}
                </a>
              </div>
              <div className="flex items-center space-x-2 text-gray-300 print:text-gray-800">
                <Linkedin className="h-3.5 w-3.5 text-cyan-500 print:text-cyan-700 shrink-0" />
                <a href="https://linkedin.com/in/devottamkumar" target="_blank" rel="noopener noreferrer" className="hover:text-white print:hover:text-black hover:underline transition-colors">
                  linkedin.com/in/devottamkumar
                </a>
              </div>
              <div className="flex items-center space-x-2 text-gray-300 print:text-gray-800">
                <Github className="h-3.5 w-3.5 text-cyan-500 print:text-cyan-700 shrink-0" />
                <a href="https://github.com/devottamkumar1310-cpu" target="_blank" rel="noopener noreferrer" className="hover:text-white print:hover:text-black hover:underline transition-colors">
                  github.com/devottamkumar1310-cpu
                </a>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* 2. EDUCATION SECTION */}
          {/* ========================================== */}
          <div className="space-y-4 border-b border-white/5 pb-8 print:border-gray-200 print:pb-6">
            <div className="flex items-center space-x-2 text-xs border-b border-white/5 print:border-gray-250 pb-1.5">
              <GraduationCap className="h-4 w-4 text-cyan-500 print:text-cyan-700 shrink-0" />
              <span className="tracking-widest font-mono text-[10px] uppercase font-bold text-gray-400 print:text-gray-700">Education</span>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white print:text-black">Indian Institute of Technology Patna</h3>
                <p className="text-sm text-cyan-400 print:text-cyan-700 font-semibold font-mono">
                  B.Sc. (Hons.) Computer Science and Data Analytics
                </p>
                <p className="text-xs text-gray-400 print:text-gray-600 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Patna, Bihar
                </p>
              </div>
              
              <div className="shrink-0 text-left sm:text-right">
                <div className="inline-block px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 print:bg-gray-150 print:text-black print:border-gray-300">
                  <span className="text-[10px] font-mono font-bold tracking-tight uppercase mr-1">CPI</span>
                  <span className="text-sm font-bold">7.90</span>
                  <span className="text-xs text-gray-400 print:text-gray-650"> / 10.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* 3. EXPERIENCE (NASA SPACE APPS CHALLENGE) */}
          {/* ========================================== */}
          <div className="space-y-4 border-b border-white/5 pb-8 print:border-gray-200 print:pb-6">
            <div className="flex items-center space-x-2 text-xs border-b border-white/5 print:border-gray-250 pb-1.5">
              <Briefcase className="h-4 w-4 text-cyan-500 print:text-cyan-700 shrink-0" />
              <span className="tracking-widest font-mono text-[10px] uppercase font-bold text-gray-400 print:text-gray-700">Experience</span>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-1">
                <div>
                  <h3 className="text-base font-bold text-white print:text-black">Project Contributor</h3>
                  <p className="text-sm text-cyan-400 print:text-cyan-700 font-semibold font-mono">NASA Space Apps Challenge</p>
                </div>
                <div className="text-left sm:text-right font-mono text-xs text-gray-400 print:text-gray-600">
                  <p className="font-semibold">2025 - 2025</p>
                  <p className="text-[10px] uppercase">Remote</p>
                </div>
              </div>

              <ul className="list-none space-y-2 text-xs text-gray-300 print:text-gray-800 font-sans leading-relaxed pl-1">
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 print:text-cyan-700 shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400/70 print:bg-cyan-700"></span>
                  <span>Participated in a multidisciplinary team to design and prototype a technology solution during the NASA Space Apps Challenge.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 print:text-cyan-700 shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400/70 print:bg-cyan-700"></span>
                  <span>Contributed to software development, testing, and project presentation under hackathon timelines.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 print:text-cyan-700 shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400/70 print:bg-cyan-700"></span>
                  <span>Applied software engineering, collaboration, and problem-solving skills in a competitive development environment.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* ========================================== */}
          {/* 4. FEATURED PROJECT (EVE) */}
          {/* ========================================== */}
          <div className="space-y-4 border-b border-white/5 pb-8 print:border-gray-200 print:pb-6">
            <div className="flex items-center space-x-2 text-xs border-b border-white/5 print:border-gray-250 pb-1.5">
              <Sparkles className="h-4 w-4 text-cyan-500 print:text-cyan-700 shrink-0" />
              <span className="tracking-widest font-mono text-[10px] uppercase font-bold text-gray-400 print:text-gray-700">Featured Project</span>
            </div>

            {/* EVE Card - Prominent styling with border, background glow, and full link */}
            <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-cyan-500/[0.03] via-white/[0.01] to-transparent border border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/[0.04] transition-all duration-300 print:bg-transparent print:border-gray-300 print:p-3">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.03] rounded-full blur-2xl pointer-events-none print:hidden" />
              
              <div className="relative space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <h4 className="text-base font-bold text-white print:text-black group-hover:text-cyan-300 transition-colors">
                        EVE
                      </h4>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono tracking-wider uppercase print:bg-gray-150 print:text-black print:border-gray-300">
                        Primary Visual Highlight
                      </span>
                    </div>
                    <p className="text-xs text-cyan-400 print:text-cyan-700 font-semibold font-mono">
                      AI-Powered Business Intelligence Platform
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400 print:text-gray-650 font-mono font-semibold">
                      2025 - Present
                    </span>
                    <Link 
                      to="/projects/eve" 
                      className="p-1.5 rounded-lg bg-white/5 border border-white/5 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10 text-gray-400 group-hover:text-cyan-300 transition-all shrink-0 print:hidden"
                      title="View Case Study"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                <ul className="list-none space-y-2 text-xs text-gray-300 print:text-gray-800 font-sans leading-relaxed pl-1">
                  <li className="flex items-start gap-2.5">
                    <span className="text-cyan-400 print:text-cyan-700 shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400/70 print:bg-cyan-700"></span>
                    <span>Architected and developed a multi-tenant SaaS platform for business intelligence and operational analytics.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-cyan-400 print:text-cyan-700 shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400/70 print:bg-cyan-700"></span>
                    <span>Built inventory intelligence modules for stockout prediction, reorder recommendations, dead-stock detection, margin analysis, and profitability forecasting.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-cyan-400 print:text-cyan-700 shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400/70 print:bg-cyan-700"></span>
                    <span>Designed executive dashboards providing KPI tracking, business health monitoring, and decision-support insights.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-cyan-400 print:text-cyan-700 shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400/70 print:bg-cyan-700"></span>
                    <span>Implemented AI-powered document intelligence, conversational analytics, and workspace-level data isolation.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-cyan-400 print:text-cyan-700 shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400/70 print:bg-cyan-700"></span>
                    <span>Developed scalable backend APIs and secure authentication workflows using FastAPI and PostgreSQL.</span>
                  </li>
                </ul>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["FastAPI", "PostgreSQL", "Next.js", "Supabase", "Google Gemini API"].map((tech) => (
                    <span 
                      key={tech} 
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-500/10 text-cyan-400 print:bg-gray-100 print:text-black print:border print:border-gray-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* 5. ACTIVE PROJECT (FRIDAY) */}
          {/* ========================================== */}
          <div className="space-y-4 border-b border-white/5 pb-8 print:border-gray-200 print:pb-6">
            <div className="flex items-center space-x-2 text-xs border-b border-white/5 print:border-gray-250 pb-1.5">
              <Layers className="h-4 w-4 text-cyan-500 print:text-cyan-700 shrink-0" />
              <span className="tracking-widest font-mono text-[10px] uppercase font-bold text-gray-400 print:text-gray-700">Active Project</span>
            </div>

            {/* FRIDAY - Minimal, clean, secondary project layout */}
            <div className="group relative p-4 rounded-xl bg-white/[0.01] border border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-all duration-300 print:bg-transparent print:border-gray-200 print:p-3">
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-base font-bold text-gray-200 print:text-black group-hover:text-white transition-colors">
                        FRIDAY
                      </h4>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10 font-mono tracking-wider uppercase print:bg-gray-100 print:text-gray-800">
                        Secondary Project
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 print:text-gray-700 font-semibold font-mono">
                      AI-Powered Adaptive Learning Platform
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400 print:text-gray-650 font-mono font-semibold">
                      2025 - Present
                    </span>
                    <Link 
                      to="/projects" 
                      className="p-1 rounded text-gray-500 hover:text-white transition-all shrink-0 print:hidden"
                      title="View Projects"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                <ul className="list-none space-y-2 text-xs text-gray-300 print:text-gray-800 font-sans leading-relaxed pl-1">
                  <li className="flex items-start gap-2.5">
                    <span className="text-gray-500 print:text-gray-500 shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-500/70 print:bg-gray-500"></span>
                    <span>Building an AI-powered adaptive learning platform that delivers personalized study plans, mentor matching, and resource recommendations.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-gray-500 print:text-gray-500 shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-500/70 print:bg-gray-500"></span>
                    <span>Designed a seven-dimensional behavioral profiling framework to model learner preferences and learning patterns.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-gray-500 print:text-gray-500 shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-500/70 print:bg-gray-500"></span>
                    <span>Developing a workload-preserving planning engine that automatically redistributes unfinished tasks while maintaining daily workload constraints and long-term learning objectives.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-gray-500 print:text-gray-500 shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-500/70 print:bg-gray-500"></span>
                    <span>Engineering recommendation systems for teacher discovery, resource selection, and personalized learning pathways.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-gray-500 print:text-gray-500 shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-500/70 print:bg-gray-500"></span>
                    <span>Building scalable backend APIs, analytics systems, and responsive user interfaces using FastAPI and Next.js.</span>
                  </li>
                </ul>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["FastAPI", "Next.js", "PostgreSQL", "Python", "Tailwind CSS"].map((tech) => (
                    <span 
                      key={tech} 
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-white/5 text-gray-400 print:bg-gray-100 print:text-black print:border print:border-gray-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* 6. TECHNICAL EXPERTISE */}
          {/* ========================================== */}
          <div className="space-y-4 border-b border-white/5 pb-8 print:border-gray-200 print:pb-6">
            <div className="flex items-center space-x-2 text-xs border-b border-white/5 print:border-gray-250 pb-1.5">
              <Cpu className="h-4 w-4 text-cyan-500 print:text-cyan-700 shrink-0" />
              <span className="tracking-widest font-mono text-[10px] uppercase font-bold text-gray-400 print:text-gray-700">Technical Expertise</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {expertise.map((group, index) => (
                <div 
                  key={index}
                  className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 hover:border-white/10 hover:bg-white/[0.015] transition-all flex flex-col justify-between print:border-gray-200 print:bg-transparent print:p-2"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-cyan-400 print:text-cyan-700 uppercase tracking-widest font-bold block leading-none">
                      {group.category}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {group.skills.map((skill, sIdx) => (
                        <span 
                      key={sIdx} 
                          className="text-xs text-gray-300 print:text-gray-800 font-sans font-medium"
                        >
                          {skill}{sIdx < group.skills.length - 1 ? "," : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================== */}
          {/* 7. AREAS OF FOCUS */}
          {/* ========================================== */}
          <div className="space-y-3.5">
            <div className="flex items-center space-x-2 text-xs border-b border-white/5 print:border-gray-250 pb-1.5">
              <Compass className="h-4 w-4 text-cyan-500 print:text-cyan-700 shrink-0" />
              <span className="tracking-widest font-mono text-[10px] uppercase font-bold text-gray-400 print:text-gray-700">Areas of Focus</span>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-0.5">
              {areasOfFocus.map((focus) => (
                <span
                  key={focus}
                  className="px-3 py-1 rounded-full bg-white/[0.02] border border-white/5 text-xs text-gray-300 font-sans tracking-tight hover:border-cyan-500/20 hover:text-cyan-300 transition-colors print:bg-gray-100 print:text-black print:border-gray-250"
                >
                  {focus}
                </span>
              ))}
            </div>
          </div>

        </motion.div>

      </div>
    </section>
  );
}
