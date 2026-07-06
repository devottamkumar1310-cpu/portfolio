import { SKILL_CATEGORIES } from "../data";
import { Code2, Server, Database, Layers, Brain, Terminal } from "lucide-react";

export default function Skills() {
  // Icon mapper helper
  const getCategoryIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("programming")) return <Code2 className="h-4.5 w-4.5 text-cyan-400" />;
    if (t.includes("backend")) return <Server className="h-4.5 w-4.5 text-blue-400" />;
    if (t.includes("databases")) return <Database className="h-4.5 w-4.5 text-emerald-400" />;
    if (t.includes("frontend")) return <Layers className="h-4.5 w-4.5 text-purple-400" />;
    if (t.includes("computer science") || t.includes("cs")) return <Brain className="h-4.5 w-4.5 text-violet-400" />;
    return <Terminal className="h-4.5 w-4.5 text-orange-400" />;
  };

  return (
    <section id="skills" className="py-12 border-t border-white/5 print:hidden">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Section Heading */}
        <div className="text-left space-y-1">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">/ Core Competencies</span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Skills
          </h2>
          <p className="text-xs text-gray-400 max-w-xl font-sans leading-relaxed">
            Technical proficiencies and tools based on academic study, hands-on building, and database practices.
          </p>
        </div>

        {/* Skills Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4.5 text-left">
          {SKILL_CATEGORIES.map((category, idx) => (
            <div 
              key={idx} 
              className="p-5 rounded-2xl bg-white/[0.012] border border-white/5 hover:border-white/10 hover:bg-white/[0.02] hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                
                {/* Header item */}
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                    {getCategoryIcon(category.title)}
                  </div>
                  <h3 className="text-xs font-semibold text-white tracking-tight leading-normal font-sans">
                    {category.title}
                  </h3>
                </div>
                
                {/* Skill Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {category.skills.map((skill, skillIdx) => (
                    <span 
                      key={skillIdx} 
                      className="px-2.5 py-1 rounded-md bg-white/[0.02] border border-white/5 text-[10.5px] font-mono text-gray-300 font-medium hover:text-white hover:border-cyan-500/20 transition-all animate-none"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
