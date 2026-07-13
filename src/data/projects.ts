import { Project } from "../types";

export const PROJECTS: Project[] = [
  {
    id: "eve",
    title: "EVE",
    tagline: "Flagship AI Business Operating System",
    category: "AI & Backend Systems",
    status: "Completed & Deployed",
    period: "2026",
    importanceLevel: "flagship",
    description: "EVE is an AI-powered business operating system that helps founders monitor, analyze, and optimize business performance through a unified executive command center.",
    problem: [
      "Small business founders operate in fragmented silos, jumping between distinct platforms for sales, inventory tracking, financial analytics, and client management. This lack of automated data aggregation results in delayed decision-making, unpredicted stockouts, and poor real-time financial visibility."
    ],
    motivation: "To build a single, unified executive command center that acts as an autonomous digital COO. By feeding raw transactional, inventory, and supply chain data into a central context engine, founders can interact with their business in plain natural language, anticipate inventory bottlenecks, and receive proactive, automated recommendations.",
    solution: "EVE implements a real-time ingestion and analytics engine that aggregates multi-channel data. An LLM-powered COO Assistant processes human-language commands to run analytical queries, while predictive inventory models forecast supply disruptions and automate threshold alerts. The interface is presented via a high-performance, dark-mode dashboard.",
    keyCapabilities: [
      "Conversational AI COO Assistant using context-window injection for live querying",
      "Real-time Business Health Monitoring and executive summaries",
      "Predictive Stockout forecasting based on sales velocity and supplier lead times",
      "Multi-tenant Workspace Isolation with strict database access rules",
      "Automated Supplier Reorder Recommendation engine"
    ],
    engineeringHighlights: [
      "Multi-tenant SaaS Architecture with robust row-level security policies.",
      "AI-powered business intelligence translating natural language queries to structured parameters.",
      "Executive dashboard rendering real-time business health indices and analytics.",
      "Inventory intelligence engine utilizing sales velocity algorithms to forecast stock depletion.",
      "Serverless event routing built on Google Cloud Run to process incoming webhooks with low latency."
    ],
    techStackBreakdown: [
      {
        category: "Frontend",
        technologies: ["Next.js 15", "React 19", "Tailwind CSS", "Framer Motion"]
      },
      {
        category: "Backend",
        technologies: ["FastAPI", "Python", "Uvicorn"]
      },
      {
        category: "Database",
        technologies: ["PostgreSQL", "Supabase", "Row-Level Security (RLS)"]
      },
      {
        category: "AI Layer",
        technologies: ["Google Gemini API", "Structured Outputs", "Context Injection"]
      },
      {
        category: "Infrastructure",
        technologies: ["Google Cloud Run", "Vercel", "Docker"]
      }
    ],
    technicalChallenges: [
      {
        title: "Multi-Tenant Data Isolation",
        problem: "Designing a database where different business clients share the same physical database instances but must remain strictly isolated, with absolute guarantees that Client A can never access or accidentally read Client B's data.",
        solution: "Leveraged Supabase's native PostgreSQL Row-Level Security (RLS) policies. Created tenant-specific organization IDs and dynamically verified users' JWT tokens on every database request, validating the tenant identity at the SQL layer before returning any row."
      },
      {
        title: "Context Optimization for AI COO",
        problem: "Feeding large datasets directly to the Gemini API was expensive, slow, and risked hallucination or reaching context window limits during busy queries.",
        solution: "Implemented a structured semantic router. Instead of dumping raw data into the LLM, the model is used as a compiler to map natural language to specific data parameters or parameterized SQL templates. The backend executes the query locally and injects only the relevant tabular result back into the model for final natural language synthesis."
      }
    ],
    results: [
      "Aggregated data across 3 core operational modules (AI COO, Inventory, Financials) in a single platform.",
      "Orchestrated 2 independent AI agents managing query analysis and alert generation.",
      "Reduced manual inventory forecasting time from hours to instantaneous dashboard indicators.",
      "Achieved sub-100ms response times for core API transactional queries."
    ],
    lessonsLearned: "Building EVE highlighted the necessity of shifting complex security logic to the database layer via row-level security and indexing, and proved that using LLMs as structured action-compilers is far more robust than letting them read and reason over large raw text outputs.",
    screenshots: ["/assets/eve_landing.png"],
    // Backwards compatibility fields for Resume/Header
    techStack: ["Next.js 15", "FastAPI", "PostgreSQL", "Google Gemini AI", "Cloud Run"],
    githubLink: "https://github.com/devottamkumar1310-cpu",
    liveLink: "https://www.eveinventory.in",
    vision: "To build a unified executive command center that acts as an intelligent COO, providing real-time forecasting and conversational queries."
  },
  {
    id: "friday",
    title: "FRIDAY",
    tagline: "AI-Powered Personalized Learning Platform",
    category: "AI Learning Intelligence",
    status: "Currently Building",
    period: "2026 - Present",
    importanceLevel: "major",
    description: "FRIDAY is an AI-powered learning intelligence platform designed to help students discover teachers, learning resources, and study strategies tailored to their unique learning styles and behavior.",
    problem: [
      "Traditional educational platforms offer rigid, one-size-fits-all curricula that ignore individual student learning behaviors, pacing, and cognitive styles. This mismatch leads to poor student engagement, high dropout rates in online courses, and difficulty in connecting students with educators who match their learning styles."
    ],
    motivation: "To build a dynamic educational matching engine that treats learning as a multi-dimensional system. By evaluating student interaction patterns, assessment metrics, and preferred modalities (visual, auditory, kinesthetic), FRIDAY aims to match students with the ideal teachers and curate custom study pathways that evolve with the student's progress.",
    solution: "FRIDAY combines cognitive profiling questionnaires with backend recommendation algorithms to map learning profiles. It offers student-teacher matching, personalized study plan curation, and an AI study guide that breaks down complex textbooks into progressive learning tasks based on the student's cognitive speed.",
    keyCapabilities: [
      "Cognitive Learning Style Assessment tracking visual, auditory, and kinesthetic profiles",
      "Student-Teacher Compatibility Matching using multi-dimensional cosine similarity",
      "Custom Dynamic Syllabus Pathways that adapt to student completion rates",
      "Personalized Resource Curation suggesting articles and videos based on comprehension scores",
      "AI Study Guidance chat agent for interactive textbook breakdown"
    ],
    engineeringHighlights: [
      "Proprietary Matching Engine scoring student-teacher compatibility based on teaching style and student cognitive needs.",
      "Learning behavior analysis tracking user drop-offs and engagement to adapt content difficulty.",
      "Recommendation system filtering learning resources and video materials matching the student's current learning speed."
    ],
    techStackBreakdown: [
      {
        category: "Frontend",
        technologies: ["Next.js 15", "React 19", "Tailwind CSS", "Lucide Icons"]
      },
      {
        category: "Backend",
        technologies: ["FastAPI", "Python", "Pydantic"]
      },
      {
        category: "Database",
        technologies: ["PostgreSQL", "SQLAlchemy", "Relational Schema Design"]
      },
      {
        category: "AI Layer",
        technologies: ["Google Gemini API", "Structured Prompts", "Embeddings"]
      }
    ],
    technicalChallenges: [
      {
        title: "Multi-Dimensional Recommendation Matching",
        problem: "Students have diverse, multi-faceted learning profiles. A standard content-based filtering model was too simple, while collaborative filtering was ineffective due to cold-start problems for new students and teachers.",
        solution: "Created a hybrid heuristic matching algorithm. The engine first classifies students and teachers into multidimensional vectors (pace, detail level, feedback frequency, modality). It computes a cosine similarity score to generate baseline compatibility rankings, which then adapt as real-time feedback loops record student satisfaction and performance."
      }
    ],
    results: [
      "Structured a profile framework tracking 5 distinct cognitive learning dimensions.",
      "Designed a recommendation database serving custom-tailored resource links.",
      "Created an interactive mockup dashboard for real-time student-teacher tracking."
    ],
    lessonsLearned: "Developing FRIDAY reinforced that recommendation systems are only as good as the structured input parameters. Gathering high-quality initial data through short, gamified cognitive exercises yields far better personalization than attempting to infer styles purely from unstructured web clicks.",
    // Backwards compatibility fields for Resume/Header
    techStack: ["Next.js 15", "FastAPI", "PostgreSQL", "Python", "Tailwind CSS"],
    githubLink: "https://github.com/devottamkumar1310-cpu",
    vision: "To build a personalized learning system tracking cognitive learning styles and matching students with educators.",
    currentProgress: "Focusing on the Matching Engine, Assessment Framework, Recommendation System, Analytics Dashboard, and Educational Intelligence Layer."
  },
  {
    id: "nasa-space-apps",
    title: "NASA Space Apps Challenge",
    tagline: "Collaborative Hackathon Project & Engineering Experience",
    category: "Hackathon Achievement",
    status: "Completed",
    period: "Oct 2025",
    importanceLevel: "condensed",
    description: "An interactive solution for a real-world space challenge built in a fast-paced hackathon environment by a four-member team.",
    problem: [
      "Space agency datasets are often highly complex, massive, and presented in dry raw formats (like JSON or CSV). This makes it difficult for the public, students, and non-specialist researchers to easily visualize, understand, and explore astronomical patterns and environmental metrics."
    ],
    motivation: "Participated in the globally recognized NASA Space Apps Challenge. Our goal was to translate massive, dry satellite/space sensor readouts into an engaging, clean, and interactive visualization dashboard, making orbital trajectories or environmental telemetry intuitive and visually striking.",
    solution: "Collaborated in a four-member team to construct a web-based interactive data portal. We designed a clean dark-themed dashboard that processes raw telemetry data and displays it on interactive spatial grids, supported by clear typography, micro-interactions, and visual representations of celestial coordinates.",
    keyCapabilities: [
      "Raw Space Telemetry Parsing on the client side",
      "Interactive Spatial Data Visualization grids",
      "High-Performance Clean CSS Graphics and layouts",
      "Responsive Cross-Browser Interface and lightweight components"
    ],
    engineeringHighlights: [
      "Rapid prototyping and deployment under a strict 48-hour deadline.",
      "Translating complex space coordinates into canvas-based 2D/3D screen coordinates.",
      "Coordinating version control workflows and task delegation in a fast-paced team environment."
    ],
    techStackBreakdown: [
      {
        category: "Frontend",
        technologies: ["HTML5", "CSS3 (Vanilla)", "JavaScript (ES6+)"]
      },
      {
        category: "Collaboration",
        technologies: ["Git", "GitHub", "Excalidraw"]
      }
    ],
    technicalChallenges: [
      {
        title: "Rapid Multi-Source Data Parsing",
        problem: "During the hackathon, we received diverse data feeds in varying, unaligned formats (some CSV, some nested JSON). We had to parse, clean, and map this data to coordinate grids in real-time on the client side without a dedicated backend.",
        solution: "Wrote lightweight JavaScript parsing utilities that standardized the coordinate keys, applied client-side caching to prevent redundant parsing, and dynamically populated the UI grid on demand, ensuring 60fps scrolling."
      }
    ],
    results: [
      "Delivered a fully functional interactive demo within the 48-hour hackathon limit.",
      "Parsed and mapped complex telemetry data points onto a visual dashboard interface.",
      "Coordinated frontend implementation across 4 team members with zero Git conflicts."
    ],
    lessonsLearned: "The NASA challenge was an intense lesson in scoping: when building under extreme time pressure, choosing standard, reliable, zero-overhead vanilla web technologies (HTML/CSS/JS) is often faster and less error-prone than wasting hours debugging framework configuration issues.",
    // Backwards compatibility fields for Resume/Header
    techStack: ["HTML", "CSS", "JavaScript"],
    githubLink: "https://github.com/devottamkumar1310-cpu",
    responsibilities: [
      "Frontend implementation of the user interface using clean web structures",
      "Testing key interactive components for responsive stability",
      "Debugging client-side code and improving cross-browser compatibility",
      "Supporting technical presentation formulation for evaluation panels"
    ]
  }
];
