import React, { useState, useEffect } from 'react';
import {
  INITIAL_PROJECTS,
  INITIAL_LIBRARY_BOOKS,
  INITIAL_TRAINING_COURSES,
  INITIAL_USER,
  INITIAL_SETTINGS
} from './data/mockData';
import {
  INITIAL_ADMIN_USERS,
  INITIAL_API_DAILY_STATS,
  INITIAL_ERROR_LOGS,
  DEFAULT_ADMIN_CONFIG,
  INITIAL_SUBSCRIPTION_REVENUE_STATS,
  ADMIN_SECURITY_CREDENTIALS
} from './data/adminData';
import { checkCanCreateProject } from './services/subscriptionService';
import {
  ViewType,
  Project,
  LibraryBook,
  TrainingCourse,
  UserProfile,
  AppSettings,
  AdminUser,
  AdminApiDailyStat,
  AdminErrorLog,
  AdminGlobalConfig
} from './types';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ProjectsView } from './components/ProjectsView';
import { ProjectStudioModal } from './components/ProjectStudioModal';
import { LibraryView } from './components/LibraryView';
import { BookReaderModal } from './components/BookReaderModal';
import { FormationsView } from './components/FormationsView';
import { CoursePlayerModal } from './components/CoursePlayerModal';
import { SettingsView } from './components/SettingsView';
import { BrainstormingModal } from './components/BrainstormingModal';
import { NewProjectModal } from './components/NewProjectModal';
import { ExportModal } from './components/ExportModal';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AuthModal } from './components/AuthModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { LandingPageView } from './components/LandingPageView';
import { ToastContainer, ToastMessage } from './components/Toast';
import { firestoreService } from './services/firestoreService';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function App() {
  // Check if initial authentication session exists
  const hasExistingSession = () => {
    try {
      const session = localStorage.getItem('bookly_user');
      if (!session) return false;
      const parsed = JSON.parse(session);
      return Boolean(parsed && parsed.email && parsed.email !== 'client@bookly.studio');
    } catch {
      return false;
    }
  };

  // State from LocalStorage or Defaults: Landing page if no session, Dashboard if session exists
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    return hasExistingSession() ? 'dashboard' : 'landing';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth Wall & Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAuthMandatory, setIsAuthMandatory] = useState<boolean>(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'signup'>('login');

  // Subscription Modal State
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [targetUpgradePlan, setTargetUpgradePlan] = useState<'pro' | 'premium'>('pro');

  // Admin Authentication State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    const saved = localStorage.getItem('bookly_admin_auth');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.isAuthenticated === true;
      } catch (e) {
        console.error(e);
      }
    }
    return false;
  });
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // Admin Data states
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('bookly_admin_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ADMIN_USERS;
  });

  const [adminApiStats] = useState<AdminApiDailyStat[]>(INITIAL_API_DAILY_STATS);

  const [adminErrorLogs, setAdminErrorLogs] = useState<AdminErrorLog[]>(() => {
    const saved = localStorage.getItem('bookly_admin_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ERROR_LOGS;
  });

  const [adminGlobalConfig, setAdminGlobalConfig] = useState<AdminGlobalConfig>(() => {
    const saved = localStorage.getItem('bookly_admin_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_ADMIN_CONFIG;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const savedUser = localStorage.getItem('bookly_user');
    let uId = INITIAL_USER.id;
    if (savedUser) {
      try {
        uId = JSON.parse(savedUser).id || uId;
      } catch (e) {
        console.error(e);
      }
    }
    const saved = localStorage.getItem(`bookly_projects_${uId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PROJECTS;
  });

  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>(() => {
    const saved = localStorage.getItem('bookly_library');
    if (saved) {
      try {
        const parsed: LibraryBook[] = JSON.parse(saved);
        // Filter out legacy demo books if any exist
        const customBooks = parsed.filter(
          (b) => !['lib-1', 'lib-2', 'lib-3', 'lib-4'].includes(b.id)
        );
        return customBooks;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_LIBRARY_BOOKS;
  });

  const [trainingCourses, setTrainingCourses] = useState<TrainingCourse[]>(() => {
    const saved = localStorage.getItem('bookly_training');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TRAINING_COURSES;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('bookly_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.email === 'client@bookly.studio') {
          localStorage.removeItem('bookly_user');
          return INITIAL_USER;
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USER;
  });

  const isLoggedIn = Boolean(
    user &&
    user.email &&
    user.email.trim().length > 0 &&
    user.email !== 'client@bookly.studio'
  );

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('bookly_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_SETTINGS;
  });

  // Modal States
  const [studioProject, setStudioProject] = useState<Project | null>(null);
  const [readerItem, setReaderItem] = useState<Project | LibraryBook | null>(null);
  const [exportItem, setExportItem] = useState<Project | LibraryBook | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isBrainstormOpen, setIsBrainstormOpen] = useState(false);

  // Listen to Firebase Auth state changes and sync profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && fbUser.email) {
        // Le compte administrateur possède son adresse mail dédiée fictive
        const isUserAdmin =
          fbUser.email.toLowerCase() === ADMIN_SECURITY_CREDENTIALS.adminEmail.toLowerCase();

        // L'adresse soumailaharoune8@gmail.com est un compte utilisateur auteur standard, sans droits admin
        const isStandardUser = fbUser.email.toLowerCase() === 'soumailaharoune8@gmail.com';

        try {
          const cloudProfile = await firestoreService.getUserProfile(fbUser.uid);
          if (cloudProfile) {
            let sanitizedProfile = { ...cloudProfile };
            if (isStandardUser) {
              sanitizedProfile.isAdmin = false;
              if (sanitizedProfile.role === 'Super Administrateur Plateforme') {
                sanitizedProfile.role = 'Auteur & Créateur Digital';
              }
              if (sanitizedProfile.planRenewsAt === 'Illimité (Admin)') {
                sanitizedProfile.plan = 'free';
                sanitizedProfile.planRenewsAt = 'Plan Gratuit Inclus';
              }
            }
            setUser(sanitizedProfile);
            localStorage.setItem('bookly_user', JSON.stringify(sanitizedProfile));
          } else {
            const formattedName =
              fbUser.displayName ||
              fbUser.email
                .split('@')[0]
                .replace(/[._-]/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase());

            const effectiveAdmin = isUserAdmin && !isStandardUser;
            const newProfile: UserProfile = {
              id: fbUser.uid,
              name: formattedName,
              email: fbUser.email,
              role: effectiveAdmin ? 'Super Administrateur Plateforme' : 'Auteur & Créateur Digital',
              bio: 'Compte connecté via Firebase. Vos projets et manuscrits sont enregistrés de façon sécurisée.',
              avatarBg: effectiveAdmin
                ? 'linear-gradient(135deg, #d97706, #f59e0b)'
                : 'linear-gradient(135deg, #2563eb, #38bdf8)',
              avatarUrl: fbUser.photoURL || undefined,
              authProvider: 'google',
              isAdmin: effectiveAdmin,
              signature: `${formattedName} — Auteur Bookly`,
              plan: effectiveAdmin ? 'premium' : 'free',
              planBilling: 'monthly',
              planRenewsAt: effectiveAdmin ? 'Illimité (Admin)' : 'Plan Gratuit Inclus',
              lifetimeProjectsCreated: 0,
              monthlyProjectsCreated: 0,
              dailyChatbotCount: 0,
              createdAt: new Date().toISOString().split('T')[0],
              lastLoginAt: 'À l\'instant'
            };
            setUser(newProfile);
            await firestoreService.saveUserProfile(newProfile);
            localStorage.setItem('bookly_user', JSON.stringify(newProfile));
          }

          if (isUserAdmin && !isStandardUser) {
            setIsAdminUnlocked(true);
          } else {
            setIsAdminUnlocked(false);
            try {
              const adminAuthRaw = localStorage.getItem('bookly_admin_auth');
              if (adminAuthRaw) {
                const parsed = JSON.parse(adminAuthRaw);
                if (
                  parsed.adminEmail &&
                  parsed.adminEmail.toLowerCase() !== ADMIN_SECURITY_CREDENTIALS.adminEmail.toLowerCase()
                ) {
                  localStorage.removeItem('bookly_admin_auth');
                }
              }
            } catch {
              localStorage.removeItem('bookly_admin_auth');
            }
          }

          setIsAuthMandatory(false);
          setIsAuthModalOpen(false);
        } catch (err) {
          console.warn('Firebase auth sync warning:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Check for Saspay checkout return callback in URL params
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const isPaymentReturn = params.get('payment_session');
      const paymentStatus = params.get('payment_status');
      const sessionId = params.get('session_id');

      if (isPaymentReturn || paymentStatus === 'success' || sessionId) {
        if (sessionId) {
          fetch(`/api/payments/verify/${sessionId}`)
            .then((r) => r.json())
            .then((data) => {
              if (data.success && (data.session?.status === 'SUCCESS' || data.session?.status === 'PAID')) {
                const plan = (data.session?.metadata?.plan || 'pro') as 'pro' | 'premium';
                const billingCycle = (data.session?.metadata?.billingCycle || 'monthly') as 'monthly' | 'quarterly' | 'yearly';
                handleUpgradeSuccess({
                  ...user,
                  plan,
                  planBilling: billingCycle,
                  planRenewsAt: billingCycle === 'yearly' ? 'Dans 1 an (Annuel)' : billingCycle === 'quarterly' ? 'Dans 3 mois (Trimestriel)' : 'Dans 30 jours (Mensuel)'
                });
                showToast(
                  'Abonnement Saspay validé !',
                  `Votre souscription au Plan ${plan.toUpperCase()} a été confirmée avec succès.`,
                  'success'
                );
              }
            })
            .catch(console.error);
        } else if (paymentStatus === 'success') {
          showToast(
            'Paiement Saspay enregistré !',
            'Merci pour votre souscription à Bookly Studio.',
            'success'
          );
        }

        // Clean query params from URL
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      }
    } catch {
      // ignore
    }
  }, []);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `t-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync admin state to LocalStorage
  useEffect(() => {
    localStorage.setItem('bookly_admin_users', JSON.stringify(adminUsers));
  }, [adminUsers]);

  useEffect(() => {
    localStorage.setItem('bookly_admin_logs', JSON.stringify(adminErrorLogs));
  }, [adminErrorLogs]);

  useEffect(() => {
    localStorage.setItem('bookly_admin_config', JSON.stringify(adminGlobalConfig));
  }, [adminGlobalConfig]);

  // Load and sync projects for the current user
  useEffect(() => {
    if (!user?.id) return;
    const userScopedKey = `bookly_projects_${user.id}`;
    const saved = localStorage.getItem(userScopedKey);
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      setProjects([]);
    }

    // Also fetch from Firestore in case they have cloud data
    let isMounted = true;
    firestoreService.getUserProjects(user.id).then((cloudProjects) => {
      if (isMounted && cloudProjects && cloudProjects.length > 0) {
        setProjects(cloudProjects);
        localStorage.setItem(userScopedKey, JSON.stringify(cloudProjects));
      }
    }).catch((err) => {
      console.warn('Firestore fetch note:', err);
    });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Sync current user's projects to LocalStorage
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`bookly_projects_${user.id}`, JSON.stringify(projects));
      localStorage.setItem('bookly_projects', JSON.stringify(projects));
    }
  }, [projects, user?.id]);

  useEffect(() => {
    localStorage.setItem('bookly_library', JSON.stringify(libraryBooks));
  }, [libraryBooks]);

  useEffect(() => {
    localStorage.setItem('bookly_training', JSON.stringify(trainingCourses));
  }, [trainingCourses]);

  useEffect(() => {
    localStorage.setItem('bookly_user', JSON.stringify(user));
  }, [user]);

  // Apply dark mode & theme settings
  useEffect(() => {
    localStorage.setItem('bookly_settings', JSON.stringify(settings));
    const isDark = settings.darkMode || settings.theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Handle admin lock
  const handleLockAdmin = () => {
    setIsAdminUnlocked(false);
    localStorage.removeItem('bookly_admin_auth');
    showToast('Session Verrouillée', 'Vous avez quitté l\'espace administrateur.', 'info');
    if (currentView === 'admin') {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('SignOut error', e);
    }
    localStorage.removeItem('bookly_auth_session');
    localStorage.removeItem('bookly_admin_auth');
    localStorage.removeItem('bookly_user');
    setIsAdminUnlocked(false);
    setUser(INITIAL_USER);
    setCurrentView('landing');
    setIsAuthMandatory(false);
    setIsAuthModalOpen(false);
    showToast('Déconnexion réussie', 'Vous êtes sur la vitrine publique Bookly. À bientôt !', 'info');
  };

  const handleOpenSubscriptionModal = (plan: 'pro' | 'premium' = 'pro') => {
    setTargetUpgradePlan(plan);
    setIsSubscriptionModalOpen(true);
  };

  const handleUpgradeSuccess = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem('bookly_user_profile', JSON.stringify(updatedUser));
    if (updatedUser.id) {
      firestoreService.saveUserProfile(updatedUser).catch((err) => {
        console.warn('Erreur sauvegarde profil Firestore:', err);
      });
    }
    setIsSubscriptionModalOpen(false);
    showToast(
      'Abonnement Activé !',
      `Félicitations, vous bénéficiez désormais de la formule ${updatedUser.plan?.toUpperCase()} avec accès complet.`,
      'success'
    );
  };

  // Actions on Projects
  const handleSaveProject = (updatedProject: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    if (user?.id) {
      firestoreService.saveProject(updatedProject, user.id);
    }
    setStudioProject(null);
  };

  const handleOpenNewProject = () => {
    const check = checkCanCreateProject(user, projects.length);
    if (!check.allowed) {
      showToast('Limite d\'e-book atteinte', check.reason || 'Limite de votre abonnement atteinte.', 'error');
      handleOpenSubscriptionModal('pro');
      return;
    }
    setIsNewProjectOpen(true);
  };

  const handleCreateProject = (newProject: Project) => {
    // Vérification centralisée des limites d'abonnement
    const check = checkCanCreateProject(user, projects.length);
    if (!check.allowed) {
      showToast('Limite d\'e-book atteinte', check.reason || 'Limite de votre abonnement atteinte.', 'error');
      handleOpenSubscriptionModal('pro');
      return;
    }

    setProjects((prev) => [newProject, ...prev]);
    if (user?.id) {
      firestoreService.saveProject(newProject, user.id);
    }
    setUser((prev) => ({
      ...prev,
      lifetimeProjectsCreated: (prev.lifetimeProjectsCreated ?? 0) + 1
    }));
    setStudioProject(newProject);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    firestoreService.deleteProject(projectId);
    showToast('Projet supprimé', 'Le manuscrit a été retiré de votre studio.', 'info');
  };

  const handleDuplicateProject = (project: Project) => {
    const check = checkCanCreateProject(user, projects.length);
    if (!check.allowed) {
      showToast('Limite d\'e-book atteinte', check.reason || 'Limite de votre abonnement atteinte.', 'error');
      handleOpenSubscriptionModal('pro');
      return;
    }
    const duplicated: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      title: `${project.title} (Copie)`,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: 'À l\'instant'
    };
    setProjects((prev) => [duplicated, ...prev]);
    if (user?.id) {
      firestoreService.saveProject(duplicated, user.id);
    }
    showToast('Projet dupliqué', `"${duplicated.title}" a été créé.`, 'success');
  };

  const handleToggleFavoriteBook = (bookId: string) => {
    setLibraryBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, isFavorite: !b.isFavorite } : b))
    );
  };

  const handleToggleCourseModule = (courseId: string, moduleIndex: number) => {
    setTrainingCourses((prev) =>
      prev.map((course) => {
        if (course.id === courseId) {
          const updatedModules = course.modulesList.map((m, idx) =>
            idx === moduleIndex ? { ...m, completed: !m.completed } : m
          );
          const completedCount = updatedModules.filter((m) => m.completed).length;
          const progress = Math.round((completedCount / updatedModules.length) * 100);

          return {
            ...course,
            modulesList: updatedModules,
            completedModules: completedCount,
            progress
          };
        }
        return course;
      })
    );

    if (selectedCourse && selectedCourse.id === courseId) {
      const updatedModules = selectedCourse.modulesList.map((m, idx) =>
        idx === moduleIndex ? { ...m, completed: !m.completed } : m
      );
      const completedCount = updatedModules.filter((m) => m.completed).length;
      const progress = Math.round((completedCount / updatedModules.length) * 100);

      setSelectedCourse({
        ...selectedCourse,
        modulesList: updatedModules,
        completedModules: completedCount,
        progress
      });
    }
  };

  const handleCreateProjectFromBrainstorm = (idea: {
    title: string;
    category: string;
    description: string;
    chapters?: Array<{ title: string; content?: string }>;
  }) => {
    const formattedChapters = idea.chapters && idea.chapters.length > 0
      ? idea.chapters.map((ch, idx) => ({
          id: `ch-${Date.now()}-${idx + 1}`,
          title: ch.title,
          content: ch.content || `### ${ch.title}\n\nRédigez votre contenu ici...`,
          wordCount: 100,
          completed: false
        }))
      : [
          {
            id: `ch-${Date.now()}-1`,
            title: 'Chapitre 1 : Introduction & Prémisse',
            content: `### Chapitre 1\n\n${idea.description}\n\nCommencez la rédaction de votre ouvrage ici.`,
            wordCount: 120,
            completed: false
          }
        ];

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: idea.title,
      subtitle: idea.description.slice(0, 100),
      category: idea.category,
      author: user.name,
      coverGradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
      status: 'in_progress',
      progress: 5,
      wordCount: formattedChapters.length * 100,
      readingTimeMinutes: Math.max(2, Math.ceil(formattedChapters.length * 1.5)),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: 'À l\'instant',
      description: idea.description,
      chapters: formattedChapters
    };
    handleCreateProject(newProj);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Toast System */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {!isLoggedIn ? (
        <div className="flex-1 w-full flex flex-col">
          <LandingPageView
            user={user}
            darkMode={settings.darkMode}
            onToggleDarkMode={() => setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }))}
            onStartCreating={() => {
              setAuthModalInitialMode('signup');
              setIsAuthMandatory(false);
              setIsAuthModalOpen(true);
            }}
            onOpenSamplePdf={() => {
              const sample = libraryBooks[0] || projects[0];
              if (sample) {
                setReaderItem(sample);
              }
            }}
            onOpenAuth={(mode = 'login') => {
              setAuthModalInitialMode(mode);
              setIsAuthMandatory(false);
              setIsAuthModalOpen(true);
            }}
            onChoosePlan={(plan) => {
              setTargetUpgradePlan(plan === 'free' ? 'pro' : plan);
              setAuthModalInitialMode('signup');
              setIsAuthMandatory(false);
              setIsAuthModalOpen(true);
            }}
            onNavigateToDashboard={() => {
              setAuthModalInitialMode('login');
              setIsAuthMandatory(false);
              setIsAuthModalOpen(true);
            }}
          />
        </div>
      ) : (
        <>
          {/* Top Header */}
          <Header
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'admin' && !isAdminUnlocked) {
            setIsAdminLoginModalOpen(true);
          } else {
            setCurrentView(view);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onToggleSidebar={() => setSidebarOpen(true)}
        darkMode={settings.darkMode}
        onToggleDarkMode={() => setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }))}
        user={user}
        onOpenBrainstorm={() => setIsBrainstormOpen(true)}
        isAdminUnlocked={isAdminUnlocked}
        onOpenAdminAuth={() => setIsAdminLoginModalOpen(true)}
        onLockAdmin={handleLockAdmin}
        onOpenAuthModal={() => {
          setIsAuthMandatory(false);
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenSubscriptionModal={() => handleOpenSubscriptionModal('pro')}
      />

      {/* Sliding Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'admin' && !isAdminUnlocked) {
            setIsAdminLoginModalOpen(true);
          } else {
            setCurrentView(view);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenNewProject={handleOpenNewProject}
        onOpenBrainstorm={() => setIsBrainstormOpen(true)}
        projects={projects}
        isAdminUnlocked={isAdminUnlocked}
        onOpenAdminAuth={() => setIsAdminLoginModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12">
        {currentView === 'landing' && (
          <LandingPageView
            user={user}
            onStartCreating={() => {
              if (hasExistingSession()) {
                setCurrentView('projects');
                handleOpenNewProject();
              } else {
                setIsAuthMandatory(false);
                setIsAuthModalOpen(true);
              }
            }}
            onOpenSamplePdf={() => {
              const sample = libraryBooks[0] || projects[0];
              if (sample) {
                setReaderItem(sample);
              }
            }}
            onOpenAuth={() => {
              setIsAuthMandatory(false);
              setIsAuthModalOpen(true);
            }}
            onChoosePlan={(plan) => {
              if (plan === 'free') {
                if (hasExistingSession()) {
                  setCurrentView('dashboard');
                } else {
                  setIsAuthMandatory(false);
                  setIsAuthModalOpen(true);
                }
              } else {
                setTargetUpgradePlan(plan);
                if (hasExistingSession()) {
                  setIsSubscriptionModalOpen(true);
                } else {
                  setIsAuthMandatory(false);
                  setIsAuthModalOpen(true);
                }
              }
            }}
            onNavigateToDashboard={() => {
              setCurrentView('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            projects={projects}
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenNewProject={handleOpenNewProject}
            onOpenBrainstorm={() => setIsBrainstormOpen(true)}
            onOpenStudio={(proj) => setStudioProject(proj)}
            onOpenExport={(proj) => setExportItem(proj || projects[0])}
          />
        )}

        {currentView === 'projects' && (
          <ProjectsView
            projects={projects}
            onOpenNewProject={handleOpenNewProject}
            onOpenStudio={(proj) => setStudioProject(proj)}
            onOpenReader={(proj) => setReaderItem(proj)}
            onOpenExport={(proj) => setExportItem(proj)}
            onDeleteProject={handleDeleteProject}
            onDuplicateProject={handleDuplicateProject}
          />
        )}

        {currentView === 'library' && (
          <LibraryView
            books={libraryBooks}
            userProjects={projects}
            onOpenReader={(item) => setReaderItem(item)}
            onOpenExport={(item) => setExportItem(item)}
            onToggleFavorite={handleToggleFavoriteBook}
            onNavigateToStudio={() => {
              setCurrentView('projects');
              handleOpenNewProject();
            }}
            onOpenStudio={(proj) => setStudioProject(proj)}
          />
        )}

        {currentView === 'formations' && (
          <FormationsView
            courses={trainingCourses}
            onOpenCourse={(course) => setSelectedCourse(course)}
            onShowToast={showToast}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            user={user}
            onUpdateUser={setUser}
            settings={settings}
            onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
            onShowToast={showToast}
            isAdminUnlocked={isAdminUnlocked}
            onUnlockAdmin={() => {
              setIsAdminUnlocked(true);
              setCurrentView('admin');
            }}
            onLockAdmin={handleLockAdmin}
            onNavigateToAdmin={() => setCurrentView('admin')}
            onOpenAuthModal={() => {
              setIsAuthMandatory(false);
              setIsAuthModalOpen(true);
            }}
            onOpenSubscriptionModal={handleOpenSubscriptionModal}
          />
        )}

        {currentView === 'admin' && (
          isAdminUnlocked ? (
            <AdminDashboardView
              users={adminUsers}
              onUpdateUsers={setAdminUsers}
              apiStats={adminApiStats}
              subscriptionRevenueStats={INITIAL_SUBSCRIPTION_REVENUE_STATS}
              errorLogs={adminErrorLogs}
              onUpdateErrorLogs={setAdminErrorLogs}
              globalConfig={adminGlobalConfig}
              onUpdateGlobalConfig={setAdminGlobalConfig}
              onLockAdmin={handleLockAdmin}
              onShowToast={showToast}
            />
          ) : (
            <div className="max-w-md mx-auto py-16 px-6 text-center space-y-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
                <span className="text-2xl">🔒</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Accès Administrateur Restreint</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Ce module de pilotage complet est réservé aux administrateurs certifiés de Bookly Studio.
                </p>
              </div>
              <button
                onClick={() => setIsAdminLoginModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
              >
                S'identifier en tant qu'Administrateur
              </button>
            </div>
          )
        )}
      </main>
        </>
      )}

      {/* Authentication Modal (Initial Wall & Account Switching) */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authModalInitialMode}
          isMandatory={isAuthMandatory}
          onClose={() => {
            if (!isAuthMandatory) {
              setIsAuthModalOpen(false);
            }
          }}
          onLoginSuccess={(loggedInUser, isAdmin) => {
            setUser(loggedInUser);
            localStorage.setItem('bookly_user', JSON.stringify(loggedInUser));
            if (isAdmin || loggedInUser.isAdmin) {
              setIsAdminUnlocked(true);
            }
            setCurrentView('dashboard');
            // Register / update in admin users list
            setAdminUsers((prev) => {
              const existingIdx = prev.findIndex(
                (u) => u.email.toLowerCase() === loggedInUser.email.toLowerCase()
              );
              if (existingIdx !== -1) {
                return prev.map((u, i) =>
                  i === existingIdx
                    ? { ...u, lastActiveDate: 'À l\'instant' }
                    : u
                );
              }
              const userPlan: 'free' | 'pro' | 'premium' =
                loggedInUser.plan === 'premium'
                  ? 'premium'
                  : loggedInUser.plan === 'pro'
                  ? 'pro'
                  : 'free';

              const newAdminUser: AdminUser = {
                id: loggedInUser.id,
                name: loggedInUser.name,
                email: loggedInUser.email,
                avatarBg: loggedInUser.avatarBg || 'linear-gradient(135deg, #4f46e5, #6366f1)',
                plan: userPlan,
                status: 'active',
                registeredDate: new Date().toISOString().split('T')[0],
                lastActiveDate: 'À l\'instant',
                dailyPromptsUsed: 0,
                dailyPromptsLimit: userPlan === 'premium' ? 200 : userPlan === 'pro' ? 50 : 5,
                lifetimeProjects: 0,
                totalWordsGenerated: 0,
                notes: loggedInUser.isAdmin ? 'Super Administrateur' : 'Inscrit via portail'
              };
              return [newAdminUser, ...prev];
            });
            setIsAuthMandatory(false);
            setIsAuthModalOpen(false);
          }}
          onShowToast={showToast}
        />
      )}

      {/* Subscription & Payment Checkout Modal */}
      {isSubscriptionModalOpen && (
        <SubscriptionModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          initialPlan={targetUpgradePlan}
          user={user}
          onUpgradeSuccess={handleUpgradeSuccess}
          onShowToast={showToast}
        />
      )}

      {/* Dedicated Admin Modal if called directly from menu */}
      {isAdminLoginModalOpen && (
        <AdminLoginModal
          isOpen={isAdminLoginModalOpen}
          onClose={() => setIsAdminLoginModalOpen(false)}
          onLoginSuccess={() => {
            setIsAdminUnlocked(true);
            setCurrentView('admin');
          }}
          onShowToast={showToast}
        />
      )}

      {/* Project Studio Modal */}
      {studioProject && (
        <ProjectStudioModal
          project={studioProject}
          isOpen={Boolean(studioProject)}
          onClose={() => setStudioProject(null)}
          onSave={handleSaveProject}
          onOpenReader={(p) => setReaderItem(p)}
          onOpenExport={(p) => setExportItem(p)}
          onShowToast={showToast}
        />
      )}

      {/* Reader Modal */}
      {readerItem && (
        <BookReaderModal
          book={readerItem}
          isOpen={Boolean(readerItem)}
          onClose={() => setReaderItem(null)}
          onExport={(item) => setExportItem(item)}
        />
      )}

      {/* Export Modal */}
      {exportItem && (
        <ExportModal
          item={exportItem}
          isOpen={Boolean(exportItem)}
          onClose={() => setExportItem(null)}
          onShowToast={showToast}
        />
      )}

      {/* Formation Course Player Modal */}
      {selectedCourse && (
        <CoursePlayerModal
          course={selectedCourse}
          isOpen={Boolean(selectedCourse)}
          onClose={() => setSelectedCourse(null)}
          onToggleModuleComplete={handleToggleCourseModule}
          onShowToast={showToast}
        />
      )}

      {/* New Project Modal */}
      {isNewProjectOpen && (
        <NewProjectModal
          isOpen={isNewProjectOpen}
          onClose={() => setIsNewProjectOpen(false)}
          onCreateProject={handleCreateProject}
          onShowToast={showToast}
          user={user}
          projects={projects}
          onOpenPricing={() => handleOpenSubscriptionModal('pro')}
        />
      )}

      {/* Brainstorming Modal */}
      {isBrainstormOpen && (
        <BrainstormingModal
          isOpen={isBrainstormOpen}
          onClose={() => setIsBrainstormOpen(false)}
          onCreateProjectFromIdea={handleCreateProjectFromBrainstorm}
          onShowToast={showToast}
        />
      )}
    </div>
  );
}
