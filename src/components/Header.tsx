import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Code2 } from "lucide-react";
import { BIO_SUMMARY } from "../data";

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
    <header className="sticky top-0 z-50 bg-[#050505]/75 backdrop-blur-md border-b border-white/5 print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Name Logo */}
        <Link 
          to="/" 
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center space-x-2.5 text-left group"
        >
          <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center transition-all group-hover:border-cyan-500/50">
            <Code2 className="h-4.5 w-4.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <span className="font-semibold text-white tracking-tight block text-sm leading-tight">
              {BIO_SUMMARY.name}
            </span>
            <span className="text-[10px] font-mono text-gray-500 leading-none">
              IIT PATNA STUDENT
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`px-3 py-1.5 rounded-md transition-all text-xs font-semibold ${
                currentTab === item.id 
                  ? "bg-white/5 text-white border border-white/10" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Contact CTA */}
        <div className="hidden md:flex items-center space-x-3">
          <Link
            to="/contact"
            className="px-3.5 py-1.5 rounded-md bg-white text-black hover:bg-gray-100 text-xs font-semibold tracking-tight transition-colors"
          >
            Get In Touch
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-white/5 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-b border-white/5 px-4 py-4 space-y-2 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center font-semibold text-xs ${
                currentTab === item.id 
                  ? "bg-white/5 text-cyan-400 border border-white/10" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="h-px bg-white/5 my-2" />
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-center block py-2.5 rounded-lg bg-white text-black hover:bg-gray-100 text-xs font-bold transition-all"
          >
            Get In Touch
          </Link>
        </div>
      )}
    </header>
  );
}
