export interface ThematicIllustration {
  id: string;
  category: string;
  title: string;
  url: string;
  credit: string;
}

export const THEMATIC_ILLUSTRATIONS: ThematicIllustration[] = [
  // Business & Entrepreneuriat & Finance
  {
    id: 'biz-1',
    category: 'business',
    title: 'Architecture Verrière & Stratégie Financière',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash Editorial'
  },
  {
    id: 'biz-2',
    category: 'business',
    title: 'Espace de Travail Minimaliste & Clarté Stratégique',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash Editorial'
  },
  {
    id: 'biz-3',
    category: 'business',
    title: 'Perspective Sommitale & Horizon d\'Affaires',
    url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash Editorial'
  },
  {
    id: 'biz-4',
    category: 'business',
    title: 'Courbes Architecturales & Dynamique de Croissance',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash Editorial'
  },

  // Technologie, IA & Data
  {
    id: 'tech-1',
    category: 'tech',
    title: 'Réseaux Neuronaux & Flux Lumineux Quantiques',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash Editorial'
  },
  {
    id: 'tech-2',
    category: 'tech',
    title: 'Circuits Intégrés & Précision Microélectronique',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash Editorial'
  },
  {
    id: 'tech-3',
    category: 'tech',
    title: 'Perspective Cybernétique & Géométrie Digitale',
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash Editorial'
  },
  {
    id: 'tech-4',
    category: 'tech',
    title: 'Ondes Lumineuses Abstraites & Intelligence Artificielle',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash Editorial'
  },

  // Mindset, Développement Personnel, Psychologie & Productivité
  {
    id: 'mind-1',
    category: 'mindset',
    title: 'Rayons Matinaux & Éveil Intérieur',
    url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash Editorial'
  },
  {
    id: 'mind-2',
    category: 'mindset',
    title: 'Carnet de Notes & Réflexion Silencieuse',
    url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash Editorial'
  },
  {
    id: 'mind-3',
    category: 'mindset',
    title: 'Équilibre Minéral & Harmonie Zen',
    url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash Editorial'
  },
  {
    id: 'mind-4',
    category: 'mindset',
    title: 'Lumière Filtrée & Clarté Mentale',
    url: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash Editorial'
  },

  // Nature, Environnement, Santé & Bien-être
  {
    id: 'nature-1',
    category: 'nature',
    title: 'Canopée Boréale & Forêt Brumeuse',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash Editorial'
  },
  {
    id: 'nature-2',
    category: 'nature',
    title: 'Dunes Sahariennes & Courbes Minérales',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash Editorial'
  },
  {
    id: 'nature-3',
    category: 'nature',
    title: 'Abysses Océaniques & Mouvement Cristallin',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash Editorial'
  },
  {
    id: 'nature-4',
    category: 'nature',
    title: 'Cimes Alpinistes & Majesté Sommitale',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash Editorial'
  },

  // Littérature, Art, Histoire & Culture
  {
    id: 'art-1',
    category: 'art',
    title: 'Bibliothèque Ancienne & Mémoire Littéraire',
    url: 'https://images.unsplash.com/photo-1507842229451-79b1be886a27?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash Editorial'
  },
  {
    id: 'art-2',
    category: 'art',
    title: 'Pages Manuscrites & Typographie Délicate',
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash Editorial'
  },
  {
    id: 'art-3',
    category: 'art',
    title: 'Sculpture & Lumière d\'Atelier Classique',
    url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash Editorial'
  },

  // Espace, Science & Prospective
  {
    id: 'sci-1',
    category: 'science',
    title: 'Nébuleuse Astrale & Poussière Stellaire',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash Editorial'
  },
  {
    id: 'sci-2',
    category: 'science',
    title: 'Horizon Orbital & Aurore Terrestre',
    url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash Editorial'
  }
];

export function getThematicFallbackIllustration(params: {
  category?: string;
  chapterTitle?: string;
  chapterNumber?: number;
}): { imageUrl: string; caption: string; source: 'thematic_curated' } {
  const cat = (params.category || '').toLowerCase();
  const title = (params.chapterTitle || '').toLowerCase();
  const chNum = params.chapterNumber || 1;

  let categoryKey = 'business';

  if (cat.includes('tech') || cat.includes('ai') || cat.includes('informatique') || cat.includes('code') || title.includes('ia') || title.includes('techno') || title.includes('digital')) {
    categoryKey = 'tech';
  } else if (cat.includes('mindset') || cat.includes('développement') || cat.includes('psycholog') || cat.includes('habitudes') || title.includes('esprit') || title.includes('habitudes') || title.includes('pensée')) {
    categoryKey = 'mindset';
  } else if (cat.includes('nature') || cat.includes('santé') || cat.includes('bio') || cat.includes('écol') || title.includes('nature') || title.includes('corps') || title.includes('santé')) {
    categoryKey = 'nature';
  } else if (cat.includes('art') || cat.includes('roman') || cat.includes('litt') || cat.includes('histoire') || cat.includes('culture') || title.includes('art') || title.includes('écriture')) {
    categoryKey = 'art';
  } else if (cat.includes('sci') || cat.includes('espace') || cat.includes('futur') || title.includes('espace') || title.includes('science')) {
    categoryKey = 'science';
  } else {
    categoryKey = 'business';
  }

  const matches = THEMATIC_ILLUSTRATIONS.filter((i) => i.category === categoryKey);
  const pool = matches.length > 0 ? matches : THEMATIC_ILLUSTRATIONS;
  const selected = pool[(chNum - 1) % pool.length];

  return {
    imageUrl: selected.url,
    caption: `Figure ${chNum} : ${selected.title}`,
    source: 'thematic_curated'
  };
}
