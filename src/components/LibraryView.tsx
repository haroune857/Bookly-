import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Download,
  Star,
  Heart,
  Edit3,
  FileText,
  Clock,
  Sparkles,
  Layers,
  CheckCircle2,
  Bookmark,
  Compass,
  ArrowRight,
  Eye,
  SlidersHorizontal,
  Plus,
  LayoutGrid,
  List,
  ArrowUpDown,
  X,
  ChevronRight,
  BookMarked
} from 'lucide-react';
import { LibraryBook, Project } from '../types';
import { EbookCoverThumbnail } from './EbookCoverThumbnail';

interface LibraryViewProps {
  books: LibraryBook[];
  userProjects?: Project[];
  onOpenReader: (item: LibraryBook | Project) => void;
  onOpenExport: (item: LibraryBook | Project) => void;
  onToggleFavorite: (bookId: string) => void;
  onNavigateToStudio?: () => void;
  onOpenStudio?: (project: Project) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  books,
  userProjects = [],
  onOpenReader,
  onOpenExport,
  onToggleFavorite,
  onNavigateToStudio,
  onOpenStudio
}) => {
  const [libraryTab, setLibraryTab] = useState<'my_books' | 'reference_books' | 'all'>('my_books');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewLayout, setViewLayout] = useState<'grid' | 'detailed'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'pages' | 'progress'>('recent');
  const [tocPreviewItem, setTocPreviewItem] = useState<{
    item: any;
    targetItem: LibraryBook | Project;
  } | null>(null);

  const filterCategories = [
    { id: 'all', label: 'Toutes les catégories' },
    { id: 'favorites', label: 'Favoris & Étoilés' },
    { id: 'Business', label: 'Business & Stratégie' },
    { id: 'Technologie', label: 'Technologie & IA' },
    { id: 'Design', label: 'Design & Création' },
    { id: 'Architecture', label: 'Architecture & Art' },
    { id: 'Développement', label: 'Développement Personnel' }
  ];

  // Combine user projects and reference books according to active tab
  const getDisplayItems = (): Array<{
    id: string;
    title: string;
    subtitle?: string;
    author: string;
    category: string;
    description?: string;
    pages: number;
    readTime: string;
    rating?: number;
    isFavorite?: boolean;
    coverGradient?: string;
    coverTemplateId?: string;
    coverCustomImage?: string;
    isUserProject: boolean;
    originalProject?: Project;
    originalBook?: LibraryBook;
    chaptersCount: number;
    chaptersList?: Array<{ id?: string; title: string; wordCount?: number }>;
    progress?: number;
    status?: string;
    updatedAt?: number;
  }> => {
    const projectItems = userProjects.map((p) => ({
      id: p.id,
      title: p.title,
      subtitle: p.subtitle,
      author: p.author || 'Moi',
      category: p.category || 'Général',
      description: p.description || p.subtitle || 'Manuscrit créé dans Bookly Studio.',
      pages: Math.max(1, Math.ceil((p.wordCount || 300) / 250)),
      readTime: `${p.readingTimeMinutes || 5} min`,
      rating: 5.0,
      isFavorite: false,
      coverGradient: p.coverGradient,
      coverTemplateId: p.coverTemplateId,
      coverCustomImage: p.coverCustomImage,
      isUserProject: true,
      originalProject: p,
      chaptersCount: p.chapters?.length || 1,
      chaptersList: p.chapters || [],
      progress: p.progress || 0,
      status: p.status,
      updatedAt: p.updatedAt ? new Date(p.updatedAt).getTime() : Date.now()
    }));

    const bookItems = books.map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: (b as any).subtitle || '',
      author: b.author,
      category: b.category,
      description: b.description,
      pages: b.pages,
      readTime: b.readTime,
      rating: b.rating,
      isFavorite: b.isFavorite,
      coverGradient: b.coverGradient,
      coverTemplateId: b.coverTemplateId,
      coverCustomImage: (b as any).coverCustomImage,
      isUserProject: false,
      originalBook: b,
      chaptersCount: (b as any).chapters?.length || Math.max(3, Math.ceil(b.pages / 4)),
      chaptersList: (b as any).chapters || [],
      progress: 100,
      status: 'published',
      updatedAt: 1700000000000
    }));

    if (libraryTab === 'my_books') {
      return projectItems;
    } else if (libraryTab === 'reference_books') {
      return bookItems;
    } else {
      return [...projectItems, ...bookItems];
    }
  };

  const allItems = getDisplayItems();

  const filteredItems = useMemo(() => {
    return allItems
      .filter((item) => {
        let matchesCategory = true;
        if (activeFilter === 'favorites') {
          matchesCategory = Boolean(item.isFavorite || (item.rating && item.rating >= 4.8));
        } else if (activeFilter !== 'all') {
          matchesCategory = item.category.toLowerCase().includes(activeFilter.toLowerCase());
        }

        const matchesSearch =
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
          item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        } else if (sortBy === 'pages') {
          return b.pages - a.pages;
        } else if (sortBy === 'progress') {
          return (b.progress || 0) - (a.progress || 0);
        }
        // default recent
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      });
  }, [allItems, activeFilter, searchQuery, sortBy]);

  // Statistics
  const totalPagesCount = allItems.reduce((acc, curr) => acc + curr.pages, 0);

  return (
    <div id="view-library" className="space-y-6 sm:space-y-7 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              <Compass className="w-3.5 h-3.5" />
              <span>Espace de Lecture & Consultation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Bibliothèque & Consultation d'Ouvrages
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Consultez tous vos écrits et guides au format livre avec mise en page A4 élégante, sommaire interactif et liseuse immersive.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigateToStudio && (
              <button
                type="button"
                id="btn-library-new-project"
                onClick={onNavigateToStudio}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Livre</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Consultable</div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {userProjects.length + books.length}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Mes Manuscrits</div>
            <div className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
              {userProjects.length}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Pages A4 Rédigées</div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
              ~{totalPagesCount}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Guides Références</div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {books.length}
            </div>
          </div>
        </div>

        {/* Scope Tabs Switcher (Mes Livres vs Références vs Tous) */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold">
            <button
              type="button"
              id="tab-lib-my-books"
              onClick={() => setLibraryTab('my_books')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                libraryTab === 'my_books'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Mes Livres ({userProjects.length})</span>
            </button>

            <button
              type="button"
              id="tab-lib-reference"
              onClick={() => setLibraryTab('reference_books')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                libraryTab === 'reference_books'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Collection & Références ({books.length})</span>
            </button>

            <button
              type="button"
              id="tab-lib-all"
              onClick={() => setLibraryTab('all')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                libraryTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tout afficher ({userProjects.length + books.length})</span>
            </button>
          </div>

          {/* Layout Toggle (Grid vs List) & Sorting */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <button
                type="button"
                onClick={() => setViewLayout('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewLayout === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Affichage en Grille"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('detailed')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewLayout === 'detailed'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Affichage Détaillé / Liste"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Sort selector */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-xs font-semibold focus:outline-hidden cursor-pointer"
              >
                <option value="recent">Plus récents</option>
                <option value="title">Titre A-Z</option>
                <option value="pages">Nombre de pages</option>
                <option value="progress">Progression</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {filterCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                activeFilter === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par titre, auteur, thème..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Books Consultation Cards (Grid vs Detailed List) */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-10 sm:p-14 text-center max-w-2xl mx-auto shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/60">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {libraryTab === 'my_books' && userProjects.length === 0
                ? 'Vous n\'avez pas encore créé de livre'
                : 'Aucun résultat trouvé'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {libraryTab === 'my_books' && userProjects.length === 0
                ? 'Lancez votre premier manuscrit dans le Studio d\'écriture et consultez-le instantanément ici avec la liseuse A4.'
                : 'Aucun ouvrage ne correspond à votre recherche ou filtre actuel. Essayez d\'élargir vos critères.'}
            </p>
          </div>
          {libraryTab === 'my_books' && onNavigateToStudio && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onNavigateToStudio}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Créer un livre dans le Studio</span>
              </button>
            </div>
          )}
        </div>
      ) : viewLayout === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredItems.map((item) => {
            const isUserOwn = item.isUserProject;
            const targetItem = item.originalProject || item.originalBook || (item as any);

            return (
              <div
                key={item.id}
                id={`consult-book-card-${item.id}`}
                className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400/60 dark:hover:border-indigo-500/50 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
              >
                <div>
                  {/* Book Cover Thumbnail with Interactive Hover Overlay */}
                  <div
                    className="h-52 rounded-xl relative overflow-hidden cursor-pointer shadow-xs group-hover:shadow-md transition-all group"
                    onClick={() => onOpenReader(targetItem)}
                    title="Cliquer pour ouvrir dans la liseuse A4"
                  >
                    <EbookCoverThumbnail
                      project={targetItem}
                      templateId={item.coverTemplateId}
                      customGradient={item.coverGradient}
                      customImage={item.coverCustomImage}
                      size="full"
                      showBadge={true}
                      showAuthor={true}
                    />

                    {/* Hover Prompt Overlay */}
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 z-30 pointer-events-none">
                      <div className="px-3.5 py-2 rounded-xl bg-white text-slate-900 text-xs font-black shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Ouvrir la Liseuse A4</span>
                      </div>
                    </div>

                    {/* Type Badge (Mon Livre vs Référence) */}
                    <div className="absolute top-2 left-2 z-20">
                      {isUserOwn ? (
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-xs bg-indigo-600 text-white">
                          Mon Manuscrit
                        </span>
                      ) : (
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-xs bg-slate-900/80 text-white backdrop-blur-xs">
                          Guide & Référence
                        </span>
                      )}
                    </div>

                    {/* Favorite Button */}
                    {!isUserOwn && (
                      <div className="absolute top-2 right-2 z-20">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(item.id);
                          }}
                          className={`p-1.5 rounded-full backdrop-blur-xs transition-transform active:scale-125 ${
                            item.isFavorite ? 'bg-rose-600 text-white shadow-xs' : 'bg-black/30 text-white/80 hover:text-white'
                          }`}
                          title={item.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Book Metadata & Title */}
                  <div className="mt-3.5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
                        {item.author}
                      </span>
                      {item.rating && (
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{item.rating}</span>
                        </div>
                      )}
                    </div>

                    <h4
                      className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      onClick={() => onOpenReader(targetItem)}
                    >
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description || item.subtitle || 'Ouvrage disponible à la lecture et consultation.'}
                    </p>

                    {/* Progress indicator for user books */}
                    {isUserOwn && (
                      <div className="space-y-1 pt-1.5">
                        <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          <span>Progression rédaction</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{item.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${item.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Info Pills */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 font-mono">
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <FileText className="w-3 h-3 text-slate-400" />
                        {item.chaptersCount} chap.
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {item.readTime}
                      </span>
                      <span>&bull;</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        ~{item.pages} p. A4
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Interactive Action Buttons */}
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  {/* Primary Consult / Read Button */}
                  <button
                    type="button"
                    id={`btn-read-consult-${item.id}`}
                    onClick={() => onOpenReader(targetItem)}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Consulter</span>
                  </button>

                  {/* Sommaire preview */}
                  <button
                    type="button"
                    onClick={() => setTocPreviewItem({ item, targetItem })}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                    title="Voir le sommaire des chapitres"
                  >
                    <BookMarked className="w-3.5 h-3.5" />
                  </button>

                  {/* If user's own book, offer Edit in Studio */}
                  {isUserOwn && item.originalProject && onOpenStudio && (
                    <button
                      type="button"
                      onClick={() => onOpenStudio(item.originalProject!)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                      title="Éditer dans le Studio"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Export Button */}
                  <button
                    type="button"
                    onClick={() => onOpenExport(targetItem)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Exporter en PDF / EPUB"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DETAILED LIST / CATALOG VIEW */
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isUserOwn = item.isUserProject;
            const targetItem = item.originalProject || item.originalBook || (item as any);

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400/60 dark:hover:border-indigo-500/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:shadow-md transition-all"
              >
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  {/* Small Cover Thumbnail */}
                  <div
                    className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl overflow-hidden shrink-0 cursor-pointer shadow-xs hover:shadow-md transition-all"
                    onClick={() => onOpenReader(targetItem)}
                  >
                    <EbookCoverThumbnail
                      project={targetItem}
                      templateId={item.coverTemplateId}
                      customGradient={item.coverGradient}
                      customImage={item.coverCustomImage}
                      size="thumb"
                      showBadge={false}
                    />
                  </div>

                  {/* Info */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.category}
                      </span>
                      {isUserOwn ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                          Mon Manuscrit ({item.progress || 0}%)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                          Guide Certifié
                        </span>
                      )}
                    </div>

                    <h4
                      className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                      onClick={() => onOpenReader(targetItem)}
                    >
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xl">
                      {item.description || item.subtitle}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono pt-0.5">
                      <span>Par {item.author}</span>
                      <span>&bull;</span>
                      <span>{item.chaptersCount} chapitres</span>
                      <span>&bull;</span>
                      <span>~{item.pages} p. A4</span>
                      <span>&bull;</span>
                      <span>{item.readTime}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => onOpenReader(targetItem)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Consulter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTocPreviewItem({ item, targetItem })}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                    title="Sommaire"
                  >
                    <BookMarked className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sommaire</span>
                  </button>

                  {isUserOwn && item.originalProject && onOpenStudio && (
                    <button
                      type="button"
                      onClick={() => onOpenStudio(item.originalProject!)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                      title="Éditer dans le Studio"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenExport(targetItem)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    title="Exporter"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive TOC Preview Modal / Drawer */}
      {tocPreviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <BookMarked className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sommaire de l'ouvrage</h3>
                  <p className="text-xs text-slate-400 truncate max-w-[280px]">{tocPreviewItem.item.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTocPreviewItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {tocPreviewItem.item.chaptersList && tocPreviewItem.item.chaptersList.length > 0 ? (
                tocPreviewItem.item.chaptersList.map((ch: any, idx: number) => (
                  <div
                    key={ch.id || idx}
                    onClick={() => {
                      setTocPreviewItem(null);
                      onOpenReader(tocPreviewItem.targetItem);
                    }}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/40 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 text-[11px] font-black font-mono text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {ch.title || `Chapitre ${idx + 1}`}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  Sommaire standard généré lors de l'ouverture de la liseuse.
                </div>
              )}
            </div>

            <div className="pt-3 border-t dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setTocPreviewItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = tocPreviewItem.targetItem;
                  setTocPreviewItem(null);
                  onOpenReader(target);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-600/20"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Ouvrir dans la Liseuse A4</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
