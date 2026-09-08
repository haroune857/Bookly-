import { Project, LibraryBook, TrainingCourse, UserProfile, AppSettings } from '../types';

export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_LIBRARY_BOOKS: LibraryBook[] = [];

export const INITIAL_TRAINING_COURSES: TrainingCourse[] = [
  {
    id: 'train-1',
    title: 'Guide Magistral : Écriture de Livres & E-books à Succès',
    badge: 'Livre Numérique & Masterclass',
    price: 49,
    priceFcfa: 30000,
    pages: 148,
    isPurchased: true,
    isFeatured: true,
    coverGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
    coverTemplateId: 'apple-frosted-orb',
    coverFigure: 'apple_frosted_orb',
    description: 'Le manuel interactif complet pour concevoir, structurer, rédiger et monétiser des livres numériques à forte valeur ajoutée.',
    progress: 100,
    totalModules: 5,
    completedModules: 5,
    instructor: 'Alexandre & Direction Éditoriale Bookly',
    duration: '148 pages • 3h 30m de lecture',
    category: 'Édition & Créativité',
    modulesList: [
      {
        title: 'Chapitre 1 : Trouver un sujet percutant et tester la demande en 48h',
        duration: '25 pages',
        completed: true,
        illustrationUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
        illustrationCaption: 'Figure 1.1 : L\'étincelle créative et la genèse d\'une idée éditoriale forte.',
        content: `## 1.1 L'Alignement Passion & Problème Marché\n\nUn livre ou e-book remarquable ne commence jamais par une envie d'écrire 300 pages : il naît d'un point de douleur aigu vécu par un groupe de personnes.\n\n### Les 3 Questions Fondamentales à vous poser :\n1. **Quel est le coût de ne pas résoudre ce problème ?**\n2. **Quelle transformation concrète mon lecteur obtient-il en refermant ce livre ?**\n3. **Pourquoi suis-je la personne légitime pour transmettre cette méthode ?**\n\n### Méthodologie d'Analyse Rapide :\n- Explorez les avis 2 et 3 étoiles des meilleures ventes dans votre niche pour identifier les manques non comblés.\n- Cartographiez les questions récurrentes sur les communautés et forums spécialisés.\n- Formalisez votre promesse centrale en une seule phrase active.`,
        keyTakeaways: [
          'Formuler une promesse de transformation claire',
          'Analyser les frustrations existantes sur le marché',
          'Valider le concept avant la rédaction intensive'
        ]
      },
      {
        title: 'Chapitre 2 : Rédiger avec l\'assistance IA sans perdre sa voix d\'auteur',
        duration: '32 pages',
        completed: true,
        illustrationUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
        illustrationCaption: 'Figure 2.1 : Harmonie entre intuition humaine et assistance générative.',
        content: `## 2.1 Le Prompting Stratégique pour Auteurs\n\nL'intelligence artificielle n'est pas un substitut à votre pensée, mais un co-auteur infatigable pour débloquer le syndrome de la page blanche.\n\n### Le Protocole en 4 Étapes :\n1. **Le Cadrage Contextuel** : Définissez précisément le ton, le public cible et le niveau de vocabulaire souhaité.\n2. **L'Approfondissement Étape par Étape** : Ne demandez jamais "écris-moi un chapitre entier", mais structurez vos sous-parties une par une.\n3. **La Réinjection Humaine** : Intégrez vos anecdotes vécues, vos exemples concrets et vos métaphores personnelles.\n4. **Le Polissage Stylistique** : Supprimez les adverbes superflus et les tournures génériques.`,
        keyTakeaways: [
          'Guider l\'IA avec un persona et un style rigoureux',
          'Alterner prompts de structure et réécriture de style',
          'Préserver l\'authenticité et l\'ancrage émotionnel'
        ]
      },
      {
        title: 'Chapitre 3 : Typographie, Couvertures et Charte Graphique Éditoriale',
        duration: '28 pages',
        completed: true,
        content: `## 3.1 La Première Impression Décisive\n\nLa couverture d'un e-book est son affiche publicitaire. 80% des décisions d'achat se jouent sur la lisibilité de la miniature.\n\n### Les Règles d'Or Graphiques :\n- **Hiérarchie Visuelle** : Le titre doit être parfaitement lisible même à une échelle de 80 pixels de haut.\n- **Harmonie Chromatique** : Utilisez un fond sombre ou texturé avec un accent vibrant (ambre, indigo, émeraude) pour attirer l'œil.\n- **Mise en page Intérieure** : Choisissez des interlignes généreux (1.5 à 1.7) et des marges aérées pour une expérience de lecture confortable sur tablette et liseuse.`,
        keyTakeaways: [
          'Concevoir une couverture lisible en miniature',
          'Choisir des contrastes typographiques équilibrés',
          'Harmoniser les titrages et les styles de chapitres'
        ]
      },
      {
        title: 'Chapitre 4 : Structuration des Chapitres et Exportations Multi-Formats',
        duration: '35 pages',
        completed: true,
        content: `## 4.1 L'Architecture du Savoir\n\nUn e-book captivant maintient le lecteur en haleine grâce à un rythme soutenu et une alternance judicieuse de théorie et d'exercices pratiques.\n\n### La Formule Standard d'un Chapitre Réussi :\n- **Accroche narrative ou question clé** (10%)\n- **Développement du concept principal** (40%)\n- **Exemple réel ou étude de cas** (30%)\n- **Plan d'action & Checklist récapitulative** (20%)\n\n### Formats de Diffusion :\n- **PDF Haute Définition** : Idéal pour les guides illustrés et les impressions professionnelles.\n- **EPUB Standardisé** : Le format universel pour Kindle, Apple Books et liseuses.\n- **Google Docs & Drive** : Indispensable pour la collaboration en temps réel avec les bêta-lecteurs.`,
        keyTakeaways: [
          'Rythmer chaque chapitre avec des cas pratiques',
          'Fournir des fiches d\'action actionnables',
          'Maîtriser les spécificités de chaque format d\'export'
        ]
      },
      {
        title: 'Chapitre 5 : Stratégies de Vente, Prix et Lancement',
        duration: '28 pages',
        completed: true,
        content: `## 5.1 Monétiser son Savoir avec Élégance\n\nFixer le bon prix pour son e-book nécessite de valoriser le gain de temps et les résultats obtenus par le lecteur plutôt que le simple nombre de pages.\n\n### Les 3 Niveaux de Tarification :\n1. **Le Guide Flash (9€ - 19€)** : Résout un micro-problème en moins d'une heure.\n2. **Le Manuel Méthodologique (29€ - 49€)** : Méthode éprouvée pas-à-pas avec modèles prêts à l'emploi.\n3. **Le Pack VIP / Masterclass (79€ - 149€)** : Livre numérique + accès communauté + bonus exclusifs.\n\n### La Séquence Email de Lancement :\n- J-7 : Teasing et partage des coulisses de rédaction\n- J-3 : Extrait offert du premier chapitre\n- J-0 : Ouverture avec tarif promotionnel limité\n- J+3 : Clôture de l'offre de lancement`,
        keyTakeaways: [
          'Positionner son prix sur la valeur de la transformation',
          'Structurer une séquence de lancement par e-mail',
          'Recueillir les premiers témoignages de lecteurs'
        ]
      }
    ]
  },
  {
    id: 'train-2',
    title: 'Manuel des Tunnels de Vente & Pages de Capture',
    badge: 'Livre Numérique & Stratégie',
    price: 39,
    priceFcfa: 25000,
    pages: 112,
    isPurchased: false,
    isFeatured: false,
    coverGradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
    coverTemplateId: 'business-obsidian-gold',
    coverFigure: 'business_obsidian_gold',
    description: 'Le guide complet pour bâtir un système automatisé qui transforme des lecteurs curieux en acheteurs fidèles.',
    progress: 0,
    totalModules: 4,
    completedModules: 0,
    instructor: 'Sarah K. (Growth & Conversion Expert)',
    duration: '112 pages • 2h 45m de lecture',
    category: 'Marketing',
    modulesList: [
      {
        title: 'Chapitre 1 : Psychologie du lecteur et promesse irrésistible',
        duration: '26 pages',
        completed: false,
        content: `## 1.1 Capter l'Attention en 3 Secondes\n\nSur le web, votre page de présentation est la vitrine de votre e-book. Les visiteurs ne lisent pas, ils scannent.\n\n### Les Leviers Psychologiques Majeurs :\n- **La Spécificité** : Préférez "Écrivez un livre de 100 pages en 21 jours" à "Apprenez à écrire un livre".\n- **La Réduction du Risque** : Garantie de remboursement et extraits gratuits à feuilleter.\n- **La Preuve Sociale** : Captures d'écrans de retours de lecteurs et notes vérifiées.`,
        keyTakeaways: [
          'Rédiger une proposition de valeur ultra-spécifique',
          'Désamorcer les objections dès le haut de page',
          'Intégrer des éléments de réassurance tangibles'
        ]
      },
      {
        title: 'Chapitre 2 : Structure millimétrée d\'une page de vente à fort impact',
        duration: '30 pages',
        completed: false,
        content: `## 2.1 Le Découpage Idéal d'une Page de Vente\n\nChaque section de votre page remplit une fonction psychologique précise dans le parcours du prospect.\n\n### L'Ordre des Blocs Recommandé :\n1. **Hero Section** : Titre fort, sous-titre explicatif, visuel 3D du livre et bouton d'action principal.\n2. **Le Constat du Problème** : Racontez la douleur vécue par le lecteur avec empathie.\n3. **La Solution & Le Sommaire** : Présentez le contenu détaillé et la table des matières.\n4. **Le Formateur / L'Auteur** : Présentation humaine et chaleureuse de votre parcours.\n5. **La FAQ & Le Bouton Final** : Répondez aux dernières hésitations.`,
        keyTakeaways: [
          'Respecter la structure séquentielle de conversion',
          'Mettre en scène l\'e-book avec des visuels 3D attractifs',
          'Clarifier les modalités de livraison instantanée'
        ]
      },
      {
        title: 'Chapitre 3 : Rédiger des accroches percutantes avec le modèle AIDA',
        duration: '28 pages',
        completed: false,
        content: `## 3.1 La Formule AIDA Adaptée aux Livres Numériques\n\n- **Attention** : Une statistique choc ou une remise en cause d'une fausse croyance.\n- **Intérêt** : L'explication de la méthode inédite contenue dans l'e-book.\n- **Désir** : La projection du lecteur après avoir mis en application les conseils.\n- **Action** : Un appel à l'action limpide et incitatif.`,
        keyTakeaways: [
          'Formuler des titres accrocheurs',
          'Maintenir la curiosité d\'un paragraphe à l\'autre',
          'Créer des boutons d\'action clairs et visibles'
        ]
      },
      {
        title: 'Chapitre 4 : Upsells, Packs et Maximisation du Panier Moyen',
        duration: '28 pages',
        completed: false,
        content: `## 4.1 L'Art des Offres Complémentaires\n\nProposez des ressources prêtes à l'emploi (fiches templates, fichiers Notion, audio book) pour doubler la valeur moyenne par commande sans effort logistique supplémentaire.`,
        keyTakeaways: [
          'Créer des bonus digitaux à marge maximale',
          'Configurer des order bumps pertinents',
          'Automatiser la livraison des accès'
        ]
      }
    ]
  },
  {
    id: 'train-3',
    title: 'Guide Pratique : Affiliation & Partenariats d\'Auteurs',
    badge: 'Livre Numérique & Revenus',
    price: 29,
    priceFcfa: 19000,
    pages: 94,
    isPurchased: false,
    isFeatured: false,
    coverGradient: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
    coverTemplateId: 'tech-neural-matrix',
    coverFigure: 'tech_neural_matrix',
    description: 'Développez un réseau d\'ambassadeurs et générez des revenus automatiques grâce à la recommandation d\'ouvrages.',
    progress: 0,
    totalModules: 3,
    completedModules: 0,
    instructor: 'David M. (Affiliation & Réseaux)',
    duration: '94 pages • 2h 10m de lecture',
    category: 'Revenus Passifs',
    modulesList: [
      {
        title: 'Chapitre 1 : Les règles d\'or du programme de recommandation',
        duration: '30 pages',
        completed: false,
        content: `## 1.1 La Puissance du Bouche-à-Oreille Organisé\n\nDonnez à vos lecteurs satisfaits la possibilité de devenir vos meilleurs ambassadeurs en leur offrant une commission sur chaque vente générée.\n\n### Les Taux de Commission Recommandés :\n- Produits numériques (e-books) : **30% à 50%** de commission pour motiver activement les affiliés.\n- Livres physiques : **10% à 20%** selon les coûts d'impression.`,
        keyTakeaways: [
          'Fixer des pourcentages de commission attractifs',
          'Choisir des règles d\'attribution éthiques et transparentes',
          'Fournir des bannières et kits de promotion prêts à l\'emploi'
        ]
      },
      {
        title: 'Chapitre 2 : Séquences d\'e-mails de recommandation et de relance',
        duration: '34 pages',
        completed: false,
        content: `## 2.1 Le Nurturing Bienveillant\n\nRédigez des séquences de suivi par e-mail qui apportent une réelle valeur ajoutée avant de proposer un ouvrage recommandé.`,
        keyTakeaways: [
          'Rédiger des e-mails centrés sur l\'apprentissage',
          'Intégrer les liens affiliés de manière fluide',
          'Programmer des relances automatiques ciblées'
        ]
      },
      {
        title: 'Chapitre 3 : Suivi des métriques, tracking et fidélisation',
        duration: '30 pages',
        completed: false,
        content: `## 3.1 Analyser les Chiffres Clés\n\nSuivez vos taux de clics (CTR), taux de conversion (CR) et revenus moyens par clic (EPC) pour optimiser vos partenariats au fil du temps.`,
        keyTakeaways: [
          'Comprendre les indicateurs de performance',
          'Identifier les canaux de diffusion les plus rentables',
          'Récompenser les meilleurs ambassadeurs'
        ]
      }
    ]
  }
];

