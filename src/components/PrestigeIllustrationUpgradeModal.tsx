import React from 'react';
import { Sparkles, Crown, Check, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';

interface PrestigeIllustrationUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: Partial<UserProfile> | null;
  onUpgrade: (plan: 'premium', cycle: 'quarterly' | 'yearly') => void;
}

export const PrestigeIllustrationUpgradeModal: React.FC<PrestigeIllustrationUpgradeModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpgrade
}) => {
  if (!isOpen) return null;

  const currentPlan = user?.plan || 'free';
  const currentBilling = user?.planBilling || 'monthly';

  const planLabel =
    currentPlan === 'premium'
      ? 'Plan Premium'
      : currentPlan === 'pro'
      ? 'Plan Pro'
      : 'Plan Découverte (Gratuit)';

  const billingLabel =
    currentBilling === 'yearly'
      ? 'Annuel (1 an)'
      : currentBilling === 'quarterly'
      ? 'Trimestriel (3 mois)'
      : 'Mensuel (1 mois)';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/60 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header with Prestige Gradient */}
        <div className="relative bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 px-6 py-6 text-white overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[11px] font-black uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>Privilège Éditorial Prestige</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-xl sm:text-2xl font-black mt-3 leading-tight tracking-tight">
            Illustrations IA Intérieures Haute Définition
          </h3>
          <p className="text-xs text-purple-100/90 mt-1 font-medium">
            Sublimez l'ouverture de chaque grand chapitre avec une illustration originale créée par l'IA.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Policy Explanation Box */}
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-900 dark:text-purple-200">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Condition d'accès exclusive :</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Pour garantir une puissance de calcul et un rendu graphique sans compromis, la génération d'images d'illustration intérieures pour les chapitres est réservée aux <strong>abonnements ayant la plus grande valeur</strong> : les abonnements à <strong>15 000 FCFA/mois</strong> et pour une <strong>souscription minimum de 3 mois</strong> (Plan Premium Trimestriel ou Annuel).
            </p>
          </div>

          {/* Current Status Comparison */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Votre Statut</span>
              <p className="font-bold text-slate-800 dark:text-slate-200">{planLabel}</p>
              <p className="text-[11px] text-slate-500">Durée : {billingLabel}</p>
            </div>
            <div className="p-3 rounded-xl border border-purple-300 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-950/30 space-y-1">
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Requis</span>
              <p className="font-bold text-purple-900 dark:text-purple-100">Plan Premium (15 000 F)</p>
              <p className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold">Minimum 3 mois</p>
            </div>
          </div>

          {/* Key Advantages */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Inclus avec votre activation Premium (3 mois min.) :
            </h4>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>Génération illimitée d'illustrations HD au début de chaque chapitre</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>4 styles artistiques : Gravure Éditoriale, Cinématographique, Aquarelle, Minimaliste</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>Intégration automatique dans la liseuse et les exports PDF Imprimeur & ePub</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>Tous les privilèges Premium : IA illimitée et support VIP 7j/7</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              id="btn-prestige-upgrade-quarterly"
              onClick={() => {
                onClose();
                onUpgrade('premium', 'quarterly');
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>Activer le Plan Premium (Formule Trimestrielle - 3 mois)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Fermer et continuer la rédaction
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
