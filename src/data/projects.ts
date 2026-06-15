import { Project } from "../types";

export const PROJECTS: Project[] = [
  {
    id: "eve",
    title: "EVE — AI COO Platform for Small Businesses",
    tagline: "Streamlining Operations and Workflows",
    category: "AI & Backend",
    status: "In Development",
    period: "Jun 2026 - Present",
    description: "An AI COO platform designed to help small businesses streamline operations, workflows, and decision-making using AI-powered systems.",
    vision: "To empower small business owners with a reliable, intelligent operating framework that interprets natural language requests to coordinate workflows, reduce repetitive administration, and organize core metrics.",
    currentProgress: "Actively constructing the core backend framework, designing transactional database schemas, prototyping multi-step intelligent automation pipelines.",
    plannedFeatures: [
      "Natural language instruction interpreter for business task execution",
      "Robust state management and validation for complex workflows",
      "Structured data integrations for metric tracking and task board synchronization",
      "Custom scheduling and notification engine for key operations"
    ],
    learningJourney: "Designing and developing EVE is teaching me how to manage asynchronous processing lifecycles, coordinate state transitions securely, write expressive APIs, and orchestrate server operations safely.",
    techStack: ["Node.js", "Express.js", "Python", "MongoDB", "MySQL", "Gemini API"],
    githubLink: "https://github.com/devottamkumar1310-cpu" // Using official profile
  },
  {
    id: "nasa-space-apps",
    title: "NASA Space Apps Challenge Project",
    tagline: "Collaborative Real-World Hackathon Project",
    category: "Hackathon",
    status: "Completed",
    period: "Oct 2025",
    description: "Collaborated in a four-member team to develop an interactive solution for a real-world space challenge.",
    responsibilities: [
      "Frontend implementation of the user interface using clean web structures",
      "Testing key interactive components for responsive stability",
      "Debugging client-side code and improving cross-browser compatibility",
      "Active team collaboration and concept alignment",
      "Supporting technical presentation formulation for evaluation panels"
    ],
    techStack: ["HTML", "CSS", "JavaScript"],
    learnings: "Working under hackathon limits taught me fast prototyping techniques, standard version control workflows, and cooperative team communication.",
    githubLink: "https://github.com/devottamkumar1310-cpu"
  },
  {
    id: "portfolio-platform",
    title: "Student Portfolio Platform",
    tagline: "Scalable Content-First Developer Showcase",
    category: "Web Engineering",
    status: "Completed",
    period: "May 2026",
    description: "Personal portfolio platform built using modern web technologies and designed around scalable architecture, clean design, and long-term maintainability.",
    features: [
      "Dynamic data-driven layout utilizing strict Separation of Concerns (SoC)",
      "Highly readable minimalist layout emphasizing educational and project credibility",
      "Print-optimized styling dedicated for elegant, standard browser PDF resume exports",
      "Responsive navigation layouts accommodating tablets, phones, and desktops seamlessly"
    ],
    techStack: ["React", "Vite", "TypeScript", "Tailwind CSS", "motion"],
    githubLink: "https://github.com/devottamkumar1310-cpu"
  }
];
