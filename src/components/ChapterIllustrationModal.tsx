import React, { useState } from 'react';
import { Sparkles, X, Wand2, Check, RefreshCw, Layers, Image as ImageIcon } from 'lucide-react';
import { generateChapterIllustration, ChapterIllustrationResult } from '../services/aiService';

export interface ChapterIllustrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterTitle: string;
  chapterNumber: number;
  chapterContent?: string;
  bookTitle: string;
  category?: string;
  initialImageUrl?: string;
  initialCaption?: string;
  onApply: (imageUrl: string, caption: string, style: string) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export type IllustrationStyleKey = 'editorial' | 'cinematic' | 'watercolor' | 'minimalist';

interface StyleOption {
  key: IllustrationStyleKey;
  label: string;
  sublabel: string;
  badge: string;
}

const STYLE_OPTIONS: StyleOption[] = [
  {
    key: 'editorial',
    label: 'Éditorial & Gravure',
    sublabel: 'Lithographie classique de luxe, traits fins, élégance livre d\'art',
    badge: 'Standard Gallimard'
  },
  {
    key: 'cinematic',
    label: 'Cinématographique',
    sublabel: 'Lumières volumétriques, profondeur de champ, composition spectaculaire',
    badge: 'Atmosphère 8K'
  },
  {
    key: 'watercolor',
    label: 'Aquarelle & Papier',
    sublabel: 'Lavages délicats sur papier d\'art texturé, nuances subtiles',
    badge: 'Art Organique'
  },
  {
    key: 'minimalist',
    label: 'Minimaliste Épuré',
    sublabel: 'Lignes architecturales pures, grand espace négatif, design contemporain',
    badge: 'Design Moderne'
  }
];

export const ChapterIllustrationModal: React.FC<ChapterIllustrationModalProps> = ({
  isOpen,
  onClose,
  chapterTitle,
  chapterNumber,
  chapterContent,
  bookTitle,
  category = 'Général',
  initialImageUrl,
  initialCaption,
  onApply,
  onShowToast
}) => {
  if (!isOpen) return null;

  const [selectedStyle, setSelectedStyle] = useState<IllustrationStyleKey>('editorial');
  const [customSummary, setCustomSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<ChapterIllustrationResult | null>(
    initialImageUrl
      ? {
          imageUrl: initialImageUrl,
          caption: initialCaption || `Figure ${chapterNumber} : Illustration — ${chapterTitle}`,
          source: 'existing'
        }
      : null
  );
  const [editedCaption, setEditedCaption] = useState(
    initialCaption || `Figure ${chapterNumber} : Illustration — ${chapterTitle}`
  );

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await generateChapterIllustration({
        bookTitle,
        chapterTitle,
        chapterNumber,
        category,
        chapterSummary: customSummary.trim() || (chapterContent ? chapterContent.slice(0, 400) : ''),
        style: selectedStyle
      });

      setCurrentResult(res);
      setEditedCaption(res.caption || `Figure ${chapterNumber} : Illustration — ${chapterTitle}`);
      onShowToast('Illustration Générée !', 'Votre illustration intérieure haute définition est prête.', 'success');
    } catch (err: any) {
      console.error('Illustration generation error:', err);
      onShowToast('Erreur de Génération', err.message || 'Impossible de générer l\'illustration.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmApply = () => {
    if (!currentResult?.imageUrl) return;
    onApply(currentResult.imageUrl, editedCaption, selectedStyle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-600/25 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Illustration IA du Chapitre {chapterNumber}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  Prestige HD
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                {chapterTitle} &bull; {bookTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Style Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Style Artistique Souhaité
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STYLE_OPTIONS.map((style) => {
                const isSelected = selectedStyle === style.key;
                return (
                  <div
                    key={style.key}
                    onClick={() => setSelectedStyle(style.key)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {style.label}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {style.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {style.sublabel}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optional Theme / Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Consigne Visuelle ou Ambiance (Optionnel)
            </label>
            <input
              type="text"
              value={customSummary}
              onChange={(e) => setCustomSummary(e.target.value)}
              placeholder="Ex: Une silhouette contemplant un lever de soleil sur une métropole moderne..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="text-[10px] text-slate-400">
              Si laissé vide, l'IA analyse automatiquement le titre et le contenu du chapitre pour créer une métaphore visuelle adaptée.
            </p>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            id="btn-generate-chapter-illustration"
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Génération Haute Définition en cours...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>{currentResult ? 'Régénérer une nouvelle illustration' : 'Créer l\'illustration de ce chapitre'}</span>
              </>
            )}
          </button>

          {/* Result Preview Box */}
          {currentResult && (
            <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                  Aperçu de l'Illustration
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                  {currentResult.source}
                </span>
              </div>

              <div className="rounded-xl overflow-hidden border border-black/10 dark:border-white/10 shadow-md bg-black/5 aspect-video max-h-60 mx-auto">
                <img
                  src={currentResult.imageUrl}
                  alt={chapterTitle}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Caption field */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Légende sous l'illustration (affichée dans le livre) :
                </label>
                <input
                  type="text"
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-serif italic text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 transition-colors"
          >
            Annuler
          </button>

          <button
            type="button"
            id="btn-apply-chapter-illustration"
            onClick={handleConfirmApply}
            disabled={!currentResult?.imageUrl || isLoading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Insérer dans le chapitre</span>
          </button>
        </div>

      </div>
    </div>
  );
};
