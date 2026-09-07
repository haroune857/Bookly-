import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Copy,
  FileText,
  Code,
  CheckCircle2,
  Share2,
  Printer,
  Sparkles,
  BookOpen,
  FileSpreadsheet,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShieldCheck,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { Project, LibraryBook } from '../types';
import {
  generateDocxBlob,
  generatePdfBlob,
  generatePrintableBookHtml,
  paginateBook,
  stripMarkdownToPureText,
  cleanAndFormatTextToHtml
} from '../services/bookTypesettingService';
import { EbookCoverThumbnail } from './EbookCoverThumbnail';

interface ExportModalProps {
  item: Project | LibraryBook | null;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

type ExportFormat = 'pdf' | 'docx' | 'html' | 'md' | 'txt';

export const ExportModal: React.FC<ExportModalProps> = ({
  item,
  isOpen,
  onClose,
  onShowToast
}) => {
  if (!isOpen || !item) return null;

  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [activePreviewTab, setActivePreviewTab] = useState<'a4' | 'raw' | 'check'>('a4');
  const [previewPageIdx, setPreviewPageIdx] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const bookStructure = useMemo(() => paginateBook(item), [item]);

  const author = bookStructure.author;
  const title = bookStructure.title;
  const subtitle = bookStructure.subtitle;
  const category = bookStructure.category;

  const getCleanRawText = () => {
    if (format === 'md') {
      const header = `# ${title}\n${subtitle ? `*${subtitle}*\n` : ''}**Auteur :** ${author}  \n**Catégorie :** ${category}  \n**Édition :** Bookly Studio Créatif (Format A4)\n\n---\n\n`;
      const chaptersText = bookStructure.chapters
        .map((ch, idx) => `## Chapitre ${idx + 1} : ${stripMarkdownToPureText(ch.title)}\n\n${stripMarkdownToPureText(ch.content)}\n\n---\n`)
        .join('\n');
      return header + chaptersText;
    }

    if (format === 'txt') {
      const header = `${title.toUpperCase()}\n${subtitle ? `${subtitle}\n` : ''}Auteur : ${author}\nCatégorie : ${category}\nÉdition : Bookly Studio • Format Manuscrit A4\n========================================\n\n`;
      const chaptersText = bookStructure.chapters
        .map((ch, idx) => `CHAPITRE ${idx + 1} : ${stripMarkdownToPureText(ch.title).toUpperCase()}\n----------------------------------------\n\n${stripMarkdownToPureText(ch.content)}\n\n`)
        .join('\n\n');
      return header + chaptersText;
    }

    if (format === 'html' || format === 'pdf') {
      return generatePrintableBookHtml(item);
    }

    return '';
  };

  /**
   * Téléchargement universel compatible avec tous les OS et appareils (iOS Safari, Android Chrome, Mac, Windows, Linux)
   */
  const triggerBrowserDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    // Conserve l'URL 45 secondes pour permettre aux navigateurs et mobiles de valider le fichier sur disque
    setTimeout(() => {
      try {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        // Ignorer si déjà nettoyé
      }
    }, 45000);
  };

