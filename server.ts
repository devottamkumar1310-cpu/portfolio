import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini safely and lazily
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in environment variables. Falling back to local offline simulation.");
    }
    ai = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// Personal AI Portfolio Assistant endpoint
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  
  if (!message) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  const systemInstruction = 
    "You are the AI Portfolio Assistant representing Devottam Kumar, a Computer Science & Data Analytics student " +
    "at the prestigious Indian Institute of Technology (IIT), Patna. " +
    "Help recruiters, software engineering managers, founders, and academic members understand Devottam's background, " +
    "technical skills (Python, TypeScript, SQL, Node.js, Express, PostgreSQL), and independent projects.\n\n" +
    "Devottam's flagship major project is EVE — an intelligent operations partner and COO Platform designed " +
    "to help small business owners delegate and automate complex, multi-channel business processes using AI and structured database backends.\n\n" +
    "Adhere to these rules:\n" +
    "1. Speak with professional composure, clarity, and helpfulness, typical of an engineering lead. Keep responses structured, content-driven, and highly credible.\n" +
    "2. DO NOT make unrealistic claims or fabricate credentials. Devottam is a talented undergrad, not an industry veteran. Frame his strength as high-potential student builder with solid database, algorithms, and backend foundations.\n" +
    "3. Keep responses relatively concise and formatted in clean Markdown.\n" +
    "4. Point out his direct email coordinates (devottamkumar7@gmail.com) if asked about contact channels.";

  // If no real API key is present, return an intelligent simulation
  if (!process.env.GEMINI_API_KEY) {
    const offlineResponses = [
      "I am running in local offline mode. Here is an index of **Devottam Kumar's** structural engineering path:\n" +
      "- **IIT Patna Student**: Studying Computer Science & Data Analytics.\n" +
      "- **EVE COO Platform**: An AI Operations Partner built to structure and execute multi-step workflows for small businesses.\n" +
      "- **Backends & Databases**: Proficient in Node.js, Express, Python, PostgreSQL, MySQL, and relational schema optimization.\n\n" +
      "What details can I compile for you?",
      
      "I have loaded Devottam's project specifications:\n\n" +
      "1. **EVE — AI COO Platform**: Streamlines business communications and tasks using semantic task matching.\n" +
      "2. **Portfolio Platform**: A high-contrast, Vercel-inspired data-driven showcase utilizing TypeScript and modular components.\n\n" +
      "Feel free to check out the *Projects Details Pages* to view further specifics on problems, solutions, and takeaways."
    ];
    
    let responseText = offlineResponses[0];
    const msgLower = message.toLowerCase();
    if (msgLower.includes("skills") || msgLower.includes("resume") || msgLower.includes("tech") || msgLower.includes("languages")) {
      responseText = "Devottam Kumar specializes in the following core subject areas:\n\n" +
        "- **Programming**: Python, TypeScript, SQL, JavaScript.\n" +
        "- **Backend Web/API**: Node.js, Express.js, Django, REST API design.\n" +
        "- **Database Operations**: MySQL, PostgreSQL, Relational Database Modeling, and queries.\n" +
        "- **Computer Science Core**: OOP algorithms, data structures, and systematic problem solving.";
    } else if (msgLower.includes("project") || msgLower.includes("eve") || msgLower.includes("coo")) {
      responseText = offlineResponses[1];
    } else if (msgLower.includes("education") || msgLower.includes("college") || msgLower.includes("iit") || msgLower.includes("patna")) {
      responseText = "Devottam is a CS & Data Analytics undergrad at **IIT Patna (Indian Institute of Technology, Patna)**. He couples theoretical data science and math foundations with rigorous real-world building practices.";
    } else if (msgLower.includes("hire") || msgLower.includes("job") || msgLower.includes("contact") || msgLower.includes("email")) {
      responseText = "You can contact Devottam Kumar directly at his dispatch coordinates:\n\n" +
        "- **Email**: `devottamkumar7@gmail.com`\n" +
        "- **LinkedIn**: [devottamkumar](https://linkedin.com/in/devottamkumar)\n" +
        "- **GitHub**: [devottamkumar](https://github.com/devottamkumar)\n\n" +
        "You can also use the inline contact form on the home view!";
    }
    
    setTimeout(() => {
      res.json({ text: responseText });
    }, 400);
    return;
  }

  try {
    const client = getGeminiClient();
    
    // Construct rich contents list from client chat history
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.slice(-10).forEach((item: any) => {
        contents.push({
          role: item.role === "user" ? "user" : "model",
          parts: [{ text: item.text }],
        });
      });
    }
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.8,
        topP: 0.9,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API error in server.ts:", error);
    res.status(500).json({ error: "Failed to communicate with agentic core", details: error.message });
  }
});

