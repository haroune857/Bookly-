import React from 'react';
import {
  Layers,
  Sparkles,
  Download,
  Plus,
  Award,
  Zap,
  TrendingUp,
  BrainCircuit,
  Compass
} from 'lucide-react';
import { Project, ViewType } from '../types';
import { RecommendedWorkshops } from './RecommendedWorkshops';

interface DashboardViewProps {
  projects: Project[];
  onNavigate: (view: ViewType) => void;
  onOpenNewProject: () => void;
  onOpenBrainstorm: () => void;
  onOpenStudio: (project: Project) => void;
  onOpenExport: (project?: Project) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  onNavigate,
  onOpenNewProject,
  onOpenBrainstorm,
  onOpenExport
}) => {
  const activeProjects = projects.filter((p) => p.status === 'in_progress' || p.status === 'ai_generating' || p.status === 'draft');
  const completedProjects = projects.filter((p) => p.status === 'completed');
  const totalWords = projects.reduce((acc, p) => acc + (p.totalWords || p.wordCount || 0), 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <div id="view-dashboard" className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              Espace Studio &amp; Création
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {getGreeting()}, Créateur
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Consultez vos statistiques d'écriture, démarrez de nouveaux manuscrits ou formez-vous aux meilleures stratégies de monétisation.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 pt-2 sm:pt-0">
            <button
              id="dash-btn-brainstorm"
              onClick={onOpenBrainstorm}
              className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Brainstorming IA</span>
            </button>
            <button
              id="dash-btn-new-project"
              onClick={onOpenNewProject}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Projet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards: Studio Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stat 1: Volume de rédaction */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Mots Rédigés au Total</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {totalWords.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-400">mots</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            <span>Moteur d'inférence prêt</span>
          </div>
        </div>

        {/* Stat 2: Projets en cours */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Manuscrits en Cours</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {activeProjects.length}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium flex items-center gap-1">
            <span>En phase d'écriture &amp; révision</span>
          </div>
        </div>

        {/* Stat 3: Projets terminés */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Manuscrits Prêts à Publier</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {completedProjects.length}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
            <span>Retrouvez-les dans "Mes Livres &amp; Projets"</span>
          </div>
        </div>
      </div>

      {/* Direct Quick Nav to Projects or Library */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-md border border-slate-800">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs text-indigo-300 font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Gestion Complète de votre Catalogue</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Vos livres sont gérés dans l'onglet dédié "Mes Livres &amp; Projets"
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Accédez à l'éditeur de chapitres, révisez vos sommaires ou consultez la bibliothèque de lecture d'un simple clic.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('projects')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm"
          >
            Accéder à Mes Livres ({projects.length})
          </button>
          <button
            onClick={() => onNavigate('library')}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-all border border-white/20"
          >
            Bibliothèque
          </button>
        </div>
      </div>

      {/* Recommended Workshops Section (Partenaires Certifiés) */}
      <RecommendedWorkshops />

      {/* Actions Rapides Grid */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Actions Rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <button
            id="action-btn-new-ebook"
            onClick={onOpenNewProject}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400/60 dark:hover:border-indigo-500/50 shadow-xs hover:shadow-sm transition-all flex items-start gap-3.5 text-left group"
          >
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Nouveau Manuscrit
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Structurer et rédiger un livre.
              </p>
            </div>
          </button>

          <button
            id="action-btn-brainstorm"
            onClick={onOpenBrainstorm}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400/60 dark:hover:border-indigo-500/50 shadow-xs hover:shadow-sm transition-all flex items-start gap-3.5 text-left group"
          >
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Brainstorming IA
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Échanger et faire mûrir vos idées.
              </p>
            </div>
          </button>

          <button
            id="action-btn-export"
            onClick={() => onOpenExport()}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400/60 dark:hover:border-indigo-500/50 shadow-xs hover:shadow-sm transition-all flex items-start gap-3.5 text-left group"
          >
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Exporter un Manuscrit
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Exportation Word DOCX, PDF ou MD.
              </p>
            </div>
          </button>

          <button
            id="action-btn-formations"
            onClick={() => onNavigate('formations')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400/60 dark:hover:border-indigo-500/50 shadow-xs hover:shadow-sm transition-all flex items-start gap-3.5 text-left group"
          >
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Ateliers &amp; Formations
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Formations vidéo et guides de vente.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
