import {
  AdminUser,
  AdminApiDailyStat,
  AdminAffiliateCourse,
  AdminErrorLog,
  AdminGlobalConfig,
  AdminSubscriptionRevenueStat,
  AdminChariotDeliveryRevenueStat
} from '../types';

export const DEFAULT_ADMIN_CONFIG: AdminGlobalConfig = {
  freeDailyPromptLimit: 5,
  proDailyPromptLimit: 50,
  premiumDailyPromptLimit: 200,
  maxFreeProjects: 5,
  defaultAiProvider: 'groq',
  defaultGroqModel: 'qwen/qwen3.8-27b',
  monthlyApiBudgetLimit: 150, // 150 €
  maintenanceMode: false,
  affiliateTrackingEnabled: true,
  announcementBanner: 'Bienvenue sur la mise à jour Bookly Studio v3.4 ! Nouvelles fonctionnalités disponibles.',
  allowFreeRegistration: true
};

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr-admin-studio',
    name: 'Alexandre (Administrateur Bookly)',
    email: 'admin@bookly.studio',
    avatarBg: 'linear-gradient(135deg, #d97706, #f59e0b)',
    plan: 'premium',
    status: 'active',
    registeredDate: '2026-08-30',
    lastActiveDate: 'À l\'instant',
    dailyPromptsUsed: 0,
    dailyPromptsLimit: 200,
    lifetimeProjects: 0,
    totalWordsGenerated: 0,
    notes: 'Compte Administrateur Principal de la plateforme.'
  }
];

export const INITIAL_API_DAILY_STATS: AdminApiDailyStat[] = [
  {
    date: '2026-02-16',
    dayLabel: 'Lun 16',
    totalTokens: 642000,
    inputTokens: 210000,
    outputTokens: 432000,
    groqTokens: 520000,
    geminiTokens: 122000,
    requestsCount: 380,
    estimatedCost: 1.42,
    avgLatencyMs: 340
  },
  {
    date: '2026-02-17',
    dayLabel: 'Mar 17',
    totalTokens: 810000,
    inputTokens: 270000,
    outputTokens: 540000,
    groqTokens: 660000,
    geminiTokens: 150000,
    requestsCount: 495,
    estimatedCost: 1.84,
    avgLatencyMs: 310
  },
  {
    date: '2026-02-18',
    dayLabel: 'Mer 18',
    totalTokens: 950000,
    inputTokens: 310000,
    outputTokens: 640000,
    groqTokens: 780000,
    geminiTokens: 170000,
    requestsCount: 560,
    estimatedCost: 2.15,
    avgLatencyMs: 295
  },
  {
    date: '2026-02-19',
    dayLabel: 'Jeu 19',
    totalTokens: 1120000,
    inputTokens: 380000,
    outputTokens: 740000,
    groqTokens: 910000,
    geminiTokens: 210000,
    requestsCount: 680,
    estimatedCost: 2.58,
    avgLatencyMs: 330
  },
  {
    date: '2026-02-20',
    dayLabel: 'Ven 20',
    totalTokens: 1280000,
    inputTokens: 420000,
    outputTokens: 860000,
    groqTokens: 1040000,
    geminiTokens: 240000,
    requestsCount: 740,
    estimatedCost: 2.92,
    avgLatencyMs: 280
  },
  {
    date: '2026-02-21',
    dayLabel: 'Sam 21',
    totalTokens: 1450000,
    inputTokens: 490000,
    outputTokens: 960000,
    groqTokens: 1180000,
    geminiTokens: 270000,
    requestsCount: 830,
    estimatedCost: 3.35,
    avgLatencyMs: 310
  },
  {
    date: '2026-02-22',
    dayLabel: 'Dim 22',
    totalTokens: 1390000,
    inputTokens: 460000,
    outputTokens: 930000,
    groqTokens: 1120000,
    geminiTokens: 270000,
    requestsCount: 790,
    estimatedCost: 3.18,
    avgLatencyMs: 305
  },
  {
    date: '2026-02-23',
    dayLabel: 'Lun 23',
    totalTokens: 1250000,
    inputTokens: 410000,
    outputTokens: 840000,
    groqTokens: 1010000,
    geminiTokens: 240000,
    requestsCount: 720,
    estimatedCost: 2.85,
    avgLatencyMs: 290
  },
  {
    date: '2026-02-24',
    dayLabel: 'Mar 24',
    totalTokens: 1580000,
    inputTokens: 530000,
    outputTokens: 1050000,
    groqTokens: 1290000,
    geminiTokens: 290000,
    requestsCount: 890,
    estimatedCost: 3.65,
    avgLatencyMs: 325
  },
  {
    date: '2026-02-25',
    dayLabel: 'Mer 25',
    totalTokens: 1720000,
    inputTokens: 580000,
    outputTokens: 1140000,
    groqTokens: 1410000,
    geminiTokens: 310000,
    requestsCount: 960,
    estimatedCost: 3.98,
    avgLatencyMs: 300
  },
  {
    date: '2026-02-26',
    dayLabel: 'Jeu 26',
    totalTokens: 1850000,
    inputTokens: 620000,
    outputTokens: 1230000,
    groqTokens: 1520000,
    geminiTokens: 330000,
    requestsCount: 1040,
    estimatedCost: 4.25,
    avgLatencyMs: 275
  },
  {
    date: '2026-02-27',
    dayLabel: 'Ven 27',
    totalTokens: 1980000,
    inputTokens: 670000,
    outputTokens: 1310000,
    groqTokens: 1620000,
    geminiTokens: 360000,
    requestsCount: 1120,
    estimatedCost: 4.58,
    avgLatencyMs: 290
  },
  {
    date: '2026-02-28',
    dayLabel: 'Sam 28',
    totalTokens: 2150000,
    inputTokens: 720000,
    outputTokens: 1430000,
    groqTokens: 1760000,
    geminiTokens: 390000,
    requestsCount: 1210,
    estimatedCost: 4.95,
    avgLatencyMs: 265
  },
  {
    date: '2026-02-29',
    dayLabel: 'Aujourd\'hui',
    totalTokens: 1420000,
    inputTokens: 480000,
    outputTokens: 940000,
    groqTokens: 1150000,
    geminiTokens: 270000,
    requestsCount: 810,
    estimatedCost: 3.28,
    avgLatencyMs: 260
  }
];

