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

// Utilisateurs réalistes avec données complètes de monétisation, consommation de tokens et livres rédigés
export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr-admin-studio',
    name: 'Administrateur Bookly',
    email: 'admin@bookly.studio',
    avatarBg: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    plan: 'premium',
    status: 'active',
    registeredDate: '2026-08-01',
    lastActiveDate: 'À l\'instant',
    dailyPromptsUsed: 4,
    dailyPromptsLimit: 200,
    lifetimeProjects: 6,
    totalWordsGenerated: 184500,
    notes: 'Compte Master Admin Studio.'
  },
  {
    id: 'usr-sarah-m',
    name: 'Sarah Mendy',
    email: 'sarah.mendy@africawrite.com',
    avatarBg: 'linear-gradient(135deg, #059669, #10b981)',
    plan: 'premium',
    status: 'active',
    registeredDate: '2026-08-12',
    lastActiveDate: 'Il y a 14 min',
    dailyPromptsUsed: 38,
    dailyPromptsLimit: 200,
    lifetimeProjects: 8,
    totalWordsGenerated: 342000,
    notes: 'Autrice best-seller romance & mindset. Abonnement Premium réglé par Saspay Wave.'
  },
  {
    id: 'usr-amadou-d',
    name: 'Amadou Diallo',
    email: 'amadou.diallo@fintech-insight.sn',
    avatarBg: 'linear-gradient(135deg, #2563eb, #38bdf8)',
    plan: 'pro',
    status: 'active',
    registeredDate: '2026-08-19',
    lastActiveDate: 'Il y a 1h',
    dailyPromptsUsed: 19,
    dailyPromptsLimit: 50,
    lifetimeProjects: 4,
    totalWordsGenerated: 128900,
    notes: 'Auteur d\'e-books business et finance personnelle. Abonnement Pro Saspay Orange Money.'
  },
  {
    id: 'usr-patricia-k',
    name: 'Patricia Koffi',
    email: 'patricia.koffi@gmail.com',
    avatarBg: 'linear-gradient(135deg, #d97706, #f59e0b)',
    plan: 'premium',
    status: 'active',
    registeredDate: '2026-08-22',
    lastActiveDate: 'Il y a 3h',
    dailyPromptsUsed: 42,
    dailyPromptsLimit: 200,
    lifetimeProjects: 5,
    totalWordsGenerated: 215400,
    notes: 'Formatrice & coach en leadership. Abonnement Premium Saspay MTN MoMo.'
  },
  {
    id: 'usr-ibrahim-t',
    name: 'Ibrahim Touré',
    email: 'i.toure@consulting-abidjan.ci',
    avatarBg: 'linear-gradient(135deg, #7c3aed, #c084fc)',
    plan: 'pro',
    status: 'active',
    registeredDate: '2026-08-28',
    lastActiveDate: 'Hier',
    dailyPromptsUsed: 12,
    dailyPromptsLimit: 50,
    lifetimeProjects: 3,
    totalWordsGenerated: 89400,
    notes: 'E-books marketing digital. Carte bancaire Saspay.'
  },
  {
    id: 'usr-fatou-c',
    name: 'Fatou Camara',
    email: 'fatou.camara@ecriture-libre.org',
    avatarBg: 'linear-gradient(135deg, #db2777, #f472b6)',
    plan: 'free',
    status: 'active',
    registeredDate: '2026-09-02',
    lastActiveDate: 'Il y a 5h',
    dailyPromptsUsed: 3,
    dailyPromptsLimit: 5,
    lifetimeProjects: 1,
    totalWordsGenerated: 14200,
    notes: 'Nouvelle utilisatrice. En phase de test du brainstorming IA.'
  },
  {
    id: 'usr-kevin-b',
    name: 'Kevin Bationo',
    email: 'kevin.bationo@outlook.fr',
    avatarBg: 'linear-gradient(135deg, #475569, #64748b)',
    plan: 'free',
    status: 'active',
    registeredDate: '2026-09-04',
    lastActiveDate: 'Il y a 2 jours',
    dailyPromptsUsed: 5,
    dailyPromptsLimit: 5,
    lifetimeProjects: 2,
    totalWordsGenerated: 22800,
    notes: 'Prospect chaud pour conversion vers forfait Pro.'
  }
];

