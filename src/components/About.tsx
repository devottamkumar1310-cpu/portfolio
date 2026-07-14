import { BookOpen, User, Server } from "lucide-react";
import { BIO_SUMMARY } from "../data";

export default function About() {
  return (
    <section id="about" className="py-12 border-t border-white/5 print:hidden relative z-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Section Heading */}
        <div className="text-left space-y-1">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">/ Introduction</span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            About Me
          </h2>
        </div>

        {/* Story Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Main Story block */}
          <div className="md:col-span-8 p-6 rounded-2xl bg-white/[0.015] border border-white/5 space-y-4 text-left">
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-semibold mb-2">
              <User className="h-4 w-4" />
              <span>My Journey</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {BIO_SUMMARY.aboutText}
            </p>
          </div>

          {/* Quick facts sidebar */}
          <div className="md:col-span-4 space-y-4 text-left">
            
            <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">
              <div className="flex items-center space-x-2 text-[10px] font-mono text-emerald-400 font-bold">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Primary Education</span>
              </div>
              <div className="text-xs space-y-1">
                <span className="font-bold text-white block">IIT Patna</span>
                <span className="text-gray-300 block font-medium">B.Sc. in Computer Science & Data Analytics</span>
                <span className="text-gray-500 font-mono text-[10px] block mt-1">Expected Graduation: 2028</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3 font-sans">
              <div className="flex items-center space-x-2 text-[10px] font-mono text-cyan-400 font-bold">
                <Server className="h-3.5 w-3.5" />
                <span>Current Focus Areas</span>
              </div>
              <ul className="text-xs text-gray-300 space-y-2 list-disc list-inside">
                {BIO_SUMMARY.currentFocus.map((focus, i) => (
                  <li key={i}>{focus}</li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