export const INITIAL_AFFILIATE_COURSES: AdminAffiliateCourse[] = [
  {
    id: 'aff-1',
    title: 'Écriture de Livres & E-books à Succès',
    author: 'Alexandre & Équipe Bookly',
    description: 'Maîtrisez l\'art de concevoir, structurer, rédiger et publier des livres et guides pratiques à forte valeur ajoutée.',
    affiliateUrl: 'https://chariot.com/aff/bookly-masterclass-ebooks?ref=studio_admin_01',
    targetAudience: 'all',
    price: 49,
    commissionRate: 40,
    category: 'Édition & Créativité',
    coverGradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    clicksCount: 384,
    conversionsCount: 42,
    isActive: true,
    createdAt: '2026-01-12'
  },
  {
    id: 'aff-2',
    title: 'Création de Tunnels de Vente Haute Conversion',
    author: 'Sarah K. (Growth Expert)',
    description: 'Apprenez à structurer des pages de capture et des tunnels de conversion optimisés pour transformer chaque visiteur en client.',
    affiliateUrl: 'https://chariot.com/aff/funnel-mastery-pro?ref=studio_admin_01',
    targetAudience: 'all',
    price: 79,
    commissionRate: 45,
    category: 'Marketing',
    coverGradient: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
    clicksCount: 295,
    conversionsCount: 28,
    isActive: true,
    createdAt: '2026-01-20'
  },
  {
    id: 'aff-3',
    title: 'Marketing d\'Affiliation Avancé & Automatisation Chariot',
    author: 'David M. (Affiliate Leader)',
    description: 'Développez vos réseaux de recommandation et touchez des commissions récurrentes avec des stratégies de trafic ciblées.',
    affiliateUrl: 'https://chariot.com/aff/affiliate-scaling-2026?ref=studio_admin_01',
    targetAudience: 'paid_only',
    price: 59,
    commissionRate: 50,
    category: 'Revenus Passifs',
    coverGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    clicksCount: 182,
    conversionsCount: 23,
    isActive: true,
    createdAt: '2026-02-01'
  },
  {
    id: 'aff-4',
    title: 'Bootcamp Amazon KDP & Distribution Internationale',
    author: 'Mathieu Royer',
    description: 'Publier, formater et positionner son livre broché et Kindle dans le Top 10 des ventes Amazon.',
    affiliateUrl: 'https://chariot.com/aff/kdp-international-domination?ref=studio_admin_01',
    targetAudience: 'all',
    price: 89,
    commissionRate: 35,
    category: 'Édition & Stratégie',
    coverGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    clicksCount: 147,
    conversionsCount: 15,
    isActive: true,
    createdAt: '2026-02-15'
  }
];

