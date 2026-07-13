import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { CERTIFICATES } from "../data";
import { Certificate } from "../types";
import { 
  Award, 
  Eye, 
  FileDown, 
  X, 
  ZoomIn, 
  ZoomOut,
  Calendar,
  Building,
  ArrowLeft,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Certificates() {
  const { id } = useParams<{ id: string }>();
  const [activePreviewCert, setActivePreviewCert] = useState<Certificate | null>(null);

  // If a specific certificate ID is provided, render the dedicated detail page
  if (id) {
    const cert = CERTIFICATES.find((c) => c.id === id);

    if (!cert) {
      return (
        <div className="py-24 text-center space-y-6">
          <h2 className="text-3xl font-bold text-white">Certificate Not Found</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            The certificate details you requested could not be found.
          </p>
          <Link
            to="/certificates"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-black hover:bg-gray-150 text-xs font-bold rounded-lg transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Certificates</span>
          </Link>
        </div>
      );
    }

    return (
      <>
        <CertificateDetailView certificate={cert} onPreview={() => setActivePreviewCert(cert)} />
        <AnimatePresence>
          {activePreviewCert && (
            <CertificateLightbox 
              certificate={activePreviewCert} 
              onClose={() => setActivePreviewCert(null)} 
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // Otherwise, render the standard Certificates list view
  return (
    <>
      <CertificatesListView onPreview={(cert) => setActivePreviewCert(cert)} />
      <AnimatePresence>
        {activePreviewCert && (
          <CertificateLightbox 
            certificate={activePreviewCert} 
            onClose={() => setActivePreviewCert(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}

// --------------------------------------------------
// VIEW: CERTIFICATES LIST
// --------------------------------------------------
interface CertificatesListViewProps {
  onPreview: (cert: Certificate) => void;
}

function CertificatesListView({ onPreview }: CertificatesListViewProps) {
  return (
    <section id="certificates" className="py-16 border-t border-white/5 print:hidden text-left relative z-10">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-left space-y-4 max-w-xl">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">/ Proven Capabilities</span>
              <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight flex items-center gap-3">
                <Award className="h-8 w-8 text-cyan-400" />
                Certificates & Recognition
              </h2>
            </div>
            <p className="text-sm text-gray-400 font-sans leading-relaxed">
              Official records of technical certifications and competitive hackathon achievements. Preview documents directly in the portfolio or download authentic PDFs.
            </p>
          </div>
        </div>

        {/* Reusable Certificate List Grid */}
        {CERTIFICATES.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl">
            <p className="text-gray-500 text-sm font-sans">No certificates added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {CERTIFICATES.map((cert, index) => (
              <CertificateCard 
                key={index} 
                certificate={cert} 
                onPreview={() => onPreview(cert)} 
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

// --------------------------------------------------
// COMPONENT: CERTIFICATE CARD
// --------------------------------------------------
interface CertificateCardProps {
  certificate: Certificate;
  onPreview: () => void;
}

export function CertificateCard({ certificate, onPreview }: CertificateCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="group rounded-2xl border border-white/5 bg-white/[0.015] hover:border-cyan-500/30 hover:bg-white/[0.025] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg"
    >
      <div className="space-y-4">
        {/* Certificate Image Frame */}
        <div 
          onClick={onPreview}
          className="relative aspect-[1.414] overflow-hidden border-b border-white/5 bg-black/40 cursor-pointer group/image"
        >
          <img 
            src={certificate.image} 
            alt={certificate.title} 
            className="w-full h-full object-cover opacity-80 group-hover/image:opacity-100 group-hover/image:scale-[1.015] transition-all duration-500"
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            <span className="px-4 py-2 rounded-lg bg-black/75 border border-white/10 text-xs font-bold text-white flex items-center space-x-1.5 transform scale-95 group-hover/image:scale-100 transition-transform">
              <Eye className="h-4 w-4 text-cyan-400" />
              <span>Preview Certificate</span>
            </span>
          </div>
        </div>

        {/* Card Content details */}
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
            <div className="flex items-center space-x-1.5">
              <Building className="h-3.5 w-3.5 text-cyan-500/70" />
              <span>{certificate.organization}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{certificate.year}</span>
            </div>
          </div>

          <div>
            <Link
              to={`/certificates/${certificate.id}`}
              className="text-lg font-bold text-white tracking-tight group-hover:text-cyan-400 hover:underline transition-colors duration-250 block"
            >
              {certificate.title}
            </Link>
            {certificate.subtitle && (
              <p className="text-xs text-cyan-200/70 font-medium font-sans mt-0.5">
                {certificate.subtitle}
              </p>
            )}
          </div>

          {certificate.description && (
            <p className="text-xs text-gray-400 leading-relaxed font-sans pt-1">
              {certificate.description}
            </p>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-6 pt-0 flex gap-3 border-t border-white/5 mt-4">
        <button
          onClick={onPreview}
          className="flex-1 inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white text-black hover:bg-gray-150 text-xs font-bold transition-all cursor-pointer"
        >
          <Eye className="h-4 w-4" />
          <span>Preview Certificate</span>
        </button>

        <a
          href={certificate.pdf}
          target="_blank"
          rel="noreferrer"
          className="flex-1 inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-bold transition-all cursor-pointer"
        >
          <FileDown className="h-4 w-4 text-gray-400" />
          <span>Download PDF</span>
        </a>
      </div>
    </motion.div>
  );
}

// --------------------------------------------------
// VIEW: CERTIFICATE DETAILS
// --------------------------------------------------
interface CertificateDetailViewProps {
  certificate: Certificate;
  onPreview: () => void;
}

function CertificateDetailView({ certificate, onPreview }: CertificateDetailViewProps) {
  return (
    <div className="py-8 space-y-10 text-left relative z-10">
      
      {/* Back button */}
      <div>
        <Link
          to="/certificates"
          className="inline-flex items-center space-x-2 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer border border-white/5 bg-white/[0.02] px-3.5 py-1.5 rounded-lg font-bold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Certificates</span>
        </Link>
      </div>

      {/* Main Certificate Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Landscape certificate preview */}
        <div className="lg:col-span-7 space-y-3">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold block">
            Certificate Preview (Click to Zoom)
          </span>
          <div 
            onClick={onPreview}
            className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden aspect-[1.414] shadow-2xl relative group cursor-zoom-in"
          >
            <img 
              src={certificate.image} 
              alt={certificate.title} 
              className="w-full h-full object-contain group-hover:scale-[1.01] transition-transform duration-300"
            />
            {/* Hover preview text */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
              <span className="px-4 py-2 rounded-lg bg-black/75 border border-white/10 text-xs font-bold text-white flex items-center space-x-1.5">
                <Eye className="h-4 w-4 text-cyan-400" />
                <span>Zoom & Preview Certificate</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Metadata */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Header titles */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold block">
              / Verified Achievement
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
              {certificate.title}
            </h2>
            {certificate.subtitle && (
              <p className="text-sm text-cyan-200/70 font-medium font-sans">
                {certificate.subtitle}
              </p>
            )}
          </div>

          {/* Quick info card */}
          <div className="p-5 rounded-2xl bg-white/[0.012] border border-white/5 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <span className="text-[9px] font-mono text-gray-500 uppercase font-bold block">Organization</span>
                <span className="text-gray-250 font-medium">{certificate.organization}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-gray-500 uppercase font-bold block">Date Issued</span>
                <span className="text-gray-250 font-medium">{certificate.year}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-gray-500 uppercase font-bold block">Status</span>
                <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                  <ShieldCheck className="h-3 w-3 inline" />
                  <span>Verified Plaque</span>
                </span>
              </div>
            </div>

            {certificate.credentialId && (
              <div className="pt-3 border-t border-white/5 text-xs">
                <span className="text-[9px] font-mono text-gray-500 uppercase font-bold block">Credential ID</span>
                <code className="text-gray-300 font-mono tracking-tight bg-white/5 px-2 py-0.5 rounded text-[11px] block mt-1 w-fit">
                  {certificate.credentialId}
                </code>
              </div>
            )}
          </div>

          {/* Description */}
          {certificate.description && (
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest font-bold block">
                Description
              </span>
              <p className="text-xs sm:text-sm text-gray-350 leading-relaxed font-sans">
                {certificate.description}
              </p>
            </div>
          )}

          {/* Skills Demonstrated */}
          {certificate.skillsDemonstrated && (
            <div className="space-y-2">
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest font-bold block">
                Skills Demonstrated
              </span>
              <div className="flex flex-wrap gap-1.5">
                {certificate.skillsDemonstrated.map((skill: string) => (
                  <span 
                    key={skill} 
                    className="px-2 py-1 rounded bg-white/[0.02] border border-white/5 text-[10px] text-gray-300 font-mono"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dedicated Actions */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onPreview}
                className="flex-1 inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-white text-black hover:bg-gray-150 font-bold text-xs transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <span>View Full Certificate</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>

              <a
                href={certificate.pdf}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-350 border border-white/10 font-bold text-xs transition-all cursor-pointer"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span>Download PDF</span>
              </a>
            </div>
            
            {certificate.verificationUrl && (
              <div className="text-center pt-2">
                <a 
                  href={certificate.verificationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-[10px] text-gray-500 hover:text-cyan-400 font-mono transition-colors"
                >
                  <span>Verify Credential Authenticity</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

// --------------------------------------------------
// COMPONENT: LIGHTBOX PREVIEW
// --------------------------------------------------
interface CertificateLightboxProps {
  certificate: Certificate;
  onClose: () => void;
}

export function CertificateLightbox({ certificate, onClose }: CertificateLightboxProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Escape listener to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Center scroll positioning when zooming
  useEffect(() => {
    if (isZoomed && scrollRef.current) {
      const scrollEl = scrollRef.current;
      scrollEl.scrollLeft = (scrollEl.scrollWidth - scrollEl.clientWidth) / 2;
      scrollEl.scrollTop = (scrollEl.scrollHeight - scrollEl.clientHeight) / 2;
    }
  }, [isZoomed]);

  const toggleZoom = () => setIsZoomed(!isZoomed);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-between p-4 md:p-6"
    >
      {/* Lightbox Top Bar */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="text-left">
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-none">
            {certificate.title}
          </h3>
          <span className="text-[10px] font-mono text-gray-500 mt-1 block">
            {certificate.organization} // {certificate.year}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Zoom Control Button */}
          <button
            onClick={toggleZoom}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
            title={isZoomed ? "Zoom Out" : "Zoom In"}
          >
            {isZoomed ? <ZoomOut className="h-4.5 w-4.5" /> : <ZoomIn className="h-4.5 w-4.5" />}
          </button>

          {/* Close Lightbox */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="Close Preview (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage (Panning Scrolling Container when zoomed) */}
      <div 
        ref={scrollRef}
        className={`flex-1 flex items-center justify-center my-4 overflow-auto rounded-lg select-none relative ${
          isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
        }`}
        onClick={toggleZoom}
      >
        <motion.div
          animate={{ scale: isZoomed ? 1.6 : 1 }}
          transition={{ type: "spring", stiffness: 250, damping: 25 }}
          className="relative max-w-full max-h-[75vh]"
          style={{ transformOrigin: "center center" }}
        >
          <img 
            src={certificate.image} 
            alt={certificate.title} 
            className="max-w-full max-h-[72vh] object-contain rounded-lg border border-white/10 shadow-2xl"
            draggable="false"
          />
        </motion.div>
      </div>

      {/* Lightbox Actions Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-3">
        <span className="text-[10px] font-mono text-gray-500 hidden sm:inline select-none">
          {isZoomed ? "DRAG / PAN OR CLICK TO ZOOM OUT" : "CLICK IMAGE TO ZOOM IN // PRESS ESC TO CLOSE"}
        </span>

        <div className="flex gap-3 w-full sm:w-auto">
          <a
            href={certificate.pdf}
            target="_blank"
            rel="noreferrer"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-white text-black hover:bg-gray-150 text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
          >
            <FileDown className="h-4 w-4" />
            <span>Download Original PDF</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
