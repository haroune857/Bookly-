import {
  AdminUser,
  AdminApiDailyStat,
  AdminErrorLog,
  AdminGlobalConfig,
  AdminSubscriptionRevenueStat
} from '../types';

export const DEFAULT_ADMIN_CONFIG: AdminGlobalConfig = {
  freeDailyPromptLimit: 5,
  proDailyPromptLimit: 50,
  premiumDailyPromptLimit: 200,
  maxFreeProjects: 5,
  defaultAiProvider: 'groq',
  defaultGroqModel: 'qwen/qwen3.8-27b',
  maintenanceMode: false,
  announcementBanner: 'Plateforme Bookly Studio prête. Génération de livres assistée par IA.',
  allowFreeRegistration: true
};

// Compte Administrateur Unique réinitialisé aux paramètres d'usine (compteurs à zéro)
export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr-admin-studio',
    name: 'Administrateur Bookly',
    email: 'admin@bookly.studio',
    avatarBg: 'linear-gradient(135deg, #d97706, #f59e0b)',
    plan: 'premium',
    status: 'active',
    registeredDate: '2026-09-05',
    lastActiveDate: 'À l\'instant',
    dailyPromptsUsed: 0,
    dailyPromptsLimit: 200,
    lifetimeProjects: 0,
    totalWordsGenerated: 0,
    notes: 'Compte Administrateur Principal (Paramètres d\'usine - Compteurs à zéro).'
  }
];

// Métriques API d'utilisation des Tokens réinitialisées aux paramètres d'usine (aucun coût financier)
export const INITIAL_API_DAILY_STATS: AdminApiDailyStat[] = [
  {
    date: '2026-09-05',
    dayLabel: 'Aujourd\'hui',
    totalTokens: 0,
    inputTokens: 0,
    outputTokens: 0,
    groqTokens: 0,
    geminiTokens: 0,
    requestsCount: 0,
    avgLatencyMs: 0
  }
];

// Identifiants administrateur sécurisés (adresse mail interne dédiée et fictive)
export const ADMIN_SECURITY_CREDENTIALS = {
  adminEmail: 'admin.studio@bookly.internal',
  adminMasterKey: 'admin2026', // Mot de passe admin
  adminPinCode: '849201', // Code PIN 6 chiffres
  passphrase: 'bookly-master-control'
};

// Revenus d'abonnements SaaS Saspay réinitialisés aux paramètres d'usine
export const INITIAL_SUBSCRIPTION_REVENUE_STATS: AdminSubscriptionRevenueStat[] = [
  {
    date: '2026-09-05',
    dayLabel: 'Aujourd\'hui',
    proRevenue: 0,
    premiumRevenue: 0,
    totalSubscriptionRevenue: 0,
    newSubscriptionsCount: 0,
    renewalsCount: 0,
    churnCount: 0
  }
];

export const INITIAL_ERROR_LOGS: AdminErrorLog[] = [];
