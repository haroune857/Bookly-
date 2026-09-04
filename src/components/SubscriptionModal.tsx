import React, { useState } from 'react';
import {
  X,
  Check,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Lock,
  Flame,
  Building2,
  Zap,
  ArrowRight,
  CheckCircle2,
  Smartphone
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
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpgradeSuccess,
  onShowToast,
  initialPlan = 'pro'
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'premium'>(initialPlan);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [step, setStep] = useState<'select' | 'checkout' | 'success'>('select');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_money' | 'apple_pay'>('card');
  
  // Checkout Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState(user.name || '');
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileProvider, setMobileProvider] = useState<'orange' | 'wave' | 'moov' | 'mtn'>('orange');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const currentPlan = user.plan || 'basic';

  // Format Card Number
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const parts = value.match(/[\s\S]{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  // Format Expiry
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  // Pricing calculation
  const getPrice = (plan: 'basic' | 'pro' | 'premium') => {
    if (plan === 'basic') return { monthly: 0, total: 0, label: '0 FCFA' };
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

  const handleStartCheckout = (plan: 'pro' | 'premium') => {
    setSelectedPlan(plan);
    setStep('checkout');
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });

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
        'Paiement validé avec succès !',
        `Votre compte bénéficie désormais du Plan ${selectedPlan.toUpperCase()}.`,
        'success'
      );
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="subscription-modal-container"
        className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {step === 'select' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Abonnements & Forfaits</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Passez à la vitesse supérieure
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Débloquez la génération illimitée de chapitres, les exports haute fidélité et les couvertures exclusives.
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

              {/* Plans Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                {/* 1. Plan Gratuit */}
                <div className={`p-5 rounded-3xl border flex flex-col justify-between ${
                  currentPlan === 'basic' || currentPlan === 'free'
                    ? 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Inclus à l'inscription
                      </span>
                      {(currentPlan === 'basic' || currentPlan === 'free') && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                          Actuel
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Plan Gratuit</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Fonctionnalités de base pour démarrer.
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
                      {(currentPlan === 'basic' || currentPlan === 'free') ? 'Votre Plan Actuel' : 'Plan Découverte'}
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
                      id="btn-upgrade-pro"
                      onClick={() => handleStartCheckout('pro')}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{currentPlan === 'pro' ? 'Renouveler / Modifier' : 'Choisir le Plan Pro'}</span>
                    </button>
                  </div>
                </div>

                {/* 3. Plan Premium (VIP) */}
                <div className={`p-5 rounded-3xl border flex flex-col justify-between ${
                  currentPlan === 'premium'
                    ? 'border-purple-500 bg-purple-500/5 dark:bg-purple-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300'
                }`}>
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
                        Puissance maximale et catalogue complet.
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {getPrice('premium').monthly.toLocaleString('fr-FR')} FCFA <span className="text-xs font-normal text-slate-400">/ mois</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">{getPrice('premium').label}</p>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span className="font-semibold text-slate-900 dark:text-white">Tout ce qui est dans Pro</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span>IA Illimitée (0 restriction)</span>
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
                        <span>Support dédié 7j/7</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-5">
                    <button
                      type="button"
                      id="btn-upgrade-premium"
                      onClick={() => handleStartCheckout('premium')}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{currentPlan === 'premium' ? 'Plan Actif' : 'Choisir le Plan Premium'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CHECKOUT STEP */}
          {step === 'checkout' && (
            <div className="space-y-6 max-w-xl mx-auto animate-in fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <button
                    type="button"
                    onClick={() => setStep('select')}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    &larr; Changer de formule
                  </button>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    Finaliser votre souscription : Plan {selectedPlan.toUpperCase()}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {activePricing.total.toLocaleString('fr-FR')} FCFA
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {billingCycle === 'yearly' ? 'Facturé annuellement' : billingCycle === 'quarterly' ? 'Facturé par 3 mois' : 'Facturation mensuelle'}
                  </p>
                </div>
              </div>

              {/* Payment Methods Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mode de règlement
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-2xs font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Carte Bancaire</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mobile_money')}
                    className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'mobile_money'
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-2xs font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Mobile Money</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'apple_pay'
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-2xs font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    <span>Apple / Google Pay</span>
                  </button>
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={handleProcessPayment} className="space-y-4">
                {paymentMethod === 'card' && (
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Nom sur la carte
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Jean Dupont"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Numéro de carte bancaire
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4242 •••• •••• 4242"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                        />
                        <div className="absolute right-3 top-2.5 flex items-center gap-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">VISA</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">MC</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Date d'expiration
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/AA"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          CVC / CVV
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                          placeholder="123"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'mobile_money' && (
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Opérateur Mobile
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'orange', label: 'Orange' },
                          { id: 'wave', label: 'Wave' },
                          { id: 'moov', label: 'Moov' },
                          { id: 'mtn', label: 'MTN' }
                        ].map((op) => (
                          <button
                            key={op.id}
                            type="button"
                            onClick={() => setMobileProvider(op.id as any)}
                            className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                              mobileProvider === op.id
                                ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {op.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Numéro de téléphone Mobile Money
                      </label>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="+225 07 •• •• •• ••"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'apple_pay' && (
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center space-y-2">
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Votre portefeuille électronique Apple Pay / Google Pay sera débité de manière sécurisée en 1 clic.
                    </p>
                  </div>
                )}

                {/* Security Guarantee Badge */}
                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Paiement crypté SSL 256 bits &bull; Annulation sans frais à tout moment</span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Traitement sécurisé en cours...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Confirmer &amp; Payer {activePricing.total.toLocaleString('fr-FR')} FCFA</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* SUCCESS STEP */}
          {step === 'success' && (
            <div className="text-center py-6 space-y-4 max-w-md mx-auto animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Félicitations ! Votre Plan {selectedPlan.toUpperCase()} est actif
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Vous avez désormais un accès complet aux outils avancés de Bookly Studio.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Formule :</span>
                  <span className="font-bold text-slate-900 dark:text-white">Plan {selectedPlan.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Période :</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {billingCycle === 'yearly' ? 'Annuel (12 mois)' : billingCycle === 'quarterly' ? 'Trimestriel (3 mois)' : 'Mensuel (1 mois)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Statut :</span>
                  <span className="font-bold text-emerald-600">Actif &bull; Prêt à l'emploi</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Accéder à mon Studio d'écriture</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
