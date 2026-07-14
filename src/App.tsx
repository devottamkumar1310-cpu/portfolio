import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

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

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll to head on route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  // Sync active tab for Header highlight based on pathname
  const getActiveTab = (): TabId => {
    const path = location.pathname;
    if (path === "/" || path === "") return "home";
    if (path.startsWith("/projects")) return "projects";
    if (path.startsWith("/certificates")) return "certificates";
    if (path.startsWith("/resume")) return "resume";
    if (path.startsWith("/contact")) return "contact";
    if (path.startsWith("/admin")) return "admin";
    return "home";
  };

  const handleTabChange = (tab: TabId) => {
    if (tab === "home") {
      navigate("/");
    } else {
      navigate(`/${tab}`);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] font-sans relative selection:bg-cyan-500/20 selection:text-cyan-200 overflow-x-hidden flex flex-col justify-between print:bg-white print:text-black">
      
      {/* Dynamic Cosmic Deep-Space Visual System */}
      <CosmicBackground />

      <div>
        {/* Core Header Navigation */}
        <Header 
          currentTab={getActiveTab()} 
          onTabChange={handleTabChange} 
        />

        {/* Navigation Stage Content Container */}
        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 print:p-0 print:max-w-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="print:opacity-100 print:transform-none"
            >
              <Routes>
                <Route path="/" element={
                  <div className="space-y-6">
                    <Hero onTabChange={(tab: "projects" | "resume") => handleTabChange(tab)} />
                    <Projects />
                    <CurrentlyBuilding />
                    <Timeline />
                    <Skills />
                    <Certificates />
                    <Contact />
                  </div>
                } />

                {/* Dedicated Projects Showcase & Dynamic Case Studies */}
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:slug" element={<Projects />} />

                {/* Nav views */}
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/certificates/:id" element={<Certificates />} />
                <Route path="/resume" element={<Resume />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin" element={<AdminDashboard />} />

                {/* Wildcard 404 handler */}
                <Route path="*" element={
                  <div className="py-20 text-center space-y-6">
                    <h2 className="text-3xl font-semibold text-white">404 - Not Found</h2>
                    <p className="text-gray-400 text-sm max-w-md mx-auto">
                      The page you are looking for does not exist or has been moved.
                    </p>
                    <button
                      onClick={() => navigate("/")}
                      className="px-4 py-2 bg-white text-black hover:bg-gray-100 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Return Home
                    </button>
                  </div>
                } />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Persistent General Footer */}
      <Footer />

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
