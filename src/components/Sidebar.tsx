import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Library,
  Award,
  Settings,
  Plus,
  X,
  Sparkles,
  BookOpen,
  ShieldCheck
} from 'lucide-react';
import { ViewType, Project } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onOpenNewProject: () => void;
  onOpenBrainstorm: () => void;
  projects: Project[];
  isAdminUnlocked?: boolean;
  onOpenAdminAuth?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentView,
  onNavigate,
  onOpenNewProject,
  onOpenBrainstorm,
  projects,
  isAdminUnlocked = false,
  onOpenAdminAuth
}) => {
  const completedCount = projects.filter((p) => p.status === 'completed').length;

  const baseNavItems = [
    {
      id: 'dashboard' as ViewType,
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'projects' as ViewType,
      label: 'Mes Livres & Projets',
      icon: FolderKanban,
      badge: projects.length.toString()
    },
    {
      id: 'library' as ViewType,
      label: 'Bibliothèque',
      icon: Library,
      badge: null
    },
    {
      id: 'formations' as ViewType,
      label: 'Formations & Ateliers',
      icon: Award,
      badge: null
    },
    {
      id: 'settings' as ViewType,
      label: 'Mon Profil & Paramètres',
      icon: Settings,
      badge: null
    }
  ];

  const adminItem = {
    id: 'admin' as ViewType,
    label: 'Console Administrateur',
    icon: ShieldCheck,
    badge: 'Admin'
  };

  const navItems = isAdminUnlocked ? [...baseNavItems, adminItem] : baseNavItems;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        id="sidebar-backdrop"
        onClick={onClose}
        className={`fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sliding Drawer */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 left-0 bottom-0 w-72 sm:w-80 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 z-50 flex flex-col p-5 shadow-2xl transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs relative flex-shrink-0">
              <svg className="w-full h-full" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="12" fill="url(#bookly-side-grad)" />
                <path d="M14 16C14 13.7909 15.7909 12 18 12H30C32.2091 12 34 13.7909 34 16V26C34 28.2091 32.2091 30 30 30H24L18 34V30H18C15.7909 30 14 28.2091 14 26V16Z" fill="white" fillOpacity="0.25" />
                <path d="M24 15L25.6 20.4L31 22L25.6 23.6L24 29L22.4 23.6L17 22L22.4 20.4L24 15Z" fill="white" />
                <circle cx="31" cy="16" r="1.5" fill="#C7D2FE" />
                <defs>
                  <linearGradient id="bookly-side-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#818CF8" />
                    <stop offset="0.5" stopColor="#6366F1" />
                    <stop offset="1" stopColor="#4F46E5" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
                Bookly Studio
              </span>
              <div className="text-[10px] text-slate-400 font-medium">
                Édition de Livres & Ebooks
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action Buttons */}
        <div className="py-4 space-y-2">
          <button
            id="sidebar-btn-new-project"
            onClick={() => {
              onClose();
              onOpenNewProject();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Livre</span>
          </button>

          <button
            id="sidebar-btn-brainstorm"
            onClick={() => {
              onClose();
              onOpenBrainstorm();
            }}
            className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Brainstorming IA</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto space-y-1 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  if (item.id === 'admin' && !isAdminUnlocked && onOpenAdminAuth) {
                    onOpenAdminAuth();
                  } else {
                    onNavigate(item.id);
                  }
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : item.id === 'admin'
                    ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : item.id === 'admin' ? 'text-amber-500' : 'text-slate-400'}`} />
                  <span className={item.id === 'admin' ? 'font-semibold text-slate-800 dark:text-slate-200' : ''}>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.id === 'admin'
                        ? isAdminUnlocked
                          ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Public Showcase / Pricing Link */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              onNavigate('landing');
              onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Vitrine & Tarifs</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">Public</span>
          </button>
        </div>

        {/* Studio Stats Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Livres terminés
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {completedCount} / {projects.length}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${projects.length ? (completedCount / projects.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-medium">
            <span>Bookly Studio</span>
            <span>Prêt & Synchronisé</span>
          </div>
        </div>
      </aside>
    </>
  );
};
