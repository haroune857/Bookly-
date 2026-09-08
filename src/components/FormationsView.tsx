import React from 'react';
import {
  Award,
  Sparkles,
  Layers,
  GraduationCap
} from 'lucide-react';
import { TrainingCourse } from '../types';
import { RecommendedWorkshops } from './RecommendedWorkshops';

interface FormationsViewProps {
  courses: TrainingCourse[];
  onOpenCourse: (course: TrainingCourse) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const FormationsView: React.FC<FormationsViewProps> = () => {
  return (
    <div id="view-formations" className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/70 dark:border-indigo-800/60 text-[11px] font-bold uppercase px-3 py-1 rounded-full tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              Ateliers &amp; Formations Partenaires
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Ateliers &amp; Formations Recommandées
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Programmes pratiques sélectionnés pour vous aider à développer votre audience, créer du contenu vidéo percutant et maximiser vos ventes d'e-books.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-800 text-xs shrink-0">
            <div className="p-2 rounded-xl bg-indigo-600 text-white font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Programmes Certifiés</div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">Accompagnement &amp; Accès Immédiat</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Workshops Section (Partenaires Certifiés) */}
      <RecommendedWorkshops />

      {/* Global Information Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 max-w-xl text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Méthodologie Éditoriale &amp; Diffusion
          </div>
          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Monétisation &amp; Promotion de vos Livres
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Chaque formation partenaire sélectionnée ici a été testée et approuvée pour vous garantir un retour sur investissement rapide, que ce soit pour la vente d'e-books ou la création de vidéos d'acquisition.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-200/70 dark:border-slate-700 shrink-0">
          <Layers className="w-4 h-4 text-indigo-500" />
          <span>Contenus actualisés régulièrement</span>
        </div>
      </div>
    </div>
  );
};
