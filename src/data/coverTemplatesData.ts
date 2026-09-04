import { EbookCoverTemplate, CoverCategory } from '../types';

export const COVER_CATEGORIES: { id: CoverCategory; label: string; iconName?: string }[] = [
  { id: 'all', label: 'Tous les Modèles (24)' },
  { id: 'apple_minimal', label: 'Style Apple & Épuré' },
  { id: 'tech_ai', label: 'Technologie & IA' },
  { id: 'nature_bio', label: 'Nature & Écologie' },
  { id: 'business_finance', label: 'Business & Finance' },
  { id: 'mindset_wellness', label: 'Mindset & Bien-être' },
  { id: 'scifi_space', label: 'Sci-Fi & Cosmos' },
  { id: 'literature_art', label: 'Littérature & Art' }
];

export const EBOOK_COVER_TEMPLATES: EbookCoverTemplate[] = [
  // ----------------------------------------------------
  // 1. STYLE APPLE & ÉPURÉ
  // ----------------------------------------------------
  {
    id: 'apple-silk-ribbon',
    name: 'Apple Silk Flow',
    category: 'apple_minimal',
    categoryLabel: 'Style Apple & Épuré',
    description: 'Volutes soyeuses chromatiques inspirées des fonds d\'écran iPad Pro & macOS, avec reflets de verre dépoli.',
    gradient: 'linear-gradient(145deg, #090d16 0%, #1e1b4b 50%, #311042 100%)',
    accentColor: '#818cf8',
    secondaryColor: '#c084fc',
    textColor: 'light',
    figureType: 'apple_silk_ribbon',
    layoutStyle: 'apple_hero',
    fontFamily: 'sans',
    tagBadge: 'Apple Studio',
    tags: ['apple', 'épuré', 'soie', 'minimaliste', 'premium', 'futuriste']
  },
  {
    id: 'apple-frosted-orb',
    name: 'Vision Glass Sphere',
    category: 'apple_minimal',
    categoryLabel: 'Style Apple & Épuré',
    description: 'Sphère prismatique 3D en verre dépoli avec réfraction lumineuse et halo spectral Vision Pro.',
    gradient: 'linear-gradient(145deg, #030712 0%, #0f172a 60%, #1e293b 100%)',
    accentColor: '#38bdf8',
    secondaryColor: '#a855f7',
    textColor: 'light',
    figureType: 'apple_frosted_orb',
    layoutStyle: 'centered',
    fontFamily: 'sans',
    tagBadge: 'Vision OS',
    tags: ['apple', 'verre', 'sphère', 'vision', '3d', 'luxe']
  },
  {
    id: 'apple-topographic-contour',
    name: 'Ultra Topo Elevation',
    category: 'apple_minimal',
    categoryLabel: 'Style Apple & Épuré',
    description: 'Lignes de dénivelé topographique ultra-fines vectorielles façon cadran Apple Watch Ultra.',
    gradient: 'linear-gradient(145deg, #18181b 0%, #09090b 100%)',
    accentColor: '#f97316',
    secondaryColor: '#fbbf24',
    textColor: 'light',
    figureType: 'apple_topographic_contour',
    layoutStyle: 'editorial',
    fontFamily: 'mono',
    tagBadge: 'Ultra Precision',
    tags: ['apple', 'topographie', 'outdoor', 'orange', 'précision', 'ultra']
  },
  {
    id: 'apple-concentric-sonar',
    name: 'Acoustic Sonar Ripple',
    category: 'apple_minimal',
    categoryLabel: 'Style Apple & Épuré',
    description: 'Ondes circulaires concentriques épurées, évoquant la propagation sonore et l\'acoustique spatiale.',
    gradient: 'linear-gradient(145deg, #0f172a 0%, #020617 100%)',
    accentColor: '#60a5fa',
    secondaryColor: '#93c5fd',
    textColor: 'light',
    figureType: 'apple_concentric_sonar',
    layoutStyle: 'modern',
    fontFamily: 'sans',
    tagBadge: 'Audio Spatial',
    tags: ['ondes', 'sonar', 'audio', 'minimal', 'circulaire', 'zen']
  },
  {
    id: 'apple-prism-lens',
    name: 'Studio Prism Light',
    category: 'apple_minimal',
    categoryLabel: 'Style Apple & Épuré',
    description: 'Faisceaux géométriques et diffraction de lumière blanche sur fond sombre ultra-net.',
    gradient: 'linear-gradient(135deg, #111827 0%, #000000 100%)',
    accentColor: '#f43f5e',
    secondaryColor: '#3b82f6',
    textColor: 'light',
    figureType: 'apple_prism_lens',
    layoutStyle: 'apple_hero',
    fontFamily: 'sans',
    tagBadge: 'Prisme Pro',
    tags: ['prisme', 'optique', 'lumière', 'design', 'géométrie']
  },
  {
    id: 'apple-titanium-mesh',
    name: 'Space Black Titanium',
    category: 'apple_minimal',
    categoryLabel: 'Style Apple & Épuré',
    description: 'Micro-grille industrielle en titane brossé, texture d\'ingénierie aérospatiale d\'une grande pureté.',
    gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)',
    accentColor: '#94a3b8',
    secondaryColor: '#cbd5e1',
    textColor: 'light',
    figureType: 'apple_titanium_mesh',
    layoutStyle: 'minimal',
    fontFamily: 'sans',
    tagBadge: 'Grade 5 Titanium',
    tags: ['titane', 'métal', 'mesh', 'pro', 'sombre', 'industriel']
  },

  // ----------------------------------------------------
  // 2. TECHNOLOGIE & IA
  // ----------------------------------------------------
  {
    id: 'tech-neural-matrix',
    name: 'Synapse Neural AI',
    category: 'tech_ai',
    categoryLabel: 'Technologie & IA',
    description: 'Réseau de neurones artificiels lumineux interconnectés avec impulsions synaptiques.',
    gradient: 'linear-gradient(135deg, #0a0f24 0%, #172554 50%, #1e1b4b 100%)',
    accentColor: '#38bdf8',
    secondaryColor: '#818cf8',
    textColor: 'light',
    figureType: 'tech_neural_matrix',
    layoutStyle: 'modern',
    fontFamily: 'sans',
    tagBadge: 'IA & Deep Learning',
    tags: ['ia', 'neural', 'cerveau', 'synapses', 'algorithme', 'data']
  },
  {
    id: 'tech-quantum-circuit',
    name: 'Circuit Quantique Or',
    category: 'tech_ai',
    categoryLabel: 'Technologie & IA',
    description: 'Tracés de microprocesseurs supraconducteurs dorés sur carte mère noir mat.',
    gradient: 'linear-gradient(145deg, #09090b 0%, #18181b 100%)',
    accentColor: '#eab308',
    secondaryColor: '#ca8a04',
    textColor: 'light',
    figureType: 'tech_quantum_circuit',
    layoutStyle: 'badge_top',
    fontFamily: 'mono',
    tagBadge: 'Hardware & Code',
    tags: ['circuit', 'quantique', 'or', 'hardware', 'crypto', 'processeur']
  },
  {
    id: 'tech-neon-code',
    name: 'Cyberpunk Code Stream',
    category: 'tech_ai',
    categoryLabel: 'Technologie & IA',
    description: 'Perspective fuyante de lignes de code binaires et matrice néon violette & turquoise.',
    gradient: 'linear-gradient(135deg, #020617 0%, #0f172a 40%, #2e1065 100%)',
    accentColor: '#06b6d4',
    secondaryColor: '#ec4899',
    textColor: 'light',
    figureType: 'tech_neon_code',
    layoutStyle: 'modern',
    fontFamily: 'mono',
    tagBadge: 'Dev & Hacker',
    tags: ['code', 'neon', 'cyberpunk', 'programmeur', 'terminal']
  },
  {
    id: 'tech-cyber-grid',
    name: 'Vector Hex Matrix',
    category: 'tech_ai',
    categoryLabel: 'Technologie & IA',
    description: 'Grille hexagonale futuriste illuminée avec perspectives isométriques.',
    gradient: 'linear-gradient(145deg, #030712 0%, #0369a1 100%)',
    accentColor: '#38bdf8',
    secondaryColor: '#bae6fd',
    textColor: 'light',
    figureType: 'tech_cyber_grid',
    layoutStyle: 'centered',
    fontFamily: 'sans',
    tagBadge: 'Cloud & Systèmes',
    tags: ['hexagone', 'grille', 'cyber', 'data', 'cloud']
  },

  // ----------------------------------------------------
  // 3. NATURE & ÉCOLOGIE
  // ----------------------------------------------------
  {
    id: 'nature-boreal-canopy',
    name: 'Canopée Boréale Émeraude',
    category: 'nature_bio',
    categoryLabel: 'Nature & Écologie',
    description: 'Formes végétales épurées, dégradé vert émeraude profond et brume matinale dorée.',
    gradient: 'linear-gradient(145deg, #022c22 0%, #064e3b 50%, #047857 100%)',
    accentColor: '#34d399',
    secondaryColor: '#fde047',
    textColor: 'light',
    figureType: 'nature_boreal_canopy',
    layoutStyle: 'editorial',
    fontFamily: 'serif',
    tagBadge: 'Botanique & Forêt',
    tags: ['nature', 'forêt', 'vert', 'botanique', 'émeraude', 'organique']
  },
  {
    id: 'nature-sahara-dunes',
    name: 'Dunes Minérales Terra Cotta',
    category: 'nature_bio',
    categoryLabel: 'Nature & Écologie',
    description: 'Courbes ondulantes de sable chaud, coucher de soleil désertique et tons ocres intenses.',
    gradient: 'linear-gradient(135deg, #451a03 0%, #78350f 40%, #c2410c 100%)',
    accentColor: '#fb923c',
    secondaryColor: '#fde047',
    textColor: 'light',
    figureType: 'nature_sahara_dunes',
    layoutStyle: 'modern',
    fontFamily: 'sans',
    tagBadge: 'Terres & Voyage',
    tags: ['dune', 'désert', 'sable', 'ocre', 'soleil', 'terra cotta']
  },
  {
    id: 'nature-ocean-abyss',
    name: 'Abysses Bleues & Bioluminescence',
    category: 'nature_bio',
    categoryLabel: 'Nature & Écologie',
    description: 'Ondes aquatiques immersives du grand large avec filaments lumineux planctoniques.',
    gradient: 'linear-gradient(145deg, #030712 0%, #082f49 50%, #0369a1 100%)',
    accentColor: '#22d3ee',
    secondaryColor: '#67e8f9',
    textColor: 'light',
    figureType: 'nature_ocean_abyss',
    layoutStyle: 'apple_hero',
    fontFamily: 'sans',
    tagBadge: 'Océanographie',
    tags: ['océan', 'eau', 'abysses', 'marin', 'bleu', 'biologie']
  },
  {
    id: 'nature-zen-bamboo',
    name: 'Zen Bambou & Galets',
    category: 'nature_bio',
    categoryLabel: 'Nature & Écologie',
    description: 'Tiges de bambou graphiques et galets d\'équilibre, équilibre parfait du minimalisme nippon.',
    gradient: 'linear-gradient(135deg, #14281d 0%, #24412f 60%, #1e3a29 100%)',
    accentColor: '#a7f3d0',
    secondaryColor: '#6ee7b7',
    textColor: 'light',
    figureType: 'nature_zen_bamboo',
    layoutStyle: 'minimal',
    fontFamily: 'serif',
    tagBadge: 'Harmonie Naturelle',
    tags: ['bambou', 'zen', 'japon', 'harmonie', 'bio', 'écologie']
  },

  // ----------------------------------------------------
  // 4. BUSINESS & FINANCE
  // ----------------------------------------------------
  {
    id: 'business-obsidian-gold',
    name: 'Obsidian Prestige & Or Pur',
    category: 'business_finance',
    categoryLabel: 'Business & Finance',
    description: 'Cadre géométrique fin doré sur fond noir minéral ultra-luxe, pour leaders et investisseurs.',
    gradient: 'linear-gradient(145deg, #09090b 0%, #18181b 60%, #27272a 100%)',
    accentColor: '#fbbf24',
    secondaryColor: '#f59e0b',
    textColor: 'light',
    figureType: 'business_obsidian_gold',
    layoutStyle: 'editorial',
    fontFamily: 'serif',
    tagBadge: 'Private Equity & Luxe',
    tags: ['or', 'prestige', 'finance', 'luxe', 'executive', 'business']
  },
  {
    id: 'business-wallstreet-chart',
    name: 'Wall Street Apex Vector',
    category: 'business_finance',
    categoryLabel: 'Business & Finance',
    description: 'Courbes ascendantes d\'analyse quantitative et d\'expansion de marché sur bleu corporate.',
    gradient: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 70%, #1d4ed8 100%)',
    accentColor: '#38bdf8',
    secondaryColor: '#4ade80',
    textColor: 'light',
    figureType: 'business_wallstreet_chart',
    layoutStyle: 'modern',
    fontFamily: 'sans',
    tagBadge: 'Stratégie & Bourse',
    tags: ['croissance', 'bourse', 'finance', 'trading', 'économie']
  },
  {
    id: 'business-silicon-nodes',
    name: 'Silicon Venture Startup',
    category: 'business_finance',
    categoryLabel: 'Business & Finance',
    description: 'Architecture modulaire de blocs d\'innovation, style moderne épuré pour bâtisseurs d\'entreprises.',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 60%, #6366f1 100%)',
    accentColor: '#a5b4fc',
    secondaryColor: '#c7d2fe',
    textColor: 'light',
    figureType: 'business_silicon_nodes',
    layoutStyle: 'badge_top',
    fontFamily: 'sans',
    tagBadge: 'Scale-Up & SaaS',
    tags: ['startup', 'saas', 'management', 'innovation', 'venture']
  },

  // ----------------------------------------------------
  // 5. MINDSET & BIEN-ÊTRE
  // ----------------------------------------------------
  {
    id: 'mindset-aura-halo',
    name: 'Aura Pastel Quartz & Lavande',
    category: 'mindset_wellness',
    categoryLabel: 'Mindset & Bien-être',
    description: 'Halo énergétique vaporeux aux teintes douces pastel pour méditation et épanouissement.',
    gradient: 'linear-gradient(135deg, #2e1065 0%, #581c87 50%, #831843 100%)',
    accentColor: '#f472b6',
    secondaryColor: '#c084fc',
    textColor: 'light',
    figureType: 'mindset_aura_halo',
    layoutStyle: 'centered',
    fontFamily: 'serif',
    tagBadge: 'Pleine Conscience',
    tags: ['aura', 'pastel', 'méditation', 'calme', 'psycho', 'chakra']
  },
  {
    id: 'mindset-solstice-sun',
    name: 'Solstice & Rayonnement Intérieur',
    category: 'mindset_wellness',
    categoryLabel: 'Mindset & Bien-être',
    description: 'Disque solaire minimaliste rayonnant, symbole d\'éveil, de vitalité et d\'énergie positive.',
    gradient: 'linear-gradient(145deg, #451a03 0%, #7c2d12 40%, #b45309 100%)',
    accentColor: '#fde047',
    secondaryColor: '#fdba74',
    textColor: 'light',
    figureType: 'mindset_solstice_sun',
    layoutStyle: 'apple_hero',
    fontFamily: 'sans',
    tagBadge: 'Développement Personnel',
    tags: ['soleil', 'énergie', 'morning', 'habitudes', 'motivation']
  },
  {
    id: 'health-matcha-spiral',
    name: 'Vitalité Pureté & Oxygène',
    category: 'mindset_wellness',
    categoryLabel: 'Mindset & Bien-être',
    description: 'Vortex dynamique vert végétal et blanc pur, idéal pour nutrition, santé et sport.',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
    accentColor: '#6ee7b7',
    secondaryColor: '#d1fae5',
    textColor: 'light',
    figureType: 'health_matcha_spiral',
    layoutStyle: 'modern',
    fontFamily: 'sans',
    tagBadge: 'Santé & Longévité',
    tags: ['santé', 'matcha', 'nutrition', 'sport', 'vitalité']
  },

  // ----------------------------------------------------
  // 6. SCI-FI & COSMOS
  // ----------------------------------------------------
  {
    id: 'scifi-supernova-ring',
    name: 'Supernova & Event Horizon',
    category: 'scifi_space',
    categoryLabel: 'Sci-Fi & Cosmos',
    description: 'Anneau d\'accrétion d\'un trou noir avec vortex gravitationnel et nébuleuse interstellaire.',
    gradient: 'linear-gradient(145deg, #030712 0%, #0f172a 40%, #4c0519 100%)',
    accentColor: '#fb7185',
    secondaryColor: '#f43f5e',
    textColor: 'light',
    figureType: 'scifi_supernova_ring',
    layoutStyle: 'centered',
    fontFamily: 'sans',
    tagBadge: 'Astrophysique & Fiction',
    tags: ['cosmos', 'trou noir', 'espace', 'étoile', 'scifi', 'galaxie']
  },
  {
    id: 'scifi-cyber-horizon',
    name: 'Horizon Rétro-Futur 2080',
    category: 'scifi_space',
    categoryLabel: 'Sci-Fi & Cosmos',
    description: 'Perspective de soleil filaire sur plaine vectorielle avec néons crépusculaires synthwave.',
    gradient: 'linear-gradient(135deg, #18032e 0%, #3b0764 45%, #701a75 100%)',
    accentColor: '#e879f9',
    secondaryColor: '#38bdf8',
    textColor: 'light',
    figureType: 'scifi_cyber_horizon',
    layoutStyle: 'apple_hero',
    fontFamily: 'mono',
    tagBadge: 'Cyberpunk & Utopie',
    tags: ['synthwave', 'futur', 'cyber', 'horizon', '80s', 'anticipation']
  },

  // ----------------------------------------------------
  // 7. LITTÉRATURE, ART & ÉDITION
  // ----------------------------------------------------
  {
    id: 'lit-gallimard-border',
    name: 'Grande Édition Classique',
    category: 'literature_art',
    categoryLabel: 'Littérature & Art',
    description: 'Double filet rouge noble, typographie serif élégante et pureté du papier d\'art littéraire.',
    gradient: 'linear-gradient(145deg, #faf5f0 0%, #f5eee6 50%, #ede3d8 100%)',
    accentColor: '#dc2626',
    secondaryColor: '#991b1b',
    textColor: 'dark',
    figureType: 'lit_gallimard_border',
    layoutStyle: 'editorial',
    fontFamily: 'serif',
    tagBadge: 'Grands Classiques',
    tags: ['littérature', 'roman', 'édition', 'classique', 'gallimard', 'élégant']
  },
  {
    id: 'lit-monochrome-typographic',
    name: 'Poésie Noir & Blanc Typographique',
    category: 'literature_art',
    categoryLabel: 'Littérature & Art',
    description: 'Contraste brut noir et blanc, composition asymétrique audacieuse digne d\'un livre d\'art suisse.',
    gradient: 'linear-gradient(145deg, #09090b 0%, #000000 100%)',
    accentColor: '#ffffff',
    secondaryColor: '#a1a1aa',
    textColor: 'light',
    figureType: 'lit_monochrome_typographic',
    layoutStyle: 'minimal',
    fontFamily: 'display',
    tagBadge: 'Design Suisse & Poésie',
    tags: ['noir et blanc', 'typographie', 'suisse', 'poésie', 'minimalisme']
  },
  {
    id: 'art-bauhaus-prisme',
    name: 'Bauhaus Prisme Géométrique',
    category: 'literature_art',
    categoryLabel: 'Littérature & Art',
    description: 'Intersection de formes géométriques primaires pures (cercle, triangle, arche) aux couleurs fortes.',
    gradient: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
    accentColor: '#ef4444',
    secondaryColor: '#3b82f6',
    textColor: 'light',
    figureType: 'art_bauhaus_prisme',
    layoutStyle: 'apple_hero',
    fontFamily: 'sans',
    tagBadge: 'Architecture & Graphisme',
    tags: ['bauhaus', 'art', 'géométrie', 'formes', 'design', 'couleurs']
  },
  {
    id: 'art-gradient-mesh',
    name: 'Chroma Liquid Mesh Pro',
    category: 'literature_art',
    categoryLabel: 'Littérature & Art',
    description: 'Fusion fluide de 5 couleurs spectrales haute dynamique, éclat vibrant et contemporain.',
    gradient: 'linear-gradient(135deg, #4c1d95 0%, #be185d 40%, #ea580c 80%, #fbbf24 100%)',
    accentColor: '#ffffff',
    secondaryColor: '#fef08a',
    textColor: 'light',
    figureType: 'art_gradient_mesh',
    layoutStyle: 'modern',
    fontFamily: 'display',
    tagBadge: 'Créativité & Médias',
    tags: ['couleurs', 'liquide', 'spectre', 'créatif', 'mesh', 'vibrant']
  }
];