export const INITIAL_ERROR_LOGS: AdminErrorLog[] = [
  {
    id: 'err-101',
    timestamp: '2026-02-29 14:22:18',
    service: 'groq',
    severity: 'warning',
    endpoint: '/api/ai/stream-chapter',
    errorCode: '429 Rate Limit (Soft)',
    message: 'Groq API rate limit approché (TPM > 85%). Bascule automatique vers le modèle fallback qwen/qwen3.8-27b effectuée sans interruption.',
    userEmail: 'karim.benali@tech-digest.io',
    resolved: true
  },
  {
    id: 'err-102',
    timestamp: '2026-02-29 12:45:02',
    service: 'gemini',
    severity: 'info',
    endpoint: '/api/ai/brainstorm',
    errorCode: '200 Latency Spike',
    message: 'Temps de réponse de génération de plan légèrement élevé (4.2s). Cache optimisé.',
    userEmail: 'sophie.martin@editions-lumiere.fr',
    resolved: true
  },
  {
    id: 'err-103',
    timestamp: '2026-02-28 18:14:33',
    service: 'auth',
    severity: 'critical',
    endpoint: '/api/auth/verify',
    errorCode: '403 Forbidden',
    message: 'Tentative d\'accès non autorisé avec clé API invalide depuis IP 185.220.101.4.',
    userEmail: 'inconnu@suspect.org',
    resolved: true
  },
  {
    id: 'err-104',
    timestamp: '2026-02-28 09:30:11',
    service: 'export',
    severity: 'warning',
    endpoint: '/api/export/docx',
    errorCode: 'TIMEOUT_DOCX',
    message: 'Fichier volumineux (>120 000 mots). Conversion asynchrone effectuée avec succès.',
    userEmail: 'david.nkosi@startup-media.org',
    resolved: true
  }
];

// Identifiants administrateur par défaut sécurisés
export const ADMIN_SECURITY_CREDENTIALS = {
  adminEmail: 'admin@bookly.studio',
  adminMasterKey: 'admin2026', // Mot de passe admin
  adminPinCode: '849201', // Code PIN 6 chiffres
  passphrase: 'bookly-master-control'
};

