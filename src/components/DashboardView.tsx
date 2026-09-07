import React from 'react';
import {
  Book,
  Layers,
  Sparkles,
  Download,
  Plus,
  ArrowRight,
  CheckCircle2,
  Award
} from 'lucide-react';
import { Project, ViewType } from '../types';
import { EbookCoverThumbnail } from './EbookCoverThumbnail';
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
  onOpenStudio,
  onOpenExport
}) => {
  const activeProjects = projects.filter((p) => p.status === 'in_progress' || p.status === 'ai_generating' || p.status === 'draft');
  const completedProjects = projects.filter((p) => p.status === 'completed');

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
              Espace Studio & Création
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {getGreeting()}, Créateur
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Consultez vos manuscrits en cours, lancez de nouveaux chapitres ou exportez vos ouvrages terminés.
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
              <span>Nouveau Livre</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards: Livres en cours & Livres terminés */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stat 1: Total Livres */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Total des Livres</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Book className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {projects.length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dans votre bibliothèque d'auteur
          </div>
        </div>

        {/* Stat 2: Livres en cours */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Livres en cours</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {activeProjects.length}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium flex items-center gap-1">
            <span>En phase d'écriture & révision</span>
          </div>
        </div>

        {/* Stat 3: Livres terminés */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Livres déjà terminés</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {completedProjects.length}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Prêts pour l'exportation</span>
          </div>
        </div>
      </div>

      {/* Projets Récents Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Projets Récents</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
              {projects.length}
            </span>
          </div>
          <button
            onClick={() => onNavigate('projects')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Tous les projets <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {projects.slice(0, 4).map((project) => {
            const isCompleted = project.status === 'completed';
            const isAi = project.status === 'ai_generating';

            return (
              <div
                key={project.id}
                id={`dash-project-card-${project.id}`}
                onClick={() => onOpenStudio(project)}
                className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400/60 dark:hover:border-indigo-500/50 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div>
                  {/* Cover Thumb */}
                  <div className="h-32 rounded-xl relative overflow-hidden shadow-xs">
                    <EbookCoverThumbnail
                      project={project}
                      templateId={project.coverTemplateId}
                      customGradient={project.coverGradient}
                      size="full"
                      showBadge={true}
                      showChaptersCount={true}
                      showAuthor={true}
                    />
                    <div className="absolute top-2 left-2 z-20">
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md shadow-xs ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isAi
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-900/80 text-white backdrop-blur-xs'
                        }`}
                      >
                        {isCompleted ? 'Terminé' : isAi ? 'IA Active' : 'En cours'}
                      </span>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="mt-3 space-y-1.5">
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {project.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {project.subtitle || project.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="pt-1 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span>Progression</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="text-slate-400 font-medium">
                    {project.category}
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5">
                    Ouvrir &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Workshops Section (Partenaires Certifiés) */}
      <RecommendedWorkshops />

      {/* Actions Rapides Grid (Full Width, No Google Sync card) */}
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
                Nouveau Livre
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Créer un manuscrit structuré.
              </p>
            </div>
          </button>

          <button
            id="action-btn-brainstorm"
            onClick={onOpenBrainstorm}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400/60 dark:hover:border-indigo-500/50 shadow-xs hover:shadow-sm transition-all flex items-start gap-3.5 text-left group"
          >
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Brainstorming IA
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Échanger et faire mûrir vos idées de livre avec l'IA.
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
                Exporter un Livre
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Exportation Markdown ou PDF.
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
                Ateliers & Formations
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Consulter les modules d'écriture.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
