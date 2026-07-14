import { useState, FormEvent } from "react";
import { Mail, Github, Linkedin, Send, CheckCircle2, Loader2 } from "lucide-react";
import { BIO_SUMMARY } from "../data";
import { motion } from "motion/react";

export default function Contact() {
  const [formState, setFormState] = useState({ name: "", company: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;

    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormState({ name: "", company: "", email: "", message: "" });
    }, 1200);
  };

  return (
    <section id="contact" className="py-12 border-t border-white/5 print:hidden text-left">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header headings */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-2"
        >
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">/ Communication</span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Get In Touch
          </h2>
          <p className="text-xs text-gray-400 max-w-xl font-sans leading-relaxed">
            I am always open to discussing backend engineering opportunities, academic projects, or internships.
          </p>
        </motion.div>

        {/* Contact Grid blocks */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Direct channels left block */}
          <motion.div 
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-5 p-6 rounded-[24px] liquid-glass-card card-contact flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white font-sans text-left">Direct Channels</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-sans text-left">
                Feel free to email me directly or connect with me via LinkedIn and GitHub. I look forward to hearing from you.
              </p>
              
              {/* Linked items */}
              <div className="space-y-2 text-left">
                
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/[0.01] border border-white/5 text-xs liquid-glass-contact-item">
                  <Mail className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-[9px] font-mono text-gray-500 uppercase block font-bold leading-normal">Email Address</span>
                    <a href={`mailto:${BIO_SUMMARY.email}`} className="text-gray-300 hover:text-cyan-400 transition-colors truncate block">{BIO_SUMMARY.email}</a>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/[0.01] border border-white/5 text-xs liquid-glass-contact-item">
                  <Github className="h-4.5 w-4.5 text-violet-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-[9px] font-mono text-gray-500 uppercase block font-bold leading-normal">GitHub Profile</span>
                    <a href={BIO_SUMMARY.github} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-400 transition-colors truncate block">
                      {BIO_SUMMARY.github.replace("https://", "")}
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/[0.01] border border-white/5 text-xs liquid-glass-contact-item">
                  <Linkedin className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-[9px] font-mono text-gray-500 uppercase block font-bold leading-normal">LinkedIn Network</span>
                    <a href={BIO_SUMMARY.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-cyan-400 transition-colors truncate block">
                      {BIO_SUMMARY.linkedin.replace("https://", "").replace("www.", "")}
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          {/* Form right block */}
          <motion.div 
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-7 p-6 rounded-[24px] liquid-glass-card card-contact flex flex-col justify-center"
          >
            {isSubmitted ? (
               <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                <div className="h-10 w-10 rounded-full bg-emerald-950/20 border border-emerald-500/15 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold text-white">Message Sent</h3>
                  <p className="text-xs text-gray-400 max-w-sm leading-relaxed font-sans mx-auto">
                    Thank you for reaching out! I have received your message and will respond as soon as possible.
                  </p>
                </div>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-4 py-2 liquid-glass-btn rounded-xl text-xs font-semibold text-cyan-400 cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left font-sans">
                    <label className="text-[9.5px] font-mono text-gray-500 uppercase block font-bold">Your Name*</label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder="Rachel Green"
                      className="w-full bg-[#020308] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-gray-205 placeholder-zinc-700 focus:outline-none focus:border-cyan-500/80 focus:shadow-[0_0_15px_-3px_rgba(6,182,212,0.35)] focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300"
                    />
                  </div>
                  
                  <div className="space-y-1.5 text-left font-sans">
                    <label className="text-[9.5px] font-mono text-gray-500 uppercase block font-bold">Company / Organization</label>
                    <input
                      type="text"
                      value={formState.company}
                      onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                      placeholder="e.g. Acme Corp"
                      className="w-full bg-[#020308] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-gray-205 placeholder-zinc-700 focus:outline-none focus:border-cyan-500/80 focus:shadow-[0_0_15px_-3px_rgba(6,182,212,0.35)] focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left font-sans">
                  <label className="text-[9.5px] font-mono text-gray-500 uppercase block font-bold">Your Email Address*</label>
                  <input
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    placeholder="rachel@company.com"
                    className="w-full bg-[#020308] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-gray-205 placeholder-zinc-700 focus:outline-none focus:border-cyan-500/80 focus:shadow-[0_0_15px_-3px_rgba(6,182,212,0.35)] focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300"
                  />
                </div>

                <div className="space-y-1.5 text-left font-sans">
                  <label className="text-[9.5px] font-mono text-gray-500 uppercase block font-bold">Message*</label>
                  <textarea
                    required
                    rows={4}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    placeholder="Describe your project, question, or opportunity..."
                    className="w-full bg-[#020308] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-gray-205 placeholder-zinc-700 focus:outline-none focus:border-cyan-500/80 focus:shadow-[0_0_15px_-3px_rgba(6,182,212,0.35)] focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300 h-28 leading-relaxed resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 liquid-glass-btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs tracking-wider rounded-xl flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0 text-white" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5 shrink-0 text-white" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>

              </form>
            )}
          </motion.div>
          
        </div>

      </div>
    </section>
  );
}