export function getCoverTemplateById(id?: string): EbookCoverTemplate {
  if (!id) return EBOOK_COVER_TEMPLATES[0];
  const found = EBOOK_COVER_TEMPLATES.find((t) => t.id === id);
  return found || EBOOK_COVER_TEMPLATES[0];
}

export function findCoverTemplateByGradientOrCategory(gradient?: string, category?: string): EbookCoverTemplate {
  if (gradient) {
    const matchByGradient = EBOOK_COVER_TEMPLATES.find((t) => t.gradient.toLowerCase() === gradient.toLowerCase());
    if (matchByGradient) return matchByGradient;
  }
  if (category) {
    const catLower = category.toLowerCase();
    if (catLower.includes('tech') || catLower.includes('ia') || catLower.includes('cyber')) {
      return EBOOK_COVER_TEMPLATES.find((t) => t.category === 'tech_ai') || EBOOK_COVER_TEMPLATES[0];
    }
    if (catLower.includes('nature') || catLower.includes('écol') || catLower.includes('botan')) {
      return EBOOK_COVER_TEMPLATES.find((t) => t.category === 'nature_bio') || EBOOK_COVER_TEMPLATES[0];
    }
    if (catLower.includes('busin') || catLower.includes('finan') || catLower.includes('strat')) {
      return EBOOK_COVER_TEMPLATES.find((t) => t.category === 'business_finance') || EBOOK_COVER_TEMPLATES[0];
    }
    if (catLower.includes('dév') || catLower.includes('médit') || catLower.includes('bien')) {
      return EBOOK_COVER_TEMPLATES.find((t) => t.category === 'mindset_wellness') || EBOOK_COVER_TEMPLATES[0];
    }
    if (catLower.includes('fict') || catLower.includes('spat') || catLower.includes('scien')) {
      return EBOOK_COVER_TEMPLATES.find((t) => t.category === 'scifi_space') || EBOOK_COVER_TEMPLATES[0];
    }
    if (catLower.includes('roman') || catLower.includes('poé') || catLower.includes('litt')) {
      return EBOOK_COVER_TEMPLATES.find((t) => t.category === 'literature_art') || EBOOK_COVER_TEMPLATES[0];
    }
  }
  return EBOOK_COVER_TEMPLATES[0];
}
