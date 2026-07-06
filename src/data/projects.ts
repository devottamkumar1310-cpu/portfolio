import { Project } from "../types";

export const PROJECTS: Project[] = [
  {
    id: "eve",
    title: "EVE",
    tagline: "Flagship AI Business Operating System",
    category: "AI & Backend",
    status: "Completed & Deployed",
    period: "2026",
    importanceLevel: "flagship",
    description: "EVE is an AI-powered business operating system that helps founders monitor, analyze, and optimize business performance through a unified executive command center.",
    problem: [
      "Founders often rely on fragmented tools to manage inventory, analyze finances, and predict operational bottlenecks. This lack of centralized intelligence leads to delayed decision-making, unexpected stockouts, and poor financial visibility."
    ],
    visionArr: [
      "To build a unified executive command center that acts as an intelligent COO. EVE should ingest operational data in real-time, predict supply chain issues before they happen, and provide a conversational AI interface for founders to query their business."
    ],
    architecture: [
      "Multi-tenant SaaS Architecture with isolated workspaces.",
      "FastAPI server for high-performance data processing and AI routing.",
      "Supabase PostgreSQL for scalable relational modeling and row-level security.",
      "Next.js 15 App Router for the front-end executive dashboard."
    ],
    features: [
      "AI COO Assistant",
      "Business Health Monitoring",
      "Financial Analytics",
      "Operational Intelligence",
      "Inventory Intelligence",
      "Stockout Prediction",
      "Executive Summaries",
      "Multi-tenant SaaS Architecture"
    ],
    aiCooSystem: [
      "Integrated with Google Gemini to process complex business queries (e.g., 'What products are likely to stock out next week?').",
      "Maintains conversational memory context across sessions.",
      "Translates natural language into SQL/data aggregation commands to fetch live metrics."
    ],
    inventoryIntelligence: [
      "Predictive algorithms analyze sales velocity to forecast stockouts.",
      "Automated alerts generation for critical inventory thresholds.",
      "Supplier timeline integration to recommend optimal reorder dates."
    ],
    challenges: [
      "Designing a robust multi-tenant architecture with strict row-level security to ensure data isolation.",
      "Optimizing prompt engineering and context-window injection for the AI COO to provide accurate, non-hallucinated business advice.",
      "Building a real-time data synchronization pipeline between the database and the predictive analytics engine."
    ],
    deploymentArchitecture: [
      "Backend deployed on Google Cloud Run for auto-scaling serverless execution.",
      "Frontend hosted on Vercel utilizing Edge caching.",
      "Database managed on Supabase with automated daily backups."
    ],
    learnings: "Building EVE provided deep hands-on experience in productionizing LLMs, designing multi-tenant databases, and orchestrating full-stack deployments on GCP.",
    techStack: ["Next.js 15", "React", "Tailwind CSS", "FastAPI", "Python", "PostgreSQL (Supabase)", "Google Gemini AI", "Google Cloud Run", "Vercel"],
    githubLink: "https://github.com/devottamkumar1310-cpu",
    liveLink: "https://www.eveinventory.in"
  },
  {
    id: "friday",
    title: "FRIDAY",
    tagline: "AI-Powered Personalized Learning",
    category: "AI Learning Intelligence Platform",
    status: "Currently Building",
    period: "2026 - Present",
    importanceLevel: "major",
    description: "FRIDAY is an AI-powered learning intelligence platform designed to help students discover teachers, learning resources, and study strategies tailored to their unique learning styles and learning behavior.",
    detailedDescription: [
      "The platform combines assessment systems, recommendation engines, learning analytics, and AI-driven guidance to create personalized educational experiences.",
      "FRIDAY aims to solve the problem of one-size-fits-all education by evaluating student learning styles through structured assessments and using intelligent matching algorithms to recommend suitable teachers, study resources, and learning pathways."
    ],
    plannedFeatures: [
      "Learning style assessment",
      "Student-teacher matching",
      "Personalized resource recommendations",
      "Learning analytics",
      "Feedback-driven recommendation system",
      "AI study guidance",
      "Personalized learning pathways"
    ],
    currentProgress: "Focusing on the Matching Engine, Assessment Framework, Recommendation System, Analytics Dashboard, and Educational Intelligence Layer.",
    techHighlights: [
      "Matching Algorithm Design",
      "Recommendation Systems",
      "Assessment Analytics",
      "FastAPI Backend Architecture",
      "PostgreSQL Data Modeling",
      "Personalized Learning Engine"
    ],
    techStack: ["Next.js 15", "FastAPI", "PostgreSQL", "Python", "Tailwind CSS"],
    impact: "This project is helping deepen understanding of recommendation systems, educational technology, user behavior analysis, and AI-assisted personalization.",
    githubLink: "https://github.com/devottamkumar1310-cpu"
  },
  {
    id: "nasa-space-apps",
    title: "NASA Space Apps Challenge",
    tagline: "Collaborative Hackathon Project",
    category: "Hackathon",
    status: "Completed",
    period: "Oct 2025",
    importanceLevel: "condensed",
    description: "Interactive solution for a real-world space challenge built in a fast-paced hackathon environment.",
    detailedDescription: [
      "Collaborated in a four-member team to develop an interactive solution for a real-world space challenge under strict time constraints. The focus was on rapid prototyping, effective teamwork, and translating a conceptual solution into a working technical demo."
    ],
    responsibilities: [
      "Frontend implementation of the user interface using clean web structures",
      "Testing key interactive components for responsive stability",
      "Debugging client-side code and improving cross-browser compatibility",
      "Supporting technical presentation formulation for evaluation panels"
    ],
    techStack: ["HTML", "CSS", "JavaScript"],
    impact: "Working under hackathon limits taught fast prototyping techniques, standard version control workflows, and cooperative team communication.",
    githubLink: "https://github.com/devottamkumar1310-cpu"
  }
];