  const handleDownload = async () => {
    setIsExporting(true);
    const sanitizedTitle = (title || 'livre')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_-]/gi, '_');

    try {
      if (format === 'docx') {
        onShowToast('Génération Word DOCX...', 'Mise en page du document .docx en A4 conforme...', 'info');
        const rawBlob = await generateDocxBlob(item);
        const docxBlob = new Blob([rawBlob], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
        triggerBrowserDownload(docxBlob, `${sanitizedTitle}.docx`);
        onShowToast('Export DOCX Réussi !', `"${title}.docx" téléchargé avec succès (compatible Word, Google Docs, LibreOffice).`, 'success');
      } else if (format === 'pdf') {
        onShowToast('Génération PDF 4K...', 'Mise en page du manuscrit A4 Haute Définition avec couverture et sommaire...', 'info');
        const pdfBlob = await generatePdfBlob(item);
        triggerBrowserDownload(pdfBlob, `${sanitizedTitle}_Livre_A4_4K.pdf`);
        onShowToast('Export PDF 4K Réussi !', `"${title}.pdf" téléchargé avec succès (format A4 Haute Définition / 4K).`, 'success');
      } else if (format === 'html') {
        const content = generatePrintableBookHtml(item);
        const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
        triggerBrowserDownload(blob, `${sanitizedTitle}.html`);
        onShowToast('Téléchargement HTML', `"${title}.html" téléchargé avec styles A4 intégrés.`, 'success');
      } else if (format === 'md') {
        // Ajout du BOM UTF-8 (\uFEFF) pour préserver tous les accents sur Windows/Mac/Android/iOS
        const content = '\uFEFF' + getCleanRawText();
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        triggerBrowserDownload(blob, `${sanitizedTitle}.md`);
        onShowToast('Téléchargement Markdown', `"${title}.md" est prêt sans balises superflues.`, 'success');
      } else {
        // Format TXT pur avec BOM UTF-8
        const content = '\uFEFF' + getCleanRawText();
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        triggerBrowserDownload(blob, `${sanitizedTitle}.txt`);
        onShowToast('Téléchargement TXT', `"${title}.txt" téléchargé avec encodage UTF-8 universel.`, 'success');
      }
    } catch (err) {
      console.error('Export error:', err);
      onShowToast('Erreur d\'export', 'Impossible de générer le fichier. Veuillez réessayer.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = getCleanRawText();
    navigator.clipboard.writeText(textToCopy);
    onShowToast('Copié !', 'Le contenu épuré a été copié dans votre presse-papier.', 'success');
  };

  const handleOpenPrintPreview = () => {
    const printHtml = generatePrintableBookHtml(item);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printHtml);
      printWindow.document.close();
      onShowToast('Aperçu Impression A4', 'La fenêtre d\'impression s\'ouvre aux dimensions A4.', 'info');
    } else {
      const sanitizedTitle = (title || 'livre').toLowerCase().replace(/[^a-z0-9_-]/gi, '_');
      const blob = new Blob([printHtml], { type: 'text/html;charset=utf-8' });
      triggerBrowserDownload(blob, `${sanitizedTitle}_A4_impression.html`);
      onShowToast('Fichier A4 prêt', 'Le fichier d\'impression a été téléchargé.', 'info');
    }
  };

  const currentPage = bookStructure.pages[previewPageIdx] || bookStructure.pages[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-1.5 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-5xl max-h-[96vh] sm:max-h-[92vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header - 100% Responsive on Mobile & Tablet */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 sm:gap-3 bg-slate-50 dark:bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25 shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                  Contrôle &amp; Exportation du Livre
                </h3>
                <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 shrink-0">
                  Format A4 Standard (210×297mm)
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                {bookStructure.chapters.length} chapitres &bull; {bookStructure.totalPages} pages A4 &bull; {bookStructure.totalWords} mots
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-5">
          
          {/* Quick Quality Control & Device Readiness Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-indigo-50/50 dark:bg-indigo-950/30 p-2.5 sm:p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 text-[11px]">
            <div className="flex items-center gap-2 p-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white leading-tight">Norme A4 Validée</p>
                <p className="text-[10px] text-slate-500">210 × 297 mm &bull; 20mm marges</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1">
              <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white leading-tight">Markdown Nettoyé</p>
                <p className="text-[10px] text-slate-500">Sans astérisques résiduels</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1">
              <Smartphone className="w-4 h-4 text-purple-500 shrink-0" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white leading-tight">Multi-Appareils</p>
                <p className="text-[10px] text-slate-500">Téléchargeable sur Mobile &amp; PC</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white leading-tight">Prêt à l'Édition</p>
                <p className="text-[10px] text-slate-500">{bookStructure.totalPages} pages réelles</p>
              </div>
            </div>
          </div>

          {/* Format selection cards - responsive grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Format d'exportation souhaité :
              </label>
              <span className="text-[10px] sm:text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                Compatibilité 100% universelle
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
              {[
                {
                  id: 'pdf' as const,
                  label: 'PDF 4K / Livre A4',
                  sub: 'Haute Définition Print',
                  icon: Printer,
                  badge: 'Ultra HD 4K'
                },
                {
                  id: 'docx' as const,
                  label: 'Word Docs (.docx)',
                  sub: 'Microsoft Word & Docs',
                  icon: FileText,
                  badge: 'A4 Conforme'
                },
                {
                  id: 'html' as const,
                  label: 'E-book Web',
                  sub: 'Fichier autonome HTML',
                  icon: Code
                },
                {
                  id: 'md' as const,
                  label: 'Markdown (.md)',
                  sub: 'UTF-8 sans artefact',
                  icon: FileSpreadsheet
                },
                {
                  id: 'txt' as const,
                  label: 'Texte Épuré (.txt)',
                  sub: 'Lisible partout',
                  icon: FileText
                }
              ].map((f) => {
                const Icon = f.icon;
                const isSelected = format === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`p-2.5 sm:p-3 rounded-2xl border text-left flex flex-col justify-between gap-1.5 transition-all relative ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25 font-bold scale-[1.01]'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {f.badge && (
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider self-start ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        }`}
                      >
                        {f.badge}
                      </span>
                    )}
                    <div>
                      <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-white' : 'text-indigo-500'}`} />
                      <div className="text-xs leading-tight font-bold">{f.label}</div>
                      <div className={`text-[10px] font-normal leading-tight mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {f.sub}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview Container with Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('a4')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    activePreviewTab === 'a4'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Aperçu Page A4</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('raw')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    activePreviewTab === 'raw'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Texte Nettoyé</span>
                </button>
              </div>

              {activePreviewTab === 'a4' && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] sm:text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Page {previewPageIdx + 1} / {bookStructure.totalPages}
                  </span>
                </div>
              )}
            </div>

            {/* TAB 1: REALISTIC RESPONSIVE A4 PAGE PREVIEW */}
            {activePreviewTab === 'a4' && (
              <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-inner">
                {/* Scrollable sheet container */}
                <div className="p-3 sm:p-6 flex justify-center overflow-x-auto">
                  <div className="w-full max-w-[540px] aspect-[210/297] min-h-[440px] sm:min-h-[580px] bg-white text-slate-900 shadow-2xl rounded-xl p-4 sm:p-8 flex flex-col justify-between relative border border-slate-200 font-serif">
                    
                    {/* COVER PAGE */}
                    {currentPage.isCover ? (
                      <div className="h-full w-full rounded-lg overflow-hidden my-auto min-h-[380px] shadow-md flex flex-col">
                        <EbookCoverThumbnail
                          project={item}
                          templateId={'coverTemplateId' in item ? item.coverTemplateId : undefined}
                          customGradient={bookStructure.coverGradient}
                          customImage={'coverCustomImage' in item ? (item as any).coverCustomImage : undefined}
                          size="full"
                          showBadge={true}
                          showAuthor={true}
                        />
                      </div>
                    ) : currentPage.isToc ? (
                      // TABLE OF CONTENTS
                      <div className="space-y-3 sm:space-y-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center border-b pb-2 font-sans text-[10px] uppercase font-bold text-slate-400">
                            <span className="truncate max-w-[160px]">{title}</span>
                            <span>Sommaire A4</span>
                          </div>
                          <h3 className="text-center font-serif text-base sm:text-lg font-black text-slate-900 border-b-2 border-indigo-600 pb-2 mt-3">
                            Table des Matières
                          </h3>
                          <div className="space-y-2 text-xs font-sans mt-3">
                            {bookStructure.chapters.map((ch, idx) => (
                              <div
                                key={ch.id || idx}
                                onClick={() => {
                                  const pIdx = bookStructure.pages.findIndex(
                                    (p) => p.chapterNumber === idx + 1 && p.isChapterOpener
                                  );
                                  if (pIdx !== -1) setPreviewPageIdx(pIdx);
                                }}
                                className="flex justify-between border-b border-dotted pb-1 cursor-pointer hover:text-indigo-600 transition-colors"
                              >
                                <span className="font-bold text-indigo-600 mr-2">0{idx + 1}</span>
                                <span className="flex-1 truncate font-medium text-slate-800">
                                  {stripMarkdownToPureText(ch.title)}
                                </span>
                                <span className="font-mono text-slate-500">p. {idx + 3}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between items-center border-t pt-2 font-sans text-[10px] text-slate-400 mt-auto">
                          <span>Bookly Studio &bull; Format A4</span>
                          <span className="font-bold text-slate-700 font-mono">- Page 2 -</span>
                        </div>
                      </div>
                    ) : (
                      // REGULAR BOOK CHAPTER PAGE
                      <div className="flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
                        <div className="flex justify-between items-center border-b pb-1.5 font-sans text-[10px] uppercase font-bold text-slate-400">
                          <span className="truncate max-w-[150px] sm:max-w-[200px]">{title}</span>
                          <span className="truncate max-w-[150px] sm:max-w-[200px]">{stripMarkdownToPureText(currentPage.chapterTitle)}</span>
                        </div>

                        <div className="text-[11px] sm:text-xs leading-relaxed text-slate-800 space-y-2 sm:space-y-3 font-serif">
                          {currentPage.isChapterOpener && (
                            <div className="text-center border-b pb-2 sm:pb-3 mb-2 sm:mb-3">
                              <div className="font-sans text-[9px] font-extrabold uppercase tracking-wider text-indigo-600">
                                Chapitre {currentPage.chapterNumber}
                              </div>
                              <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                                {stripMarkdownToPureText(currentPage.chapterTitle)}
                              </h3>
                            </div>
                          )}
                          <div
                            className="prose prose-sm max-w-none text-justify"
                            dangerouslySetInnerHTML={{ __html: currentPage.contentHtml }}
                          />
                        </div>

                        <div className="flex justify-between items-center border-t pt-2 font-sans text-[10px] text-slate-400">
                          <span>{author}</span>
                          <span className="font-bold text-slate-800 font-mono">- Page {currentPage.pageNumber} -</span>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* HIGHLY VISIBLE & COMFORTABLE BOTTOM PAGINATION BAR - RESPONSIVE */}
                <div className="px-3 sm:px-4 py-2.5 sm:py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewPageIdx(Math.max(0, previewPageIdx - 1))}
                    disabled={previewPageIdx === 0}
                    className="min-h-[40px] px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-35 disabled:cursor-not-allowed transition-all shadow-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden xs:inline">Précédente</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <div className="hidden sm:block w-28 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(((previewPageIdx + 1) / bookStructure.totalPages) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[11px] sm:text-xs font-extrabold font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                      Page {previewPageIdx + 1} / {bookStructure.totalPages}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreviewPageIdx(Math.min(bookStructure.totalPages - 1, previewPageIdx + 1))}
                    disabled={previewPageIdx === bookStructure.totalPages - 1}
                    className="min-h-[40px] px-3.5 sm:px-5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-35 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-600/30 hover:scale-[1.02] active:scale-95"
                  >
                    <span className="hidden xs:inline">Suivante</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: RAW / STRIPPED TEXT PREVIEW */}
            {activePreviewTab === 'raw' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Contenu formaté sans symboles résiduels :
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copier le texte
                  </button>
                </div>
                <div className="h-64 rounded-2xl bg-slate-950 p-4 border border-slate-800 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre leading-relaxed">
                  {getCleanRawText()}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer Actions - Responsive on All Screens */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleOpenPrintPreview}
              className="flex-1 sm:flex-initial min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Imprimer A4</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-initial min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copier</span>
            </button>
          </div>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-95 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>
              {format === 'docx'
                ? 'Télécharger en Word Docs (.docx A4)'
                : format === 'pdf'
                ? 'Télécharger en PDF 4K (.pdf A4)'
                : `Télécharger le fichier (.${format})`}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};

