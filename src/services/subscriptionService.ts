import { UserProfile, Project } from '../types';

export interface PlanLimits {
  id: 'free' | 'pro' | 'premium';
  name: string;
  badge: string;
  maxActiveProjects: number;
  maxDailyAiQueries: number;
  maxChaptersPerBook: number;
  allowsDocxExport: boolean;
  allowsHdPdfExport: boolean;
  allowsCustomCover: boolean;
}

export const PLAN_LIMITS: Record<'free' | 'pro' | 'premium', PlanLimits> = {
  free: {
    id: 'free',
    name: 'Plan Gratuit',
    badge: 'Découverte',
    maxActiveProjects: 1, // STRICTEMENT 1 SEUL E-BOOK ACTIF
    maxDailyAiQueries: 5, // 5 requêtes IA / jour
    maxChaptersPerBook: 5,
    allowsDocxExport: true,
    allowsHdPdfExport: true,
    allowsCustomCover: false
  },
  pro: {
    id: 'pro',
    name: 'Plan Pro',
    badge: 'Populaire',
    maxActiveProjects: Infinity, // E-books illimités
    maxDailyAiQueries: 100, // 100 requêtes IA / jour
    maxChaptersPerBook: 25,
    allowsDocxExport: true,
    allowsHdPdfExport: true,
    allowsCustomCover: true
  },
  premium: {
    id: 'premium',
    name: 'Plan Premium',
    badge: 'VIP & Studio',
    maxActiveProjects: Infinity, // E-books illimités
    maxDailyAiQueries: 9999, // Requêtes IA illimitées
    maxChaptersPerBook: 50,
    allowsDocxExport: true,
    allowsHdPdfExport: true,
    allowsCustomCover: true
  }
};

export function getUserPlan(user?: Partial<UserProfile> | null): 'free' | 'pro' | 'premium' {
  if (!user || !user.plan) return 'free';
  if (user.plan === 'premium') return 'premium';
  if (user.plan === 'pro') return 'pro';
  return 'free'; // 'basic' and 'free' map to 'free'
}

export function getLimitsForUser(user?: Partial<UserProfile> | null): PlanLimits {
  const plan = getUserPlan(user);
  return PLAN_LIMITS[plan];
}

/**
 * Vérifie si l'utilisateur a le droit de créer un nouvel e-book selon les limites strictes de son abonnement.
 * Sur le Plan Gratuit : exactement 1 seul e-book actif autorisé.
 */
export function checkCanCreateProject(
  user: Partial<UserProfile> | null | undefined,
  existingProjectsCount: number
): { allowed: boolean; reason?: string; limitType?: 'active' | 'lifetime' | 'total' } {
  const plan = getUserPlan(user);
  const limits = PLAN_LIMITS[plan];

  if (existingProjectsCount >= limits.maxActiveProjects) {
    if (plan === 'free') {
      return {
        allowed: false,
        limitType: 'active',
        reason:
          'Limite du Plan Gratuit atteinte : vous avez droit à 1 seul e-book actif. Mettez à niveau vers le Plan Pro pour créer des e-books illimités, ou supprimez votre projet existant.'
      };
    }
    return {
      allowed: false,
      limitType: 'total',
      reason: `Limite de ${limits.maxActiveProjects} projets atteinte pour votre abonnement.`
    };
  }

  return { allowed: true };
}

/**
 * Vérifie si l'utilisateur peut effectuer une requête IA aujourd'hui selon son plan.
 */
export function checkCanUseAi(user: Partial<UserProfile> | null): {
  allowed: boolean;
  remainingToday: number;
  reason?: string;
} {
  const plan = getUserPlan(user);
  const limits = PLAN_LIMITS[plan];
  const todayStr = new Date().toISOString().split('T')[0];

  // Si la date a changé, le quota d'aujourd'hui repart à 0
  const isToday = user?.createdAt === todayStr || (user as any)?.lastAiUsageDate === todayStr;
  const currentCount = isToday ? (user?.dailyChatbotCount || 0) : 0;
  const remaining = Math.max(0, limits.maxDailyAiQueries - currentCount);

  if (currentCount >= limits.maxDailyAiQueries) {
    return {
      allowed: false,
      remainingToday: 0,
      reason:
        plan === 'free'
          ? 'Quota quotidien de 5 requêtes IA atteint pour le Plan Gratuit. Mettez à niveau vers le Plan Pro pour profiter de 100 requêtes/jour !'
          : 'Quota quotidien de requêtes IA atteint pour aujourd\'hui.'
    };
  }

  return {
    allowed: true,
    remainingToday: remaining
  };
}

/**
 * Incrémente le compteur d'utilisation IA de l'utilisateur.
 */
export function incrementAiCount(user: UserProfile): UserProfile {
  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = (user as any).lastAiUsageDate === todayStr;
  const newCount = isToday ? (user.dailyChatbotCount || 0) + 1 : 1;

  const updated: UserProfile = {
    ...user,
    dailyChatbotCount: newCount,
    ...({ lastAiUsageDate: todayStr } as any)
  };

  try {
    localStorage.setItem('bookly_user', JSON.stringify(updated));
  } catch {
    // Ignore storage issues
  }

  return updated;
}

/**
 * Vérifie si l'utilisateur est éligible à la fonctionnalité exclusive :
 * "Génération d'Images d'Illustration Intérieures pour les Chapitres"
 * Règle stricte exigée :
 * "Pour les abonnements ayant la plus grande valeur, les abonnements à 15000 francs et pour une souscription minimum de 3 mois."
 * - Plan Premium (15 000 FCFA/mois)
 * - Souscription d'au moins 3 mois : billingCycle 'quarterly' (3 mois) ou 'yearly' (1 an)
 * - Les comptes administrateurs ont également un accès de test complet.
 */
export function checkCanGenerateChapterIllustrations(user?: Partial<UserProfile> | null): {
  allowed: boolean;
  reason?: string;
  isPremium: boolean;
  hasMinDuration: boolean;
  currentCycle?: string;
} {
  if (user?.isAdmin) {
    return {
      allowed: true,
      isPremium: true,
      hasMinDuration: true,
      currentCycle: user?.planBilling || 'quarterly'
    };
  }

  const plan = getUserPlan(user);
  const isPremium = plan === 'premium';
  const billingCycle = user?.planBilling || 'monthly';
  const hasMinDuration = billingCycle === 'quarterly' || billingCycle === 'yearly';

  if (!isPremium) {
    return {
      allowed: false,
      isPremium: false,
      hasMinDuration: false,
      currentCycle: billingCycle,
      reason:
        "La génération d'illustrations intérieures de chapitres par l'IA est une exclusivité Prestige réservée aux abonnements Premium (15 000 FCFA/mois) avec une souscription minimale de 3 mois."
    };
  }

  if (!hasMinDuration) {
    return {
      allowed: false,
      isPremium: true,
      hasMinDuration: false,
      currentCycle: billingCycle,
      reason:
        "Votre compte est actuellement souscrit au Plan Premium Mensuel (1 mois). La génération automatique des illustrations de chapitres requiert une souscription d'au moins 3 mois (Trimestriel ou Annuel)."
    };
  }

  return {
    allowed: true,
    isPremium: true,
    hasMinDuration: true,
    currentCycle: billingCycle
  };
}