// ---------------------------------------------------------------------
// DONNÉES FINANCIÈRES : REVENUS ISSUS DES ABONNEMENTS (SaaS)
// ---------------------------------------------------------------------
export const INITIAL_SUBSCRIPTION_REVENUE_STATS: AdminSubscriptionRevenueStat[] = [
  {
    date: '2026-02-16',
    dayLabel: 'Lun 16',
    proRevenue: 348,
    premiumRevenue: 294,
    totalSubscriptionRevenue: 642,
    newSubscriptionsCount: 11,
    renewalsCount: 16,
    churnCount: 1
  },
  {
    date: '2026-02-17',
    dayLabel: 'Mar 17',
    proRevenue: 406,
    premiumRevenue: 343,
    totalSubscriptionRevenue: 749,
    newSubscriptionsCount: 14,
    renewalsCount: 18,
    churnCount: 0
  },
  {
    date: '2026-02-18',
    dayLabel: 'Mer 18',
    proRevenue: 464,
    premiumRevenue: 392,
    totalSubscriptionRevenue: 856,
    newSubscriptionsCount: 16,
    renewalsCount: 20,
    churnCount: 1
  },
  {
    date: '2026-02-19',
    dayLabel: 'Jeu 19',
    proRevenue: 522,
    premiumRevenue: 441,
    totalSubscriptionRevenue: 963,
    newSubscriptionsCount: 18,
    renewalsCount: 22,
    churnCount: 0
  },
  {
    date: '2026-02-20',
    dayLabel: 'Ven 20',
    proRevenue: 580,
    premiumRevenue: 490,
    totalSubscriptionRevenue: 1070,
    newSubscriptionsCount: 21,
    renewalsCount: 24,
    churnCount: 2
  },
  {
    date: '2026-02-21',
    dayLabel: 'Sam 21',
    proRevenue: 638,
    premiumRevenue: 539,
    totalSubscriptionRevenue: 1177,
    newSubscriptionsCount: 23,
    renewalsCount: 25,
    churnCount: 1
  },
  {
    date: '2026-02-22',
    dayLabel: 'Dim 22',
    proRevenue: 609,
    premiumRevenue: 490,
    totalSubscriptionRevenue: 1099,
    newSubscriptionsCount: 19,
    renewalsCount: 23,
    churnCount: 0
  },
  {
    date: '2026-02-23',
    dayLabel: 'Lun 23',
    proRevenue: 551,
    premiumRevenue: 441,
    totalSubscriptionRevenue: 992,
    newSubscriptionsCount: 17,
    renewalsCount: 21,
    churnCount: 1
  },
  {
    date: '2026-02-24',
    dayLabel: 'Mar 24',
    proRevenue: 667,
    premiumRevenue: 588,
    totalSubscriptionRevenue: 1255,
    newSubscriptionsCount: 24,
    renewalsCount: 27,
    churnCount: 0
  },
  {
    date: '2026-02-25',
    dayLabel: 'Mer 25',
    proRevenue: 725,
    premiumRevenue: 637,
    totalSubscriptionRevenue: 1362,
    newSubscriptionsCount: 26,
    renewalsCount: 29,
    churnCount: 1
  },
  {
    date: '2026-02-26',
    dayLabel: 'Jeu 26',
    proRevenue: 783,
    premiumRevenue: 686,
    totalSubscriptionRevenue: 1469,
    newSubscriptionsCount: 28,
    renewalsCount: 31,
    churnCount: 0
  },
  {
    date: '2026-02-27',
    dayLabel: 'Ven 27',
    proRevenue: 841,
    premiumRevenue: 735,
    totalSubscriptionRevenue: 1576,
    newSubscriptionsCount: 31,
    renewalsCount: 33,
    churnCount: 1
  },
  {
    date: '2026-02-28',
    dayLabel: 'Sam 28',
    proRevenue: 899,
    premiumRevenue: 784,
    totalSubscriptionRevenue: 1683,
    newSubscriptionsCount: 33,
    renewalsCount: 35,
    churnCount: 0
  },
  {
    date: '2026-02-29',
    dayLabel: 'Aujourd\'hui',
    proRevenue: 609,
    premiumRevenue: 490,
    totalSubscriptionRevenue: 1099,
    newSubscriptionsCount: 20,
    renewalsCount: 22,
    churnCount: 0
  }
];

