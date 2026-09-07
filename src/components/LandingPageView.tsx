import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  FileDown,
  CheckCircle2,
  Zap,
  Star,
  ShieldCheck,
  Layers,
  ChevronDown,
  ChevronUp,
  Check,
  FileText,
  Clock,
  Eye,
  CreditCard,
  Smartphone,
  Quote,
  Flame,
  Wand2,
  LogIn,
  UserPlus,
  Moon,
  Sun,
  Menu,
  X,
  LayoutDashboard
} from 'lucide-react';
import { UserProfile } from '../types';

interface LandingPageViewProps {
  user?: UserProfile;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onStartCreating: () => void;
  onOpenSamplePdf: () => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onChoosePlan: (plan: 'free' | 'pro' | 'premium') => void;
  onNavigateToDashboard: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  user,
  darkMode,
  onToggleDarkMode,
  onStartCreating,
  onOpenSamplePdf,
  onOpenAuth,
  onChoosePlan,
  onNavigateToDashboard
}) => {
  // Mobile Nav Menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interactive FAQ State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Interactive Interactive Step 1 Demo Generator
  const [demoTopic, setDemoTopic] = useState('Guide complet pour lancer son business digital');
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);
  const [demoGenerated, setDemoGenerated] = useState(true);

  // Billing Cycle Toggle (Monthly vs Annual)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const isLoggedIn = Boolean(
    user && user.email && user.email.trim().length > 0 && user.email !== 'client@bookly.studio'
  );

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleRunDemo = () => {
    setIsGeneratingDemo(true);
    setTimeout(() => {
      setIsGeneratingDemo(false);
      setDemoGenerated(true);
    }, 600);
  };

  const faqItems = [
    {
      question: 'Suis-je le propriétaire légal des e-books générés ?',
      answer:
        'Oui, à 100 %. Tous les droits de propriété intellectuelle et les droits commerciaux vous appartiennent intégralement. Vous pouvez vendre vos e-books sur Amazon KDP, Chariow, Gumroad, votre propre boutique Shopify, ou les offrir comme lead magnet pour capturer des prospects qualifiés.'
    },
    {
      question: 'Quelle est la qualité du fichier PDF généré ?',
      answer:
        'Les exports PDF de Bookly respectent scrupuleusement les règles de l\'édition professionnelle : typographie soignée, césures automatiques, lettrines, marges de confort adaptées à la lecture sur tablette ou smartphone, sommaire cliquable et pagination dynamique. Aucun filigrane ni mention Bookly n\'est imposé.'
    },
    {
      question: 'Puis-je modifier le texte avant d\'exporter le livre ?',
      answer:
        'Absolument. Bookly intègre un Studio d\'écriture et d\'édition complet. Vous pouvez à tout moment réécrire un paragraphe, développer une section avec l\'IA, insérer vos propres anecdotes, témoignages clients ou exercices pratiques avant de lancer la compilation PDF.'
    },
    {
      question: 'Combien de temps prend la génération d\'un livre complet ?',
      answer:
        'Le plan détaillé et les titres de chapitres sont élaborés en moins de 10 secondes. La rédaction assistée par IA de l\'ensemble de l\'ouvrage prend généralement entre 2 et 4 minutes pour un e-book de 30 à 60 pages, contre plusieurs semaines de travail manuel.'
    },
    {
      question: 'Quels moyens de paiement acceptez-vous ?',
      answer:
        'Nous acceptons les cartes bancaires internationales (Visa, Mastercard) ainsi que le Mobile Money (Wave, Orange Money, MTN Mobile Money, Moov Money) via notre passerelle de paiement sécurisée Saspay.'
    }
  ];

  const testimonials = [
    {
      name: 'Amadou D.',
      role: 'Consultant en Marketing Digital',
      location: 'Dakar & Abidjan',
      quote:
        'J\'ai créé un guide complet de 45 pages en une après-midi. D\'habitude, rédiger un lead magnet me prenait 3 semaines entre l\'écriture et Canva. Avec Bookly, le plan, le texte et la maquette PDF étaient prêts en moins d\'une heure. Mes prospects adorent la clarté du document !',
      rating: 5,
      avatarBg: 'from-amber-500 to-orange-600',
      badge: '450+ téléchargements'
    },
    {
      name: 'Sarah L.',
      role: 'Coach Fitness & Créatrice de Contenu',
      location: 'Paris',
      quote:
        '150 ventes dès la première semaine de lancement. Je voulais lancer un guide de nutrition sportive, mais je bloquais sur la structure. Bookly a organisé mes connaissances de façon hyper fluide. Le rendu PDF est tellement soigné que mes clients pensaient que j\'avais engagé une maison d\'édition.',
      rating: 5,
      avatarBg: 'from-indigo-500 to-purple-600',
      badge: '1 250 000 FCFA générés'
    },
    {
      name: 'Koffi M.',
      role: 'Formateur & Auteur Indépendant',
      location: 'Lomé & Cotonou',
      quote:
        'Le meilleur investissement pour diversifier ses revenus en ligne. En tant que formateur, convertir mes cours en e-books téléchargeables est devenu un jeu d\'enfant. Bookly me fait économiser des milliers d\'euros en prestations graphiques et de rédaction.',
      rating: 5,
      avatarBg: 'from-emerald-500 to-teal-600',
      badge: '3 livres publiés'
    }
  ];

  return (
    <div className="w-full text-slate-900 dark:text-slate-100 antialiased space-y-16 sm:space-y-24 pb-16">
      {/* ========================================================= */}
      {/* 0. PUBLIC ANTICHAMBRE NAVIGATION BAR */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-950/90 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">
                  Bookly
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                  Studio SaaS
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5 hidden sm:block">
                Édition d'e-books IA & Export PDF
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a
              href="#process"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Fonctionnalités
            </a>
            <a
              href="#demo"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Démonstration
            </a>
            <a
              href="#testimonials"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Témoignages
            </a>
            <a
              href="#pricing"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Tarifs
            </a>
            <a
              href="#faq"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              FAQ
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark Mode Toggle */}
            {onToggleDarkMode && (
              <button
                onClick={onToggleDarkMode}
                title={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {isLoggedIn ? (
              <button
                onClick={onNavigateToDashboard}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Mon Tableau de bord</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Se connecter</span>
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Créer un compte</span>
                  <span className="sm:hidden">S'inscrire</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-3 text-sm">
            <div className="flex flex-col space-y-2 pt-2">
              <a
                href="#process"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
              >
                Fonctionnalités
              </a>
              <a
                href="#demo"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
              >
                Démonstrateur de plan
              </a>
              <a
                href="#testimonials"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
              >
                Témoignages & Avis
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
              >
                Tarifs
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
              >
                FAQ
              </a>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateToDashboard();
                  }}
                  className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-center flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Accéder à mon Studio</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('login');
                    }}
                    className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-center"
                  >
                    Se connecter
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('signup');
                    }}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-center"
                  >
                    Commencer gratuitement
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Logged-In User Banner Alert */}
      {isLoggedIn && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mb-6">
          <div className="p-3 sm:p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                Session active pour <strong>{user?.name || 'Auteur'}</strong> ({user?.email}) · Formule{' '}
                <strong className="uppercase">{user?.plan || 'gratuit'}</strong>
              </span>
            </div>
            <button
              onClick={onNavigateToDashboard}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <span>Aller au Tableau de bord</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. HERO SECTION (L'ACCROCHE PERCUTANTE) */}
      {/* ========================================================= */}
      <section className="relative pt-6 sm:pt-12 pb-8 sm:pb-16 overflow-hidden">
        {/* Subtle Decorative Elements (Non-slop, clean mathematical blur) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6 shadow-2xs">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span>Propulsé par une IA éditoriale de nouvelle génération</span>
          </div>

          {/* Main Headline H1 */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12] mb-6">
            Transformez vos idées en{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              e-books best-sellers
            </span>{' '}
            en quelques secondes.
          </h1>

          {/* Subtitle H2 */}
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Fini le syndrome de la page blanche et les heures passées sur la mise en page. Bookly structure,
            rédige et met en page des e-books prêts à la vente, exportables instantanément en{' '}
            <span className="font-semibold text-slate-900 dark:text-white">PDF haute définition</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
            <button
              id="btn-hero-create-ebook"
              onClick={isLoggedIn ? onNavigateToDashboard : onStartCreating}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2.5 transition-all"
            >
              <span>{isLoggedIn ? 'Accéder à mon Studio' : 'Créer mon premier e-book gratuitement'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              id="btn-hero-sample-pdf"
              onClick={onOpenSamplePdf}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-2xs"
            >
              <Eye className="w-4 h-4 text-indigo-500" />
              <span>Voir un exemple d'e-book (PDF)</span>
            </button>
          </div>

          {/* Micro-Reassurance */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-10">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
              Aucune carte bancaire requise
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
              Export PDF immédiat
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
              100 % de droits commerciaux conservés
            </span>
          </div>

          {/* Social Proof Strip */}
          <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex -space-x-2">
              {['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'].map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="Auteur Bookly"
                  className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 object-cover"
                />
              ))}
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-medium">
              Déjà plus de <strong className="text-slate-900 dark:text-white">1 400 créateurs et auteurs</strong> publient avec Bookly.
            </span>
          </div>
        </div>

        {/* Hero Interactive Mockup Showcase */}
        <div className="max-w-5xl mx-auto mt-12 px-4 sm:px-6">
          <div className="relative rounded-3xl p-1.5 bg-gradient-to-b from-indigo-500/20 via-slate-200/40 to-transparent dark:from-indigo-500/30 dark:via-slate-800/40 shadow-2xl">
            <div className="rounded-[22px] bg-slate-900 text-slate-100 overflow-hidden border border-slate-800">
              {/* Fake Window Header */}
              <div className="h-10 px-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 text-[11px] font-mono text-slate-400">
                    Bookly Studio — Le Guide Pratique du Copywriting Digital (Export PDF)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> PDF Prêt (34 pages)
                  </span>
                </div>
              </div>

              {/* Mockup Body: Book Preview */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8 bg-slate-900">
                {/* Book Cover Simulation */}
                <div className="md:col-span-4 flex flex-col items-center justify-center">
                  <div className="w-48 sm:w-56 aspect-[3/4] rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-950 p-6 flex flex-col justify-between shadow-2xl shadow-indigo-900/60 border border-indigo-400/30 transform hover:-rotate-1 transition-transform">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-200/80">
                        Édition Masterclass
                      </span>
                      <h4 className="text-base font-black text-white leading-tight">
                        Le Guide Pratique du Copywriting
                      </h4>
                      <p className="text-[10px] text-indigo-200">
                        La méthode complète pour transformer vos lecteurs en clients fidèles
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-indigo-400/20 text-[10px] text-indigo-300">
                      <span>Par Amadou D.</span>
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Live Generated Content Snippet */}
                <div className="md:col-span-8 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                        Chapitre 1 : L'Architecture Secrète des Mots Persuasifs
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> 8 min de lecture
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-serif">
                      « Écrire pour vendre ne consiste pas à séduire par des envolées lyriques, mais à
                      éliminer systématiquement la friction psychologique dans l'esprit du prospect. Chaque
                      mot doit être conçu comme un pont logique menant vers l'action... »
                    </p>
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 space-y-1">
                      <strong className="text-amber-400 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" /> La Règle d'Or Bookly :
                      </strong>
                      <p className="text-slate-400 text-[11px]">
                        Une structure en 5 actes générée en 12 secondes : Hook, Tension, Révélation, Démonstration, Passage à l'acte.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300">
                        <FileText className="w-4 h-4 text-indigo-400" /> 6 Chapitres rédigés
                      </span>
                      <span>·</span>
                      <span>12 450 mots</span>
                    </div>

                    <button
                      onClick={onOpenSamplePdf}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>Télécharger cet extrait PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. SECTION FONCTIONNALITÉS (LE PROCESSUS EN 3 ÉTAPES) */}
      {/* ========================================================= */}
      <section id="process" className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400">
            SIMPLICITÉ ABSOLUE
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-2 mb-4">
            De l'idée brute au livre publié : 3 étapes suffisent
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Vous n'avez besoin d'aucune compétence en écriture ni en graphisme. L'intelligence éditoriale
            de Bookly orchestre la structure, le style et la mise en page pour vous.
          </p>
        </div>

        {/* 3 Steps Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg mb-5 shadow-2xs">
                1
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Wand2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Décrivez votre sujet
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Entrez simplement votre thématique, votre audience cible et le ton désiré. En quelques secondes,
                Bookly génère un titre percutant, un pitch commercial et un plan complet chapitre par chapitre.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">Exemple : </span>
              « Un guide pour aider les débutants à lancer une newsletter monétisée »
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/80 border border-violet-200 dark:border-violet-800/80 text-violet-600 dark:text-violet-400 flex items-center justify-center font-black text-lg mb-5 shadow-2xs">
                2
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  L'IA rédige en profondeur
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Validez ou réajustez le sommaire. Bookly rédige un contenu argumenté, captivant et enrichi
                d'exemples réels, d'exercices pratiques et de résumés mémorables. Vous gardez la main libre pour tout éditer.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300">
              <span className="font-bold text-violet-600 dark:text-violet-400">Qualité éditoriale : </span>
              Vocabulaire précis, métaphores pédagogiques et aucun jargon creux.
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-lg mb-5 shadow-2xs">
                3
              </div>
              <div className="flex items-center gap-2 mb-2">
                <FileDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Exportez votre PDF pro
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Choisissez votre maquette de couverture, ajustez la palette de couleurs et cliquez sur Exporter.
                Votre livre est immédiatement compilé en PDF haute fidélité, prêt à être commercialisé ou partagé.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Prêt pour la vente : </span>
              Compatible Chariow, Gumroad, Amazon KDP & téléchargement direct.
            </div>
          </div>
        </div>

        {/* Live Mini-Interactive Concept Generator */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-500" />
                Faites l'essai : visualisez le plan généré pour votre futur sujet
              </span>
              <span className="text-[10px] font-mono text-slate-400">Simulation instantanée</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={demoTopic}
                onChange={(e) => setDemoTopic(e.target.value)}
                placeholder="Ex. Guide pour débuter en e-commerce ou en freelance..."
                className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleRunDemo}
                disabled={isGeneratingDemo}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shrink-0 transition-all flex items-center justify-center gap-2"
              >
                {isGeneratingDemo ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" /> Structuration...
                  </span>
                ) : (
                  <span>Générer la structure</span>
                )}
              </button>
            </div>

            {demoGenerated && (
              <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs space-y-2.5">
                <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 font-bold">
                  <span>💡 Proposition de plan pour : « {demoTopic} »</span>
                  <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    5 chapitres calibrés
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 text-[11px]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    1. Les fondations : valider son idée sans budget initial
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    2. L'offre irrésistible : packager son expertise
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    3. Acquisition client : trouver ses 10 premiers acheteurs
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    4. Automatisation & encaissement (Saspay, Mobile Money)
                  </div>
                </div>
                <div className="pt-2 text-right">
                  <button
                    onClick={onStartCreating}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                  >
                    Rédiger ce livre complet dans le Studio <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. TÉMOIGNAGES & PREUVE SOCIALE */}
      {/* ========================================================= */}
      <section id="testimonials" className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400">
            RÉSULTATS CLIENTS
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-2 mb-4">
            Ils ont créé et monétisé leur premier e-book avec Bookly
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Découvrez comment des entrepreneurs, formateurs et créateurs de contenu transforment
            leurs compétences en produits digitaux rentables.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative group hover:border-indigo-300 dark:hover:border-indigo-800/80 transition-colors"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {t.badge}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  « {t.quote} »
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-tr ${t.avatarBg} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs`}
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {t.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.role} · <span className="text-slate-400">{t.location}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. LES DIFFÉRENTS TARIFS */}
      {/* ========================================================= */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400">
            TARIFS CLAIRS SANS ENGAGEMENT
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-2 mb-4">
            Choisissez la formule idéale pour booster vos publications
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Démarrez gratuitement, montez en puissance quand vous êtes prêt. Tous vos droits commerciaux sont inclus.
          </p>

          {/* Toggle Monthly / Yearly */}
          <div className="mt-6 inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Facturation mensuelle
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Facturation annuelle</span>
              <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Plan Découverte (Gratuit) */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Formule Découverte
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Gratuit
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Pour tester la puissance du studio et créer votre premier livre.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white">0</span>
                <span className="text-sm font-bold text-slate-500">FCFA</span>
                <span className="text-xs text-slate-400 ml-1">/ pour toujours</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>1 e-book complet</strong> inclus</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Modèle d'IA standard (Groq / Gemini Flash)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Export PDF direct sans filigrane</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>100 % de vos droits commerciaux</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <span className="w-4 h-4 flex items-center justify-center font-bold">✕</span>
                  <span>Pas de personnalisation avancée des couvertures</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onChoosePlan('free')}
              className="mt-8 w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition-all"
            >
              Commencer gratuitement
            </button>
          </div>

          {/* Plan Auteur Pro (Best-Seller) */}
          <div className="relative p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-500 shadow-xl shadow-indigo-600/10 flex flex-col justify-between transform lg:-translate-y-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Flame className="w-3 h-3 fill-current" /> Le plus populaire
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Formule Auteur Pro
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Auteur Pro
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Pour les créateurs réguliers, coachs et infopreneurs ambitieux.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white">
                  {billingCycle === 'yearly' ? '3 100' : '3 900'}
                </span>
                <span className="text-sm font-bold text-slate-500">FCFA</span>
                <span className="text-xs text-slate-400 ml-1">
                  / mois {billingCycle === 'yearly' && '(facturé annuellement)'}
                </span>
              </div>

              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>E-books illimités</strong> chaque mois</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Modèles IA Pro (Gemini 2.5 Pro, Llama 3.3 70B)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Exports PDF Haute Définition + EPub</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Générateur de couvertures avec palettes premium</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Support prioritaire par e-mail</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onChoosePlan('pro')}
              className="mt-8 w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Choisir le plan Pro</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Plan Studio Premium (VIP) */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Formule Studio VIP
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Studio Premium
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Pour les agences, maisons d'édition et créateurs prolifiques.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white">
                  {billingCycle === 'yearly' ? '12 000' : '15 000'}
                </span>
                <span className="text-sm font-bold text-slate-500">FCFA</span>
                <span className="text-xs text-slate-400 ml-1">/ mois</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>Tout le plan Pro inclus</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Mode Multi-tomes & Séries de livres</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Accès aux modèles IA Ultra (Claude 3.7 / GPT-4o)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Synchronisation passerelle Chariow & Saspay</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Assistance VIP dédiée 7j/7 + WhatsApp</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onChoosePlan('premium')}
              className="mt-8 w-full py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold text-xs transition-all"
            >
              Passer à la vitesse Premium
            </button>
          </div>
        </div>

        {/* Payment Methods Banner */}
        <div className="mt-12 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Paiement sécurisé via <strong>Saspay</strong> · Cryptage SSL 256 bits</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
              <CreditCard className="w-3.5 h-3.5 text-indigo-500" /> Cartes Visa / Mastercard
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
              <Smartphone className="w-3.5 h-3.5 text-emerald-500" /> Wave, Orange Money, MTN, Moov
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. FOIRE AUX QUESTIONS (FAQ) */}
      {/* ========================================================= */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400">
            TRANSPARENCE TOTALE
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-2 mb-3">
            Questions fréquentes
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Tout ce que vous devez savoir avant de créer et publier votre premier livre.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqItems.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-850 transition-colors"
                >
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {item.question}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. APPEL À L'ACTION FINAL (CLOSING PERCUTANT) */}
      {/* ========================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white overflow-hidden border border-indigo-500/20 shadow-2xl text-center space-y-6">
          {/* Subtle Accent Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-300">
              PASSEZ À L'ACTION
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
              Votre prochain e-book est à seulement 3 clics.
            </h2>
            <p className="text-sm sm:text-base text-indigo-200/90 leading-relaxed">
              Rejoignez des centaines de créateurs qui monétisent leur savoir dès aujourd'hui.
              Créez votre compte gratuit en 30 secondes et téléchargez votre premier livre dès ce soir.
            </p>
          </div>

          <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={isLoggedIn ? onNavigateToDashboard : onStartCreating}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-black text-sm sm:text-base shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span>🚀 Commencer à rédiger gratuitement</span>
              <ArrowRight className="w-4 h-4 text-indigo-600" />
            </button>

            {!isLoggedIn && (
              <button
                onClick={() => onOpenAuth('login')}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-indigo-900/60 hover:bg-indigo-900/90 border border-indigo-400/30 text-white font-semibold text-sm transition-all"
              >
                Déjà un compte ? Se connecter
              </button>
            )}
          </div>

          <div className="relative z-10 text-[11px] text-indigo-300/80">
            Garantie Zéro Risque · Aucun engagement · Annulable à tout moment
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. FOOTER DE LA LANDING PAGE */}
      {/* ========================================================= */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 dark:text-white">Bookly Studio</span>
          <span>— L'outil SaaS d'édition d'e-books automatisé.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#process" className="hover:text-indigo-600 transition-colors">
            Fonctionnalités
          </a>
          <a href="#testimonials" className="hover:text-indigo-600 transition-colors">
            Témoignages
          </a>
          <a href="#pricing" className="hover:text-indigo-600 transition-colors">
            Tarifs
          </a>
          <a href="#faq" className="hover:text-indigo-600 transition-colors">
            FAQ
          </a>
        </div>
      </footer>
    </div>
  );
};
