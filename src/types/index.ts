export interface Voice {
  id: string;
  name: string;
  gender: 'Female' | 'Male' | 'Neutral';
  tone: string;
  style: string;
  recommendedFor: string;
  languages: string[];
  previewText: string;
  avatarColor?: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  flag: string;
}

export interface GenerationItem {
  id: string;
  text: string;
  voice: string;
  language: string;
  style: string;
  speed: number;
  audioBase64: string;
  format: 'wav';
  duration: number;
  characters: number;
  words: number;
  createdAt: string;
  projectId?: string;
  title?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
}

export interface UserUsage {
  charactersUsed: number;
  charactersLimit: number;
  charactersRemaining: number;
  generationsCount: number;
  tier: 'Free' | 'Creator' | 'Pro';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'Free' | 'Creator' | 'Pro';
  defaultLanguage: string;
  defaultVoice: string;
  themePreference: 'dark' | 'light' | 'system';
}

export interface PricingPlan {
  id: 'free' | 'creator' | 'pro';
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  charactersPerMonth: number;
  formattedChars: string;
  maxPerRequest: number;
  popular?: boolean;
  features: string[];
  cta: string;
}

export type ActiveTab = 'home' | 'studio' | 'voices' | 'history' | 'projects' | 'pricing' | 'dashboard';
