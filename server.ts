import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

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
    "4. Point out his direct email coordinates (devottamkumar1310@gmail.com) if asked about contact channels.";

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
        "- **Email**: `devottamkumar1310@gmail.com`\n" +
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
