import React from 'react';
import {
  User,
  ShieldCheck,
  CreditCard,
  FolderKanban,
  LogOut,
  ChevronRight,
  Sparkles,
  Key
} from 'lucide-react';
import { UserProfile, ViewType } from '../types';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onNavigate: (view: ViewType) => void;
  isAdminUnlocked: boolean;
  onOpenAdminAuth: () => void;
  onLockAdmin: () => void;
  onSwitchAccount?: (account: UserProfile) => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onOpenSubscriptionModal?: () => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  isOpen,
  onClose,
  user,
  onNavigate,
  isAdminUnlocked,
  onOpenAdminAuth,
  onLockAdmin,
  onOpenAuthModal,
  onLogout,
  onOpenSubscriptionModal = () => {}
}) => {
  if (!isOpen) return null;

  const currentPlan = user.plan === 'free' ? 'Gratuit' : (user.plan?.toUpperCase() || 'GRATUIT');

  return (
    <>
      {/* Invisible backdrop to dismiss dropdown */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      <div
        id="profile-dropdown-menu"
        className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95"
      >
        {/* User Profile Header Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 relative">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0 relative"
              style={{ background: user.avatarBg || 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
            >
              {user.name.charAt(0)}
              {/* Provider Badge */}
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-xs border border-slate-200 dark:border-slate-700"
                title={user.authProvider === 'google' ? 'Connecté avec Google' : 'Connecté par Email'}
              >
                {user.authProvider === 'google' ? (
                  <svg className="w-3 h-3" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                ) : (
                  <Key className="w-3 h-3 text-indigo-500" />
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {user.name}
                </span>
                {user.isAdmin && (
                  <span className="shrink-0 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-500 text-white shadow-2xs">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>

              {/* Badges */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Plan {currentPlan}
                </span>
                <span className="text-[10px] text-slate-400">
                  {user.authProvider === 'google' ? 'Google' : 'Email'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Callout if Free Plan */}
        {(user.plan === 'free' || user.plan === 'basic') && (
          <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-indigo-900 dark:text-indigo-200">
                Passez au Plan Pro
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Livres illimités &amp; sans filigrane
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSubscriptionModal();
              }}
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-[11px] font-bold shadow-xs flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Upgrade</span>
            </button>
          </div>
        )}

        {/* ADMIN EXCLUSIVE SECTION */}
        {(isAdminUnlocked || user.isAdmin) && (
          <div className="mt-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>Session Administrateur</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  id="btn-profile-open-admin"
                  onClick={() => {
                    onNavigate('admin');
                    onClose();
                  }}
                  className="py-1.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold text-center shadow-xs transition-colors"
                >
                  Ouvrir Console
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLockAdmin();
                    onClose();
                  }}
                  className="py-1.5 px-2 rounded-xl bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 hover:bg-amber-100/50 text-[11px] font-semibold text-center border border-amber-300 dark:border-amber-700 transition-colors"
                >
                  Verrouiller
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fast Navigation Items */}
        <div className="mt-3 space-y-1 border-t border-slate-100 dark:border-slate-800 pt-2 text-xs">
          <button
            type="button"
            onClick={() => {
              onNavigate('settings');
              onClose();
            }}
            className="w-full h-10 flex items-center justify-between px-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Mon Profil &amp; Compte</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigate('projects');
              onClose();
            }}
            className="w-full h-10 flex items-center justify-between px-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <FolderKanban className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Mes Projets &amp; Livres</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSubscriptionModal();
            }}
            className="w-full h-10 flex items-center justify-between px-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Abonnements &amp; Tarifs</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              {currentPlan}
            </span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="mt-3 border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAuthModal();
            }}
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            Changer de compte
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="text-red-500 hover:text-red-600 font-semibold flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
};
