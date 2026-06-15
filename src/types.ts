export interface Project {
  id: string;
  title: string;
  tagline?: string;
  category: string;
  description: string;
  status?: string;
  period?: string;
  // Dynamic fields for EVE:
  vision?: string;
  currentProgress?: string;
  plannedFeatures?: string[];
  learningJourney?: string;
  // Standard fields
  problem?: string;
  solution?: string;
  features?: string[];
  responsibilities?: string[];
  techStack: string[];
  learnings?: string;
  githubLink?: string;
  liveLink?: string;
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
  id: string;
  title: string;
  issuer: string;
  date: string;
  verificationLink?: string;
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

