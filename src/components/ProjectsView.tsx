import React, { useState } from 'react';
import {
  Plus,
  Search,
  FileText,
  Clock,
  MoreVertical,
  BookOpen,
  Download,
  Trash2,
  Copy,
  Edit3,
  Palette
} from 'lucide-react';
import { Project, ProjectStatus } from '../types';
import { EbookCoverThumbnail } from './EbookCoverThumbnail';

interface ProjectsViewProps {
  projects: Project[];
  onOpenNewProject: () => void;
  onOpenStudio: (project: Project) => void;
  onOpenReader: (project: Project) => void;
  onOpenExport: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (project: Project) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onOpenNewProject,
  onOpenStudio,
  onOpenReader,
  onOpenExport,
  onDeleteProject,
  onDuplicateProject
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | ProjectStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filters: { id: 'all' | ProjectStatus; label: string }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'in_progress', label: 'En rédaction' },
    { id: 'ai_generating', label: 'IA active' },
    { id: 'completed', label: 'Terminés' },
    { id: 'draft', label: 'Brouillons' }
  ];

  const filteredProjects = projects.filter((project) => {
    const matchesFilter = activeFilter === 'all' || project.status === activeFilter;
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.subtitle && project.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      project.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'completed':
        return { label: 'Terminé', class: 'bg-emerald-600 text-white' };
      case 'ai_generating':
        return { label: 'Génération IA', class: 'bg-indigo-600 text-white' };
      case 'in_progress':
        return { label: 'En rédaction', class: 'bg-slate-800 text-white' };
      case 'draft':
      default:
        return { label: 'Brouillon', class: 'bg-slate-500 text-white' };
    }
  };

  return (
    <div id="view-projects" className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Mes Livres & Manuscrits
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gérez vos écrits, modifiez vos chapitres ou préparez vos exports.
          </p>
        </div>

        <button
          id="projects-btn-new"
          onClick={onOpenNewProject}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Projet</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProjects.map((project) => {
          const badge = getStatusBadge(project.status);
          const isMenuOpen = openMenuId === project.id;

          return (
            <div
              key={project.id}
              id={`project-card-${project.id}`}
              className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 relative"
            >
              <div>
                {/* Cover Card */}
                <div
                  className="h-36 rounded-xl relative overflow-hidden cursor-pointer shadow-xs group-hover:shadow-md transition-all"
                  onClick={() => onOpenStudio(project)}
                >
                  <EbookCoverThumbnail
                    project={project}
                    templateId={project.coverTemplateId}
                    customGradient={project.coverGradient}
                    customImage={project.coverCustomImage}
                    size="full"
                    showBadge={true}
                    showChaptersCount={true}
                    showAuthor={true}
                  />
                  <div className="absolute top-2 left-2 z-20">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md shadow-xs ${badge.class}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* Info & Progress */}
                <div className="mt-3.5 space-y-1.5">
                  <h4
                    className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    onClick={() => onOpenStudio(project)}
                  >
                    {project.title}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {project.subtitle || project.description || 'Aucune description'}
                  </p>

                  {/* Progress info */}
                  <div className="space-y-1 pt-1">
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

              {/* Bottom Meta & Actions */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2.5 font-medium text-[11px]">
                  <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    {project.chapters?.length || 1} chap.
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {project.readingTimeMinutes} min
                  </span>
                </div>

                <div className="flex items-center gap-1 relative">
                  <button
                    onClick={() => onOpenStudio(project)}
                    className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 font-semibold text-xs flex items-center gap-1"
                    title="Éditer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onOpenReader(project)}
                    className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Lire"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onOpenExport(project)}
                    className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Exporter"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setOpenMenuId(isMenuOpen ? null : project.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Options"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {/* Context menu */}
                  {isMenuOpen && (
                    <div className="absolute right-0 bottom-8 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 p-1 animate-in fade-in zoom-in-95">
                      <button
                        onClick={() => {
                          setOpenMenuId(null);
                          onDuplicateProject(project);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Copy className="w-3.5 h-3.5" /> Dupliquer
                      </button>
                      <button
                        onClick={() => {
                          setOpenMenuId(null);
                          onOpenExport(project);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5" /> Exporter
                      </button>
                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                      <button
                        onClick={() => {
                          setOpenMenuId(null);
                          onDeleteProject(project.id);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Dashed Create Card */}
        <div
          id="project-card-new-dashed"
          onClick={onOpenNewProject}
          className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 cursor-pointer min-h-[240px] transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Nouveau Livre
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-[180px]">
              Lancez un nouveau manuscrit avec assistance IA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
