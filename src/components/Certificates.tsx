import { CERTIFICATES } from "../data";
import { Award, ArrowUpRight, ShieldCheck, Calendar } from "lucide-react";

export default function Certificates() {
  return (
    <section id="certificates" className="py-12 border-t border-white/5 print:hidden text-left">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header section */}
        <div className="text-left space-y-2">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">/ Credentials</span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Academic & Tech Certifications
          </h2>
          <p className="text-xs text-gray-400 max-w-xl font-sans leading-relaxed">
            Verified academic accomplishments and structured subject matter proficiencies.
          </p>
        </div>

        {/* Dynamic Card stack */}
        {CERTIFICATES.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
            {CERTIFICATES.map((cert) => (
              <div 
                key={cert.id}
                className="p-5 rounded-2xl bg-white/[0.012] border border-white/5 hover:border-white/10 hover:bg-white/[0.02] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="h-8 w-8 rounded-full bg-cyan-950/20 border border-cyan-800/10 flex items-center justify-center">
                    <Award className="h-4.5 w-4.5 text-cyan-400" />
                  </div>
                  
                  <h3 className="text-sm font-semibold text-white tracking-tight leading-snug font-sans">
                    {cert.title}
                  </h3>
                  
                  <div className="space-y-1 text-[11px] text-gray-400 font-sans">
                    <span className="block font-medium text-gray-400">{cert.issuer}</span>
                    <div className="flex items-center space-x-1 font-mono text-gray-500 text-[10px]">
                      <Calendar className="h-3 w-3" />
                      <span>{cert.date}</span>
                    </div>
                  </div>
                </div>

                {cert.verificationLink && (
                  <a
                    href={cert.verificationLink}
                    target="_blank"
                    className="inline-flex items-center space-x-1 text-[10px] font-semibold font-mono text-cyan-400 hover:text-cyan-300 select-none pb-0.5"
                  >
                    <span>VERIFIED RECORD</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-white/[0.005] border border-white/5 text-center space-y-2">
            <Award className="h-8 w-8 text-gray-600 mx-auto" />
            <p className="text-xs text-gray-400 max-w-sm mx-auto font-sans leading-relaxed">
              No certifications are currently listed. Course highlights and official academic records will be verified and added here as they are completed.
            </p>
          </div>
        )}

        {/* Empty placeholder slot demonstrating future expansion support */}
        <div className="p-6 rounded-2xl bg-white/[0.005] border border-dashed border-white/5 text-center space-y-4">
          <ShieldCheck className="h-6 w-6 text-gray-600 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-xs text-gray-300 font-semibold font-sans">Continuing Specializations</h4>
            <p className="text-[11px] text-gray-550 font-sans">
              Currently pursuing structured academic tracks in Core Systems Programming and Applied Data analytics.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
