import { useState } from "react";
import { BIO_SUMMARY, PROJECTS, SKILL_CATEGORIES, ACHIEVEMENTS } from "../data";
import { Mail, Github, Linkedin, Copy, Check, MapPin, Printer, BookOpen, Briefcase, Award } from "lucide-react";

export default function Resume() {
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Copy Email Helper
  const copyToClipboard = () => {
    navigator.clipboard.writeText(BIO_SUMMARY.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <section id="interactive-resume" className="py-12 border-t border-white/5 text-left">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Page header (hidden during printing) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">/ Resume</span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Curriculum Vitae</h2>
            <p className="text-xs text-gray-400">Print or export to PDF directly via your browser print setup.</p>
          </div>
          
          <div className="flex gap-2.5">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              {copiedEmail ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Email Copied!</span>
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
              className="px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-md"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Export PDF</span>
            </button>
          </div>
        </div>

        {/* PRINTABLE RESUME CANVAS */}
        {/* This container has high-contrast white-text formatting on screen, and switches gracefully to optimal rich black-text, pure white background look when printed */}
        <div className="rounded-2xl bg-white/[0.008] border border-white/5 p-8 sm:p-12 space-y-8 shadow-2xl print:bg-white print:text-black print:p-0 print:border-none print:shadow-none print:block font-sans">
          
          {/* Header section (Name & Title / Subtitle) */}
          <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-white/5 print:border-gray-350 pb-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white print:text-black tracking-tight">
                {BIO_SUMMARY.name}
              </h1>
              <p className="text-cyan-400 print:text-cyan-700 font-semibold font-mono text-xs tracking-wider">
                COMPUTER SCIENCE & DATA ANALYTICS STUDENT // IIT PATNA
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-400 print:text-gray-600 font-sans">
                <MapPin className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                <span>Patna, Bihar, India (IIT Patna Campus)</span>
              </div>
            </div>

            {/* Contacts lists */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center space-x-2 text-gray-300 print:text-gray-800">
                <Mail className="h-3.5 w-3.5 text-cyan-500 print:text-cyan-700 shrink-0" />
                <a href={`mailto:${BIO_SUMMARY.email}`} className="hover:text-white print:hover:text-black decoration-dotted underline-offset-2 transition-colors">
                  {BIO_SUMMARY.email}
                </a>
              </div>
              <div className="flex items-center space-x-2 text-gray-300 print:text-gray-800">
                <Github className="h-3.5 w-3.5 text-cyan-500 print:text-cyan-700 shrink-0" />
                <a href={BIO_SUMMARY.github} target="_blank" className="hover:text-white print:hover:text-black decoration-dotted underline-offset-2 transition-colors">
                  github.com/devottamkumar
                </a>
              </div>
              <div className="flex items-center space-x-2 text-gray-300 print:text-gray-800">
                <Linkedin className="h-3.5 w-3.5 text-cyan-500 print:text-cyan-700 shrink-0" />
                <a href={BIO_SUMMARY.linkedin} target="_blank" className="hover:text-white print:hover:text-black decoration-dotted underline-offset-2 transition-colors">
                  linkedin.com/in/devottamkumar
                </a>
              </div>
            </div>
          </div>

          {/* Education Core Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs border-b border-white/5 print:border-gray-250 pb-1">
              <BookOpen className="h-4 w-4 text-cyan-500 print:text-cyan-700 shrink-0" />
              <span className="tracking-widest font-mono text-[10px] uppercase font-bold text-gray-400 print:text-gray-700">Education</span>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white print:text-black">Indian Institute of Technology, Patna</h3>
                <p className="text-xs text-gray-300 print:text-gray-800 font-medium font-sans">
                  {BIO_SUMMARY.educationDegree}
                </p>
                <p className="text-xs text-gray-400 print:text-gray-600 font-sans leading-relaxed">
                  Focusing on core programming paradigms, relational database environments, algorithmic efficiency, and scalable backend workflows.
                </p>
              </div>
              <span className="text-gray-400 print:text-gray-800 font-mono text-[10.5px] shrink-0 font-bold bg-white/[0.03] print:bg-transparent border border-white/5 print:border-none px-1.5 py-0.5 rounded">
                Expected 2028
              </span>
            </div>
          </div>

          {/* Structured Work experience Or Technical Builds */}
          <div className="space-y-5">
            <div className="flex items-center space-x-2 text-xs border-b border-white/5 print:border-gray-250 pb-1">
              <Briefcase className="h-4 w-4 text-cyan-500 print:text-cyan-700 shrink-0" />
              <span className="tracking-widest font-mono text-[10px] uppercase font-bold text-gray-400 print:text-gray-700">Featured Projects & Practical Builds</span>
            </div>

            <div className="space-y-6">
              {PROJECTS.map((proj) => (
                <div key={proj.id} className="space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white print:text-black">
                      {proj.title} 
                      {proj.status && (
                        <span className="text-gray-400 print:text-gray-600 font-normal font-sans text-xs shrink-0 block sm:inline ml-0 sm:ml-2">
                          • {proj.status}
                        </span>
                      )}
                    </h3>
                    <span className="text-gray-400 print:text-gray-800 font-mono text-[10.5px] shrink-0 font-bold bg-white/[0.03] print:bg-transparent border border-white/5 print:border-none px-1.5 py-0.5 rounded">
                      {proj.period || "2026"}
                    </span>
                  </div>

                  <p className="text-xs text-cyan-400 print:text-cyan-700 font-semibold font-sans italic leading-none">
                    {proj.tagline}
                  </p>

                  <ul className="text-xs text-gray-300 print:text-gray-800 space-y-1.5 pl-4 list-disc list-outside font-sans">
                    <li>
                      <strong className="text-gray-400 print:text-gray-900">Description:</strong> {proj.description}
                    </li>
                    
                    {proj.vision && (
                      <li>
                        <strong className="text-gray-400 print:text-gray-900">Vision & Focus:</strong> {proj.vision}
                      </li>
                    )}

                    {proj.currentProgress && (
                      <li>
                        <strong className="text-gray-400 print:text-gray-900">Current Progress:</strong> {proj.currentProgress}
                      </li>
                    )}

                    {proj.responsibilities && proj.responsibilities.length > 0 && (
                      <li>
                        <strong className="text-gray-400 print:text-gray-900">Responsibilities:</strong> {proj.responsibilities.join(", ")}
                      </li>
                    )}

                    {proj.learnings && (
                      <li>
                        <strong className="text-gray-400 print:text-gray-900">Key Learnings:</strong> {proj.learnings}
                      </li>
                    )}

                    <li>
                      <strong className="text-gray-400 print:text-gray-900">Tech Stack:</strong> {proj.techStack.join(", ")}
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Matrix */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs border-b border-white/5 print:border-gray-250 pb-1">
              <Award className="h-4 w-4 text-cyan-500 print:text-cyan-700 shrink-0" />
              <span className="tracking-widest font-mono text-[10px] uppercase font-bold text-gray-400 print:text-gray-700">Technical Skills</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {SKILL_CATEGORIES.map((cat, i) => (
                <div key={i} className="space-y-1">
                  <span className="text-[10px] font-mono text-gray-500 print:text-gray-800 uppercase block font-bold leading-normal">
                    {cat.title}
                  </span>
                  <p className="text-xs text-gray-300 print:text-gray-800 font-sans leading-relaxed">
                    {cat.skills.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Achievements & Benchmarks Segment */}
          {ACHIEVEMENTS.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-xs border-b border-white/5 print:border-gray-250 pb-1">
                <Award className="h-4 w-4 text-cyan-500 print:text-cyan-700 shrink-0" />
                <span className="tracking-widest font-mono text-[10px] uppercase font-bold text-gray-400 print:text-gray-700">Academic & Project Benchmarks</span>
              </div>
              
              <ul className="text-xs text-gray-300 print:text-gray-800 space-y-1.5 pl-4 list-disc list-outside font-sans">
                {ACHIEVEMENTS.map((ach) => (
                  <li key={ach.id}>
                    <strong className="text-gray-400 print:text-gray-900">{ach.title} ({ach.date}):</strong> {ach.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
