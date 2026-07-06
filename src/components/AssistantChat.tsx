import { useState, useEffect, useRef, FormEvent } from "react";
import { X, Send, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { BIO_SUMMARY } from "../data";

interface AssistantChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AssistantChat({ isOpen, onClose }: AssistantChatProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<{ role: "model" | "user" | "system"; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize greeting on load
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "system",
          text: `Devottam's Digital Liaison Core Active`
        },
        {
          role: "model",
          text: `Hi there! I am **Devottam's AI Portfolio Assistant**.\n\nI can answer questions about Devottam's background, academic path at **IIT Patna**, his featured **EVE operations platform** project, or his detailed skills.\n\nFeel free to ask me anything or click one of the suggested prompts below.`
        }
      ]);
    }
  }, [messages]);

  // Keep chat scrolled down
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMsg = textToSend.trim();
    setInputMessage("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setIsTyping(true);

    try {
      // Reconstruct simple chat history for context
      const chatHistory = messages
        .filter(m => m.role !== "system")
        .map(m => ({
          role: m.role === "user" ? ("user" as const) : ("model" as const),
          text: m.text
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history: chatHistory })
      });

      if (!res.ok) {
        throw new Error("Transceiver link error");
      }

      const data = await res.json();
      setMessages(prev => [...prev, { role: "model", text: data.text }]);
    } catch (err) {
      console.warn("Liaison communication link offline. Invoking smart local prompt matcher...");
      
      // Fine-tuned smart local agent responses
      let replyStr = `I am running in local backup mode. Let me report general specs on Devottam:\n\n- **IIT Patna Undergrad**: Studying Computer Science & Data Analytics.\n- **Featured Project**: EVE — an intelligent operations partner solving rigid automation for small businesses.\n- **Core Stack**: Node.js/Express, Python, PostgreSQL, React, and robust API workflows.`;
      
      const lower = userMsg.toLowerCase();
      if (lower.includes("eve") || lower.includes("coo") || lower.includes("project")) {
        replyStr = `**[Local Spec Match - EVE Platform]**:\n\n**EVE** is Devottam's major flagship project. It is an intelligent Operations CEO/COO partner for small business owners. Unlike standard Zapier triggers, it interprets raw natural language instructions, maintains asynchronous state consistency across complex steps, and handles custom tools securely. See the *Projects Page* for complete details!`;
      } else if (lower.includes("skills") || lower.includes("stack") || lower.includes("tech") || lower.includes("languages")) {
        replyStr = `**[Local Spec Match - Capabilities]**:\n\nDevottam Kumar works with a rigorous technical stack:\n- **Programming**: Python, TypeScript, SQL, JavaScript.\n- **Backend**: Express, Node.js, REST APIs, and safe server configurations.\n- **Databases**: PostgreSQL, MySQL, and optimal relational modeling.\n- **Frontend**: React, Next.js, and clean Tailwind styling layouts.`;
      } else if (lower.includes("education") || lower.includes("college") || lower.includes("iit") || lower.includes("patna")) {
        replyStr = `**[Local Spec Match - Education]**:\n\nDevottam Kumar is currently pursuing his degree in **Computer Science & Data Analytics** at the prestigious **Indian Institute of Technology (IIT), Patna**. He combines algorithmic problem-solving with a highly practical systems development approach.`;
      } else if (lower.includes("hire") || lower.includes("job") || lower.includes("contact") || lower.includes("email")) {
        replyStr = `Interested in hiring Devottam Kumar for internship or engineering collaboration? Excellent! Devottam is actively looking for high-caliber Summer 2026 roles.\n\n- **Direct Email Coordinates**: devottamkumar1310@gmail.com\n- You can also trigger the *Interactive Handshake Form* on the landing page!`;
      }

      setMessages(prev => [...prev, { role: "model", text: replyStr }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] z-[100] bg-[#0c0c0c] border-l border-white/5 shadow-2xl flex flex-col justify-between selection:bg-cyan-500/20">
      
      {/* Header sheet bar */}
      <div className="p-4 bg-white/[0.015] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-cyan-950/20 border border-cyan-500/25">
            <Sparkles className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-tight block">AI Portfolio Companion</h3>
            <span className="text-[9.5px] font-mono text-gray-500">POWERED BY GEMINI 3.5 FLASH</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors border border-white/5 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages stream */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 text-xs font-sans">
        {messages.map((m, idx) => {
          if (m.role === "system") {
            return (
              <div key={idx} className="flex justify-center">
                <span className="px-2.5 py-0.5 rounded bg-white/[0.02] border border-white/5 text-[9px] font-mono font-semibold text-gray-500">
                  {m.text}
                </span>
              </div>
            );
          }

          const isUser = m.role === "user";
          return (
            <div 
              key={idx} 
              className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-2.5`}
            >
              {!isUser && (
                <div className="h-6 w-6 rounded-full bg-cyan-950/30 border border-cyan-500/10 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-mono text-cyan-400">
                  L
                </div>
              )}
              
              <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                isUser 
                  ? "bg-white/5 text-white border border-white/5 rounded-tr-none text-left" 
                  : "bg-white/[0.01] text-gray-300 border border-white/5 rounded-tl-none text-left"
              }`}>
                {/* Simulated rendering helper */}
                {m.text.split("\n\n").map((chunk, chunkIdx) => (
                  <p key={chunkIdx} className={`${chunkIdx > 0 ? "mt-2" : ""}`}>
                    {chunk.startsWith("- ") ? (
                      <span className="block pl-2 mt-1">
                        {chunk.split("\n").map((li, liIdx) => (
                          <span key={liIdx} className="block">{li}</span>
                        ))}
                      </span>
                    ) : chunk.startsWith("1. ") || chunk.startsWith("**") ? (
                      <span className="block">{chunk}</span>
                    ) : (
                      chunk
                    )}
                  </p>
                ))}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start items-start gap-2.5">
            <div className="h-6 w-6 rounded-full bg-cyan-950/30 border border-cyan-500/10 flex items-center justify-center shrink-0 mt-0.5 text-cyan-400 animate-pulse">
              ···
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.01] text-gray-500 border border-white/5 rounded-tl-none">
              <RefreshCw className="h-3 w-3 animate-spin text-gray-650" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts & chat inputs */}
      <div className="p-4 border-t border-white/5 space-y-3.5 bg-black/40">
        
        {/* Chips */}
        <div className="flex flex-wrap gap-1 text-[10px] items-center">
          <span className="text-gray-550 font-mono text-[9px] mr-1 block">QUICK PARAMS:</span>
          {[
            "Who is Devottam?",
            "What is EVE?",
            "View Skills",
            "Are they looking for placement?"
          ].map((promptText, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(promptText)}
              className="px-2 py-1 rounded bg-white/[0.02] hover:bg-white/5 text-gray-400 hover:text-white border border-white/5 transition-colors text-left cursor-pointer font-mono"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputMessage); }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Query credentials or project spec..."
            className="flex-grow bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-white text-black hover:bg-gray-100 transition-all cursor-pointer shrink-0"
            title="Transmit message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

      </div>

    </div>
  );
}