export const INITIAL_USER: UserProfile = {
  id: 'usr-guest',
  name: 'Nouvel Auteur',
  email: '',
  role: 'Auteur Indépendant',
  bio: 'Passionné d\'écriture et de création d\'e-books numériques sur Bookly Studio.',
  avatarBg: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  authProvider: 'email',
  isAdmin: false,
  signature: 'Auteur Bookly',
  plan: 'free',
  planBilling: 'monthly',
  planRenewsAt: 'Non applicable',
  lifetimeProjectsCreated: 0,
  monthlyProjectsCreated: 0,
  dailyChatbotCount: 0,
  createdAt: '2026-09-05'
};

export const ADMIN_USER_PROFILE: UserProfile = {
  id: 'usr-admin-studio',
  name: 'Administrateur Bookly',
  email: 'admin.studio@bookly.internal',
  role: 'Super Administrateur Plateforme',
  bio: 'Gestionnaire système Bookly Studio, contrôle des accès et supervision.',
  avatarBg: 'linear-gradient(135deg, #d97706, #f59e0b)',
  authProvider: 'email',
  isAdmin: true,
  signature: 'Direction Bookly Studio',
  plan: 'premium',
  planBilling: 'yearly',
  planRenewsAt: 'Illimité (Admin)',
  lifetimeProjectsCreated: 0,
  monthlyProjectsCreated: 0,
  dailyChatbotCount: 0,
  createdAt: '2026-09-05'
};

export const PRESET_ACCOUNTS: UserProfile[] = [];

export const INITIAL_SETTINGS: AppSettings = {
  darkMode: false,
  fontFamily: 'plus_jakarta',
  fontSize: 'medium',
  editorDensity: 'comfortable',
  autoSaveIntervalSec: 15,
  defaultWordGoal: 1000,
  emailNotifications: true,
  aiModel: 'gemini-2.5-flash',
  aiCreativity: 'creative',
  googleIntegration: {
    googleDocsExportFormat: 'gdoc',
    googleDriveBackupEnabled: false,
    lastGoogleDriveBackupDate: 'Jamais',
    autoSyncToDrive: false,
    googleWorkspaceEmail: 'admin@bookly.studio'
  }
};
