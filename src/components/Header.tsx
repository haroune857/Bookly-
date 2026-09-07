import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  Sparkles,
  ChevronRight,
  X,
  LayoutDashboard,
  FolderKanban,
  Library,
  Award
} from 'lucide-react';
import { ViewType, UserProfile } from '../types';
import { ProfileMenu } from './ProfileMenu';

interface HeaderProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onToggleSidebar: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  user: UserProfile;
  onOpenBrainstorm: () => void;
  isAdminUnlocked?: boolean;
  onOpenAdminAuth?: () => void;
  onLockAdmin?: () => void;
  onSwitchAccount?: (account: UserProfile) => void;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
  onOpenSubscriptionModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onToggleSidebar,
  darkMode,
  onToggleDarkMode,
  user,
  onOpenBrainstorm,
  isAdminUnlocked = false,
  onOpenAdminAuth = () => {},
  onLockAdmin = () => {},
  onSwitchAccount = () => {},
  onOpenAuthModal = () => {},
  onLogout = () => {},
  onOpenSubscriptionModal = () => {}
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isFreePlan = user.plan === 'free' || user.plan === 'basic';

  const notifications = [
    {
      id: 'notif-1',
      title: 'Chapitre IA prêt',
      text: 'Le chapitre 2 de "L\'Art de la Méditation" est prêt pour relecture.',
      time: 'Il y a 25 min',
      unread: true
    },
    {
      id: 'notif-2',
      title: 'Sauvegarde du Studio',
      text: 'Vos manuscrits et chapitres sont enregistrés avec succès.',
      time: 'Il y a 1h',
      unread: false
    },
    {
      id: 'notif-3',
      title: 'Nouveau module disponible',
      text: 'Le cours "Storytelling et Architecture de Récit" a été mis à jour.',
      time: 'Hier',
      unread: false
    }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Side: Hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            id="btn-toggle-sidebar"
            onClick={onToggleSidebar}
            className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800 shrink-0"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            className="flex items-center gap-3 cursor-pointer group select-none"
            onClick={() => onNavigate('dashboard')}
          >
            {/* SVG Logo */}
            <div className="w-9 h-9 relative flex-shrink-0 shadow-md shadow-indigo-500/20 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-200">
              <svg className="w-full h-full" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="12" fill="url(#bookly-header-grad)" />
                <rect width="48" height="48" rx="12" fill="black" fillOpacity="0.08" />
                <path d="M14 16C14 13.7909 15.7909 12 18 12H30C32.2091 12 34 13.7909 34 16V26C34 28.2091 32.2091 30 30 30H24L18 34V30H18C15.7909 30 14 28.2091 14 26V16Z" fill="white" fillOpacity="0.25" />
                <path d="M24 15L25.6 20.4L31 22L25.6 23.6L24 29L22.4 23.6L17 22L22.4 20.4L24 15Z" fill="white" />
                <circle cx="31" cy="16" r="1.5" fill="#C7D2FE" />
                <defs>
                  <linearGradient id="bookly-header-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#818CF8" />
                    <stop offset="0.5" stopColor="#6366F1" />
                    <stop offset="1" stopColor="#4F46E5" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Bookly
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                  Studio
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 leading-none">
                Automated Content Studio
              </span>
            </div>
          </div>
        </div>

        {/* Center: Desktop Navigation Bar (Aligné, direct et élégant) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 h-10">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`h-8 px-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              currentView === 'dashboard'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Tableau de bord</span>
          </button>
          <button
            onClick={() => onNavigate('projects')}
            className={`h-8 px-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              currentView === 'projects'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Mes Livres</span>
          </button>
          <button
            onClick={() => onNavigate('library')}
            className={`h-8 px-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              currentView === 'library'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Library className="w-3.5 h-3.5" />
            <span>Bibliothèque</span>
          </button>
          <button
            onClick={() => onNavigate('formations')}
            className={`h-8 px-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              currentView === 'formations'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Formations</span>
          </button>
        </nav>

        {/* Center / Right Quick Action Buttons & Status */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Upgrade Callout Button */}
          {isFreePlan ? (
            <button
              id="btn-header-upgrade"
              onClick={onOpenSubscriptionModal}
              className="h-10 flex items-center gap-1.5 px-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 shadow-xs transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Passer à Pro</span>
              <span className="sm:hidden">Pro</span>
            </button>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 h-10 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-300">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Plan {user.plan?.toUpperCase()}
            </span>
          )}

          {/* Quick Brainstorm Action */}
          <button
            id="btn-header-brainstorm"
            onClick={onOpenBrainstorm}
            className="hidden xl:flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Brainstorming IA</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            id="btn-toggle-theme"
            onClick={onToggleDarkMode}
            className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800 shrink-0"
            aria-label="Basculer le thème clair/sombre"
            title={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="btn-header-notifications"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative h-10 w-10 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800 shrink-0"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 ring-2 ring-white dark:ring-slate-900" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h4>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400">
                      3 récentes
                    </span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-1 max-h-72 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 p-2 rounded-xl transition-colors">
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{notif.title}</span>
                          <span className="text-[10px] text-slate-400">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{notif.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <button
                    onClick={() => {
                      onNavigate('projects');
                      setShowNotifications(false);
                    }}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    Voir mes projets en cours <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Account Menu Trigger */}
          <div className="relative">
            <button
              id="btn-header-profile"
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="h-10 flex items-center gap-2 px-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800 shrink-0"
              title="Profil & Compte"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs relative"
                style={{ background: user.avatarBg || 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
              >
                {user.name.charAt(0)}
                {isAdminUnlocked && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-900" />
                )}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[110px]">
                  {user.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-slate-400 font-medium leading-none">
                  {user.isAdmin ? 'Admin' : (user.plan === 'free' ? 'Gratuit' : user.plan?.toUpperCase() || 'PRO')}
                </span>
              </div>
            </button>

            {/* Profile Dropdown Component */}
            <ProfileMenu
              isOpen={showProfileMenu}
              onClose={() => setShowProfileMenu(false)}
              user={user}
              onNavigate={onNavigate}
              isAdminUnlocked={isAdminUnlocked}
              onOpenAdminAuth={onOpenAdminAuth}
              onLockAdmin={onLockAdmin}
              onSwitchAccount={onSwitchAccount}
              onOpenAuthModal={onOpenAuthModal}
              onLogout={onLogout}
              onOpenSubscriptionModal={onOpenSubscriptionModal}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
