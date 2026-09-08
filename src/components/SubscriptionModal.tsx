import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  Sparkles,
  ShieldCheck,
  Lock,
  Flame,
  Building2,
  Zap,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  CreditCard,
  Smartphone,
  ChevronLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpgradeSuccess: (updatedUser: UserProfile) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  initialPlan?: 'pro' | 'premium';
  initialCycle?: 'monthly' | 'quarterly' | 'yearly';
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpgradeSuccess,
  onShowToast,
  initialPlan = 'pro',
  initialCycle = 'monthly'
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'premium'>(initialPlan);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>(initialCycle);
  const [step, setStep] = useState<'select' | 'saspay_modal' | 'success'>('select');

  // Saspay Session & Interactive Modal State
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSimulatingTest, setIsSimulatingTest] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pollIntervalRef = useRef<any>(null);

  // Sync initial plan and cycle if they change
  useEffect(() => {
    if (initialPlan) {
      setSelectedPlan(initialPlan);
    }
  }, [initialPlan]);

  useEffect(() => {
    if (initialCycle) {
      setBillingCycle(initialCycle);
    }
  }, [initialCycle]);

  // Pricing calculation
  const getPrice = (plan: 'pro' | 'premium') => {
    if (plan === 'pro') {
      if (billingCycle === 'yearly') return { monthly: 3120, total: 37440, label: '37 440 FCFA / an' };
      if (billingCycle === 'quarterly') return { monthly: 3510, total: 10530, label: '10 530 FCFA / 3 mois' };
      return { monthly: 3900, total: 3900, label: '3 900 FCFA / mois' };
    }
    // Premium
    if (billingCycle === 'yearly') return { monthly: 12000, total: 144000, label: '144 000 FCFA / an' };
    if (billingCycle === 'quarterly') return { monthly: 13500, total: 40500, label: '40 500 FCFA / 3 mois' };
    return { monthly: 15000, total: 15000, label: '15 000 FCFA / mois' };
  };

  const activePricing = getPrice(selectedPlan);
  const currentPlan = user.plan || 'free';

  // Complete upgrade after successful Saspay verification
  const completeUpgrade = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    setStep('success');

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // Confetti fallback
    }

    const renewsLabel =
      billingCycle === 'quarterly'
        ? 'Dans 3 mois (Trimestriel)'
        : billingCycle === 'yearly'
        ? 'Dans 1 an (Annuel)'
        : 'Dans 30 jours (Mensuel)';

    const updated: UserProfile = {
      ...user,
      plan: selectedPlan,
      planBilling: billingCycle,
      planRenewsAt: renewsLabel
    };

    onUpgradeSuccess(updated);
    onShowToast(
      'Paiement Saspay Validé !',
      `Félicitations, votre abonnement ${selectedPlan.toUpperCase()} est désormais actif sans restriction.`,
      'success'
    );
  };

  // Launch the interactive Saspay modal pop-up directly in the flow (no external redirect)
  const handleLaunchSaspayPayment = async (plan: 'pro' | 'premium') => {
    setSelectedPlan(plan);
    setErrorMessage(null);
    setIsCreatingSession(true);
    setIframeLoaded(false);
    setStep('saspay_modal');

    try {
      const customerEmail = user.email || 'auteur@bookly.studio';
      const customerName = user.name || 'Auteur Bookly';
      const returnUrl = `${window.location.origin}/?payment_status=success`;

      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan,
          billingCycle,
          customerEmail,
          customerName,
          returnUrl
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.session) {
        throw new Error(result.error || 'Impossible d\'initialiser la session de paiement Saspay.');
      }

      const session = result.session;
      setSessionId(session.id);
      setCheckoutUrl(session.checkout_url);
    } catch (err: any) {
      console.error('Erreur lancement Saspay:', err);
      setErrorMessage(err.message || 'Erreur lors de la connexion à la passerelle Saspay.');
      onShowToast('Erreur Saspay', err.message || 'Échec de connexion.', 'error');
    } finally {
      setIsCreatingSession(false);
    }
  };

  // Check transaction status on Saspay backend
  const checkPaymentStatus = async (silent: boolean = false) => {
    if (!sessionId) return;
    if (!silent) setIsVerifying(true);

    try {
      const res = await fetch(`/api/payments/verify/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        const status = data.session?.status;
        if (status === 'SUCCESS' || status === 'PAID' || status === 'COMPLETED') {
          completeUpgrade();
          return;
        }
      }

      if (!silent) {
        onShowToast(
          'Statut Saspay',
          'Paiement en attente de validation. Veuillez renseigner vos identifiants dans la modale Saspay.',
          'info'
        );
      }
    } catch (err) {
      if (!silent) {
        onShowToast('Vérification', 'Impossible d\'interroger le serveur Saspay pour l\'instant.', 'error');
      }
    } finally {
      if (!silent) setIsVerifying(false);
    }
  };

  // Test sandbox confirmation for development/testing without real funds
  const handleSimulateTestValidation = async () => {
    if (!sessionId) return;
    setIsSimulatingTest(true);
    try {
      const res = await fetch(`/api/payments/simulate-success/${sessionId}`, { method: 'POST' });
      if (res.ok) {
        completeUpgrade();
      } else {
        throw new Error('Échec de la simulation');
      }
    } catch (err: any) {
      onShowToast('Mode Test', err.message || 'Erreur simulation test', 'error');
    } finally {
      setIsSimulatingTest(false);
    }
  };

  // Real-time polling when interactive Saspay modal is open
  useEffect(() => {
    if (step === 'saspay_modal' && sessionId && checkoutUrl) {
      // Poll every 2.5s for seamless automatic detection
      pollIntervalRef.current = setInterval(() => {
        checkPaymentStatus(true);
      }, 2500);

      // Listen for window message events if Saspay iframe emits completion
      const handleWindowMessage = (event: MessageEvent) => {
        try {
          if (
            event.data?.type === 'saspay:success' ||
            event.data?.status === 'SUCCESS' ||
            event.data?.status === 'PAID'
          ) {
            checkPaymentStatus(false);
          }
        } catch {
          // Ignore foreign events
        }
      };

      window.addEventListener('message', handleWindowMessage);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        window.removeEventListener('message', handleWindowMessage);
      };
    }
  }, [step, sessionId, checkoutUrl, selectedPlan, billingCycle]);

  // Clean up on unmount or close
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      id="subscription-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="subscription-modal-container"
        className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col transition-all duration-300 ${
          step === 'saspay_modal' ? 'max-w-2xl max-h-[95vh]' : 'max-w-4xl max-h-[92vh]'
        }`}
      >
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shrink-0" />

        {/* Global Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-20"
          aria-label="Fermer la fenêtre"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: PLAN SELECTION & EXCLUSIVE SASPAY PRESENTATION */}
        {step === 'select' && (
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
            {/* Header */}
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Formules & Abonnements Officiels</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Passez à la vitesse supérieure
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Activez vos fonctionnalités premium en toute sécurité via la passerelle de paiement officielle <span className="font-bold text-indigo-600 dark:text-indigo-400">Saspay</span>.
              </p>

              {/* Billing Cycle Toggle */}
              <div className="pt-2 flex justify-center">
                <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      billingCycle === 'monthly'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Mensuel
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('quarterly')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                      billingCycle === 'quarterly'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>3 Mois</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 font-bold">-10%</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                      billingCycle === 'yearly'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Annuel (1 an)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 font-bold">-20%</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Exclusive Gateway Notice */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>
                  <strong className="font-semibold">Saspay est la seule passerelle active</strong> pour valider les comptes Pro et Premium.
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Wave</span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Orange Money</span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">MTN &bull; Moov</span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Cartes Visa &bull; Mastercard</span>
              </div>
            </div>

            {/* Plans Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
              {/* 1. Plan Gratuit */}
              <div
                className={`p-5 rounded-3xl border flex flex-col justify-between ${
                  currentPlan === 'free' || currentPlan === 'basic'
                    ? 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Inclus à l'inscription
                    </span>
                    {(currentPlan === 'free' || currentPlan === 'basic') && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                        Actuel
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Plan Gratuit</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Fonctionnalités de base pour débuter l'écriture.
                    </p>
                  </div>

                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    0 FCFA <span className="text-xs font-normal text-slate-400">/ mois</span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>1 projet d'e-book actif</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>5 requêtes IA / jour</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Éditeur de texte & mode focus</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Accès bibliothèque publique</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-5">
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-semibold cursor-not-allowed"
                  >
                    {currentPlan === 'free' || currentPlan === 'basic' ? 'Votre Plan Actuel' : 'Plan Découverte'}
                  </button>
                </div>
              </div>

              {/* 2. Plan Pro (Populaire) */}
              <div className="p-6 rounded-3xl border-2 border-indigo-500 bg-gradient-to-b from-indigo-50/40 via-white to-purple-50/20 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 flex flex-col justify-between relative shadow-lg shadow-indigo-500/10">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs flex items-center gap-1">
                  <Flame className="w-3 h-3" /> Recommandé
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Auteur & Créateur
                    </span>
                    {currentPlan === 'pro' && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold">
                        Actif
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Plan Pro</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Idéal pour publier régulièrement sans contrainte.
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {getPrice('pro').monthly.toLocaleString('fr-FR')} FCFA <span className="text-xs font-normal text-slate-500">/ mois</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">{getPrice('pro').label}</p>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-200 pt-2 border-t border-indigo-100 dark:border-indigo-900/60 font-medium">
                    <li className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span className="font-semibold">Projets d'e-books illimités</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>50 à 100 requêtes IA / jour</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Exports propres sans filigrane</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Exports PDF Haute Définition & Word</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Couvertures & Thèmes exclusifs</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-5">
                  <button
                    type="button"
                    id="btn-saspay-checkout-pro"
                    onClick={() => handleLaunchSaspayPayment('pro')}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Payer avec Saspay ({getPrice('pro').monthly.toLocaleString('fr-FR')} FCFA)</span>
                  </button>
                </div>
              </div>

              {/* 3. Plan Premium (VIP) */}
              <div
                className={`p-5 rounded-3xl border flex flex-col justify-between ${
                  currentPlan === 'premium'
                    ? 'border-purple-500 bg-purple-500/5 dark:bg-purple-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> Entreprise & VIP
                    </span>
                    {currentPlan === 'premium' && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-bold">
                        Actif
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Plan Premium</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Puissance maximale, catalogue complet et support prioritaire.
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {getPrice('premium').monthly.toLocaleString('fr-FR')} FCFA <span className="text-xs font-normal text-slate-400">/ mois</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">{getPrice('premium').label}</p>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <li className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-semibold bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>Illustrations IA HD intérieures au début de chaque chapitre (Dès 3 mois)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span className="font-semibold text-slate-900 dark:text-white">Tout ce qui est dans Pro</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>IA Illimitée (0 restriction de volume)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>Accès prioritaire aux modèles Groq & Gemini</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>Exports formats Imprimeur & ePub</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>Support VIP dédié 7j/7</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-5">
                  <button
                    type="button"
                    id="btn-saspay-checkout-premium"
                    onClick={() => handleLaunchSaspayPayment('premium')}
                    className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Payer avec Saspay ({getPrice('premium').monthly.toLocaleString('fr-FR')} FCFA)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: INTERACTIVE SASPAY POP-UP MODAL (DIRECTLY IN-APP WITHOUT EXTERNAL REDIRECT) */}
        {step === 'saspay_modal' && (
          <div className="flex flex-col h-full flex-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Saspay Modal Top Navigation & Details */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                    setStep('select');
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                  title="Revenir au choix de formule"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      Paiement Sécurisé Saspay
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                      selectedPlan === 'premium' ? 'bg-purple-600 text-white' : 'bg-indigo-600 text-white'
                    }`}>
                      Plan {selectedPlan.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Règlement immédiat par Mobile Money (Wave, Orange, MTN, Moov) ou Carte bancaire
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 pr-8">
                <div className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400">
                  {activePricing.total.toLocaleString('fr-FR')} FCFA
                </div>
                <div className="text-[10px] text-slate-400">
                  {billingCycle === 'yearly' ? 'Facturé annuellement' : billingCycle === 'quarterly' ? 'Facturé par 3 mois' : 'Facturation mensuelle'}
                </div>
              </div>
            </div>

            {/* Main Interactive Saspay Modal Viewport */}
            <div className="flex-1 relative bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center min-h-[460px] sm:min-h-[520px] overflow-hidden">
              {/* If Session is creating or loading */}
              {isCreatingSession && (
                <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Initialisation de la passerelle Saspay...
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Génération du formulaire de paiement interactif sécurisé.
                    </p>
                  </div>
                </div>
              )}

              {/* If Error during session creation */}
              {errorMessage && !isCreatingSession && (
                <div className="p-6 max-w-md mx-auto text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Impossible de charger Saspay
                    </h4>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {errorMessage}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLaunchSaspayPayment(selectedPlan)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-500 transition-all"
                  >
                    Réessayer la connexion
                  </button>
                </div>
              )}

              {/* Embedded Interactive Saspay Checkout (Direct In-App Modal Frame) */}
              {checkoutUrl && !errorMessage && !isCreatingSession && (
                <div className="w-full h-full relative flex-1 flex flex-col">
                  {!iframeLoaded && (
                    <div className="absolute inset-0 z-10 bg-white/90 dark:bg-slate-900/90 flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        Chargement de l'interface sécurisée Saspay...
                      </p>
                    </div>
                  )}

                  <iframe
                    id="saspay-checkout-iframe"
                    src={checkoutUrl}
                    title="Saspay Interactive Checkout"
                    allow="payment; clipboard-write; camera"
                    onLoad={() => setIframeLoaded(true)}
                    className="w-full h-full flex-1 border-0 min-h-[480px] sm:min-h-[540px]"
                  />
                </div>
              )}
            </div>

            {/* Interactive Control & Real-Time Sync Bar */}
            <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-[11px] font-medium">
                  {isVerifying ? 'Vérification en temps réel...' : 'Écoute active & validation automatique...'}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Manual verification button */}
                <button
                  type="button"
                  id="btn-verify-saspay-payment"
                  onClick={() => checkPaymentStatus(false)}
                  disabled={isVerifying}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-indigo-500' : ''}`} />
                  <span>Vérifier le paiement</span>
                </button>

                {/* Sandbox / Test confirmation button for development verification */}
                <button
                  type="button"
                  id="btn-sandbox-test-validate"
                  onClick={handleSimulateTestValidation}
                  disabled={isSimulatingTest}
                  className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/80 transition-all flex items-center justify-center gap-1.5"
                  title="Simule la réussite de la transaction Saspay en mode test"
                >
                  {isSimulatingTest ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Valider le test Saspay (Sandbox)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 'success' && (
          <div className="p-6 sm:p-10 text-center space-y-5 max-w-md mx-auto animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mb-2">
                Paiement Saspay Confirmé
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Félicitations ! Votre Plan {selectedPlan.toUpperCase()} est actif
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                La passerelle Saspay a validé votre transaction. Toutes les fonctionnalités avancées sont débloquées.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Formule validée :</span>
                <span className="font-bold text-slate-900 dark:text-white">Plan {selectedPlan.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Période d'abonnement :</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {billingCycle === 'yearly' ? 'Annuel (12 mois)' : billingCycle === 'quarterly' ? 'Trimestriel (3 mois)' : 'Mensuel (1 mois)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Passerelle de règlement :</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Saspay Officiel</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Statut du compte :</span>
                <span className="font-bold text-emerald-600">Actif &bull; Prêt à l'emploi</span>
              </div>
            </div>

            <button
              type="button"
              id="btn-close-subscription-success"
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Accéder à mon Studio d'écriture</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
