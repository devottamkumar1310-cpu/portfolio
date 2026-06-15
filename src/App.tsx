import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

// Sub-components
import CosmicBackground from "./components/CosmicBackground";
import Header from "./components/Header";
import Hero from "./components/Hero";
import CurrentlyBuilding from "./components/CurrentlyBuilding";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Certificates from "./components/Certificates";
import Resume from "./components/Resume";
import Timeline from "./components/Timeline";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

type TabId = "home" | "projects" | "certificates" | "resume" | "contact";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("home");

  // Scroll to head on tab shifts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#030303] text-[#e5e7eb] font-sans relative selection:bg-cyan-500/20 selection:text-cyan-200 overflow-x-hidden flex flex-col justify-between print:bg-white print:text-black">
      
      {/* Dynamic Cosmic Deep-Space Visual System */}
      <CosmicBackground />

      <div>
        {/* Core Header Navigation */}
        <Header 
          currentTab={activeTab} 
          onTabChange={(tab: TabId) => setActiveTab(tab)} 
        />

        {/* Navigation Stage Content Container */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 print:p-0 print:max-w-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="print:opacity-100 print:transform-none"
            >
              {activeTab === "home" && (
                <div className="space-y-6">
                  <Hero onTabChange={(tab: "projects" | "resume") => setActiveTab(tab)} />
                  <CurrentlyBuilding />
                  <About />
                  <Projects />
                  <Skills />
                  <Timeline />
                  <Contact />
                </div>
              )}

              {activeTab === "projects" && <Projects />}

              {activeTab === "certificates" && <Certificates />}

              {activeTab === "resume" && <Resume />}

              {activeTab === "contact" && <Contact />}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Persistent General Footer */}
      <Footer />

    </div>
  );
}
