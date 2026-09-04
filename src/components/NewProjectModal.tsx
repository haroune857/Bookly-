import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Sparkles,
  Layers,
  BookOpen,
  DollarSign,
  Palette,
  FileText,
  Wand2,
  AlertCircle,
  Zap,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Trash2,
  MoveUp,
  MoveDown,
  CheckCircle2,
  Play,
  RotateCcw,
  Edit3,
  Sliders
} from 'lucide-react';
import { Project, Chapter, UserProfile, CoverCategory } from '../types';
import {
  generateAiOutline,
  generateSingleChapterDraft,
  generateBatchChapters,
  OutlineItem
} from '../services/aiService';
import { EBOOK_COVER_TEMPLATES, COVER_CATEGORIES, getCoverTemplateById } from '../data/coverTemplatesData';
import { EbookCoverThumbnail } from './EbookCoverThumbnail';
import { CoverGalleryModal } from './CoverGalleryModal';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Project) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  user?: UserProfile;
  projects?: Project[];
  onOpenPricing?: () => void;
}

type ModalStep = 'info' | 'outline' | 'writing_mode';

interface DraftChapterItem {
  id: string;
  number: number;
  title: string;
  summary?: string;
  content: string;
  wordCount: number;
  isDrafted: boolean;
  isGenerating?: boolean;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
  onShowToast,
  user,
  projects = [],
  onOpenPricing
}) => {
  if (!isOpen) return null;

  // Step state
  const [currentStep, setCurrentStep] = useState<ModalStep>('info');

  // Step 1: Info State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Business & Monétisation');
  const [author, setAuthor] = useState(user?.name || 'Jean Dupont');
  const [targetAudience, setTargetAudience] = useState('Grand public & Professionnels');
  const [tone, setTone] = useState('Pratique, inspirant et structuré');
  const [chaptersCount, setChaptersCount] = useState<number>(5);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('apple-silk-ribbon');
  const [selectedGradient, setSelectedGradient] = useState<string>(
    'linear-gradient(145deg, #090d16 0%, #1e1b4b 50%, #311042 100%)'
  );
  const [customCoverImage, setCustomCoverImage] = useState<string | undefined>(undefined);
  const [coverCategoryFilter, setCoverCategoryFilter] = useState<CoverCategory>('all');
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

  // Step 2: Outline (Chapters plan) State
  const [draftChapters, setDraftChapters] = useState<DraftChapterItem[]>([]);
  const [isAiOutlineLoading, setIsAiOutlineLoading] = useState(false);

  // Step 3: Writing Mode State
  const [writingMode, setWritingMode] = useState<'step_by_step' | 'batch_auto' | 'empty_skeleton'>('step_by_step');
  
  // Step-by-step sequential generator state
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [stepCustomPrompt, setStepCustomPrompt] = useState<string>('');
  const [isStepGenerating, setIsStepGenerating] = useState<boolean>(false);

  // Batch auto generation state
  const [isBatchGenerating, setIsBatchGenerating] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; title: string }>({
    current: 0,
    total: 0,
    title: ''
  });

  // Free plan limits verification
  const isFreePlan = user?.plan === 'free';
  const lifetimeProjectsCount = user?.lifetimeProjectsCreated ?? projects.length;
  const activeProjectsCount = projects.filter(
    (p) => p.status === 'in_progress' || p.status === 'ai_generating' || p.status === 'draft'
  ).length;

  const isLifetimeQuotaReached = isFreePlan && lifetimeProjectsCount >= 5;
  const isSimultaneousQuotaReached = isFreePlan && activeProjectsCount >= 1;

  // Selected cover template
  const currentCoverTemplate = getCoverTemplateById(selectedTemplateId);

  // Filtered cover templates for quick picker
  const filteredCoverTemplates = EBOOK_COVER_TEMPLATES.filter((t) => {
    return coverCategoryFilter === 'all' || t.category === coverCategoryFilter;
  });

  // Helper to initialize draft chapters from count
  const initializeDefaultChapters = (count: number, currentTitle: string) => {
    const list: DraftChapterItem[] = [];
    for (let i = 1; i <= count; i++) {
      list.push({
        id: `draft-ch-${Date.now()}-${i}`,
        number: i,
        title: i === 1
          ? `Chapitre 1 : Les Fondations & Pourquoi ${currentTitle || 'ce Projet'}`
          : i === 2
          ? `Chapitre 2 : La Méthode Pas-à-Pas et les Outils Clés`
          : i === 3
          ? `Chapitre 3 : Les Erreurs Stratégiques à Éviter`
          : i === 4
          ? `Chapitre 4 : Mise en Pratique & Optimisation`
          : `Chapitre ${i} : Passage à l'Échelle & Pérennisation`,
        summary: `Objectifs et leviers d'action pour le chapitre ${i}.`,
        content: '',
        wordCount: 0,
        isDrafted: false
      });
    }
    return list;
  };

  // Move from Step 1 to Step 2
  const handleProceedToOutline = async () => {
    if (isLifetimeQuotaReached || isSimultaneousQuotaReached) return;

    if (!title.trim()) {
      onShowToast('Titre requis', 'Veuillez renseigner le titre de votre ouvrage.', 'error');
      return;
    }

    const count = Math.max(2, Math.min(12, chaptersCount || 5));
    
    // If draftChapters is empty or length changed, populate with smart outline
    if (draftChapters.length === 0 || draftChapters.length !== count) {
      const initial = initializeDefaultChapters(count, title.trim());
      setDraftChapters(initial);
    }

    setCurrentStep('outline');
  };

  // AI Suggest Outline Titles
  const handleGenerateAiOutline = async () => {
    setIsAiOutlineLoading(true);
    onShowToast('Génération du plan IA', 'Recherche des meilleurs angles et titres de chapitres...', 'info');

    try {
      const outlineItems = await generateAiOutline({
        title: title.trim(),
        subtitle: subtitle.trim(),
        category,
        audience: targetAudience,
        tone,
        chaptersCount: draftChapters.length || chaptersCount || 5
      });

      if (outlineItems && outlineItems.length > 0) {
        const newChapters: DraftChapterItem[] = outlineItems.map((item, idx) => {
          const existing = draftChapters[idx];
          return {
            id: existing ? existing.id : `draft-ch-${Date.now()}-${idx + 1}`,
            number: idx + 1,
            title: item.title,
            summary: item.summary || '',
            content: existing ? existing.content : '',
            wordCount: existing ? existing.wordCount : 0,
            isDrafted: existing ? existing.isDrafted : false
          };
        });
        setDraftChapters(newChapters);
        onShowToast('Plan mis à jour', 'Les titres de chapitres ont été enrichis par l\'IA.', 'success');
      }
    } catch (err: any) {
      console.warn('AI outline error:', err);
      onShowToast('Erreur IA', 'Impossible de récupérer les titres.', 'error');
    } finally {
      setIsAiOutlineLoading(false);
    }
  };

  // Chapter editing helpers
  const handleUpdateChapterTitle = (index: number, newTitle: string) => {
    const updated = [...draftChapters];
    updated[index].title = newTitle;
    setDraftChapters(updated);
  };

  const handleAddChapter = () => {
    if (draftChapters.length >= 15) {
      onShowToast('Limite atteinte', 'Le livre peut contenir au maximum 15 chapitres.', 'info');
      return;
    }
    const newNumber = draftChapters.length + 1;
    const newChapter: DraftChapterItem = {
      id: `draft-ch-${Date.now()}-${newNumber}`,
      number: newNumber,
      title: `Chapitre ${newNumber} : Nouveau Thème Clé`,
      summary: 'Description des objectifs d\'apprentissage',
      content: '',
      wordCount: 0,
      isDrafted: false
    };
    setDraftChapters([...draftChapters, newChapter]);
  };

  const handleDeleteChapter = (index: number) => {
    if (draftChapters.length <= 1) {
      onShowToast('Minimum requis', 'Le livre doit avoir au moins 1 chapitre.', 'error');
      return;
    }
    const updated = draftChapters
      .filter((_, idx) => idx !== index)
      .map((ch, idx) => ({ ...ch, number: idx + 1 }));
    setDraftChapters(updated);
  };

  const handleMoveChapter = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === draftChapters.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...draftChapters];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const renumbered = updated.map((ch, idx) => ({ ...ch, number: idx + 1 }));
    setDraftChapters(renumbered);
  };

  // Move from Step 2 to Step 3
  const handleProceedToWritingMode = () => {
    // Validate that all chapters have titles
    const emptyTitle = draftChapters.find((c) => !c.title.trim());
    if (emptyTitle) {
      onShowToast('Titre manquant', 'Veuillez saisir un titre pour chaque chapitre.', 'error');
      return;
    }
    setCurrentStep('writing_mode');
  };

  // Step-by-Step Generator: Generate current active chapter
  const handleGenerateStepChapter = async () => {
    const currentChapter = draftChapters[activeStepIndex];
    if (!currentChapter) return;

    setIsStepGenerating(true);
    onShowToast('Rédaction en cours', `L'IA rédige "${currentChapter.title}"...`, 'info');

    try {
      const draft = await generateSingleChapterDraft({
        bookTitle: title.trim(),
        chapterTitle: currentChapter.title,
        chapterNumber: currentChapter.number,
        totalChapters: draftChapters.length,
        audience: targetAudience,
        tone: tone,
        customInstructions: stepCustomPrompt || undefined
      });

      const updated = [...draftChapters];
      updated[activeStepIndex] = {
        ...currentChapter,
        content: draft.content,
        wordCount: draft.wordCount,
        isDrafted: true
      };
      setDraftChapters(updated);
      setStepCustomPrompt('');
      onShowToast('Chapitre rédigé', `Le chapitre ${currentChapter.number} est prêt !`, 'success');
    } catch (err: any) {
      console.error(err);
      onShowToast('Erreur de rédaction', 'Impossible de générer le chapitre.', 'error');
    } finally {
      setIsStepGenerating(false);
    }
  };

  // Step-by-step confirmation and next
  const handleConfirmAndNextStep = () => {
    if (activeStepIndex < draftChapters.length - 1) {
      setActiveStepIndex(activeStepIndex + 1);
      setStepCustomPrompt('');
    } else {
      handleFinalizeProject();
    }
  };

  // Batch Auto Generation: All chapters in one go
  const handleStartBatchGeneration = async () => {
    setIsBatchGenerating(true);
    setBatchProgress({ current: 0, total: draftChapters.length, title: 'Initialisation...' });
    onShowToast('Génération intégrale lancée', `Rédaction automatique des ${draftChapters.length} chapitres...`, 'info');

    try {
      const updatedChapters = await generateBatchChapters(
        draftChapters.map((c) => ({ id: c.id, title: c.title })),
        {
          bookTitle: title.trim(),
          audience: targetAudience,
          tone: tone
        },
        (current, total, chTitle) => {
          setBatchProgress({ current, total, title: chTitle });
        }
      );

      const merged: DraftChapterItem[] = draftChapters.map((ch, idx) => {
        const generated = updatedChapters[idx];
        return {
          ...ch,
          content: generated ? generated.content : ch.content,
          wordCount: generated ? generated.wordCount : ch.wordCount,
          isDrafted: true
        };
      });

      setDraftChapters(merged);
      setIsBatchGenerating(false);
      onShowToast('Tous les chapitres sont rédigés !', 'Le livre a été rédigé dans son intégralité.', 'success');
      
      // Auto finalize
      handleFinalizeProject(merged);
    } catch (err: any) {
      console.error(err);
      setIsBatchGenerating(false);
      onShowToast('Erreur de génération', 'Une erreur est survenue lors de la rédaction.', 'error');
    }
  };

  // Finalize Project Creation
  const handleFinalizeProject = (chaptersListOverride?: DraftChapterItem[]) => {
    const listToUse = chaptersListOverride || draftChapters;
    
    const finalChapters: Chapter[] = listToUse.map((ch, i) => {
      const contentToUse = ch.content && ch.content.trim()
        ? ch.content
        : `### ${ch.title}\n\nCommencez à rédiger ce chapitre ou utilisez le co-pilote IA dans le studio pour développer vos idées.`;
      const wordCount = contentToUse.trim().split(/\s+/).filter(Boolean).length;

      return {
        id: ch.id || `ch-${Date.now()}-${i + 1}`,
        title: ch.title,
        content: contentToUse,
        wordCount: wordCount,
        completed: ch.isDrafted || Boolean(ch.content && ch.content.length > 200)
      };
    });

    const totalWords = finalChapters.reduce((acc, c) => acc + c.wordCount, 0);
    const readingTime = Math.ceil(totalWords / 200) || 5;
    const completedCount = finalChapters.filter((c) => c.completed).length;
    const progress = Math.round((completedCount / finalChapters.length) * 100);

    const chosenTemplate = getCoverTemplateById(selectedTemplateId);
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim(),
      category,
      author,
      coverGradient: selectedGradient || chosenTemplate.gradient,
      coverTemplateId: selectedTemplateId || chosenTemplate.id,
      coverFigure: chosenTemplate.figureType,
      coverLayout: chosenTemplate.layoutStyle,
      coverAccentColor: chosenTemplate.accentColor,
      coverCustomImage: customCoverImage,
      status: progress >= 80 ? 'in_progress' : 'in_progress',
      progress: Math.max(10, progress),
      wordCount: totalWords,
      readingTimeMinutes: readingTime,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: 'À l\'instant',
      description: subtitle || `Ouvrage pratique sur le thème : ${title}`,
      chapters: finalChapters
    };

    onCreateProject(newProject);
    onShowToast('Projet Créé !', `"${title}" a été ajouté à votre studio avec son plan personnalisé.`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[94vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header with Stepper */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>Créer un Nouvel E-book</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Étape {currentStep === 'info' ? '1/3' : currentStep === 'outline' ? '2/3' : '3/3'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentStep === 'info' && '1. Détails généraux, style de couverture et audience.'}
                {currentStep === 'outline' && '2. Définition et personnalisation libre du plan & des titres de chapitres.'}
                {currentStep === 'writing_mode' && '3. Rédaction des chapitres assistée par IA (pas-à-pas ou intégrale).'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Plan Block Check */}
        {isLifetimeQuotaReached ? (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20 shadow-sm">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                Limite Formule Gratuite (5/5 Projets)
              </span>
              <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Quota de 5 projets atteint
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Un abonné gratuit a droit à <strong>5 projets de livres au total tout au long de son abonnement</strong>. Vous avez atteint cette limite.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200"
              >
                Fermer
              </button>
              {onOpenPricing && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPricing();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 hover:opacity-95"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Passer à Premium (Projets Illimités)</span>
                </button>
              )}
            </div>
          </div>
        ) : isSimultaneousQuotaReached ? (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20 shadow-sm">
              <BookOpen className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                1 Projet en cours max (Formule Gratuite)
              </span>
              <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Vous avez déjà 1 projet en cours
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                La formule gratuite autorise <strong>un seul projet actif en simultané</strong>. Terminez votre projet en cours ou passez à Premium.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200"
              >
                Gérer mes projets
              </button>
              {onOpenPricing && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPricing();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 hover:opacity-95"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Passer à Premium (Simultané Illimité)</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col">
            
            {/* ========================================================= */}
            {/* STEP 1: GENERAL INFO & METADATA */}
            {/* ========================================================= */}
            {currentStep === 'info' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Titre de l'E-book *</span>
                      <span className="text-[11px] text-slate-400 font-normal">Obligatoire</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Le Guide Ultime de la Vente en Ligne"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-black dark:text-white font-bold focus:outline-hidden focus:border-indigo-500 shadow-xs"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Sous-titre / Promesse &amp; Accroche
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="Ex: Comment passer de 0 à 500 000 FCFA sans budget publicitaire"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-black dark:text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Catégorie
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-black dark:text-white"
                    >
                      <option value="Business & Monétisation">Business & Monétisation</option>
                      <option value="Marketing & Copywriting">Marketing & Copywriting</option>
                      <option value="Intelligence Artificielle">Intelligence Artificielle</option>
                      <option value="Développement Personnel">Développement Personnel</option>
                      <option value="Science-Fiction & Tech">Science-Fiction & Tech</option>
                      <option value="Design & Architecture">Design & Architecture</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Public Cible &amp; Lecteurs
                    </label>
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="Ex: Débutants, Créateurs, Entrepreneurs"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-black dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Auteur
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-black dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Nombre de chapitres souhaité
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={12}
                      value={chaptersCount}
                      onChange={(e) => setChaptersCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-black dark:text-white"
                    />
                  </div>
                </div>

                {/* Style et Miniature de Couverture (24+ Modèles) */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Modèle de Miniature &amp; Couverture</span>
                      <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                        {EBOOK_COVER_TEMPLATES.length} modèles
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setIsGalleryModalOpen(true)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1.5 self-start sm:self-auto bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Explorer tous les modèles &amp; figures</span>
                    </button>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {COVER_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCoverCategoryFilter(cat.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                          coverCategoryFilter === cat.id
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Horizontal Scrollable Carousel of Miniature Cards */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto p-1 scrollbar-thin">
                    {filteredCoverTemplates.map((template) => {
                      const isSelected = selectedTemplateId === template.id;

                      return (
                        <div
                          key={template.id}
                          onClick={() => {
                            setSelectedTemplateId(template.id);
                            setSelectedGradient(template.gradient);
                          }}
                          className={`group cursor-pointer rounded-xl border-2 p-1.5 transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/20 scale-[1.02]'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                          }`}
                        >
                          <div className="aspect-3/4 rounded-lg overflow-hidden relative shadow-2xs">
                            <EbookCoverThumbnail
                              title={title || 'Titre'}
                              author={author || 'Auteur'}
                              category={category}
                              templateId={template.id}
                              size="full"
                              showBadge={false}
                              showAuthor={false}
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-indigo-600 text-white rounded-full p-0.5 shadow-sm">
                                <CheckCircle2 className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-900 dark:text-white mt-1 line-clamp-1 text-center">
                            {template.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Active Selection Summary Banner */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-9 rounded-md overflow-hidden shrink-0 shadow-xs">
                        <EbookCoverThumbnail
                          title={title || 'Titre'}
                          templateId={currentCoverTemplate.id}
                          size="full"
                          showBadge={false}
                          showAuthor={false}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{currentCoverTemplate.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
                            {currentCoverTemplate.tagBadge || currentCoverTemplate.categoryLabel}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-1">
                          {currentCoverTemplate.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsGalleryModalOpen(true)}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                    >
                      Changer
                    </button>
                  </div>
                </div>

                {/* Bottom navigation */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Étape suivante : Personnaliser le plan complet
                  </div>
                  <button
                    type="button"
                    onClick={handleProceedToOutline}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-95 transition-all"
                  >
                    <span>Définir le Plan &amp; Sommaire</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 2: EDITABLE OUTLINE & CHAPTER TITLES */}
            {/* ========================================================= */}
            {currentStep === 'outline' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>Plan &amp; Sommaire Complet ({draftChapters.length} Chapitres)</span>
                    </h4>
                    <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 mt-0.5">
                      Modifiez, renommez, ajoutez ou réorganisez vos titres à votre bon vouloir avant la rédaction.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateAiOutline}
                    disabled={isAiOutlineLoading}
                    className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
                  >
                    {isAiOutlineLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    )}
                    <span>Proposer des titres avec l'IA</span>
                  </button>
                </div>

                {/* Chapter Titles List */}
                <div className="space-y-2.5 max-h-[46vh] overflow-y-auto pr-1">
                  {draftChapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center gap-3 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={chapter.title}
                          onChange={(e) => handleUpdateChapterTitle(index, e.target.value)}
                          placeholder={`Titre du Chapitre ${index + 1}`}
                          className="w-full bg-transparent border-0 border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 text-xs sm:text-sm font-bold text-black dark:text-white px-1 py-0.5 focus:outline-hidden"
                        />
                      </div>

                      {/* Reorder and Delete Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveChapter(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                          title="Monter"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveChapter(index, 'down')}
                          disabled={index === draftChapters.length - 1}
                          className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                          title="Descendre"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteChapter(index)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Chapter Button */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleAddChapter}
                    className="px-3 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter un chapitre</span>
                  </button>

                  <span className="text-[11px] text-slate-400">
                    Total : {draftChapters.length} chapitres configurés
                  </span>
                </div>

                {/* Navigation Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('info')}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour aux détails</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedToWritingMode}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-95 transition-all"
                  >
                    <span>Passer aux Options de Rédaction</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 3: WRITING MODE & CONFIRMATION ENGINE */}
            {/* ========================================================= */}
            {currentStep === 'writing_mode' && (
              <div className="space-y-5">
                {/* Mode Selector Tabs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setWritingMode('step_by_step')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      writingMode === 'step_by_step'
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-600 ring-2 ring-indigo-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-xl bg-indigo-600 text-white">
                        <Edit3 className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-100/60 dark:bg-indigo-900 px-2 py-0.5 rounded-md">
                        Recommandé
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Chapitre par Chapitre
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        Générez et validez chaque chapitre un par un avec votre confirmation.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWritingMode('batch_auto')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      writingMode === 'batch_auto'
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-600 ring-2 ring-indigo-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-xl bg-purple-600 text-white">
                        <Zap className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-100/60 dark:bg-purple-900 px-2 py-0.5 rounded-md">
                        100% Auto
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        D'une Seule Traite
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        L'IA rédige automatiquement l'ensemble des chapitres de manière séquentielle.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWritingMode('empty_skeleton')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      writingMode === 'empty_skeleton'
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-600 ring-2 ring-indigo-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-xl bg-slate-600 text-white">
                        <Layers className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        Plan Seul
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Squelette dans le Studio
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        Crée le livre avec vos titres et rédigez manuellement dans le studio.
                      </p>
                    </div>
                  </button>
                </div>

                {/* Sub-view: Option 1 (Step-by-step confirmation) */}
                {writingMode === 'step_by_step' && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                    {/* Step progress pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {draftChapters.map((ch, idx) => (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => setActiveStepIndex(idx)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                            activeStepIndex === idx
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : ch.isDrafted
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          {ch.isDrafted && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                          <span>Ch. {idx + 1}</span>
                        </button>
                      ))}
                    </div>

                    {/* Active chapter card */}
                    {draftChapters[activeStepIndex] && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400">
                              Chapitre {activeStepIndex + 1} sur {draftChapters.length}
                            </span>
                            <h4 className="text-sm sm:text-base font-bold text-black dark:text-white">
                              {draftChapters[activeStepIndex].title}
                            </h4>
                          </div>

                          {draftChapters[activeStepIndex].isDrafted && (
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{draftChapters[activeStepIndex].wordCount} mots</span>
                            </span>
                          )}
                        </div>

                        {/* Custom chapter prompt input */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                            Consigne spécifique pour ce chapitre (facultatif) :
                          </label>
                          <input
                            type="text"
                            value={stepCustomPrompt}
                            onChange={(e) => setStepCustomPrompt(e.target.value)}
                            placeholder="Ex: Insiste sur 3 études de cas réelles et un exercice pratique..."
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-black dark:text-white focus:outline-hidden focus:border-indigo-500"
                          />
                        </div>

                        {/* Chapter draft preview (if already generated) */}
                        {draftChapters[activeStepIndex].content ? (
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-36 overflow-y-auto text-xs text-black dark:text-slate-200 leading-relaxed font-normal">
                            <pre className="whitespace-pre-wrap font-sans">
                              {draftChapters[activeStepIndex].content.slice(0, 400)}...
                            </pre>
                          </div>
                        ) : null}

                        {/* Actions for current step */}
                        <div className="flex items-center justify-between pt-2">
                          <button
                            type="button"
                            onClick={handleGenerateStepChapter}
                            disabled={isStepGenerating}
                            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm disabled:opacity-50"
                          >
                            {isStepGenerating ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Rédaction en cours...</span>
                              </>
                            ) : draftChapters[activeStepIndex].isDrafted ? (
                              <>
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Régénérer ce chapitre</span>
                              </>
                            ) : (
                              <>
                                <Wand2 className="w-3.5 h-3.5" />
                                <span>Rédiger ce chapitre</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={handleConfirmAndNextStep}
                            className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                          >
                            <span>
                              {activeStepIndex === draftChapters.length - 1
                                ? 'Confirmer & Ouvrir le Studio 🚀'
                                : 'Confirmer & Chapitre Suivant ➔'}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-view: Option 2 (Batch Auto generation) */}
                {writingMode === 'batch_auto' && (
                  <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-4 text-center">
                    <div className="max-w-md mx-auto space-y-2">
                      <h4 className="text-sm sm:text-base font-bold text-purple-950 dark:text-purple-200">
                        Génération intégrale en 1 clic
                      </h4>
                      <p className="text-xs text-purple-800/80 dark:text-purple-300/80">
                        L'IA va rédiger séquentiellement les <strong>{draftChapters.length} chapitres</strong> à partir de vos titres personnalisés.
                      </p>
                    </div>

                    {isBatchGenerating && (
                      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-left space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-300">
                          <span>
                            Rédaction du Chapitre {batchProgress.current}/{batchProgress.total}
                          </span>
                          <span>
                            {Math.round((batchProgress.current / (batchProgress.total || 1)) * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-purple-100 dark:bg-purple-950 overflow-hidden">
                          <div
                            className="h-full bg-purple-600 transition-all duration-300"
                            style={{
                              width: `${(batchProgress.current / (batchProgress.total || 1)) * 100}%`
                            }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          En cours : {batchProgress.title}
                        </p>
                      </div>
                    )}

                    {!isBatchGenerating && (
                      <button
                        type="button"
                        onClick={handleStartBatchGeneration}
                        className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 active:scale-95 transition-all mx-auto"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                        <span>Lancer la Rédaction de Tout le Livre ({draftChapters.length} Chapitres)</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Sub-view: Option 3 (Empty skeleton) */}
                {writingMode === 'empty_skeleton' && (
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                      Votre livre sera créé avec la structure des <strong>{draftChapters.length} chapitres</strong> que vous avez définie. Vous pourrez rédiger ou appeler l'IA directement dans le Studio.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleFinalizeProject()}
                      className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md mx-auto"
                    >
                      <span>Créer le Projet &amp; Ouvrir le Studio</span>
                    </button>
                  </div>
                )}

                {/* Bottom Navigation */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('outline')}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Modifier le plan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFinalizeProject()}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Ouvrir directement dans le Studio
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full 24+ Covers Gallery Modal */}
      <CoverGalleryModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        selectedTemplateId={selectedTemplateId}
        selectedCustomImage={customCoverImage}
        onSelectTemplate={(tmpl, customImg) => {
          setSelectedTemplateId(tmpl.id);
          setSelectedGradient(tmpl.gradient);
          setCustomCoverImage(customImg);
          onShowToast(
            'Couverture sélectionnée',
            customImg
              ? 'Miniature personnalisée appliquée au projet.'
              : `Le modèle "${tmpl.name}" a été appliqué à votre projet.`,
            'success'
          );
        }}
        bookTitle={title || 'Mon E-book'}
        bookSubtitle={subtitle}
        bookAuthor={author}
        bookCategory={category}
      />
    </div>
  );
};
