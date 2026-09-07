import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Sparkles,
  Loader2
} from 'lucide-react';
import { UserProfile } from '../types';
import { ADMIN_SECURITY_CREDENTIALS } from '../data/adminData';
import { firestoreService } from '../services/firestoreService';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile, isAdmin: boolean) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  initialMode?: 'login' | 'signup';
  isMandatory?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onShowToast,
  initialMode = 'login',
  isMandatory = false
}) => {
  // Mode: 'login' | 'signup'
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Standard Google OAuth Sign-In with Firebase
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      if (!fbUser || !fbUser.email) {
        throw new Error("Impossible de récupérer l'adresse email depuis Google.");
      }

      const isUserAdmin = fbUser.email.toLowerCase() === ADMIN_SECURITY_CREDENTIALS.adminEmail.toLowerCase();
      const userId = `usr-google-${fbUser.uid}`;

      // Check if user already exists in Firestore or build a fresh profile
      let userProfile: UserProfile;
      try {
        const existing = await firestoreService.getUserProfile(userId);
        if (existing) {
          userProfile = {
            ...existing,
            lastLoginAt: 'À l\'instant',
            name: fbUser.displayName || existing.name,
            avatarUrl: fbUser.photoURL || existing.avatarUrl
          };
        } else {
          userProfile = {
            id: userId,
            name: fbUser.displayName || fbUser.email.split('@')[0],
            email: fbUser.email,
            role: isUserAdmin ? 'Super Administrateur Plateforme' : 'Auteur & Créateur Digital',
            bio: 'Auteur Bookly Studio.',
            avatarBg: isUserAdmin
              ? 'linear-gradient(135deg, #d97706, #f59e0b)'
              : 'linear-gradient(135deg, #7c3aed, #6366f1)',
            avatarUrl: fbUser.photoURL || undefined,
            authProvider: 'google',
            isAdmin: isUserAdmin,
            signature: `${fbUser.displayName || 'Auteur'} — Bookly`,
            plan: isUserAdmin ? 'premium' : 'free',
            planBilling: 'monthly',
            planRenewsAt: isUserAdmin ? 'Illimité (Admin)' : 'Plan Gratuit Inclus',
            lifetimeProjectsCreated: 0,
            monthlyProjectsCreated: 0,
            dailyChatbotCount: 0,
            createdAt: new Date().toISOString().split('T')[0],
            lastLoginAt: 'À l\'instant'
          };
        }
      } catch {
        userProfile = {
          id: userId,
          name: fbUser.displayName || fbUser.email.split('@')[0],
          email: fbUser.email,
          role: isUserAdmin ? 'Super Administrateur Plateforme' : 'Auteur & Créateur Digital',
          bio: 'Auteur Bookly Studio.',
          avatarBg: isUserAdmin
            ? 'linear-gradient(135deg, #d97706, #f59e0b)'
            : 'linear-gradient(135deg, #7c3aed, #6366f1)',
          avatarUrl: fbUser.photoURL || undefined,
          authProvider: 'google',
          isAdmin: isUserAdmin,
          signature: `${fbUser.displayName || 'Auteur'} — Bookly`,
          plan: isUserAdmin ? 'premium' : 'free',
          planBilling: 'monthly',
          planRenewsAt: isUserAdmin ? 'Illimité (Admin)' : 'Plan Gratuit Inclus',
          lifetimeProjectsCreated: 0,
          monthlyProjectsCreated: 0,
          dailyChatbotCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
          lastLoginAt: 'À l\'instant'
        };
      }

      if (isUserAdmin) {
        localStorage.setItem(
          'bookly_admin_auth',
          JSON.stringify({
            isAuthenticated: true,
            authTimestamp: Date.now(),
            adminEmail: fbUser.email
          })
        );
      }

      localStorage.setItem('bookly_user', JSON.stringify(userProfile));
      firestoreService.saveUserProfile(userProfile).catch((e) => console.warn(e));

      onShowToast(
        'Connexion Google réussie',
        `Bienvenue ${userProfile.name} ! Votre session est active.`,
        'success'
      );
      onLoginSuccess(userProfile, isUserAdmin);
      onClose();
    } catch (err: any) {
      console.warn('Google Sign-In notice:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('La fenêtre de connexion Google a été fermée.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMsg('La fenêtre contextuelle Google a été bloquée par le navigateur. Vous pouvez utiliser la connexion par e-mail.');
      } else {
        setErrorMsg(err.message || 'Échec de la connexion avec Google. Veuillez réessayer ou utiliser l\'authentification par e-mail.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Standard Email/Password Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const email = loginEmail.trim().toLowerCase();
    const password = loginPassword;

    if (!email || !password) {
      setErrorMsg('Veuillez remplir tous les champs.');
      setIsLoading(false);
      return;
    }

    // Check if Administrator
    if (email === ADMIN_SECURITY_CREDENTIALS.adminEmail.toLowerCase()) {
      if (password === ADMIN_SECURITY_CREDENTIALS.adminMasterKey || password === ADMIN_SECURITY_CREDENTIALS.adminPinCode) {
        const adminProfile: UserProfile = {
          id: 'usr-admin-studio',
          name: 'Administrateur Bookly',
          email: ADMIN_SECURITY_CREDENTIALS.adminEmail,
          role: 'Super Administrateur Plateforme',
          bio: 'Gestionnaire système Bookly Studio, contrôle des accès et supervision.',
          avatarBg: 'linear-gradient(135deg, #d97706, #f59e0b)',
          authProvider: 'email',
          isAdmin: true,
          signature: 'Direction Bookly Studio',
          plan: 'premium',
          planBilling: 'yearly',
          planRenewsAt: 'Illimité (Admin)',
          lifetimeProjectsCreated: 0,
          monthlyProjectsCreated: 0,
          dailyChatbotCount: 0,
          createdAt: '2026-09-05',
          lastLoginAt: 'À l\'instant'
        };

        localStorage.setItem(
          'bookly_admin_auth',
          JSON.stringify({
            isAuthenticated: true,
            authTimestamp: Date.now(),
            adminEmail: email
          })
        );
        localStorage.setItem('bookly_user', JSON.stringify(adminProfile));

        setIsLoading(false);
        onShowToast('Session Administrateur Active', 'Bienvenue sur la console de contrôle Bookly Studio.', 'success');
        onLoginSuccess(adminProfile, true);
        onClose();
        return;
      } else {
        setErrorMsg('Mot de passe administrateur incorrect.');
        setIsLoading(false);
        return;
      }
    }

    // Standard User Login via Firestore or local cache
    try {
      const storedUsersRaw = localStorage.getItem('bookly_registered_users');
      let registeredUsers: Record<string, { profile: UserProfile; passwordHash: string }> = {};
      if (storedUsersRaw) {
        try {
          registeredUsers = JSON.parse(storedUsersRaw);
        } catch {
          registeredUsers = {};
        }
      }

      const existingRecord = registeredUsers[email];
      if (existingRecord) {
        if (existingRecord.passwordHash !== password) {
          setErrorMsg('Mot de passe incorrect pour cette adresse e-mail.');
          setIsLoading(false);
          return;
        }

        const userProfile = {
          ...existingRecord.profile,
          lastLoginAt: 'À l\'instant'
        };

        localStorage.setItem('bookly_user', JSON.stringify(userProfile));
        onShowToast('Connexion réussie', `Ravi de vous revoir, ${userProfile.name} !`, 'success');
        onLoginSuccess(userProfile, false);
        onClose();
        return;
      }

      // Check Firestore
      const userProfileFromDb = await firestoreService.getUserProfile(`usr-email-${email.replace(/[^a-zA-Z0-9]/g, '_')}`);
      if (userProfileFromDb) {
        localStorage.setItem('bookly_user', JSON.stringify(userProfileFromDb));
        onShowToast('Connexion réussie', `Ravi de vous revoir, ${userProfileFromDb.name} !`, 'success');
        onLoginSuccess(userProfileFromDb, false);
        onClose();
        return;
      }

      setErrorMsg('Aucun compte trouvé avec cet e-mail. Veuillez créer un compte.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue lors de la connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  // Standard Email/Password Sign Up
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const name = signupName.trim();
    const email = signupEmail.trim().toLowerCase();
    const password = signupPassword;

    if (!name || !email || !password) {
      setErrorMsg('Veuillez remplir tous les champs.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Le mot de passe doit comporter au moins 6 caractères.');
      setIsLoading(false);
      return;
    }

    if (email === ADMIN_SECURITY_CREDENTIALS.adminEmail.toLowerCase()) {
      setErrorMsg('Cet email est réservé à l\'administration.');
      setIsLoading(false);
      return;
    }

    try {
      const userId = `usr-email-${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const newProfile: UserProfile = {
        id: userId,
        name,
        email,
        role: 'Auteur & Créateur Digital',
        bio: 'Auteur Bookly Studio.',
        avatarBg: 'linear-gradient(135deg, #7c3aed, #6366f1)',
        authProvider: 'email',
        isAdmin: false,
        signature: `${name} — Auteur Bookly`,
        plan: 'free',
        planBilling: 'monthly',
        planRenewsAt: 'Plan Gratuit Inclus',
        lifetimeProjectsCreated: 0,
        monthlyProjectsCreated: 0,
        dailyChatbotCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        lastLoginAt: 'À l\'instant'
      };

      // Save credentials locally
      const storedUsersRaw = localStorage.getItem('bookly_registered_users');
      let registeredUsers: Record<string, { profile: UserProfile; passwordHash: string }> = {};
      if (storedUsersRaw) {
        try {
          registeredUsers = JSON.parse(storedUsersRaw);
        } catch {
          registeredUsers = {};
        }
      }

      registeredUsers[email] = {
        profile: newProfile,
        passwordHash: password
      };
      localStorage.setItem('bookly_registered_users', JSON.stringify(registeredUsers));
      localStorage.setItem('bookly_user', JSON.stringify(newProfile));

      // Save to Firestore
      firestoreService.saveUserProfile(newProfile).catch((err) => console.warn('Firestore sync:', err));

      onShowToast('Compte créé avec succès', `Bienvenue ${name} sur Bookly Studio !`, 'success');
      onLoginSuccess(newProfile, false);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue lors de la création du compte.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Close button */}
        {!isMandatory && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {mode === 'login' ? 'Connexion à Bookly' : 'Créer un compte Bookly'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'login'
              ? 'Accédez à votre studio d\'écriture et vos manuscrits'
              : 'Rejoignez la communauté d\'auteurs et créateurs digitaux'}
          </p>
        </div>

        {/* Standard Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-3 transition-all shadow-xs hover:shadow-md disabled:opacity-60"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continuer avec Google</span>
        </button>

        {/* Separator */}
        <div className="flex items-center gap-3 my-5 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          <span>ou par e-mail</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-5">
          <button
            type="button"
            onClick={() => {
              setErrorMsg('');
              setMode('login');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorMsg('');
              setMode('signup');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Créer un compte
          </button>
        </div>

        {/* Form: Login */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="votre.email@exemple.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <span>Se connecter</span>
              )}
            </button>
          </form>
        ) : (
          /* Form: Sign Up */
          <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nom complet
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Votre nom"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="votre.email@exemple.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mot de passe (au moins 6 caractères)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Création du compte...</span>
                </>
              ) : (
                <span>Créer mon compte</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
