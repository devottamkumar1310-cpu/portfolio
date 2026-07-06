import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PROJECTS } from "./data";

// Sub-components
import CosmicBackground from "./components/CosmicBackground";
import Header from "./components/Header";
import Hero from "./components/Hero";
import CurrentlyBuilding from "./components/CurrentlyBuilding";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Certificates from "./components/Certificates";
import Resume from "./components/Resume";
import Timeline from "./components/Timeline";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import AdminDashboard from "./components/admin/AdminDashboard";

export type TabId = "home" | "projects" | "certificates" | "resume" | "contact" | "admin";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [activeProjectSlug, setActiveProjectSlug] = useState<string | null>(null);

  // Sync state with location hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || "#home";
      const cleanHash = hash.replace("#", "");
      
      if (cleanHash.startsWith("projects/")) {
        const slug = cleanHash.split("/")[1];
        // Validate slug against project list dynamically
        const projectExists = PROJECTS.some(p => p.id === slug);
        if (projectExists) {
          setActiveTab("projects");
          setActiveProjectSlug(slug);
        } else {
          // If project slug doesn't exist, redirect to projects list
          window.location.hash = "#projects";
        }
      } else {
        const validTabs: TabId[] = ["home", "projects", "certificates", "resume", "contact", "admin"];
        if (validTabs.includes(cleanHash as TabId)) {
          setActiveTab(cleanHash as TabId);
          setActiveProjectSlug(null);
        } else {
          window.location.hash = "#home";
        }
      }
    };

    // Initial check on mount
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Scroll to head on route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab, activeProjectSlug]);

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] font-sans relative selection:bg-cyan-500/20 selection:text-cyan-200 overflow-x-hidden flex flex-col justify-between print:bg-white print:text-black">
      
      {/* Dynamic Cosmic Deep-Space Visual System */}
      <CosmicBackground />

      <div>
        {/* Core Header Navigation */}
        <Header 
          currentTab={activeTab} 
          onTabChange={(tab: TabId) => { window.location.hash = `#${tab}`; }} 
        />

        {/* Navigation Stage Content Container */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 print:p-0 print:max-w-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (activeProjectSlug ? `-${activeProjectSlug}` : "")}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="print:opacity-100 print:transform-none"
            >
              {activeTab === "home" && (
                <div className="space-y-6">
                  <Hero onTabChange={(tab: "projects" | "resume") => { window.location.hash = `#${tab}`; }} />
                  <Projects activeProjectSlug={activeProjectSlug} />
                  <CurrentlyBuilding />
                  <Timeline />
                  <Skills />
                  <Certificates />
                  <Contact />
                </div>
              )}

              {activeTab === "projects" && <Projects activeProjectSlug={activeProjectSlug} />}

              {activeTab === "certificates" && <Certificates />}

              {activeTab === "resume" && <Resume />}

              {activeTab === "contact" && <Contact />}

              {activeTab === "admin" && <AdminDashboard />}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Persistent General Footer */}
      <Footer />

    </div>
  );
}