// ---------------------------------------------------------------------
// DONNÉES FINANCIÈRES : REVENUS ISSUS DE LA LIVRAISON CHARIOT (Affiliation & Formations)
// ---------------------------------------------------------------------
export const INITIAL_CHARIOT_DELIVERY_REVENUE_STATS: AdminChariotDeliveryRevenueStat[] = [
  {
    date: '2026-02-16',
    dayLabel: 'Lun 16',
    grossMerchandiseValue: 420,
    commissionsEarned: 168,
    ordersDeliveredCount: 7,
    averageCartValue: 60.00,
    topCourseTitle: 'Écriture de Livres & E-books'
  },
  {
    date: '2026-02-17',
    dayLabel: 'Mar 17',
    grossMerchandiseValue: 580,
    commissionsEarned: 242,
    ordersDeliveredCount: 9,
    averageCartValue: 64.44,
    topCourseTitle: 'Tunnels de Vente Haute Conversion'
  },
  {
    date: '2026-02-18',
    dayLabel: 'Mer 18',
    grossMerchandiseValue: 690,
    commissionsEarned: 295,
    ordersDeliveredCount: 11,
    averageCartValue: 62.72,
    topCourseTitle: 'Marketing d\'Affiliation Avancé'
  },
  {
    date: '2026-02-19',
    dayLabel: 'Jeu 19',
    grossMerchandiseValue: 840,
    commissionsEarned: 358,
    ordersDeliveredCount: 13,
    averageCartValue: 64.61,
    topCourseTitle: 'Bootcamp Amazon KDP'
  },
  {
    date: '2026-02-20',
    dayLabel: 'Ven 20',
    grossMerchandiseValue: 970,
    commissionsEarned: 412,
    ordersDeliveredCount: 15,
    averageCartValue: 64.66,
    topCourseTitle: 'Écriture de Livres & E-books'
  },
  {
    date: '2026-02-21',
    dayLabel: 'Sam 21',
    grossMerchandiseValue: 1150,
    commissionsEarned: 495,
    ordersDeliveredCount: 18,
    averageCartValue: 63.88,
    topCourseTitle: 'Tunnels de Vente Haute Conversion'
  },
  {
    date: '2026-02-22',
    dayLabel: 'Dim 22',
    grossMerchandiseValue: 1080,
    commissionsEarned: 462,
    ordersDeliveredCount: 16,
    averageCartValue: 67.50,
    topCourseTitle: 'Marketing d\'Affiliation Avancé'
  },
  {
    date: '2026-02-23',
    dayLabel: 'Lun 23',
    grossMerchandiseValue: 890,
    commissionsEarned: 382,
    ordersDeliveredCount: 14,
    averageCartValue: 63.57,
    topCourseTitle: 'Écriture de Livres & E-books'
  },
  {
    date: '2026-02-24',
    dayLabel: 'Mar 24',
    grossMerchandiseValue: 1240,
    commissionsEarned: 535,
    ordersDeliveredCount: 19,
    averageCartValue: 65.26,
    topCourseTitle: 'Bootcamp Amazon KDP'
  },
  {
    date: '2026-02-25',
    dayLabel: 'Mer 25',
    grossMerchandiseValue: 1380,
    commissionsEarned: 598,
    ordersDeliveredCount: 21,
    averageCartValue: 65.71,
    topCourseTitle: 'Tunnels de Vente Haute Conversion'
  },
  {
    date: '2026-02-26',
    dayLabel: 'Jeu 26',
    grossMerchandiseValue: 1490,
    commissionsEarned: 648,
    ordersDeliveredCount: 23,
    averageCartValue: 64.78,
    topCourseTitle: 'Marketing d\'Affiliation Avancé'
  },
  {
    date: '2026-02-27',
    dayLabel: 'Ven 27',
    grossMerchandiseValue: 1620,
    commissionsEarned: 705,
    ordersDeliveredCount: 25,
    averageCartValue: 64.80,
    topCourseTitle: 'Écriture de Livres & E-books'
  },
  {
    date: '2026-02-28',
    dayLabel: 'Sam 28',
    grossMerchandiseValue: 1750,
    commissionsEarned: 762,
    ordersDeliveredCount: 27,
    averageCartValue: 64.81,
    topCourseTitle: 'Bootcamp Amazon KDP'
  },
  {
    date: '2026-02-29',
    dayLabel: 'Aujourd\'hui',
    grossMerchandiseValue: 1120,
    commissionsEarned: 485,
    ordersDeliveredCount: 17,
    averageCartValue: 65.88,
    topCourseTitle: 'Écriture de Livres & E-books'
  }
];
