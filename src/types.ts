export interface Project {
  id: string;
  title: string;
  tagline?: string;
  category: string;
  description: string; // Used as short one-line summary for projects now
  status?: string;
  period?: string;
  
  // Case Study detailed fields
  importanceLevel?: "flagship" | "major" | "condensed" | "supporting";
  detailedDescription?: string[]; // For 2-4 paragraphs
  techHighlights?: string[];
  challenges?: string[];
  impact?: string;
  
  // EVE Specific Case Study Fields
  problem?: string[];
  visionArr?: string[];
  architecture?: string[];
  aiCooSystem?: string[];
  inventoryIntelligence?: string[];
  deploymentArchitecture?: string[];
  
  // Backwards compatibility / existing optional fields
  vision?: string;
  currentProgress?: string;
  plannedFeatures?: string[];
  learningJourney?: string;
  solution?: string;
  features?: string[];
  responsibilities?: string[];
  techStack: string[];
  learnings?: string;
  githubLink?: string;
  liveLink?: string;

  // New Case Study structured fields
  motivation?: string;
  keyCapabilities?: string[];
  engineeringHighlights?: string[];
  techStackBreakdown?: { category: string; technologies: string[] }[];
  technicalChallenges?: { title: string; problem: string; solution: string }[];
  results?: string[];
  lessonsLearned?: string;
  screenshots?: string[];
}

export interface SkillCategory {
  title: string;
  skills: string[];
}

export interface TimelineEvent {
  period: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface Certificate {
  title: string;
  organization: string;
  image: string;
  pdf: string;
  year: string;
  subtitle?: string;
  description?: string;
}

export interface Achievement {
  id: string;
  title: string;
  date: string;
  description: string;
  highlight?: boolean;
}

export interface FutureMilestone {
  period: string;
  goal: string;
  motivation: string;
}