// Métriques API d'utilisation des Tokens sur les 7 derniers jours
export const INITIAL_API_DAILY_STATS: AdminApiDailyStat[] = [
  {
    date: '2026-09-02',
    dayLabel: 'Mercredi',
    totalTokens: 145200,
    inputTokens: 42000,
    outputTokens: 103200,
    groqTokens: 98000,
    geminiTokens: 47200,
    requestsCount: 68,
    avgLatencyMs: 820
  },
  {
    date: '2026-09-03',
    dayLabel: 'Jeudi',
    totalTokens: 189400,
    inputTokens: 51200,
    outputTokens: 138200,
    groqTokens: 124000,
    geminiTokens: 65400,
    requestsCount: 84,
    avgLatencyMs: 760
  },
  {
    date: '2026-09-04',
    dayLabel: 'Vendredi',
    totalTokens: 234100,
    inputTokens: 68400,
    outputTokens: 165700,
    groqTokens: 158000,
    geminiTokens: 76100,
    requestsCount: 112,
    avgLatencyMs: 790
  },
  {
    date: '2026-09-05',
    dayLabel: 'Samedi',
    totalTokens: 298500,
    inputTokens: 84100,
    outputTokens: 214400,
    groqTokens: 198000,
    geminiTokens: 100500,
    requestsCount: 142,
    avgLatencyMs: 710
  },
  {
    date: '2026-09-06',
    dayLabel: 'Dimanche',
    totalTokens: 312000,
    inputTokens: 91000,
    outputTokens: 221000,
    groqTokens: 215000,
    geminiTokens: 97000,
    requestsCount: 156,
    avgLatencyMs: 690
  },
  {
    date: '2026-09-07',
    dayLabel: 'Hier',
    totalTokens: 278600,
    inputTokens: 78900,
    outputTokens: 199700,
    groqTokens: 187000,
    geminiTokens: 91600,
    requestsCount: 138,
    avgLatencyMs: 740
  },
  {
    date: '2026-09-08',
    dayLabel: 'Aujourd\'hui',
    totalTokens: 194300,
    inputTokens: 54100,
    outputTokens: 140200,
    groqTokens: 131000,
    geminiTokens: 63300,
    requestsCount: 96,
    avgLatencyMs: 720
  }
];

// Identifiants administrateur sécurisés
export const ADMIN_SECURITY_CREDENTIALS = {
  adminEmail: 'admin.studio@bookly.internal',
  adminMasterKey: 'admin2026',
  adminPinCode: '849201',
  passphrase: 'bookly-master-control'
};

// Revenus d'abonnements SaaS Saspay sur les 7 derniers jours (en FCFA)
export const INITIAL_SUBSCRIPTION_REVENUE_STATS: AdminSubscriptionRevenueStat[] = [
  {
    date: '2026-09-02',
    dayLabel: 'Mercredi',
    proRevenue: 38000,
    premiumRevenue: 32000,
    totalSubscriptionRevenue: 70000,
    newSubscriptionsCount: 2,
    renewalsCount: 1,
    churnCount: 0
  },
  {
    date: '2026-09-03',
    dayLabel: 'Jeudi',
    proRevenue: 19000,
    premiumRevenue: 64000,
    totalSubscriptionRevenue: 83000,
    newSubscriptionsCount: 3,
    renewalsCount: 1,
    churnCount: 0
  },
  {
    date: '2026-09-04',
    dayLabel: 'Vendredi',
    proRevenue: 57000,
    premiumRevenue: 32000,
    totalSubscriptionRevenue: 89000,
    newSubscriptionsCount: 4,
    renewalsCount: 2,
    churnCount: 0
  },
  {
    date: '2026-09-05',
    dayLabel: 'Samedi',
    proRevenue: 38000,
    premiumRevenue: 96000,
    totalSubscriptionRevenue: 134000,
    newSubscriptionsCount: 5,
    renewalsCount: 2,
    churnCount: 0
  },
  {
    date: '2026-09-06',
    dayLabel: 'Dimanche',
    proRevenue: 76000,
    premiumRevenue: 64000,
    totalSubscriptionRevenue: 140000,
    newSubscriptionsCount: 6,
    renewalsCount: 3,
    churnCount: 1
  },
  {
    date: '2026-09-07',
    dayLabel: 'Hier',
    proRevenue: 57000,
    premiumRevenue: 64000,
    totalSubscriptionRevenue: 121000,
    newSubscriptionsCount: 5,
    renewalsCount: 2,
    churnCount: 0
  },
  {
    date: '2026-09-08',
    dayLabel: 'Aujourd\'hui',
    proRevenue: 38000,
    premiumRevenue: 64000,
    totalSubscriptionRevenue: 102000,
    newSubscriptionsCount: 4,
    renewalsCount: 1,
    churnCount: 0
  }
];

export const INITIAL_ERROR_LOGS: AdminErrorLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-09-08 12:45',
    service: 'system',
    severity: 'info',
    endpoint: '/api/payments/create-checkout',
    errorCode: 200,
    message: 'Session de paiement Saspay initialisée avec succès (Wave / Orange Money).',
    userEmail: 'sarah.mendy@africawrite.com',
    resolved: true
  },
  {
    id: 'log-002',
    timestamp: '2026-09-08 11:30',
    service: 'groq',
    severity: 'info',
    endpoint: '/api/ai/chapter',
    errorCode: 200,
    message: 'Génération du chapitre complétée via qwen/qwen3.8-27b (1 420 mots).',
    userEmail: 'patricia.koffi@gmail.com',
    resolved: true
  }
];
