import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Moon,
  Sun,
  BookMarked,
  Download,
  Layers,
  FileText,
  ListFilter,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { LibraryBook, Project, Chapter } from '../types';
import { EbookCoverThumbnail } from './EbookCoverThumbnail';
import {
  cleanAndFormatTextToHtml,
  stripMarkdownToPureText,
  paginateBook
} from '../services/bookTypesettingService';

interface BookReaderModalProps {
  book: LibraryBook | Project | null;
  isOpen: boolean;
  onClose: () => void;
  onExport?: (item: LibraryBook | Project) => void;
}

export const BookReaderModal: React.FC<BookReaderModalProps> = ({
  book,
  isOpen,
  onClose,
  onExport
}) => {
  if (!isOpen || !book) return null;

  const [readerViewMode, setReaderViewMode] = useState<'paginated_a4' | 'chapter_scroll'>('paginated_a4');
  const [currentPageIdx, setCurrentPageIdx] = useState<number>(0);
  const [currentChapterIdx, setCurrentChapterIdx] = useState<number>(0);
  const [fontSize, setFontSize] = useState<number>(16);
  const [readerTheme, setReaderTheme] = useState<'dark' | 'light' | 'sepia'>('light');
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const bookStructure = useMemo(() => paginateBook(book), [book]);
  const chaptersList = bookStructure.chapters;

  const totalPages = bookStructure.totalPages;
  const currentPage = bookStructure.pages[currentPageIdx] || bookStructure.pages[0];

  const currentChapter: Chapter = chaptersList[currentChapterIdx] || chaptersList[0] || {
    id: 'ch-0',
    title: book.title,
    content: 'Aucun contenu disponible pour ce chapitre.',
    wordCount: 0,
    completed: true,
    illustrationUrl: undefined,
    illustrationCaption: undefined
  };

  const progressPercent = Math.round(((currentPageIdx + 1) / totalPages) * 100);

  // Keyboard navigation for smooth reading
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (readerViewMode === 'paginated_a4') {
          setCurrentPageIdx((prev) => Math.min(totalPages - 1, prev + 1));
        } else {
          setCurrentChapterIdx((prev) => Math.min(chaptersList.length - 1, prev + 1));
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (readerViewMode === 'paginated_a4') {
          setCurrentPageIdx((prev) => Math.max(0, prev - 1));
        } else {
          setCurrentChapterIdx((prev) => Math.max(0, prev - 1));
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalPages, chaptersList.length, readerViewMode, onClose]);

  const getThemeClasses = () => {
    switch (readerTheme) {
      case 'light':
        return 'bg-slate-100 text-slate-900 border-slate-200';
      case 'sepia':
        return 'bg-[#f4ecd8] text-[#3c2f1f] border-[#e7d8bf]';
      case 'dark':
      default:
        return 'bg-slate-950 text-slate-100 border-slate-800';
    }
  };

  const getPageCardStyle = () => {
    switch (readerTheme) {
      case 'light':
        return 'bg-white text-slate-900 shadow-xl border-slate-200';
      case 'sepia':
        return 'bg-[#fdf8ed] text-[#3c2f1f] shadow-xl border-[#e8ddc7]';
      case 'dark':
      default:
        return 'bg-slate-900 text-slate-100 shadow-2xl border-slate-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`w-full ${isFullscreen ? 'h-screen max-w-full rounded-none' : 'max-w-6xl h-[94vh] rounded-3xl'} shadow-2xl border flex flex-col overflow-hidden transition-all duration-200 ${getThemeClasses()}`}
      >
        {/* Reader Topbar */}
        <div className="px-4 py-3 border-b flex items-center justify-between gap-3 shrink-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-xs sm:text-sm md:text-base truncate">{book.title}</h3>
              <p className="text-[11px] opacity-70 truncate">
                {book.author} &bull; {readerViewMode === 'paginated_a4' ? `Page ${currentPageIdx + 1} sur ${totalPages}` : `Chapitre ${currentChapterIdx + 1} sur ${chaptersList.length}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile Table of Contents button */}
            <button
              type="button"
              onClick={() => setIsMobileTocOpen(!isMobileTocOpen)}
              className="md:hidden p-2 rounded-xl bg-black/10 dark:bg-white/10 text-xs font-bold flex items-center gap-1"
              title="Afficher le Sommaire"
            >
              <ListFilter className="w-4 h-4" />
              <span className="text-[11px]">Sommaire</span>
            </button>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-black/10 dark:bg-white/10 p-0.5 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setReaderViewMode('paginated_a4')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  readerViewMode === 'paginated_a4'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Pages A4 (p.{currentPageIdx + 1})</span>
              </button>
              <button
                type="button"
                onClick={() => setReaderViewMode('chapter_scroll')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  readerViewMode === 'chapter_scroll'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Par Chapitre</span>
              </button>
            </div>

            {/* Theme picker */}
            <div className="flex items-center gap-1 bg-black/10 dark:bg-white/10 p-1 rounded-xl">
              <button
                onClick={() => setReaderTheme('light')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${readerTheme === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'opacity-60'}`}
                title="Mode Jour"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setReaderTheme('sepia')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${readerTheme === 'sepia' ? 'bg-[#d8c5a4] text-[#433422]' : 'opacity-60'}`}
                title="Mode Sépia (Confort de lecture)"
              >
                <BookMarked className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setReaderTheme('dark')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${readerTheme === 'dark' ? 'bg-indigo-600 text-white' : 'opacity-60'}`}
                title="Mode Nuit"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Font size adjustments */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => setFontSize(Math.max(13, fontSize - 1))}
                className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/10"
                title="Diminuer la police"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono w-6 text-center">{fontSize}</span>
              <button
                onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/10"
                title="Agrandir la police"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Export button */}
            {onExport && (
              <button
                onClick={() => onExport(book)}
                className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 transition-colors flex items-center gap-1 text-xs font-bold"
                title="Exporter ce livre"
              >
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Exporter</span>
              </button>
            )}

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/10 transition-colors hidden sm:block"
              title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/10 transition-colors"
              aria-label="Fermer la liseuse"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reader Layout (TOC on left on desktop + Reader Canvas) */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Table of contents sidebar (Desktop & Mobile Drawer) */}
          <div
            className={`${
              isMobileTocOpen
                ? 'absolute inset-0 z-30 flex flex-col p-4 bg-white dark:bg-slate-900'
                : 'hidden md:flex flex-col w-64 border-r p-3 space-y-1.5 overflow-y-auto shrink-0 border-inherit bg-black/5 dark:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between px-2 py-1 mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider opacity-60">
                Sommaire du Livre
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-normal font-mono opacity-70">
                  {chaptersList.length} chapitres
                </span>
                {isMobileTocOpen && (
                  <button
                    type="button"
                    onClick={() => setIsMobileTocOpen(false)}
                    className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1 overflow-y-auto flex-1">
              {chaptersList.map((ch, idx) => (
                <button
                  key={ch.id || idx}
                  onClick={() => {
                    setCurrentChapterIdx(idx);
                    const pageIdx = bookStructure.pages.findIndex(
                      (p) => p.chapterNumber === idx + 1 && p.isChapterOpener
                    );
                    if (pageIdx !== -1) setCurrentPageIdx(pageIdx);
                    setIsMobileTocOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-between gap-2 ${
                    currentChapterIdx === idx
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">{stripMarkdownToPureText(ch.title)}</span>
                  <span className="text-[10px] opacity-70 font-mono">p.{idx + 3}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reading Canvas */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start">
            
            {readerViewMode === 'paginated_a4' ? (
              /* A4 PAGINATED BOOK VIEW */
              <div
                className={`w-full max-w-2xl min-h-[600px] rounded-2xl p-8 sm:p-12 flex flex-col justify-between border transition-all ${getPageCardStyle()}`}
                style={{ fontSize: `${fontSize}px` }}
              >
                {currentPage.isCover ? (
                  /* COVER PAGE WITH ULTRA-HD COVER ARTWORK */
                  <div className="flex-1 flex flex-col items-center justify-center my-auto min-h-[480px] w-full py-4">
                    <div className="w-full max-w-md aspect-[1/1.414] rounded-2xl overflow-hidden shadow-2xl border border-white/20 relative">
                      <EbookCoverThumbnail
                        project={book as any}
                        title={bookStructure.title}
                        subtitle={bookStructure.subtitle}
                        author={bookStructure.author}
                        category={bookStructure.category}
                        templateId={bookStructure.coverTemplateId}
                        customGradient={bookStructure.coverGradient}
                        customImage={bookStructure.coverCustomImage}
                        size="full"
                        showBadge={true}
                        showAuthor={true}
                        showChaptersCount={true}
                        chaptersCount={bookStructure.chapters.length}
                        showSpine={true}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                ) : currentPage.isToc ? (
                  /* TABLE OF CONTENTS PAGE */
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center border-b pb-2 font-sans text-xs uppercase font-bold opacity-50">
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
                              if (pIdx !== -1) setCurrentPageIdx(pIdx);
                            }}
                            className="flex justify-between border-b border-dotted pb-2 cursor-pointer hover:text-indigo-600 transition-colors"
                          >
                            <span className="font-bold text-indigo-600 mr-2">0{idx + 1}</span>
                            <span className="flex-1 truncate font-medium">
                              {stripMarkdownToPureText(ch.title)}
                            </span>
                            <span className="font-mono opacity-70">p. {idx + 3}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center border-t pt-3 font-sans text-xs opacity-50">
                      <span>Bookly Studio</span>
                      <span className="font-bold font-mono">- Page 2 -</span>
                    </div>
                  </div>
                ) : (
                  /* REGULAR CONTENT PAGE */
                  <div className="flex-1 flex flex-col justify-between space-y-6">
                    <div className="flex justify-between items-center border-b pb-2.5 font-sans text-[11px] uppercase tracking-wider font-bold opacity-60">
                      <span className="truncate max-w-[240px] font-serif">{bookStructure.title}</span>
                      <span className="truncate max-w-[240px] text-indigo-600 dark:text-indigo-400">{stripMarkdownToPureText(currentPage.chapterTitle)}</span>
                    </div>

                    <div className="space-y-4 font-serif leading-relaxed text-justify relative">
                      {currentPage.isChapterOpener && (
                        <div className="text-center pb-5 mb-6 border-b border-indigo-500/20">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-sans text-xs font-black uppercase tracking-widest mb-2">
                            <span>✦</span>
                            <span>Chapitre {currentPage.chapterNumber}</span>
                            <span>✦</span>
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight mt-1 text-slate-900 dark:text-white">
                            {stripMarkdownToPureText(currentPage.chapterTitle)}
                          </h2>
                          <div className="flex items-center justify-center gap-2 mt-2 text-indigo-500/40 text-xs">
                            <span>—</span>
                            <span>❦</span>
                            <span>—</span>
                          </div>

                          {currentPage.illustrationUrl && (
                            <div className="mt-4 mb-2 mx-auto max-w-[94%] group text-center">
                              <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10 shadow-md bg-black/5">
                                <img
                                  src={currentPage.illustrationUrl}
                                  alt={stripMarkdownToPureText(currentPage.chapterTitle)}
                                  className="w-full max-h-[220px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              {currentPage.illustrationCaption && (
                                <p className="mt-2 text-[11px] font-sans italic opacity-70 tracking-wide">
                                  ✦ {currentPage.illustrationCaption}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        className={`prose prose-slate dark:prose-invert max-w-none text-justify book-page-content ${currentPage.isChapterOpener ? 'first-page-dropcap' : ''}`}
                        dangerouslySetInnerHTML={{ __html: currentPage.contentHtml }}
                      />
                    </div>

                    <div className="flex justify-between items-center border-t pt-3.5 font-sans text-xs opacity-60">
                      <span className="font-medium italic">{bookStructure.author}</span>
                      <span className="font-bold font-mono tracking-widest px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/5">
                        • {currentPage.pageNumber} •
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* CONTINUOUS CHAPTER SCROLL VIEW */
              <div
                className={`w-full max-w-2xl rounded-2xl p-8 sm:p-12 border transition-all ${getPageCardStyle()}`}
                style={{ fontSize: `${fontSize}px` }}
              >
                <div className="pb-4 border-b border-black/10 dark:border-white/10 mb-6">
                  <span className="text-xs uppercase font-bold tracking-wider text-indigo-500">
                    {book.category} &bull; Section {currentChapterIdx + 1}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-black mt-1">
                    {stripMarkdownToPureText(currentChapter.title)}
                  </h2>
                </div>

                {currentChapter.illustrationUrl && (
                  <div className="mb-8 overflow-hidden rounded-xl border border-black/10 dark:border-white/10 shadow-lg bg-black/5">
                    <img
                      src={currentChapter.illustrationUrl}
                      alt={stripMarkdownToPureText(currentChapter.title)}
                      className="w-full max-h-[300px] object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {currentChapter.illustrationCaption && (
                      <div className="p-3 bg-black/5 dark:bg-white/5 border-t border-inherit text-center text-xs font-sans italic opacity-75">
                        ✦ {currentChapter.illustrationCaption}
                      </div>
                    )}
                  </div>
                )}

                <div
                  className="space-y-4 font-serif leading-relaxed text-justify"
                  dangerouslySetInnerHTML={{
                    __html: cleanAndFormatTextToHtml(currentChapter.content || '')
                  }}
                />
              </div>
            )}

          </div>
        </div>

        {/* Reader Bottom Navigation Bar */}
        <div className="px-4 py-3 border-t flex items-center justify-between gap-4 shrink-0 border-inherit bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
          {readerViewMode === 'paginated_a4' ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentPageIdx(Math.max(0, currentPageIdx - 1))}
                disabled={currentPageIdx === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-black/10 dark:bg-white/10 hover:bg-black/20 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Page Précédente
              </button>

              <div className="flex-1 max-w-xs mx-auto flex items-center gap-3">
                <div className="flex-1 bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-bold opacity-80 whitespace-nowrap">
                  Page {currentPageIdx + 1}/{totalPages}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setCurrentPageIdx(Math.min(totalPages - 1, currentPageIdx + 1))}
                disabled={currentPageIdx === totalPages - 1}
                className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
              >
                Page Suivante <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setCurrentChapterIdx(Math.max(0, currentChapterIdx - 1))}
                disabled={currentChapterIdx === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-black/10 dark:bg-white/10 hover:bg-black/20 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Chapitre Précédent
              </button>

              <div className="flex-1 max-w-xs mx-auto text-center text-xs font-mono font-bold opacity-80">
                Chapitre {currentChapterIdx + 1} / {chaptersList.length}
              </div>

              <button
                type="button"
                onClick={() => setCurrentChapterIdx(Math.min(chaptersList.length - 1, currentChapterIdx + 1))}
                disabled={currentChapterIdx === chaptersList.length - 1}
                className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
              >
                Chapitre Suivant <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
