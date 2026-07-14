import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Code2 } from "lucide-react";
import { BIO_SUMMARY } from "../data";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: any) => void;
}

export default function Header({ currentTab }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home", path: "/" },
    { id: "projects", label: "Products & Systems", path: "/projects" },
    { id: "certificates", label: "Certificates", path: "/certificates" },
    { id: "resume", label: "Resume", path: "/resume" },
    { id: "contact", label: "Contact", path: "/contact" }
  ];

  return (
    <header className="sticky top-4 z-50 mx-4 md:mx-auto max-w-4xl liquid-glass-navbar rounded-full print:hidden">
      <div className="px-6 h-14 flex items-center justify-between relative">
        
        {/* Name Logo */}
        <Link 
          to="/" 
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center space-x-2.5 text-left group"
        >
          <div className="w-8.5 h-8.5 bg-white/5 border border-white/10 rounded-full flex items-center justify-center transition-all group-hover:border-cyan-500/50">
            <Code2 className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <span className="font-semibold text-white tracking-tight block text-xs leading-tight">
              {BIO_SUMMARY.name}
            </span>
            <span className="text-[9px] font-mono text-gray-500 leading-none block">
              IIT PATNA STUDENT
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 text-sm relative">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`relative px-3.5 py-1.5 rounded-full transition-colors duration-300 text-[11px] font-semibold ${
                  isActive ? "text-cyan-400" : "text-gray-450 hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeNavTab"
                    className="absolute inset-0 bg-cyan-950/20 border border-cyan-500/35 rounded-full shadow-[0_0_12px_-3px_rgba(6,182,212,0.3)] -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Contact CTA */}
        <div className="hidden md:flex items-center space-x-3">
          <Link
            to="/contact"
            className="px-4 py-1.5 rounded-full liquid-glass-btn-primary text-[11px] font-bold tracking-tight text-white hover:text-cyan-400"
          >
            Get In Touch
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all border border-white/5 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>

        {/* Mobile Menu dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-16 left-0 right-0 md:hidden liquid-glass-navbar px-4 py-4 rounded-2xl space-y-1.5 text-sm shadow-2xl z-50 border border-white/10"
            >
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all duration-200 flex items-center font-semibold text-xs border ${
                    currentTab === item.id 
                      ? "bg-cyan-950/20 text-cyan-400 border-cyan-500/35 shadow-inner" 
                      : "text-gray-450 hover:text-white hover:bg-white/[0.03] border-transparent"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="h-px bg-white/5 my-2" />
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center block py-2.5 rounded-xl liquid-glass-btn-primary text-xs font-bold transition-all shadow-md"
              >
                Get In Touch
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </header>
  );
}
