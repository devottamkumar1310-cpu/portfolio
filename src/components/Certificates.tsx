import { useState, useEffect } from "react";
import { CERTIFICATES as STATIC_CERTIFICATES } from "../data";
import { Award, ArrowUpRight, GraduationCap, CheckCircle2, Bookmark, Loader2 } from "lucide-react";
import { Certificate } from "../types";
import { supabase } from "../lib/supabase";

export default function Certificates() {
  const [dbCertificates, setDbCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    async function fetchCertificates() {
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .order('issue_date', { ascending: false });

        if (error) {
          console.error("Error fetching certificates from Supabase:", error);
          return;
        }

        // Map database row schema to Certificate interface
        if (data) {
          const mappedCerts: Certificate[] = data.map((row: any) => ({
            id: row.id,
            title: row.title,
            issuer: row.issuer,
            date: row.issue_date,
            category: row.category || "General",
            skills: row.skills || [],
            verificationLink: row.verification_url,
            featured: row.featured,
          }));
          setDbCertificates(mappedCerts);
        }
      } catch (err) {
        console.error("Supabase fetch failed", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCertificates();
  }, []);

  // Combine static fallback data with database data (Supabase takes precedence if they were duplicate, but here we just concat)
  // In a real app, you might fully replace STATIC_CERTIFICATES with DB data. For now, we merge them for portfolio breadth.
  const ALL_CERTIFICATES = [...dbCertificates, ...STATIC_CERTIFICATES];

  // Derive categories dynamically
  const categories = ["All", ...Array.from(new Set(ALL_CERTIFICATES.map(c => c.category)))];

  const filteredCerts = filter === "All" 
    ? ALL_CERTIFICATES 
    : ALL_CERTIFICATES.filter(c => c.category === filter);

  const featuredCerts = filteredCerts.filter(c => c.featured);
  const regularCerts = filteredCerts.filter(c => !c.featured);

  // Group regular certificates by category
  const groupedCerts = regularCerts.reduce((acc, cert) => {
    if (!acc[cert.category]) {
      acc[cert.category] = [];
    }
    acc[cert.category].push(cert);
    return acc;
  }, {} as Record<string, Certificate[]>);

  const activeCategories = Object.keys(groupedCerts);

  return (
    <section id="certificates" className="py-16 border-t border-white/5 print:hidden text-left relative z-10">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-left space-y-4 max-w-xl">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">/ Continuous Learning</span>
              <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight flex items-center gap-3">
                <GraduationCap className="h-8 w-8 text-cyan-400" />
                Certificates & Learning
              </h2>
            </div>
            <p className="text-sm text-gray-400 font-sans leading-relaxed">
              A curated collection of courses, certifications, and technical training that have shaped my skills in software engineering, artificial intelligence, data science, and product development.
            </p>
          </div>

          {/* Pill Filters */}
          <div className="flex flex-wrap gap-1 bg-white/[0.02] border border-white/5 rounded-lg p-1 text-xs self-start">
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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-cyan-500">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-xs font-mono tracking-widest">SYNCING DATABASE...</span>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Featured Certificates */}
            {featuredCerts.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
                  <Award className="h-4 w-4 text-amber-400" />
                  <h3 className="text-sm font-mono uppercase tracking-widest font-bold text-amber-400">Featured Certifications</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredCerts.map(cert => (
                    <div 
                      key={cert.id}
                      className="p-6 sm:p-8 rounded-3xl bg-amber-950/10 border border-amber-500/20 shadow-[0_0_30px_-10px_rgba(245,158,11,0.1)] hover:bg-amber-950/20 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-6 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] -mt-10 -mr-10 pointer-events-none rounded-full" />
                      
                      <div className="space-y-4 relative z-10">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-amber-500/80 uppercase tracking-widest font-bold">
                            {cert.issuer}
                          </span>
                          <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                            {cert.title}
                          </h4>
                        </div>
                        
                        <div className="space-y-2">
                          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold block">
                            Skills Gained
                          </span>
                          <ul className="grid grid-cols-2 gap-2">
                            {cert.skills.map((skill, i) => (
                              <li key={i} className="flex items-start space-x-2 text-xs">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-gray-300 font-sans">{skill}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-amber-500/10 relative z-10">
                        <span className="text-xs font-mono text-gray-500">{cert.date}</span>
                        {cert.verificationLink && (
                          <a
                            href={cert.verificationLink}
                            target="_blank"
                            className="inline-flex items-center space-x-1 text-xs font-semibold font-mono text-amber-400 hover:text-amber-300 transition-colors"
                          >
                            <span>View Credential</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grouped Certificates by Category */}
            <div className="space-y-12">
              {activeCategories.map((category) => (
                <div key={category} className="space-y-6">
                  
                  <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
                    <Bookmark className="h-4 w-4 text-cyan-500" />
                    <h3 className="text-sm font-mono uppercase tracking-widest font-bold text-cyan-400">{category}</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {groupedCerts[category].map(cert => (
                      <div 
                        key={cert.id}
                        className="p-6 rounded-2xl bg-white/[0.015] border border-white/5 hover:bg-white/[0.03] hover:border-white/10 transition-colors flex flex-col justify-between space-y-5 group"
                      >
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">
                              {cert.issuer}
                            </span>
                            <h4 className="text-base font-bold text-white tracking-tight leading-snug">
                              {cert.title}
                            </h4>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {cert.skills.map((skill, i) => (
                              <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.02] text-gray-300 border border-white/5">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <span className="text-[10px] font-mono text-gray-500">{cert.date}</span>
                          {cert.verificationLink && (
                            <a
                              href={cert.verificationLink}
                              target="_blank"
                              className="inline-flex items-center space-x-1 text-[10px] font-bold font-mono text-cyan-400/70 group-hover:text-cyan-400 transition-colors"
                            >
                              <span>Credential</span>
                              <ArrowUpRight className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>

            {ALL_CERTIFICATES.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500 text-sm font-sans">No certificates found matching your criteria.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
