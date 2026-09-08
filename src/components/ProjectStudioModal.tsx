import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Save,
  Sparkles,
  Plus,
  Trash2,
  BookOpen,
  Download,
  CheckCircle2,
  Zap,
  FileText,
  Clock,
  Layers,
  Wand2,
  Maximize2,
  Minimize2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Palette,
  Image as ImageIcon
} from 'lucide-react';
import { Project, Chapter, UserProfile } from '../types';
import {
  generateAiContent,
  generateSingleChapterDraft,
  generateBatchChapters,
  generateChapterIllustration,
  generateBatchIllustrations
} from '../services/aiService';
import { checkCanGenerateChapterIllustrations } from '../services/subscriptionService';
import {
  cleanAndFormatTextToHtml,
  stripMarkdownToPureText,
  paginateBook,
  generateDocxBlob
} from '../services/bookTypesettingService';
import { EbookCoverThumbnail } from './EbookCoverThumbnail';
import { CoverGalleryModal } from './CoverGalleryModal';
import { ChapterIllustrationModal } from './ChapterIllustrationModal';
import { PrestigeIllustrationUpgradeModal } from './PrestigeIllustrationUpgradeModal';
import { getCoverTemplateById } from '../data/coverTemplatesData';

interface ProjectStudioModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProject: Project) => void;
  onOpenReader: (project: Project) => void;
  onOpenExport: (project: Project) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  user?: Partial<UserProfile> | null;
  onOpenPricing?: (plan?: 'pro' | 'premium', cycle?: 'monthly' | 'quarterly' | 'yearly') => void;
}

