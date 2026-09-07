import React from 'react';
import {
  ExternalLink,
  Video,
  TrendingUp,
  Sparkles,
  Flame,
  CheckCircle2,
  Users,
  MessageCircle,
  Smartphone,
  Award
} from 'lucide-react';

export interface RecommendedOffer {
  id: string;
  type: 'formation' | 'guide';
  typeLabel: string;
  title: string;
  instructor: string;
  description: string;
  priceDisplay: string;
  priceDetails: string;
  ctaText: string;
  ctaLink: string;
  highlightTag: string;
  gradient: string;
  badgeBg: string;
  icon: React.ElementType;
  keyPoints: string[];
}

export const RECOMMENDED_OFFERS: RecommendedOffer[] = [
  {
    id: 'veo-sora-2025',
    type: 'formation',
    typeLabel: 'Formation Vidéo IA',
    title: 'FORMATION CRÉATION VIDÉO IA - VEO3.2 et Sora 2025',
    instructor: 'R.M DIGITAL ECOM',
    description:
      'Apprenez à créer des vidéos longues (de 1 à 10 minutes avec le même personnage et une cohérence totale) et des publicités virales TikTok sans abonnement payant, grâce à l\'accès à vie aux outils pros Sora 2 Pro et Veo 3 Pro. Inclut ChatGPT, Suno AI, CapCut, et un suivi H24 sur WhatsApp.',
    priceDisplay: '3 500 FCFA',
    priceDetails: 'Soit environ 6 à 9 $US • Accès immédiat',
    ctaText: 'Rejoindre la formation Veo & Sora',
    ctaLink: 'https://chariow.ly/LDEX2VZRKG',
    highlightTag: 'Top Ventes Vidéo IA',
    gradient: 'from-violet-600 via-indigo-600 to-purple-800',
    badgeBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    icon: Video,
    keyPoints: [
      'Cohérence de personnage sur 1 à 10 min',
      'Accès à vie Sora 2 Pro & Veo 3 Pro sans abonnement',
      'ChatGPT, Suno AI & CapCut inclus',
      'Suivi H24 sur communauté WhatsApp'
    ]
  },
  {
    id: 'maitriser-art-de-vendre',
    type: 'guide',
    typeLabel: 'Guide Stratégique',
    title: 'MAÎTRISER L’ART DE VENDRE',
    instructor: 'DIGYCORE',
    description:
      'Le guide indispensable pour surmonter les blocages de vente, comprendre pourquoi les clients hésitent, présenter vos offres pour donner envie et transformer vos prospects en acheteurs dès cette semaine (idéal pour le marketing d\'affiliation et en ligne).',
    priceDisplay: '16,43 $US',
    priceDetails: 'Environ 9 600 FCFA • Téléchargement direct',
    ctaText: 'Découvrir le guide de vente',
    ctaLink: 'https://chariow.ly/UB8K9NZMXF',
    highlightTag: 'Best-Seller Conversion',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-800',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    icon: TrendingUp,
    keyPoints: [
      'Débloquer les freins et objections clients',
      'Pitch d\'offre irrésistible & psychologie d\'achat',
      'Idéal affiliation & monétisation e-books',
      'Méthode actionnable dès cette semaine'
    ]
  },
  {
    id: 'videos-virales-prisca-nimi',
    type: 'formation',
    typeLabel: 'Formation Complète 8 Modules',
    title: 'CRÉER DES VIDÉOS VIRALES AVEC L\'IA',
    instructor: 'Prisca Nimi',
    description:
      'Une formation complète en 8 modules (réalisme IA, dessins animés, drames, animations 3D africaines) pour créer du contenu faceless (sans montrer son visage) qui cartonne sur TikTok et YouTube, compatible téléphone ou PC, avec une communauté WhatsApp privée à vie et les bases de la monétisation.',
    priceDisplay: '30 $US',
    priceDetails: 'Prix de lancement • Soit environ 17 598 FCFA',
    ctaText: 'Rejoindre la formation de Prisca Nimi',
    ctaLink: 'https://chariow.ly/AVDOE0BUNB',
    highlightTag: 'Spécial Faceless & Monétisation',
    gradient: 'from-amber-600 via-orange-600 to-rose-700',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    icon: Flame,
    keyPoints: [
      '8 modules : 3D africaine, réalisme & dessins animés',
      'Contenu faceless (sans montrer son visage)',
      '100% compatible Téléphone & PC',
      'Communauté privée WhatsApp à vie incluse'
    ]
  }
];

interface RecommendedWorkshopsProps {
  compact?: boolean;
  className?: string;
}

export const RecommendedWorkshops: React.FC<RecommendedWorkshopsProps> = ({
  compact = false,
  className = ''
}) => {
  return (
    <section
      id="recommended-workshops-section"
      aria-labelledby="recommended-workshops-title"
      className={`space-y-4 ${className}`}
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Offres Partenaires Recommandées</span>
          </div>
          <h3
            id="recommended-workshops-title"
            className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2"
          >
            <span>Ateliers &amp; Formations Recommandées</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Boostez la visibilité, les ventes et la promotion vidéo de vos e-books grâce à ces programmes d'experts soigneusement sélectionnés pour la communauté Bookly.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shrink-0 self-start sm:self-center">
          <Award className="w-3.5 h-3.5 text-indigo-500" />
          <span>Sélection Qualité &amp; Suivi</span>
        </div>
      </div>

      {/* 3-Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {RECOMMENDED_OFFERS.map((offer) => {
          const IconComponent = offer.icon;

          return (
            <div
              key={offer.id}
              id={`offer-card-${offer.id}`}
              className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400/70 dark:hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200"
            >
              <div className="space-y-4">
                {/* Header Badge & Category */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md border ${offer.badgeBg}`}
                  >
                    {offer.typeLabel}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                    Par {offer.instructor}
                  </span>
                </div>

                {/* Visual Banner Accent */}
                <div
                  className={`p-3.5 rounded-xl bg-gradient-to-tr ${offer.gradient} text-white shadow-xs flex items-center justify-between`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-white/20 backdrop-blur-xs">
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 block">
                        {offer.highlightTag}
                      </span>
                      <span className="text-xs font-extrabold text-white">
                        {offer.priceDisplay}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded text-white font-medium">
                    {offer.type === 'guide' ? 'Guide PDF' : 'Vidéo + WhatsApp'}
                  </span>
                </div>

                {/* Title & Instructor */}
                <div className="space-y-1">
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {offer.title}
                  </h4>
                  <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                    Formateur : {offer.instructor}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {offer.description}
                </p>

                {/* Key Points */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    Points clés inclus :
                  </span>
                  <ul className="space-y-1">
                    {offer.keyPoints.map((point, idx) => (
                      <li
                        key={idx}
                        className="text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Price & Action CTA */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Tarif
                    </span>
                    <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                      {offer.priceDisplay}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 text-right">
                    {offer.priceDetails}
                  </span>
                </div>

                {/* The distinct Affiliate CTA Link */}
                <a
                  href={offer.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  id={`cta-${offer.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-[0.98] transition-all"
                >
                  <span>{offer.ctaText}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
