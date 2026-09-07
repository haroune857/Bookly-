import React, { useState } from 'react';
import {
  User,
  Sun,
  Moon,
  Save,
  CheckCircle2,
  Sparkles,
  Palette,
  CreditCard,
  Check,
  Zap,
  Building2,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  Flame,
  Star,
  Lock,
  LogOut,
  Clock
} from 'lucide-react';
import { UserProfile, AppSettings } from '../types';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  isAdminUnlocked?: boolean;
  onUnlockAdmin?: () => void;
  onLockAdmin?: () => void;
  onNavigateToAdmin?: () => void;
  onOpenAuthModal?: () => void;
  onSwitchAccount?: (account: UserProfile) => void;
  onOpenSubscriptionModal?: (plan?: 'pro' | 'premium') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateUser,
  settings,
  onUpdateSettings,
  onShowToast,
  isAdminUnlocked = false,
  onUnlockAdmin = () => {},
  onLockAdmin = () => {},
  onNavigateToAdmin = () => {},
  onOpenAuthModal = () => {},
  onSwitchAccount = () => {},
  onOpenSubscriptionModal = () => {}
}) => {
  const [activeTab, setActiveTab] = useState<'profil' | 'tarifs' | 'theme'>('profil');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  // Profil Local State
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio);
  const [role, setRole] = useState(user.role);
  const [avatarBg, setAvatarBg] = useState(user.avatarBg || 'linear-gradient(135deg, #4f46e5, #6366f1)');

  const currentPlan = user.plan === 'free' ? 'basic' : (user.plan || 'basic');

  const avatarGradients = [
    'linear-gradient(135deg, #4f46e5, #6366f1)',
    'linear-gradient(135deg, #2563eb, #38bdf8)',
    'linear-gradient(135deg, #059669, #10b981)',
    'linear-gradient(135deg, #d97706, #f59e0b)',
    'linear-gradient(135deg, #e11d48, #fb7185)',
    'linear-gradient(135deg, #0f172a, #334155)'
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name,
      email,
      bio,
      role,
      avatarBg
    });
    onShowToast('Profil mis à jour', 'Vos informations ont été enregistrées avec succès.', 'success');
  };

  const handleSelectPlan = (planKey: 'basic' | 'pro' | 'premium') => {
    if (planKey === currentPlan) {
      onShowToast('Plan Actif', `Vous bénéficiez déjà de la formule ${planKey.toUpperCase()}.`, 'info');
      return;
    }

    if (planKey === 'basic') {
      onUpdateUser({
        ...user,
        plan: 'free',
        planBilling: 'monthly',
        planRenewsAt: 'Plan Gratuit'
      });
      onShowToast('Plan Gratuit', 'Vous êtes repassé au Plan Gratuit.', 'info');
      return;
    }

    // Open full checkout modal for Pro or Premium
    onOpenSubscriptionModal(planKey);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Paramètres & Compte
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gérez vos informations de profil, votre abonnement et vos préférences de studio.
          </p>
        </div>

        {/* Global Save Button when on profile tab */}
        {activeTab === 'profil' && (
          <button
            type="button"
            id="btn-save-profile-top"
            onClick={handleSaveProfile}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les modifications</span>
          </button>
        )}
      </div>

      {/* Settings Navigation Tabs (Profil, Tarifs, Thème) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          id="tab-settings-profil"
          onClick={() => setActiveTab('profil')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'profil'
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profil & Compte</span>
        </button>

        <button
          type="button"
          id="tab-settings-tarifs"
          onClick={() => setActiveTab('tarifs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tarifs'
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Abonnements & Tarifs</span>
          {currentPlan !== 'premium' && (
            <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[9px] font-extrabold uppercase">
              Upgrade
            </span>
          )}
        </button>

        <button
          type="button"
          id="tab-settings-theme"
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'theme'
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Thème d'affichage</span>
        </button>
      </div>

      {/* TAB 1: Profil & Identité Auteur */}
      {activeTab === 'profil' && (
        <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in duration-200">
          
          {/* Card 1: Avatar & Informations Publiques */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0 transition-transform hover:scale-105"
                style={{ background: avatarBg }}
              >
                {name.charAt(0).toUpperCase()}
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {name || 'Votre Nom'}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                    Plan {user.plan === 'premium' ? 'Premium' : user.plan === 'pro' ? 'Pro' : 'Gratuit'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Choisissez une nuance pour personnaliser votre avatar d'auteur Bookly Studio.
                </p>

                {/* Avatar Color Picker */}
                <div className="flex items-center gap-2 pt-1">
                  {avatarGradients.map((grad, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setAvatarBg(grad)}
                      className={`w-7 h-7 rounded-xl shadow-xs transition-all ${
                        avatarBg === grad ? 'ring-2 ring-indigo-600 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ background: grad }}
                      aria-label={`Nuance avatar ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Profile fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nom d'auteur / Pseudonyme
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom complet"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Adresse Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@domaine.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Titre / Spécialité
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Ex: Auteur de fiction, Expert Marketing, Formateur..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Biographie courte
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Présentez brièvement vos univers littéraires et projets..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* AUTHENTICATION & SUBSCRIPTION SUMMARY CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/60">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Compte & Authentification
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Statut de connexion et formule active
                  </p>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                user.authProvider === 'google'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
              }`}>
                {user.authProvider === 'google' ? 'Google Auth Synchronisé' : 'Email & Mot de passe'}
              </span>
            </div>

            {/* Account Information Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Compte Connecté</p>
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">{user.email}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Identifiant : {user.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenAuthModal()}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  Changer de compte
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Formule Actuelle</p>
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">
                    Plan {user.plan === 'premium' ? 'Premium (VIP)' : user.plan === 'pro' ? 'Pro (Illimité)' : 'Gratuit (Découverte)'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {user.planRenewsAt || 'Accès actif'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenSubscriptionModal(user.plan === 'pro' ? 'premium' : 'pro')}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{user.plan === 'premium' ? 'Gérer' : 'Mettre à niveau'}</span>
                </button>
              </div>
            </div>

            {/* If Logged in as Admin: show direct shortcut */}
            {(isAdminUnlocked || user.isAdmin) && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/40 dark:border-amber-700/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs font-extrabold text-amber-900 dark:text-amber-200">
                      Session Super Administrateur Active
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300">
                      Vous avez accès à la console de gestion globale de Bookly Studio.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onNavigateToAdmin}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Ouvrir la Console Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={onLockAdmin}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
                    title="Verrouiller la session admin"
                  >
                    <Lock className="w-4 h-4 text-amber-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      )}

      {/* TAB 2: Tarification & Abonnements (Gratuit, Pro, Premium) */}
      {activeTab === 'tarifs' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Header & Billing Cycle Selector */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-200/60 dark:border-indigo-800">
              Formules & Tarifs Bookly Studio
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Libérez tout le potentiel de votre écriture
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Choisissez l'abonnement adapté à vos ambitions : commencez gratuitement et passez à Pro ou Premium quand vous le souhaitez.
            </p>

            {/* Toggle Monthly / Quarterly (3 months) / Yearly */}
            <div className="pt-3 flex items-center justify-center">
              <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs flex-wrap justify-center gap-1.5 sm:gap-2">
                
                {/* 1 Mois - Mensuel */}
                <button
                  type="button"
                  id="btn-billing-monthly"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    billingCycle === 'monthly'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>Mensuel</span>
                  <span className="text-[10px] text-slate-400 font-normal">(1 mois)</span>
                </button>

                {/* 3 Mois - Trimestriel (-10%) */}
                <button
                  type="button"
                  id="btn-billing-quarterly"
                  onClick={() => setBillingCycle('quarterly')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                    billingCycle === 'quarterly'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold border border-indigo-200/80 dark:border-indigo-800/60'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="font-bold">3 Mois</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold border border-amber-500/30 shadow-2xs">
                    -10% Réduction
                  </span>
                </button>

                {/* 12 Mois - Annuel (-20%) */}
                <button
                  type="button"
                  id="btn-billing-yearly"
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                    billingCycle === 'yearly'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold border border-emerald-200/80 dark:border-emerald-800/60'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="font-bold">Annuel (1 an)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30 shadow-2xs">
                    -20% Réduction
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* The 3 Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            
            {/* 1. FORMULE BASIQUE (GRATUITE) */}
            <div className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 flex flex-col justify-between shadow-xs transition-all ${
              currentPlan === 'basic' ? 'border-slate-400 dark:border-slate-600 ring-2 ring-slate-400/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Version Découverte
                    </span>
                    {currentPlan === 'basic' && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-bold">
                        Actif
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    Formule Basique
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Idéale pour découvrir Bookly Studio et tester la rédaction avec l'IA.
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                    0 FCFA
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    / mois
                  </span>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <p className="font-semibold text-slate-900 dark:text-white text-[11px] uppercase tracking-wide">
                    Services réservés à cette formule :
                  </p>
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                        💬
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">Chatbot Intégré (Découverte) :</span>
                        <span className="text-slate-600 dark:text-slate-400 block text-[11px] mt-0.5">5-10 requêtes par jour avec IA standard.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                        📖
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">Générateur d'e-books :</span>
                        <span className="text-slate-600 dark:text-slate-400 block text-[11px] mt-0.5">1 projet d'e-book d'essai actif.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-slate-600 dark:text-slate-400">Éditeur de texte complet avec mode focus</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-slate-600 dark:text-slate-400">Bibliothèque communautaire</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <button
                  id="btn-select-basic"
                  onClick={() => handleSelectPlan('basic')}
                  disabled={currentPlan === 'basic'}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                    currentPlan === 'basic'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-default'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {currentPlan === 'basic' ? 'Formule Actuelle' : 'Choisir la Formule Basique'}
                </button>
              </div>
            </div>

            {/* 2. FORMULE PRO (3 900 FCFA) */}
            <div className="relative bg-gradient-to-b from-indigo-50/50 via-white to-purple-50/30 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/20 border-2 border-indigo-500 dark:border-indigo-500 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl shadow-indigo-500/10 lg:-translate-y-2">
              
              {/* Top Banner Tag */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5" />
                <span>La Plus Populaire &bull; Recommandé</span>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      Auteur &amp; Créateur Pro
                    </span>
                    {currentPlan === 'pro' && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold">
                        Actif
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    Formule Pro
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-medium">
                    La solution complète pour publier des livres et guides sans contraintes.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {billingCycle === 'yearly'
                        ? '3 120 FCFA'
                        : billingCycle === 'quarterly'
                        ? '3 510 FCFA'
                        : '3 900 FCFA'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      / mois
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {billingCycle === 'yearly' && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Facturé 37 440 FCFA pour 12 mois (-20%)</span>
                    )}
                    {billingCycle === 'quarterly' && (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">Facturé 10 530 FCFA pour 3 mois (-10%)</span>
                    )}
                    {billingCycle === 'monthly' && 'Facturation mensuelle sans engagement'}
                  </p>
                </div>

                <div className="border-t border-indigo-100 dark:border-indigo-900/60 pt-4 space-y-3 text-xs text-slate-700 dark:text-slate-200">
                  <p className="font-bold text-indigo-600 dark:text-indigo-400 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Services réservés à cette formule :
                  </p>
                  <ul className="space-y-2.5 font-medium">
                    <li className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-950 dark:text-white">Projets illimités :</span>
                        <span className="text-slate-600 dark:text-slate-300 block text-[11px] mt-0.5">Créez et éditez autant d'e-books que souhaité.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-950 dark:text-white">Chatbot IA (Usage régulier) :</span>
                        <span className="text-slate-600 dark:text-slate-300 block text-[11px] mt-0.5">50 à 100 requêtes/jour et historique persistant.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-200">Exports haute résolution (sans filigrane)</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-200">Couvertures & Thèmes graphiques exclusifs</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <button
                  id="btn-select-pro"
                  onClick={() => handleSelectPlan('pro')}
                  className={`w-full py-3 px-5 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                    currentPlan === 'pro'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/25'
                      : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white shadow-indigo-500/30 active:scale-[0.98]'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {currentPlan === 'pro' ? 'Formule Actuelle' : 'Payer avec Saspay (Plan Pro)'}
                  </span>
                </button>
              </div>
            </div>

            {/* 3. FORMULE PREMIUM (15 000 FCFA) */}
            <div className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 flex flex-col justify-between shadow-xs transition-all ${
              currentPlan === 'premium' ? 'border-purple-500 dark:border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800/80'
            }`}>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[10px] font-bold uppercase tracking-wider">
                      <Building2 className="w-3 h-3" />
                      <span>VIP &bull; Entreprise</span>
                    </div>
                    {currentPlan === 'premium' && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-bold">
                        Actif
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                    Formule Premium
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Version haut de gamme pour les maisons d'édition et créateurs intensifs.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                      {billingCycle === 'yearly'
                        ? '12 000 FCFA'
                        : billingCycle === 'quarterly'
                        ? '13 500 FCFA'
                        : '15 000 FCFA'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      / mois
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {billingCycle === 'yearly' && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Facturé 144 000 FCFA pour 12 mois (-20%)</span>
                    )}
                    {billingCycle === 'quarterly' && (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">Facturé 40 500 FCFA pour 3 mois (-10%)</span>
                    )}
                    {billingCycle === 'monthly' && 'Facturation mensuelle sans engagement'}
                  </p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <p className="font-semibold text-purple-700 dark:text-purple-300 text-[11px] uppercase tracking-wide">
                    Services réservés à cette formule :
                  </p>
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">Chatbot IA Illimité :</span>
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px] mt-0.5">Zéro restriction, modèles IA les plus puissants.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">Générateur d'e-books Illimité :</span>
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px] mt-0.5">Génération illimitée, formats imprimeurs & EPUB.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                      <span className="text-slate-600 dark:text-slate-400">Support dédié prioritaire 7j/7</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <button
                  id="btn-select-premium"
                  onClick={() => handleSelectPlan('premium')}
                  disabled={currentPlan === 'premium'}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                    currentPlan === 'premium'
                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 cursor-default'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20 active:scale-[0.98]'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>
                    {currentPlan === 'premium' ? 'Formule Actuelle' : 'Payer avec Saspay (Plan Premium)'}
                  </span>
                </button>
              </div>
            </div>

          </div>

          {/* Security & Guarantees Trust Banner */}
          <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">Passerelle exclusive Saspay</h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Paiement pop-up sécurisé sans redirection.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">Mobile Money & Cartes</h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Wave, Orange, MTN, Moov, Visa &amp; Mastercard.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">Validation immédiate</h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Déblocage instantané de vos fonctionnalités.</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: Apparence & Thème */}
      {activeTab === 'theme' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Thème d'affichage</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Basculez entre le mode clair et le mode sombre selon votre confort de lecture.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option Mode Clair */}
              <div
                onClick={() => onUpdateSettings({ theme: 'light' })}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-4 ${
                  settings.theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
                    <Sun className="w-5 h-5" />
                  </div>
                  {settings.theme === 'light' && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Mode Clair</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Fond blanc épuré, contraste élevé pour la journée.
                  </p>
                </div>
              </div>

              {/* Option Mode Sombre */}
              <div
                onClick={() => onUpdateSettings({ theme: 'dark' })}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-4 ${
                  settings.theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-indigo-950 text-indigo-400">
                    <Moon className="w-5 h-5" />
                  </div>
                  {settings.theme === 'dark' && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Mode Sombre</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Fond anthracite sombre, réduit la fatigue oculaire.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