export const ProjectStudioModal: React.FC<ProjectStudioModalProps> = ({
  project,
  isOpen,
  onClose,
  onSave,
  onOpenReader,
  onOpenExport,
  onShowToast,
  user,
  onOpenPricing
}) => {
  if (!isOpen || !project) return null;

  const [activeProject, setActiveProject] = useState<Project>({ ...project });
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    project.chapters && project.chapters.length > 0 ? project.chapters[0].id : ''
  );
  const [editorMode, setEditorMode] = useState<'write' | 'a4_preview'>('write');
  const [previewPageIdx, setPreviewPageIdx] = useState<number>(0);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [showAiBox, setShowAiBox] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; title: string }>({
    current: 0,
    total: 0,
    title: ''
  });
  const [isIllustrationLoading, setIsIllustrationLoading] = useState(false);
  const [illustrationStyle, setIllustrationStyle] = useState<'editorial' | 'minimalist' | 'photorealistic' | 'cinematic' | 'watercolor'>('editorial');
  const [showIllustrationPanel, setShowIllustrationPanel] = useState(false);
  const [isIllustrationModalOpen, setIsIllustrationModalOpen] = useState(false);
  const [isPrestigeModalOpen, setIsPrestigeModalOpen] = useState(false);
  const [targetIllustrationChapterId, setTargetIllustrationChapterId] = useState<string | null>(null);
  const [isBatchIllustrating, setIsBatchIllustrating] = useState(false);
  const [batchIllustrationProgress, setBatchIllustrationProgress] = useState<{ current: number; total: number; title: string }>({
    current: 0,
    total: 0,
    title: ''
  });

  useEffect(() => {
    setActiveProject({ ...project });
    if (project.chapters && project.chapters.length > 0) {
      setSelectedChapterId(project.chapters[0].id);
    }
  }, [project]);

  // Keyboard shortcut listener: Escape to close, Ctrl/Cmd + S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCoverModalOpen) {
          setIsCoverModalOpen(false);
          return;
        }
        if (showAiBox) {
          setShowAiBox(false);
          return;
        }
        if (isSidebarOpen && window.innerWidth < 768) {
          setIsSidebarOpen(false);
          return;
        }
        handleSaveAndClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave(activeProject);
        onShowToast('Sauvegardé !', 'Les modifications de votre livre ont été enregistrées.', 'success');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProject, isCoverModalOpen, showAiBox, isSidebarOpen]);

  const bookStructure = useMemo(() => paginateBook(activeProject), [activeProject]);

  const activeChapter =
    activeProject.chapters.find((c) => c.id === selectedChapterId) ||
    activeProject.chapters[0] || {
      id: 'default',
      title: 'Chapitre 1',
      content: '',
      wordCount: 0,
      completed: false
    };

  const handleUpdateChapterContent = (newContent: string) => {
    const words = newContent.trim().split(/\s+/).filter(Boolean).length;
    const updatedChapters = activeProject.chapters.map((ch) => {
      if (ch.id === activeChapter.id) {
        return { ...ch, content: newContent, wordCount: words };
      }
      return ch;
    });

    const totalWords = updatedChapters.reduce((acc, c) => acc + c.wordCount, 0);
    const readingTime = Math.ceil(totalWords / 200);

    setActiveProject({
      ...activeProject,
      chapters: updatedChapters,
      wordCount: totalWords,
      readingTimeMinutes: readingTime
    });
  };

  const handleUpdateChapterTitle = (newTitle: string) => {
    const cleanTitle = stripMarkdownToPureText(newTitle);
    const updatedChapters = activeProject.chapters.map((ch) => {
      if (ch.id === activeChapter.id) {
        return { ...ch, title: cleanTitle };
      }
      return ch;
    });
    setActiveProject({ ...activeProject, chapters: updatedChapters });
  };

  const handleAddChapter = () => {
    const newId = `ch-${Date.now()}`;
    const newNumber = activeProject.chapters.length + 1;
    const newChapter: Chapter = {
      id: newId,
      title: `Chapitre ${newNumber} : Nouveau Thème`,
      content: `Commencez à rédiger ici ou utilisez l'assistant IA pour générer le premier jet.`,
      wordCount: 15,
      completed: false
    };

    const updatedChapters = [...activeProject.chapters, newChapter];
    setActiveProject({
      ...activeProject,
      chapters: updatedChapters
    });
    setSelectedChapterId(newId);
    onShowToast('Chapitre ajouté', `Le chapitre ${newNumber} a été créé.`);
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (activeProject.chapters.length <= 1) {
      onShowToast('Impossible', 'Le livre doit contenir au moins un chapitre.', 'error');
      return;
    }
    const updatedChapters = activeProject.chapters.filter((c) => c.id !== chapterId);
    setActiveProject({ ...activeProject, chapters: updatedChapters });
    setSelectedChapterId(updatedChapters[0].id);
    onShowToast('Chapitre supprimé', 'Le chapitre a été retiré.');
  };

  const handleToggleChapterCompleted = (chapterId: string) => {
    const updatedChapters = activeProject.chapters.map((c) => {
      if (c.id === chapterId) {
        return { ...c, completed: !c.completed };
      }
      return c;
    });
    const completedCount = updatedChapters.filter((c) => c.completed).length;
    const progress = Math.round((completedCount / updatedChapters.length) * 100);

    setActiveProject({
      ...activeProject,
      chapters: updatedChapters,
      progress,
      status: progress === 100 ? 'completed' : 'in_progress'
    });
  };

  const handleGenerateAiChapter = async (
    promptOverride?: string,
    actionType: 'chapter' | 'continue' | 'expand' | 'rewrite' | 'summarize' = 'chapter'
  ) => {
    setIsAiLoading(true);
    const instruction =
      promptOverride ||
      aiPromptInput ||
      `Rédige la suite détaillée du chapitre : "${activeChapter.title}" pour le livre "${activeProject.title}".`;

    try {
      const result = await generateAiContent({
        type: actionType,
        topic: activeProject.title,
        tone: 'Professionnel, captivant et clair',
        prompt:
          actionType === 'rewrite' || actionType === 'summarize' || actionType === 'expand'
            ? activeChapter.content || instruction
            : `${activeChapter.title} - ${instruction}`
      });

      if (result.text) {
        if (actionType === 'rewrite') {
          handleUpdateChapterContent(result.text);
          onShowToast('Chapitre reformulé', 'Le contenu a été réécrit avec une typographie fluide.');
        } else if (actionType === 'continue' || actionType === 'expand') {
          handleUpdateChapterContent(`${activeChapter.content}\n\n${result.text}`);
          onShowToast('Suite rédigée', 'Nouveaux paragraphes ajoutés au chapitre.');
        } else {
          handleUpdateChapterContent(result.text);
          onShowToast('Chapitre rédigé', 'Le contenu a été généré avec succès.');
        }
      }
    } catch (error) {
      console.error('Error generating AI chapter:', error);
      onShowToast('Erreur IA', 'Impossible de générer le contenu.', 'error');
    } finally {
      setIsAiLoading(false);
      setAiPromptInput('');
    }
  };

  const handleDraftCurrentChapterFromTitle = async () => {
    setIsAiLoading(true);
    try {
      const chapterIdx = activeProject.chapters.findIndex((c) => c.id === activeChapter.id);

      const draftResult = await generateSingleChapterDraft({
        bookTitle: activeProject.title,
        chapterTitle: activeChapter.title,
        chapterNumber: chapterIdx >= 0 ? chapterIdx + 1 : 1,
        totalChapters: activeProject.chapters.length,
        audience: activeProject.category,
        tone: 'Professionnel, captivant et structuré'
      });

      if (draftResult && draftResult.content) {
        handleUpdateChapterContent(draftResult.content);
        onShowToast('Chapitre rédigé', `"${activeChapter.title}" a été rédigé avec succès.`, 'success');
      }
    } catch (error) {
      console.error('Draft error:', error);
      onShowToast('Erreur', 'Impossible de rédiger ce chapitre automatiquement.', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleBatchDraftAllUnfinishedChapters = async () => {
    const unfinished = activeProject.chapters.filter((c) => !c.content || c.content.length < 80);
    if (unfinished.length === 0) {
      onShowToast('Tous rédigés', 'Tous les chapitres ont déjà du contenu !', 'info');
      return;
    }

    setIsBatchGenerating(true);
    setBatchProgress({ current: 0, total: unfinished.length, title: 'Démarrage...' });

    try {
      const updatedChapters = await generateBatchChapters(
        activeProject.chapters,
        {
          bookTitle: activeProject.title,
          audience: activeProject.category,
          tone: 'Professionnel et structuré'
        },
        (current, total, title) => {
          setBatchProgress({ current, total, title });
        }
      );

      const totalWords = updatedChapters.reduce((acc, c) => acc + (c.wordCount || 0), 0);
      const readingTime = Math.ceil(totalWords / 200);

      setActiveProject({
        ...activeProject,
        chapters: updatedChapters,
        wordCount: totalWords,
        readingTimeMinutes: readingTime
      });

      onShowToast('Livre entier rédigé !', `${unfinished.length} chapitres ont été rédigés et mis en page avec succès.`, 'success');
    } catch (error) {
      console.error('Batch draft error:', error);
      onShowToast('Erreur lot', 'Une interruption est survenue lors de la génération.', 'error');
    } finally {
      setIsBatchGenerating(false);
    }
  };

  const handleOpenIllustrationForChapter = (chapterId?: string) => {
    const check = checkCanGenerateChapterIllustrations(user);
    if (!check.allowed) {
      setIsPrestigeModalOpen(true);
      return;
    }
    setTargetIllustrationChapterId(chapterId || activeChapter.id);
    setIsIllustrationModalOpen(true);
  };

  const handleApplyIllustrationFromModal = (imageUrl: string, caption: string, style: string) => {
    const targetId = targetIllustrationChapterId || activeChapter.id;
    const updatedChapters = activeProject.chapters.map((ch) => {
      if (ch.id === targetId) {
        return {
          ...ch,
          illustrationUrl: imageUrl,
          illustrationCaption: caption,
          illustrationStyle: style
        };
      }
      return ch;
    });

    const updatedProj = { ...activeProject, chapters: updatedChapters };
    setActiveProject(updatedProj);
    onSave(updatedProj);
    setShowIllustrationPanel(true);
    onShowToast(
      'Illustration insérée !',
      'L\'illustration haute définition a été insérée au début du chapitre avec succès.',
      'success'
    );
  };

  const handleGenerateIllustrationForCurrentChapter = async (customStyle?: typeof illustrationStyle) => {
    if (!activeChapter) return;
    const check = checkCanGenerateChapterIllustrations(user);
    if (!check.allowed) {
      setIsPrestigeModalOpen(true);
      return;
    }
    setIsIllustrationLoading(true);
    try {
      const activeIdx = activeProject.chapters.findIndex((c) => c.id === activeChapter.id);
      const styleToUse = customStyle || illustrationStyle;
      const result = await generateChapterIllustration({
        bookTitle: activeProject.title,
        chapterTitle: activeChapter.title,
        chapterNumber: activeIdx >= 0 ? activeIdx + 1 : 1,
        category: activeProject.category,
        chapterSummary: activeChapter.content ? activeChapter.content.slice(0, 300) : undefined,
        style: styleToUse
      });

      const updatedChapters = activeProject.chapters.map((ch) => {
        if (ch.id === activeChapter.id) {
          return {
            ...ch,
            illustrationUrl: result.imageUrl,
            illustrationCaption: result.caption
          };
        }
        return ch;
      });

      const updatedProj = { ...activeProject, chapters: updatedChapters };
      setActiveProject(updatedProj);
      onSave(updatedProj);
      setShowIllustrationPanel(true);
      onShowToast(
        'Illustration insérée !',
        `Illustration haute définition générée et insérée en tête du chapitre (${result.source}).`,
        'success'
      );
    } catch (err: any) {
      console.error('Illustration generation error:', err);
      onShowToast('Erreur', 'Impossible de générer l\'illustration.', 'error');
    } finally {
      setIsIllustrationLoading(false);
    }
  };

  const handleRemoveChapterIllustration = (chapterId: string) => {
    const updatedChapters = activeProject.chapters.map((ch) => {
      if (ch.id === chapterId) {
        return { ...ch, illustrationUrl: undefined, illustrationCaption: undefined };
      }
      return ch;
    });
    const updatedProj = { ...activeProject, chapters: updatedChapters };
    setActiveProject(updatedProj);
    onSave(updatedProj);
    onShowToast('Illustration retirée', 'L\'illustration de ce chapitre a été supprimée.', 'info');
  };

  const handleUpdateChapterIllustrationCaption = (chapterId: string, caption: string) => {
    const updatedChapters = activeProject.chapters.map((ch) => {
      if (ch.id === chapterId) {
        return { ...ch, illustrationCaption: caption };
      }
      return ch;
    });
    setActiveProject({ ...activeProject, chapters: updatedChapters });
  };

  const handleBatchIllustrateAllChapters = async () => {
    const check = checkCanGenerateChapterIllustrations(user);
    if (!check.allowed) {
      setIsPrestigeModalOpen(true);
      return;
    }

    if (!activeProject.chapters || activeProject.chapters.length === 0) return;
    setIsBatchIllustrating(true);
    setBatchIllustrationProgress({
      current: 0,
      total: activeProject.chapters.length,
      title: 'Initialisation...'
    });

    try {
      const resultMap = await generateBatchIllustrations(
        activeProject.chapters,
        {
          bookTitle: activeProject.title,
          category: activeProject.category,
          style: illustrationStyle
        },
        (curr, tot, title) => {
          setBatchIllustrationProgress({ current: curr, total: tot, title });
        }
      );

      const updatedChapters = activeProject.chapters.map((ch) => {
        const item = resultMap[ch.id];
        if (item) {
          return {
            ...ch,
            illustrationUrl: item.illustrationUrl,
            illustrationCaption: item.illustrationCaption
          };
        }
        return ch;
      });

      const updatedProj = { ...activeProject, chapters: updatedChapters };
      setActiveProject(updatedProj);
      onSave(updatedProj);
      onShowToast(
        'Illustrations Terminées !',
        `Toutes les illustrations (${activeProject.chapters.length} chapitres) ont été générées et intégrées.`,
        'success'
      );
    } catch (err) {
      console.error('Batch illustrations error:', err);
      onShowToast('Erreur lot', 'Une erreur est survenue lors de la génération par lot.', 'error');
    } finally {
      setIsBatchIllustrating(false);
    }
  };

  const handleSaveAndClose = () => {
    onSave(activeProject);
    onClose();
  };

  const activeChapterIndex = activeProject.chapters.findIndex((c) => c.id === activeChapter.id);
  const targetIllustrationChapter =
    activeProject.chapters.find((c) => c.id === (targetIllustrationChapterId || activeChapter.id)) || activeChapter;
  const targetIllustrationChapterIndex = activeProject.chapters.findIndex(
    (c) => c.id === targetIllustrationChapter.id
  );
  const hasPrevChapter = activeChapterIndex > 0;
  const hasNextChapter = activeChapterIndex < activeProject.chapters.length - 1;

  const handlePrevChapter = () => {
    if (hasPrevChapter) {
      setSelectedChapterId(activeProject.chapters[activeChapterIndex - 1].id);
    }
  };

  const handleNextChapter = () => {
    if (hasNextChapter) {
      setSelectedChapterId(activeProject.chapters[activeChapterIndex + 1].id);
    }
  };

  const currentPage = bookStructure.pages[previewPageIdx] || bookStructure.pages[0];

  return (
    <div
      className={`fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 ${
        isFullscreen ? '!p-0' : ''
      }`}
    >
      <div
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-7xl h-[94vh] shadow-2xl flex flex-col overflow-hidden transition-all ${
          isFullscreen ? '!h-full !rounded-none !border-none' : ''
        }`}
      >
        {/* Top Studio Bar - Structured, High-Contrast & Zero Overlap */}
        <header className="px-3 sm:px-6 py-2.5 sm:py-3 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 backdrop-blur-xs flex items-center justify-between gap-2 sm:gap-4 shrink-0">
          {/* Left: Sommaire Toggle + Book Info */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {/* Unified Sommaire Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                isSidebarOpen
                  ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
              aria-label="Afficher ou masquer le sommaire"
              title={isSidebarOpen ? 'Masquer le sommaire' : 'Afficher le sommaire'}
            >
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline font-semibold">Sommaire</span>
              <span className="text-[10px] opacity-75 font-mono">({activeProject.chapters.length})</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3
                  className="font-black text-xs sm:text-sm md:text-base text-slate-900 dark:text-white truncate max-w-[130px] xs:max-w-[190px] sm:max-w-xs md:max-w-sm lg:max-w-md"
                  title={activeProject.title}
                >
                  {activeProject.title}
                </h3>
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 shrink-0">
                  {bookStructure.totalPages} p. A4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate hidden md:block">
                {activeProject.wordCount} mots &bull; ~{activeProject.readingTimeMinutes} min de lecture
              </p>
            </div>
          </div>

          {/* Center: Mode Switcher Tabs (Edition vs Mise en Page A4) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 sm:p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
            <button
              type="button"
              onClick={() => setEditorMode('write')}
              className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 sm:gap-1.5 transition-all ${
                editorMode === 'write'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-xs ring-1 ring-slate-200 dark:ring-slate-800'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Passer en mode écriture de chapitre"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Édition</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('a4_preview')}
              className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 sm:gap-1.5 transition-all ${
                editorMode === 'a4_preview'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Passer en aperçu paginé format A4"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Aperçu A4</span>
            </button>
          </div>

          {/* Right: Actions & High-Contrast Close Button */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => onOpenReader(activeProject)}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Aperçu Liseuse"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Liseuse</span>
            </button>

            <button
              onClick={() => onOpenExport(activeProject)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors shadow-2xs"
              title="Exporter en PDF / Word DOCX"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden lg:flex p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              aria-label="Plein écran"
              title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Primary Save Button */}
            <button
              id="studio-btn-save"
              onClick={handleSaveAndClose}
              className="px-3 sm:px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/25 active:scale-95 transition-all border border-indigo-500"
              title="Enregistrer les modifications (Ctrl+S)"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Enregistrer</span>
            </button>

            {/* Close Button (High contrast, clearly visible) */}
            <button
              onClick={handleSaveAndClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-transparent flex items-center justify-center transition-all shadow-2xs shrink-0 cursor-pointer ml-0.5"
              aria-label="Fermer le studio (Échap)"
              title="Fermer le studio (Échap)"
            >
              <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          </div>
        </header>

        {/* Main Workspace (Split: Chapters Sidebar + Center Editor) */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Mobile Sidebar Overlay Backdrop */}
          {isSidebarOpen && (
            <div
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-20 bg-slate-950/60 backdrop-blur-xs md:hidden"
            />
          )}

          {/* Left Chapter Nav - Collapsible on desktop, responsive drawer on mobile */}
          <div
            className={`${
              isSidebarOpen
                ? 'flex fixed inset-y-0 left-0 z-30 w-72 md:static md:w-64 sm:md:w-72 shadow-2xl md:shadow-none animate-in slide-in-from-left duration-200'
                : 'hidden'
            } bg-slate-50 dark:bg-slate-950/80 border-r border-slate-200 dark:border-slate-800 flex-col justify-between shrink-0 h-full`}
          >
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Sommaire du livre
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleAddChapter}
                  className="p-1 rounded-md text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors flex items-center gap-1 text-[11px] font-bold"
                >
                  <Plus className="w-3.5 h-3.5" /> Chapitre
                </button>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                  title="Fermer le panneau sommaire"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {activeProject.chapters.map((ch, idx) => {
                const isSelected = ch.id === activeChapter.id;
                return (
                  <div
                    key={ch.id}
                    onClick={() => {
                      setSelectedChapterId(ch.id);
                      if (window.innerWidth < 768) {
                        setIsSidebarOpen(false);
                      }
                      if (editorMode === 'a4_preview') {
                        const pageIdx = bookStructure.pages.findIndex(
                          (p) => p.chapterNumber === idx + 1 && p.isChapterOpener
                        );
                        if (pageIdx !== -1) setPreviewPageIdx(pageIdx);
                      }
                    }}
                    className={`p-2.5 rounded-xl text-left text-xs font-medium cursor-pointer transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                          p.{idx + 3}
                        </span>
                        <span className="truncate font-semibold">{stripMarkdownToPureText(ch.title)}</span>
                      </div>
                      <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {ch.wordCount || 0} mots &bull; {ch.completed ? '✓ Validé' : 'En cours'}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleChapterCompleted(ch.id);
                      }}
                      className={`p-1 rounded-md transition-colors ${
                        isSelected
                          ? 'text-white hover:bg-indigo-700'
                          : ch.completed
                          ? 'text-emerald-500 hover:bg-emerald-50'
                          : 'text-slate-400 hover:bg-slate-100'
                      }`}
                      title={ch.completed ? 'Marquer comme en cours' : 'Marquer comme validé'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Quick Status and Batch AI Generator */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 space-y-2.5">
              {isBatchGenerating ? (
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[11px] space-y-1.5">
                  <div className="flex justify-between font-bold text-purple-700 dark:text-purple-300">
                    <span>Rédaction {batchProgress.current}/{batchProgress.total}</span>
                    <span>{Math.round((batchProgress.current / (batchProgress.total || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-purple-200 dark:bg-purple-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(batchProgress.current / (batchProgress.total || 1)) * 100}%` }}
                    />
                  </div>
                  <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                    {batchProgress.title}
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleBatchDraftAllUnfinishedChapters}
                  className="w-full py-2 px-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-purple-500" />
                  <span>Rédiger tout le livre</span>
                </button>
              )}

              {/* Générateur d'illustrations en lot pour tous les chapitres */}
              {isBatchIllustrating ? (
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] space-y-1.5">
                  <div className="flex justify-between font-bold text-indigo-700 dark:text-indigo-300">
                    <span>Illustrations {batchIllustrationProgress.current}/{batchIllustrationProgress.total}</span>
                    <span>{Math.round((batchIllustrationProgress.current / (batchIllustrationProgress.total || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-indigo-200 dark:bg-indigo-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(batchIllustrationProgress.current / (batchIllustrationProgress.total || 1)) * 100}%` }}
                    />
                  </div>
                  <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                    {batchIllustrationProgress.title}
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleBatchIllustrateAllChapters}
                  className="w-full py-2 px-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                  title="Générer des illustrations haute définition pour tous les chapitres"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Illustrer tout le livre</span>
                </button>
              )}

              {/* Miniature de Couverture & Customisation */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Palette className="w-3 h-3 text-indigo-500" />
                    <span>Couverture</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCoverModalOpen(true)}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Changer
                  </button>
                </div>

                <div
                  onClick={() => setIsCoverModalOpen(true)}
                  className="cursor-pointer group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all p-1.5 bg-white dark:bg-slate-900 flex items-center gap-2.5 shadow-2xs"
                >
                  <div className="w-9 h-12 rounded-lg overflow-hidden shrink-0 shadow-xs">
                    <EbookCoverThumbnail
                      project={activeProject}
                      templateId={activeProject.coverTemplateId}
                      customGradient={activeProject.coverGradient}
                      size="full"
                      showBadge={false}
                      showAuthor={false}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                      {getCoverTemplateById(activeProject.coverTemplateId).name}
                    </p>
                    <p className="text-[9px] text-slate-500 truncate">
                      {getCoverTemplateById(activeProject.coverTemplateId).categoryLabel}
                    </p>
                    <span className="inline-block text-[9px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5 group-hover:underline">
                      24+ modèles & figures &rarr;
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between font-medium">
                <span>Avancement global</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{activeProject.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{ width: `${activeProject.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Center Editor / A4 Layout Workspace */}
          {editorMode === 'write' ? (
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
              
              {/* Clean, Non-Redundant Chapter Editor Toolbar */}
              <div className="px-3 sm:px-6 py-2.5 sm:py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/90 dark:bg-slate-950/70 shrink-0">
                {/* Left: Sequential Chapter Navigation + Completion Pill */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 shadow-2xs shrink-0">
                    <button
                      type="button"
                      onClick={handlePrevChapter}
                      disabled={!hasPrevChapter}
                      className="p-1 sm:p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Chapitre précédent"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    <span className="px-2 sm:px-2.5 py-0.5 text-xs font-black text-slate-900 dark:text-white font-mono">
                      {activeChapterIndex + 1} / {activeProject.chapters.length}
                    </span>

                    <button
                      type="button"
                      onClick={handleNextChapter}
                      disabled={!hasNextChapter}
                      className="p-1 sm:p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Chapitre suivant"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Chapter Completion Status Pill */}
                  <button
                    type="button"
                    onClick={() => handleToggleChapterCompleted(activeChapter.id)}
                    className={`hidden xs:flex items-center gap-1 px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                      activeChapter.completed
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                    }`}
                    title={activeChapter.completed ? 'Marquer comme en cours' : 'Marquer comme validé'}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${activeChapter.completed ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <span>{activeChapter.completed ? 'Validé' : 'En cours'}</span>
                  </button>
                </div>

                {/* Right: Powerful Co-pilote IA, Chapter Illustration & Delete */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <button
                    id="studio-btn-chapter-illustration"
                    type="button"
                    onClick={() => setShowIllustrationPanel(!showIllustrationPanel)}
                    className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 sm:gap-2 border transition-all cursor-pointer ${
                      showIllustrationPanel || activeChapter.illustrationUrl
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                        : 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/80 hover:bg-purple-100 dark:hover:bg-purple-900 border-purple-200 dark:border-purple-800 shadow-2xs'
                    }`}
                    title="Gérer ou générer l'illustration intérieure de ce chapitre"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-purple-300" />
                    <span>Illustration HD</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      showIllustrationPanel || activeChapter.illustrationUrl ? 'bg-purple-500 text-white' : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                    }`}>
                      {activeChapter.illustrationUrl ? '1 image' : 'IA'}
                    </span>
                  </button>

                  <button
                    id="studio-btn-ai-copilot"
                    type="button"
                    onClick={() => setShowAiBox(!showAiBox)}
                    className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 sm:gap-2 border transition-all cursor-pointer ${
                      showAiBox
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                        : 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 border-indigo-200 dark:border-indigo-800 shadow-2xs'
                    }`}
                    title="Ouvrir le co-pilote d'assistance IA pour ce chapitre"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Co-pilote IA</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      showAiBox ? 'bg-indigo-500 text-white' : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                    }`}>
                      {showAiBox ? 'Ouvert' : 'Aide'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteChapter(activeChapter.id)}
                    className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-colors cursor-pointer"
                    title="Supprimer ce chapitre"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Seamless AI Assistant Panel - Integrated, No Floating/Overlap */}
              {showAiBox && (
                <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/5 border-b border-indigo-200 dark:border-indigo-900/60 animate-in slide-in-from-top-2 space-y-3 shrink-0">
                  {/* Assistant Header with 1-Click Drafting & Dismiss */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Co-pilote de Rédaction
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden xs:inline">
                        (Rédigez automatiquement ou personnalisez la consigne)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* One-click automatic chapter generator */}
                      <button
                        type="button"
                        onClick={handleDraftCurrentChapterFromTitle}
                        disabled={isAiLoading}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                        title="Rédiger tout ce chapitre automatiquement selon son titre"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Rédiger tout le chapitre</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowAiBox(false)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Fermer le co-pilote"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Custom prompt input & Generate button */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Ex: Rédige 3 parties avec exemples concrets et un exercice pratique..."
                        value={aiPromptInput}
                        onChange={(e) => setAiPromptInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isAiLoading) handleGenerateAiChapter();
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGenerateAiChapter()}
                      disabled={isAiLoading}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 transition-all shrink-0 cursor-pointer"
                    >
                      {isAiLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Génération...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Générer</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Suggestions de Prompts Rapides */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mr-1">
                      Suggestions :
                    </span>
                    <button
                      type="button"
                      onClick={() => handleGenerateAiChapter("Rédige une introduction captivante avec une accroche forte et une promesse claire.", 'chapter')}
                      disabled={isAiLoading}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-2xs transition-colors cursor-pointer"
                    >
                      ✨ Intro percutante
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerateAiChapter("Développe les arguments clés en 3 sous-parties détaillées avec des études de cas.", 'chapter')}
                      disabled={isAiLoading}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-2xs transition-colors cursor-pointer"
                    >
                      🚀 Développer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerateAiChapter("Ajoute un encadré 'Action Immédiate' avec un exercice pas-à-pas pour le lecteur.", 'continue')}
                      disabled={isAiLoading}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-2xs transition-colors cursor-pointer"
                    >
                      💡 Exercice pratique
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerateAiChapter('', 'rewrite')}
                      disabled={isAiLoading || !activeChapter.content}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-[11px] font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40 shadow-2xs transition-colors cursor-pointer"
                    >
                      🎯 Améliorer le style
                    </button>
                  </div>
                </div>
              )}

              {/* Title & Body Textarea with clean visual boundaries */}
              <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto space-y-3.5">
                <div className="flex items-center gap-2.5 px-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md shrink-0">
                    Titre du Chapitre
                  </span>
                  <input
                    type="text"
                    value={activeChapter.title}
                    onChange={(e) => handleUpdateChapterTitle(e.target.value)}
                    placeholder="Titre du chapitre..."
                    className="flex-1 text-base sm:text-lg font-black text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-hidden pb-1 font-serif transition-colors"
                  />
                </div>

                {/* Section Illustration Intérieure du Chapitre */}
                {(showIllustrationPanel || activeChapter.illustrationUrl) && (
                  <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-gradient-to-br from-purple-50/70 via-white to-indigo-50/40 dark:from-purple-950/40 dark:via-slate-900 dark:to-indigo-950/20 p-4 transition-all shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold">
                          <ImageIcon className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>Illustration Intérieure du Chapitre</span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/80 text-purple-700 dark:text-purple-300">
                              HD &bull; Début de chapitre
                            </span>
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            Insérée automatiquement en tête de page (A4, Liseuse, PDF et DOCX)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowIllustrationPanel(false)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5"
                          title="Masquer ce panneau"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {activeChapter.illustrationUrl ? (
                      /* ACTIVE ILLUSTRATION PREVIEW & CAPTION CONTROLS */
                      <div className="space-y-3">
                        <div className="relative group overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 max-h-[240px] flex items-center justify-center">
                          <img
                            src={activeChapter.illustrationUrl}
                            alt={activeChapter.title}
                            className="w-full max-h-[240px] object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                            <span className="text-[11px] text-white/90 font-medium">
                              ✦ Aperçu HD réel
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleGenerateIllustrationForCurrentChapter()}
                                disabled={isIllustrationLoading}
                                className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-slate-900 text-xs font-bold shadow-md cursor-pointer transition-colors"
                              >
                                {isIllustrationLoading ? 'Génération...' : 'Régénérer'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenIllustrationForChapter(activeChapter.id)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
                              >
                                Studio IA
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveChapterIllustration(activeChapter.id)}
                                className="p-1 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white cursor-pointer transition-colors"
                                title="Supprimer cette illustration"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Légende / Caption */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                            Légende :
                          </span>
                          <input
                            type="text"
                            value={activeChapter.illustrationCaption || ''}
                            onChange={(e) => handleUpdateChapterIllustrationCaption(activeChapter.id, e.target.value)}
                            placeholder={`Ex: Figure ${activeChapterIndex + 1} : Illustration — ${activeChapter.title}`}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                          />
                        </div>

                        {/* Style switcher */}
                        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-slate-400">Style :</span>
                            {(['editorial', 'cinematic', 'minimalist', 'watercolor'] as const).map((style) => (
                              <button
                                key={style}
                                type="button"
                                onClick={() => {
                                  setIllustrationStyle(style);
                                  handleGenerateIllustrationForCurrentChapter(style);
                                }}
                                disabled={isIllustrationLoading}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize transition-all cursor-pointer ${
                                  illustrationStyle === style
                                    ? 'bg-purple-600 text-white shadow-2xs'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-purple-400'
                                }`}
                              >
                                {style === 'editorial' ? '🏛️ Éditorial' : style === 'cinematic' ? '🎬 Cinématique' : style === 'minimalist' ? '📐 Minimaliste' : '🎨 Aquarelle'}
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveChapterIllustration(activeChapter.id)}
                            className="text-[11px] text-rose-500 hover:underline flex items-center gap-1 cursor-pointer ml-auto"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Retirer l'illustration</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* EMPTY STATE: GENERATE BUTTON & STYLE PICKER */
                      <div className="p-4 rounded-xl border border-dashed border-purple-300 dark:border-purple-800/80 bg-white/60 dark:bg-slate-900/60 text-center space-y-3">
                        <div className="max-w-md mx-auto space-y-1">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Aucune illustration insérée pour ce chapitre.
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            L'IA analyse le titre et le contenu du chapitre pour créer une illustration haute définition sur-mesure ou sélectionner une œuvre thématique.
                          </p>
                        </div>

                        {/* Style Selector */}
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-400 mr-1">Style artistique :</span>
                          {(['editorial', 'cinematic', 'minimalist', 'watercolor'] as const).map((style) => (
                            <button
                              key={style}
                              type="button"
                              onClick={() => setIllustrationStyle(style)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                                illustrationStyle === style
                                  ? 'bg-purple-600 text-white shadow-2xs'
                                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-purple-400'
                              }`}
                            >
                              {style === 'editorial' ? '🏛️ Éditorial' : style === 'cinematic' ? '🎬 Cinématique' : style === 'minimalist' ? '📐 Minimaliste' : '🎨 Aquarelle'}
                            </button>
                          ))}
                        </div>

                        <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleGenerateIllustrationForCurrentChapter()}
                            disabled={isIllustrationLoading}
                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm shadow-purple-600/25 disabled:opacity-50 transition-all cursor-pointer"
                          >
                            {isIllustrationLoading ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Création de l'illustration HD...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Générer l'Illustration Directe</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenIllustrationForChapter(activeChapter.id)}
                            className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Studio IA Personnalisé (Prompt & Style)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Banner when illustration panel is closed and no illustration exists */}
                {!activeChapter.illustrationUrl && !showIllustrationPanel && (
                  <div className="rounded-2xl border border-dashed border-purple-200 dark:border-purple-800/60 bg-gradient-to-r from-purple-50/50 via-indigo-50/30 to-transparent dark:from-purple-950/20 dark:via-indigo-950/10 dark:to-transparent p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-purple-600/20">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                            Illustration Intérieure Haute Définition
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            Prestige (15 000 F / 3 mois min.)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Insérez automatiquement une illustration haute définition au début de ce chapitre pour sublimer votre e-book.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenIllustrationForChapter(activeChapter.id)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm shadow-purple-600/25 shrink-0 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Générer l'illustration IA</span>
                    </button>
                  </div>
                )}

                <div className="flex-1 flex flex-col min-h-[360px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 focus-within:border-indigo-500 dark:focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all p-3.5 sm:p-5 shadow-2xs">
                  <textarea
                    id="chapter-editor-textarea"
                    value={activeChapter.content}
                    onChange={(e) => handleUpdateChapterContent(e.target.value)}
                    placeholder="Rédigez ou collez le texte de votre chapitre ici..."
                    className="w-full flex-1 font-serif text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 bg-transparent resize-none focus:outline-hidden placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Bottom Status bar - Clean & informative, no duplicate action buttons */}
              <footer className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
                <div className="flex items-center gap-3 font-mono">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {activeChapter.wordCount} mots
                  </span>
                  <span>&bull;</span>
                  <span>
                    {(activeChapter.content || '').length} caractères
                  </span>
                  <span className="hidden sm:inline">&bull;</span>
                  <span className="hidden sm:inline">
                    ~{Math.ceil((activeChapter.wordCount || 0) / 200)} min de lecture
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>Sauvegarde studio synchronisée</span>
                </div>
              </footer>
            </div>
          ) : (
            /* REAL A4 BOOK PAGE WORKSPACE */
            <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
              
              {/* A4 Pagination Navigation Header */}
              <div className="px-3 sm:px-6 py-2 sm:py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Aperçu Pagination :
                  </span>
                  <span className="text-[11px] sm:text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800">
                    Page {previewPageIdx + 1} / {bookStructure.totalPages}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => onOpenExport(activeProject)}
                    className="p-1 sm:p-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 text-xs font-extrabold shadow-sm shadow-indigo-600/25"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exporter</span>
                  </button>
                </div>
              </div>

              {/* A4 Sheet Display - ONLY THIS SHEET SCROLLS */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 flex flex-col items-center justify-start">
                <div className="w-full max-w-[620px] min-h-[500px] sm:min-h-[640px] bg-white text-slate-900 shadow-2xl rounded-2xl p-5 sm:p-10 md:p-12 flex flex-col justify-between relative border border-slate-200 font-serif mb-4">
                  
                  {currentPage.isCover ? (
                    <div className="flex-1 flex flex-col justify-center items-center my-auto min-h-[480px]">
                      <div className="w-full h-full min-h-[480px] rounded-2xl overflow-hidden shadow-md">
                        <EbookCoverThumbnail
                          project={activeProject}
                          customImage={activeProject.coverCustomImage}
                          size="full"
                          showBadge={true}
                          showAuthor={true}
                        />
                      </div>
                    </div>
                  ) : currentPage.isToc ? (
                    <div className="space-y-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center border-b pb-2 font-sans text-xs uppercase font-bold text-slate-400">
                          <span>{bookStructure.title}</span>
                          <span>Sommaire</span>
                        </div>
                        <h2 className="text-center font-serif text-2xl font-black mt-6 mb-6 pb-2 border-b-2 border-indigo-600">
                          Table des Matières
                        </h2>
                        <div className="space-y-3 font-sans text-sm">
                          {bookStructure.chapters.map((ch, idx) => (
                            <div
                              key={ch.id || idx}
                              onClick={() => {
                                const pIdx = bookStructure.pages.findIndex(
                                  (p) => p.chapterNumber === idx + 1 && p.isChapterOpener
                                );
                                if (pIdx !== -1) setPreviewPageIdx(pIdx);
                              }}
                              className="flex justify-between border-b border-dotted pb-2 cursor-pointer hover:text-indigo-600 transition-colors"
                            >
                              <span className="font-bold text-indigo-600 mr-2">0{idx + 1}</span>
                              <span className="flex-1 truncate font-medium">
                                {stripMarkdownToPureText(ch.title)}
                              </span>
                              <span className="font-mono text-slate-400">p. {idx + 3}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-t pt-3 font-sans text-xs text-slate-400">
                        <span>Bookly Studio</span>
                        <span className="font-bold font-mono text-slate-700">- Page 2 -</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-between space-y-6">
                      <div className="flex justify-between items-center border-b pb-2 font-sans text-xs uppercase font-bold text-slate-400">
                        <span className="truncate max-w-[240px]">{bookStructure.title}</span>
                        <span className="truncate max-w-[240px]">{stripMarkdownToPureText(currentPage.chapterTitle)}</span>
                      </div>

                      <div className="space-y-4 font-serif leading-relaxed text-justify text-sm">
                        {currentPage.isChapterOpener && (
                          <div className="text-center border-b pb-4 mb-4">
                            <div className="font-sans text-xs font-extrabold uppercase tracking-widest text-indigo-600">
                              Chapitre {currentPage.chapterNumber}
                            </div>
                            <h2 className="text-xl font-serif font-black mt-1 text-slate-900">
                              {stripMarkdownToPureText(currentPage.chapterTitle)}
                            </h2>

                            {currentPage.illustrationUrl && (
                              <div className="mt-3 mb-2 mx-auto max-w-[95%]">
                                <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                                  <img
                                    src={currentPage.illustrationUrl}
                                    alt={stripMarkdownToPureText(currentPage.chapterTitle)}
                                    className="w-full max-h-[190px] object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                {currentPage.illustrationCaption && (
                                  <p className="mt-1.5 text-[10px] font-sans italic text-slate-500">
                                    ✦ {currentPage.illustrationCaption}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        <div
                          className="prose prose-slate max-w-none text-justify"
                          dangerouslySetInnerHTML={{ __html: currentPage.contentHtml }}
                        />
                      </div>

                      <div className="flex justify-between items-center border-t pt-3 font-sans text-xs text-slate-400">
                        <span>{bookStructure.author}</span>
                        <span className="font-bold font-mono text-slate-800">- Page {currentPage.pageNumber} -</span>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* DOCKED STICKY BOTTOM NAVIGATION BAR - NEVER MOVES OR GETS LOST ON SCROLL */}
              <footer className="shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 z-20 shadow-lg">
                <button
                  type="button"
                  onClick={() => setPreviewPageIdx(Math.max(0, previewPageIdx - 1))}
                  disabled={previewPageIdx === 0}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Page Précédente</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <div className="hidden sm:block w-28 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.round(((previewPageIdx + 1) / bookStructure.totalPages) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-extrabold font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                    Page {previewPageIdx + 1} / {bookStructure.totalPages}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewPageIdx(Math.min(bookStructure.totalPages - 1, previewPageIdx + 1))}
                  disabled={previewPageIdx === bookStructure.totalPages - 1}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-600/30 hover:scale-[1.02] active:scale-95"
                >
                  <span>Page Suivante</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </footer>
            </div>
          )}

        </div>
      </div>

      {/* Cover Gallery Modal in Studio */}
      <CoverGalleryModal
        isOpen={isCoverModalOpen}
        onClose={() => setIsCoverModalOpen(false)}
        selectedTemplateId={activeProject.coverTemplateId || 'apple-silk-ribbon'}
        selectedCustomImage={activeProject.coverCustomImage}
        onSelectTemplate={(tmpl, customImage) => {
          const updated = {
            ...activeProject,
            coverTemplateId: tmpl.id,
            coverGradient: tmpl.gradient,
            coverFigure: tmpl.figureType,
            coverLayout: tmpl.layoutStyle,
            coverAccentColor: tmpl.accentColor,
            coverCustomImage: customImage
          };
          setActiveProject(updated);
          onSave(updated);
          onShowToast(
            'Couverture actualisée',
            customImage
              ? 'Votre miniature personnalisée a été enregistrée avec succès.'
              : `Le modèle "${tmpl.name}" a été appliqué et sauvegardé.`,
            'success'
          );
        }}
        bookTitle={activeProject.title}
        bookSubtitle={activeProject.subtitle}
        bookAuthor={activeProject.author}
        bookCategory={activeProject.category}
      />

      {/* Chapter Illustration Interactive Modal */}
      {isIllustrationModalOpen && targetIllustrationChapter && (
        <ChapterIllustrationModal
          isOpen={isIllustrationModalOpen}
          onClose={() => setIsIllustrationModalOpen(false)}
          chapterTitle={targetIllustrationChapter.title}
          chapterNumber={targetIllustrationChapterIndex + 1}
          chapterContent={targetIllustrationChapter.content}
          bookTitle={activeProject.title}
          category={activeProject.category}
          initialImageUrl={targetIllustrationChapter.illustrationUrl}
          initialCaption={targetIllustrationChapter.illustrationCaption}
          onApply={(imgUrl, caption, style) => handleApplyIllustrationFromModal(imgUrl, caption, style)}
          onShowToast={onShowToast}
        />
      )}

      {/* Prestige Gate Upgrade Modal for non-eligible users */}
      <PrestigeIllustrationUpgradeModal
        isOpen={isPrestigeModalOpen}
        onClose={() => setIsPrestigeModalOpen(false)}
        user={user}
        onUpgrade={(plan, cycle) => {
          onOpenPricing?.(plan, cycle);
        }}
      />
    </div>
  );
};
