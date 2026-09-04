import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Palette,
  Search,
  Check,
  Eye,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Info,
  Download,
  Wand2,
  Sliders,
  Cpu,
  Layers,
  CheckCircle2,
  Zap,
  ArrowRight
} from 'lucide-react';
import { EbookCoverTemplate, CoverCategory } from '../types';
import { EBOOK_COVER_TEMPLATES, COVER_CATEGORIES, getCoverTemplateById } from '../data/coverTemplatesData';
import { EbookCoverThumbnail } from './EbookCoverThumbnail';
import { coverGenerationService, AiCoverAdvice } from '../services/coverGenerationService';
import { getAiSystemHealth, AiSystemHealth } from '../services/aiService';

interface CoverGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplateId?: string;
  selectedCustomImage?: string;
  onSelectTemplate: (template: EbookCoverTemplate, customImage?: string) => void;
  bookTitle?: string;
  bookSubtitle?: string;
  bookAuthor?: string;
  bookCategory?: string;
  onShowToast?: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

type ModalTab = 'templates' | 'generator' | 'custom_upload';

export const CoverGalleryModal: React.FC<CoverGalleryModalProps> = ({
  isOpen,
  onClose,
  selectedTemplateId,
  selectedCustomImage,
  onSelectTemplate,
  bookTitle = 'Mon Chef-d’Œuvre Numérique',
  bookSubtitle = 'Guide complet & stratégies avancées',
  bookAuthor = 'Jean Dupont',
  bookCategory = 'Business & Innovation',
  onShowToast
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<ModalTab>(
    selectedCustomImage ? 'custom_upload' : 'templates'
  );
  const [activeCategory, setActiveCategory] = useState<CoverCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplateId, setPreviewTemplateId] = useState<string>(
    selectedTemplateId || EBOOK_COVER_TEMPLATES[0].id
  );
  const [previewCustomImage, setPreviewCustomImage] = useState<string | undefined>(
    selectedCustomImage
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generator & AI Direction State
  const [proceduralStyle, setProceduralStyle] = useState<'silk' | 'mesh' | 'cosmic' | 'geometric' | 'gold_minimal'>('silk');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [secondaryColor, setSecondaryColor] = useState('#ec4899');
  const [isGeneratingAiAdvice, setIsGeneratingAiAdvice] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<AiCoverAdvice | null>(null);
  const [isDownloadingPng, setIsDownloadingPng] = useState(false);
  const [aiHealth, setAiHealth] = useState<AiSystemHealth | null>(null);

  // Check connected AI providers
  useEffect(() => {
    getAiSystemHealth().then(setAiHealth).catch(() => {});
  }, []);

  // Filter templates
  const filteredTemplates = EBOOK_COVER_TEMPLATES.filter((template) => {
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const activePreviewTemplate = getCoverTemplateById(previewTemplateId);

  const handleApply = () => {
    if (previewCustomImage) {
      onSelectTemplate(activePreviewTemplate, previewCustomImage);
    } else {
      onSelectTemplate(activePreviewTemplate, undefined);
    }
    if (onShowToast) {
      onShowToast('Page de garde validée', 'Le visuel de couverture a été appliqué à votre manuscrit.', 'success');
    }
    onClose();
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (PNG, JPG, JPEG, WEBP, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewCustomImage(e.target.result as string);
        setActiveTab('custom_upload');
        if (onShowToast) {
          onShowToast('Image importée', 'Votre visuel personnalisé est prêt et visualisé en 3D.', 'success');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Generate procedural canvas artwork
  const handleGenerateProceduralArt = () => {
    const artworkDataUrl = coverGenerationService.generateProceduralArtwork(
      proceduralStyle,
      primaryColor,
      secondaryColor
    );
    if (artworkDataUrl) {
      setPreviewCustomImage(artworkDataUrl);
      if (onShowToast) {
        onShowToast('Fond visuel généré', 'Un fond artistique haute définition a été créé sur-mesure.', 'success');
      }
    }
  };

  // Ask AI for artistic direction
  const handleFetchAiAdvice = async () => {
    setIsGeneratingAiAdvice(true);
    try {
      const advice = await coverGenerationService.getAiCoverAdvice({
        title: bookTitle,
        subtitle: bookSubtitle,
        category: bookCategory,
        author: bookAuthor
      });
      setAiAdvice(advice);
      if (advice.recommendedTemplateId) {
        setPreviewTemplateId(advice.recommendedTemplateId);
      }
      if (advice.accentColor) {
        setPrimaryColor(advice.accentColor);
      }
      if (onShowToast) {
        onShowToast('Direction IA générée', `Recommandation basée sur ${advice.source === 'openrouter' ? 'OpenRouter' : advice.source}.`, 'success');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAiAdvice(false);
    }
  };

  // Download high-resolution PNG cover
  const handleDownloadHdCover = async () => {
    setIsDownloadingPng(true);
    try {
      await coverGenerationService.downloadCoverAsPng({
        title: bookTitle,
        subtitle: bookSubtitle,
        author: bookAuthor,
        category: bookCategory,
        coverGradient: activePreviewTemplate.gradient,
        coverTemplateId: activePreviewTemplate.id,
        coverCustomImage: previewCustomImage,
        coverAccentColor: primaryColor
      });
      if (onShowToast) {
        onShowToast('Couverture HD téléchargée', 'Fichier PNG (1414 x 2000 px, 300 DPI) enregistré sur votre appareil.', 'success');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloadingPng(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="cover-gallery-modal"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-6xl h-[92vh] max-h-[880px] shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Studio & Service de Page de Garde
                </h3>
                <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Génération &bull; Import &bull; Export HD
                </span>
                {aiHealth?.hasOpenRouterKey && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> OpenRouter Actif
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Créez une couverture mémorable, importez vos maquettes ou laissez l'IA concevoir votre charte visuelle.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Main Tabs */}
        <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="tab-cover-templates"
              onClick={() => setActiveTab('templates')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'templates'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Modèles Apple & Studio ({EBOOK_COVER_TEMPLATES.length})</span>
            </button>

            <button
              type="button"
              id="tab-cover-generator"
              onClick={() => setActiveTab('generator')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'generator'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Générateur Graphique & IA</span>
              <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[10px] font-mono">
                IA Pro
              </span>
            </button>

            <button
              type="button"
              id="tab-cover-custom-upload"
              onClick={() => setActiveTab('custom_upload')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'custom_upload'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Importer une Miniature</span>
              {previewCustomImage && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Format A4 & Ebook (1:1.414) &bull; Rendu Haute Définition
            </span>
          </div>
        </div>

        {/* Main Content Layout: Left Content (68%) + Right Live 3D Preview (32%) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* LEFT COLUMN */}
          <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/30 dark:bg-slate-950/20">
            
            {/* TAB 1: VECTOR TEMPLATES */}
            {activeTab === 'templates' && (
              <>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Rechercher par style (Apple, soie, neurone, titane, or, dunes, zen, galets...)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {COVER_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                          activeCategory === cat.id
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {filteredTemplates.map((template) => {
                    const isSelected = previewTemplateId === template.id && !previewCustomImage;
                    const isCurrentProjectChoice = selectedTemplateId === template.id && !selectedCustomImage;

                    return (
                      <div
                        key={template.id}
                        onClick={() => {
                          setPreviewTemplateId(template.id);
                          setPreviewCustomImage(undefined);
                        }}
                        onDoubleClick={handleApply}
                        className={`group relative flex flex-col rounded-2xl border-2 p-2.5 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-md ring-2 ring-indigo-500/20'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="aspect-3/4 rounded-xl overflow-hidden shadow-xs relative">
                          <EbookCoverThumbnail
                            title={bookTitle}
                            author={bookAuthor}
                            category={bookCategory}
                            templateId={template.id}
                            size="full"
                            showBadge={true}
                            showAuthor={false}
                          />

                          {isCurrentProjectChoice && (
                            <div className="absolute top-2 right-2 z-30 bg-emerald-600 text-white rounded-full p-1 shadow-md">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        <div className="mt-2.5 flex items-start justify-between gap-1">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                              {template.name}
                            </h4>
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                              {template.categoryLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* TAB 2: GENERATOR & AI ARTISTIC DIRECTION */}
            {activeTab === 'generator' && (
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                
                {/* 1. AI Creative Direction Card */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900/15 via-purple-900/10 to-pink-900/15 border border-indigo-200 dark:border-indigo-800/60 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Direction Artistique Assistée par IA
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Analyse thématique de votre titre pour générer une identité visuelle vendeuse.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleFetchAiAdvice}
                      disabled={isGeneratingAiAdvice}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all shrink-0"
                    >
                      {isGeneratingAiAdvice ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Génération IA...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Analyser & Proposer</span>
                        </>
                      )}
                    </button>
                  </div>

                  {aiAdvice && (
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-indigo-800/80 space-y-3 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Recommandation Direction Artistique
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          Moteur : {aiAdvice.source}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Palette & Accent</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="w-4 h-4 rounded-full border border-white shadow-xs" style={{ backgroundColor: aiAdvice.accentColor }} />
                            <span className="font-bold text-slate-800 dark:text-slate-100">{aiAdvice.paletteName}</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Sur-Titre & Badge</span>
                          <span className="font-bold text-slate-800 dark:text-slate-100 mt-1 block truncate">{aiAdvice.tagline}</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300 italic border-l-2 border-indigo-500 pl-3 py-1">
                        &laquo; {aiAdvice.visualMood} &raquo;
                      </div>

                      {aiAdvice.subtitleSuggestion && (
                        <div className="text-xs bg-indigo-50/50 dark:bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900 flex items-start gap-2">
                          <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">Sous-titre vendeur suggéré :</span>
                            <p className="text-slate-700 dark:text-slate-300 mt-0.5">{aiAdvice.subtitleSuggestion}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Procedural Graphic Generator */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-indigo-500" />
                      Générateur de Motifs Visuels Abstraits HD
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Créez un visuel haute résolution (1414 x 2000 px) calculé en temps réel sur Canvas.
                    </p>
                  </div>

                  {/* Styles Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'silk', label: 'Soie Vaporeuse', desc: 'Courbes lumineuses vaporeuses (Style Apple)' },
                      { id: 'mesh', label: 'Mesh Gradient', desc: 'Dégradé multicolore organique moderne' },
                      { id: 'cosmic', label: 'Nébuleuse Cosmique', desc: 'Poussière d\'étoiles et halo interstellaire' },
                      { id: 'geometric', label: 'Prisme Géométrique', desc: 'Grille polygonale et lignes de force' },
                      { id: 'gold_minimal', label: 'Or & Obsidienne', desc: 'Cadre or pur minimaliste haute joaillerie' },
                    ].map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setProceduralStyle(style.id as any)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          proceduralStyle === style.id
                            ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{style.label}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{style.desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* Color pickers */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Teinte Primaire :
                      </label>
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-700 p-0.5 bg-transparent"
                      />
                      <span className="text-xs font-mono text-slate-400">{primaryColor}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Teinte Secondaire :
                      </label>
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-700 p-0.5 bg-transparent"
                      />
                      <span className="text-xs font-mono text-slate-400">{secondaryColor}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateProceduralArt}
                      className="ml-auto px-4 py-2 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Générer ce Fond Visuel HD</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CUSTOM THUMBNAIL UPLOAD */}
            {activeTab === 'custom_upload' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 flex items-start gap-3">
                  <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <p className="font-bold text-slate-900 dark:text-white">
                      Importez votre propre création graphique ou photo de couverture
                    </p>
                    <p className="leading-relaxed">
                      Téléversez une image au format PNG, JPG, SVG ou WEBP. Notre moteur de mise en page A4 l'intégrera directement dans vos exports PDF et manuscrits imprimables avec un rendu parfait.
                    </p>
                  </div>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                    isDragging
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 scale-[1.01]'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />

                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs border border-indigo-200/50 dark:border-indigo-800/50">
                    <UploadCloud className="w-8 h-8 animate-bounce" />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Glissez-déposez votre image ici, ou <span className="text-indigo-600 dark:text-indigo-400 underline">parcourez vos fichiers</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Formats supportés : PNG, JPG, JPEG, WEBP &bull; Max 20 Mo &bull; Résolution idéale : 1414 x 2000 px
                    </p>
                  </div>
                </div>

                {/* Uploaded File Status / Action Card */}
                {previewCustomImage && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-16 rounded-lg overflow-hidden shadow-sm border border-emerald-300 shrink-0">
                        <img src={previewCustomImage} alt="Miniature importée" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                            Miniature personnalisée chargée
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                          Visualisez le rendu 3D haute définition sur le panneau de droite.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Remplacer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewCustomImage(undefined);
                          setActiveTab('templates');
                        }}
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 border border-red-200 dark:border-red-800 transition-colors"
                        title="Supprimer la miniature personnalisée"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: INTERACTIVE 3D PREVIEW & EXPORT TOOLS */}
          <div className="w-full md:w-80 lg:w-96 p-5 flex flex-col justify-between bg-white dark:bg-slate-900 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  Rendu Final 3D
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {previewCustomImage ? 'Visuel Importé' : 'Vecteur Apple'}
                </span>
              </div>

              {/* Centered Large Book Cover */}
              <div className="flex justify-center my-2">
                <div className="w-56 h-80 rounded-2xl shadow-2xl relative transition-transform duration-300 hover:scale-[1.02]">
                  <EbookCoverThumbnail
                    title={bookTitle}
                    subtitle={bookSubtitle}
                    author={bookAuthor}
                    category={bookCategory}
                    templateId={activePreviewTemplate.id}
                    customImage={previewCustomImage}
                    customGradient={activePreviewTemplate.gradient}
                    size="full"
                    showBadge={true}
                    showAuthor={true}
                  />
                </div>
              </div>

              {/* Template details card */}
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {previewCustomImage ? 'Page de Garde Personnalisée' : activePreviewTemplate.name}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {previewCustomImage ? 'Custom Artwork' : activePreviewTemplate.tagBadge || 'Édition Pro'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {previewCustomImage
                    ? 'Image haute définition intégrée avec typographie synchronisée pour l\'export A4 et PDF.'
                    : activePreviewTemplate.description}
                </p>
              </div>

              {/* HD Download Button for Marketing / KDP */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleDownloadHdCover}
                  disabled={isDownloadingPng}
                  className="w-full py-2.5 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  {isDownloadingPng ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Télécharger l'Image de Couverture (PNG HD)</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <button
                id="btn-apply-cover-template"
                onClick={handleApply}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>
                  {previewCustomImage ? 'Appliquer la Miniature au Livre' : 'Appliquer ce Modèle Graphique'}
                </span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