// Rate limiting and duplicate prevention state
const submissionIpCache = new Map<string, number>();
const RATE_LIMIT_COOLDOWN = 45 * 1000; // 45 seconds cooldown

// Auto reply feature flag
const AUTO_REPLY_ENABLED = process.env.AUTO_REPLY_ENABLED === "true";

app.post("/api/contact", async (req, res) => {
  const { name, email, company, message } = req.body;

  // 1. IP rate limiting
  const ip = (req.ip || req.headers["x-forwarded-for"] || "unknown").toString();
  const now = Date.now();
  if (submissionIpCache.has(ip)) {
    const lastTime = submissionIpCache.get(ip)!;
    if (now - lastTime < RATE_LIMIT_COOLDOWN) {
      res.status(429).json({ error: "Too many requests. Please wait a moment before sending another message." });
      return;
    }
  }

  // 2. Validate required fields
  if (!name || !email || !message) {
    res.status(400).json({ error: "Missing required fields: Name, Email, and Message are required." });
    return;
  }

  // 3. Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Invalid email format." });
    return;
  }

  // 4. Sanitize inputs to prevent basic scripting injections
  const sanitize = (val: string) => {
    if (!val) return "";
    return val.replace(/<[^>]*>/g, "").trim();
  };

  const cleanName = sanitize(name);
  const cleanEmail = sanitize(email);
  const cleanCompany = sanitize(company || "");
  const cleanMessage = sanitize(message);

  // 5. Verify Resend SDK readiness
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Resend Warning] RESEND_API_KEY is not defined in the environment. Submission logged below but outbound email failed.");
    console.log(`[Offline Submission Record]\nName: ${cleanName}\nEmail: ${cleanEmail}\nCompany: ${cleanCompany}\nMessage: ${cleanMessage}`);
    res.status(503).json({ error: "Outbound email service is not configured on this host." });
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const destinationEmail = process.env.CONTACT_EMAIL || "devottamkumar7@gmail.com";

    // 6. Send Notification Email
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || "contact@devottamkumar.in",
      to: destinationEmail,
      subject: "New Portfolio Contact Submission",
      text: `----------------------------------\nName: ${cleanName}\nEmail: ${cleanEmail}\nCompany: ${cleanCompany || "N/A"}\nTime: ${new Date().toISOString()}\n\nMessage:\n${cleanMessage}\n----------------------------------`,
    });

    if (response.error) {
      console.error("[Resend Error Response]:", response.error);
      res.status(500).json({ error: "Failed to dispatch email via Resend.", details: response.error.message });
      return;
    }

    // Update rate limit cache on success
    submissionIpCache.set(ip, now);

    // 7. Auto Reply Subsystem (Disabled behind feature flag)
    if (AUTO_REPLY_ENABLED) {
      // Auto-reply configuration prepared for future domain activation
      console.log(`[Auto-Reply Subsystem] Triggered for user ${cleanEmail}. Feature flag is active.`);
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "contact@devottamkumar.in",
          to: cleanEmail,
          subject: "Thank you for reaching out!",
          text: `Hi ${cleanName},\n\nThank you for getting in touch. I have received your message and will review it shortly.\n\nBest regards,\nDevottam Kumar`,
        });
      } catch (autoErr) {
        console.error("Auto-reply delivery failed:", autoErr);
      }
    }

    res.json({ success: true, message: "Message dispatched successfully." });
  } catch (error: any) {
    console.error("Failed to send email via Resend:", error);
    res.status(500).json({ error: "Internal server error while processing transmission.", details: error.message });
  }
});

// Configure Vite middleware or static assets serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[EVE OS SERVER] Core running at http://0.0.0.0:${PORT}`);
  });
}

setupServer();
