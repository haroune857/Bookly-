export type ViewType = 'landing' | 'dashboard' | 'projects' | 'library' | 'formations' | 'settings' | 'admin';

export type ProjectStatus = 'draft' | 'in_progress' | 'ai_generating' | 'completed';

export interface Chapter {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  completed: boolean;
}

export interface Project {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  author: string;
  coverGradient: string;
  coverTemplateId?: string;
  coverFigure?: string;
  coverCustomImage?: string;
  coverLayout?: 'modern' | 'minimal' | 'editorial' | 'apple_hero' | 'centered' | 'badge_top';
  coverAccentColor?: string;
  status: ProjectStatus;
  progress: number;
  wordCount: number;
  readingTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
  chapters: Chapter[];
  description?: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: string;
  coverGradient: string;
  coverTemplateId?: string;
  coverFigure?: string;
  coverCustomImage?: string;
  pages: number;
  readTime: string;
  rating: number;
  isFavorite: boolean;
  isPurchased: boolean;
  description: string;
  content: string[];
}

export type CoverCategory =
  | 'all'
  | 'apple_minimal'
  | 'tech_ai'
  | 'nature_bio'
  | 'business_finance'
  | 'mindset_wellness'
  | 'scifi_space'
  | 'literature_art';

export interface EbookCoverTemplate {
  id: string;
  name: string;
  category: CoverCategory;
  categoryLabel: string;
  description: string;
  gradient: string;
  backgroundStyle?: string;
  accentColor: string;
  secondaryColor?: string;
  textColor: 'light' | 'dark';
  figureType:
    | 'apple_silk_ribbon'
    | 'apple_frosted_orb'
    | 'apple_topographic_contour'
    | 'apple_concentric_sonar'
    | 'apple_prism_lens'
    | 'apple_titanium_mesh'
    | 'nature_boreal_canopy'
    | 'nature_sahara_dunes'
    | 'nature_ocean_abyss'
    | 'nature_zen_bamboo'
    | 'tech_neural_matrix'
    | 'tech_quantum_circuit'
    | 'tech_neon_code'
    | 'tech_cyber_grid'
    | 'business_obsidian_gold'
    | 'business_wallstreet_chart'
    | 'business_silicon_nodes'
    | 'mindset_aura_halo'
    | 'mindset_solstice_sun'
    | 'scifi_supernova_ring'
    | 'scifi_cyber_horizon'
    | 'lit_gallimard_border'
    | 'lit_monochrome_typographic'
    | 'health_matcha_spiral'
    | 'art_bauhaus_prisme'
    | 'art_gradient_mesh';
  layoutStyle: 'modern' | 'minimal' | 'editorial' | 'apple_hero' | 'centered' | 'badge_top';
  fontFamily: 'sans' | 'serif' | 'mono' | 'display';
  tagBadge?: string;
  tags: string[];
}

export interface TrainingCourse {
  id: string;
  title: string;
  badge: string;
  isFeatured?: boolean;
  description: string;
  progress: number;
  totalModules: number;
  completedModules: number;
  instructor: string;
  duration: string;
  category: string;
  price?: number;
  priceFcfa?: number;
  isPurchased?: boolean;
  pages?: number;
  coverGradient?: string;
  coverTemplateId?: string;
  coverFigure?: string;
  modulesList: {
    title: string;
    duration: string;
    completed: boolean;
    content?: string;
    keyTakeaways?: string[];
  }[];
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  role: string;
  bio: string;
  avatarBg: string;
  avatarUrl?: string;
  authProvider?: 'email' | 'google';
  isAdmin?: boolean;
  signature?: string;
  plan?: 'basic' | 'pro' | 'premium' | 'free';
  planBilling?: 'monthly' | 'quarterly' | 'yearly';
  planRenewsAt?: string;
  lifetimeProjectsCreated?: number;
  monthlyProjectsCreated?: number;
  dailyChatbotCount?: number;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface GoogleIntegrationSettings {
  googleDocsExportFormat: 'gdoc' | 'docx' | 'markdown' | 'pdf_html';
  googleDriveBackupEnabled: boolean;
  lastGoogleDriveBackupDate?: string;
  autoSyncToDrive: boolean;
  googleWorkspaceEmail?: string;
}

export interface AppSettings {
  darkMode: boolean;
  theme?: 'light' | 'dark';
  fontFamily?: 'plus_jakarta' | 'newsreader' | 'merriweather' | 'jetbrains';
  fontSize?: 'small' | 'medium' | 'large';
  editorDensity?: 'comfortable' | 'compact';
  autoSaveIntervalSec?: number;
  defaultWordGoal?: number;
  emailNotifications?: boolean;
  aiModel?: string;
  aiCreativity?: 'creative' | 'balanced' | 'precise';
  customAiApiKey?: string;
  googleIntegration?: GoogleIntegrationSettings;
}

// ----------------------------------------------------
// Admin Module Types
// ----------------------------------------------------
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatarBg: string;
  plan: 'free' | 'pro' | 'premium';
  status: 'active' | 'blocked';
  registeredDate: string;
  lastActiveDate: string;
  dailyPromptsUsed: number;
  dailyPromptsLimit: number;
  lifetimeProjects: number;
  totalWordsGenerated: number;
  notes?: string;
}

export interface AdminApiDailyStat {
  date: string;
  dayLabel: string;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  groqTokens: number;
  geminiTokens: number;
  requestsCount: number;
  avgLatencyMs: number;
}

export interface AdminErrorLog {
  id: string;
  timestamp: string;
  service: 'groq' | 'gemini' | 'system' | 'auth' | 'export';
  severity: 'critical' | 'warning' | 'info';
  endpoint: string;
  errorCode: string | number;
  message: string;
  userEmail: string;
  resolved: boolean;
}

export interface AdminGlobalConfig {
  freeDailyPromptLimit: number;
  proDailyPromptLimit: number;
  premiumDailyPromptLimit: number;
  maxFreeProjects: number;
  defaultAiProvider: 'groq' | 'gemini';
  defaultGroqModel: string;
  maintenanceMode: boolean;
  announcementBanner: string;
  allowFreeRegistration: boolean;
}

export interface AdminKpiSummary {
  totalRegisteredUsers: number;
  activeUsersToday: number;
  activeUsersMonth: number;
  paidSubscribersCount: number;
  freeUsersCount: number;
  totalBooksCreated: number;
  totalWordsGenerated: number;
  totalAiRequests: number;
  totalTokensConsumed: number;
  geminiTokensConsumed: number;
  groqTokensConsumed: number;
  totalSubscriptionRevenueMonth: number; // en FCFA (Saspay)
  proSubscriptionsCount: number;
  premiumSubscriptionsCount: number;
}

export interface AdminSubscriptionRevenueStat {
  date: string;
  dayLabel: string;
  proRevenue: number; // Abonnements Pro Saspay (FCFA)
  premiumRevenue: number; // Abonnements Premium Saspay (FCFA)
  totalSubscriptionRevenue: number; // Total Saspay (FCFA)
  newSubscriptionsCount: number;
  renewalsCount: number;
  churnCount: number;
}
