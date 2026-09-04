import React from 'react';
import { Project, LibraryBook, EbookCoverTemplate } from '../types';
import { getCoverTemplateById, findCoverTemplateByGradientOrCategory } from '../data/coverTemplatesData';

interface EbookCoverThumbnailProps {
  project?: Partial<Project> | Partial<LibraryBook>;
  title?: string;
  subtitle?: string;
  author?: string;
  category?: string;
  templateId?: string;
  customGradient?: string;
  customImage?: string;
  size?: 'nano' | 'thumb' | 'card' | 'large' | 'full';
  showBadge?: boolean;
  showAuthor?: boolean;
  showChaptersCount?: boolean;
  chaptersCount?: number;
  showSpine?: boolean;
  className?: string;
  onClick?: () => void;
}

export const EbookCoverThumbnail: React.FC<EbookCoverThumbnailProps> = ({
  project,
  title: propTitle,
  subtitle: propSubtitle,
  author: propAuthor,
  category: propCategory,
  templateId: propTemplateId,
  customGradient: propCustomGradient,
  customImage: propCustomImage,
  size = 'card',
  showBadge = true,
  showAuthor = true,
  showChaptersCount = false,
  chaptersCount: propChaptersCount,
  showSpine = true,
  className = '',
  onClick
}) => {
  // Extract data from project or direct props
  const title = propTitle || project?.title || 'Titre du Livre';
  const subtitle = propSubtitle || (project as any)?.subtitle || '';
  const author = propAuthor || project?.author || 'Auteur';
  const category = propCategory || project?.category || 'Non-Fiction';
  const templateId = propTemplateId || (project as any)?.coverTemplateId;
  const customGradient = propCustomGradient || (project as any)?.coverGradient;
  const customImage = propCustomImage || (project as any)?.coverCustomImage;
  const chaptersCount = propChaptersCount ?? ((project as any)?.chapters?.length || 1);

  // Resolve template
  let template: EbookCoverTemplate;
  if (templateId) {
    template = getCoverTemplateById(templateId);
  } else {
    template = findCoverTemplateByGradientOrCategory(customGradient, category);
  }

  const backgroundGradient = customGradient || template.gradient;
  const isDarkText = template.textColor === 'dark';

  // Size styling maps
  const sizeStyles = {
    nano: 'w-10 h-14 text-[6px] rounded-md',
    thumb: 'w-20 h-28 text-[9px] rounded-lg',
    card: 'w-full h-44 sm:h-48 text-xs rounded-xl',
    large: 'w-64 sm:w-72 h-88 sm:h-96 text-sm rounded-2xl',
    full: 'w-full h-full text-base rounded-2xl'
  };

  // Render dedicated vector figure according to template.figureType
  const renderVectorFigure = () => {
    switch (template.figureType) {
      // ----------------------------------------------------
      // 1. APPLE FIGURES
      // ----------------------------------------------------
      case 'apple_silk_ribbon':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-85 absolute inset-0 pointer-events-none overflow-visible">
            <defs>
              <linearGradient id="silkGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#c084fc" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="silkGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
                <stop offset="70%" stopColor="#818cf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
              </linearGradient>
              <filter id="glowSilk" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx="100" cy="100" r="60" fill="#a855f7" opacity="0.15" filter="url(#glowSilk)" />
            <path
              d="M-20,160 C40,80 70,180 130,90 C170,30 210,120 230,60"
              fill="none"
              stroke="url(#silkGrad1)"
              strokeWidth="28"
              strokeLinecap="round"
            />
            <path
              d="M-10,120 C50,190 100,50 160,140 C190,180 210,70 230,40"
              fill="none"
              stroke="url(#silkGrad2)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M20,180 C80,100 120,140 180,60"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeDasharray="4 6"
              opacity="0.5"
            />
          </svg>
        );

      case 'apple_frosted_orb':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-90 absolute inset-0 pointer-events-none">
            <defs>
              <radialGradient id="orbGrad" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.6" />
                <stop offset="60%" stopColor="#818cf8" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.1" />
              </radialGradient>
              <radialGradient id="orbHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="70%" stopColor="#a855f7" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="70" fill="url(#orbHalo)" />
            <circle cx="100" cy="100" r="42" fill="url(#orbGrad)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <ellipse cx="88" cy="85" rx="14" ry="7" fill="#ffffff" opacity="0.6" transform="rotate(-30 88 85)" />
            <circle cx="100" cy="100" r="54" fill="none" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1" strokeDasharray="3 5" />
          </svg>
        );

      case 'apple_topographic_contour':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-60 absolute inset-0 pointer-events-none">
            <defs>
              <linearGradient id="topoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
            <path d="M-10,40 Q60,10 110,60 T220,50" fill="none" stroke="url(#topoGrad)" strokeWidth="1.2" />
            <path d="M-10,70 Q70,40 120,90 T220,80" fill="none" stroke="url(#topoGrad)" strokeWidth="1.2" />
            <path d="M-10,100 Q80,70 130,120 T220,110" fill="none" stroke="url(#topoGrad)" strokeWidth="1.6" />
            <path d="M-10,130 Q90,100 140,150 T220,140" fill="none" stroke="url(#topoGrad)" strokeWidth="1.2" />
            <path d="M-10,160 Q100,130 150,180 T220,170" fill="none" stroke="url(#topoGrad)" strokeWidth="1.2" />
            <circle cx="130" cy="120" r="2.5" fill="#f97316" />
            <text x="138" y="122" fill="#fbbf24" fontSize="6" fontFamily="monospace" opacity="0.8">4 810 M</text>
          </svg>
        );

      case 'apple_concentric_sonar':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-50 absolute inset-0 pointer-events-none">
            <circle cx="100" cy="100" r="15" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="30" fill="none" stroke="#60a5fa" strokeWidth="1.2" opacity="0.8" />
            <circle cx="100" cy="100" r="48" fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.6" strokeDasharray="6 4" />
            <circle cx="100" cy="100" r="68" fill="none" stroke="#60a5fa" strokeWidth="0.8" opacity="0.4" />
            <circle cx="100" cy="100" r="88" fill="none" stroke="#60a5fa" strokeWidth="0.5" opacity="0.25" />
            <circle cx="100" cy="100" r="4" fill="#93c5fd" />
          </svg>
        );

      case 'apple_prism_lens':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-80 absolute inset-0 pointer-events-none">
            <polygon points="100,45 150,140 50,140" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
            <line x1="10" y1="110" x2="80" y2="95" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
            <line x1="120" y1="100" x2="195" y2="65" stroke="#f43f5e" strokeWidth="2.5" opacity="0.8" />
            <line x1="120" y1="105" x2="195" y2="85" stroke="#eab308" strokeWidth="2.5" opacity="0.8" />
            <line x1="120" y1="110" x2="195" y2="105" stroke="#10b981" strokeWidth="2.5" opacity="0.8" />
            <line x1="120" y1="115" x2="195" y2="125" stroke="#3b82f6" strokeWidth="2.5" opacity="0.8" />
            <line x1="120" y1="120" x2="195" y2="145" stroke="#a855f7" strokeWidth="2.5" opacity="0.8" />
          </svg>
        );

      case 'apple_titanium_mesh':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-35 absolute inset-0 pointer-events-none">
            <defs>
              <pattern id="tiGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="8" cy="8" r="1.5" fill="#cbd5e1" />
                <path d="M0,8 L16,8 M8,0 L8,16" stroke="rgba(203, 213, 225, 0.15)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#tiGrid)" />
            <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(203, 213, 225, 0.4)" strokeWidth="1" />
            <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(203, 213, 225, 0.6)" strokeWidth="1.5" strokeDasharray="4 4" />
          </svg>
        );

      // ----------------------------------------------------
      // 2. TECH & IA FIGURES
      // ----------------------------------------------------
      case 'tech_neural_matrix':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-70 absolute inset-0 pointer-events-none">
            <g stroke="#38bdf8" strokeWidth="1" opacity="0.4">
              <line x1="50" y1="60" x2="100" y2="40" />
              <line x1="50" y1="60" x2="90" y2="100" />
              <line x1="100" y1="40" x2="150" y2="70" />
              <line x1="90" y1="100" x2="150" y2="70" />
              <line x1="90" y1="100" x2="60" y2="150" />
              <line x1="90" y1="100" x2="130" y2="140" />
              <line x1="150" y1="70" x2="130" y2="140" />
              <line x1="60" y1="150" x2="130" y2="140" />
            </g>
            <circle cx="50" cy="60" r="4" fill="#38bdf8" />
            <circle cx="100" cy="40" r="5" fill="#818cf8" />
            <circle cx="150" cy="70" r="4" fill="#38bdf8" />
            <circle cx="90" cy="100" r="7" fill="#ffffff" />
            <circle cx="60" cy="150" r="4" fill="#818cf8" />
            <circle cx="130" cy="140" r="5" fill="#38bdf8" />
          </svg>
        );

      case 'tech_quantum_circuit':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-70 absolute inset-0 pointer-events-none">
            <g fill="none" stroke="#eab308" strokeWidth="1.5">
              <path d="M20,50 L70,50 L90,70 L140,70 L160,90" />
              <path d="M40,160 L80,160 L100,140 L150,140" />
              <path d="M100,40 L100,80 L120,100 L120,160" />
              <circle cx="70" cy="50" r="2.5" fill="#eab308" />
              <circle cx="140" cy="70" r="2.5" fill="#eab308" />
              <circle cx="100" cy="140" r="2.5" fill="#eab308" />
              <circle cx="120" cy="100" r="3" fill="#ffffff" />
            </g>
            <rect x="85" y="85" width="30" height="30" rx="4" fill="rgba(234, 179, 8, 0.15)" stroke="#eab308" strokeWidth="1.5" />
          </svg>
        );

      case 'tech_neon_code':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-50 absolute inset-0 pointer-events-none">
            <text x="30" y="60" fill="#06b6d4" fontSize="14" fontFamily="monospace" opacity="0.8">const AI = () =&gt; &#123;</text>
            <text x="50" y="85" fill="#ec4899" fontSize="12" fontFamily="monospace" opacity="0.9">&gt; 01101001 01101110</text>
            <text x="50" y="110" fill="#a855f7" fontSize="12" fontFamily="monospace" opacity="0.9">&gt; neural.synthesize()</text>
            <text x="30" y="135" fill="#06b6d4" fontSize="14" fontFamily="monospace" opacity="0.8">&#125;; // v4.5</text>
            <line x1="20" y1="155" x2="180" y2="155" stroke="#ec4899" strokeWidth="1" strokeDasharray="4 4" />
          </svg>
        );

      case 'tech_cyber_grid':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-60 absolute inset-0 pointer-events-none">
            <g fill="none" stroke="#38bdf8" strokeWidth="1">
              <polygon points="100,50 150,80 150,135 100,165 50,135 50,80" />
              <polygon points="100,70 135,90 135,125 100,145 65,125 65,90" strokeDasharray="3 3" opacity="0.7" />
              <line x1="100" y1="50" x2="100" y2="165" />
              <line x1="50" y1="80" x2="150" y2="135" />
              <line x1="50" y1="135" x2="150" y2="80" />
            </g>
          </svg>
        );

      // ----------------------------------------------------
      // 3. NATURE & ÉCOLOGIE FIGURES
      // ----------------------------------------------------
      case 'nature_boreal_canopy':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-70 absolute inset-0 pointer-events-none">
            <defs>
              <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            <path
              d="M100,170 C100,100 60,70 100,20 C140,70 100,100 100,170 Z"
              fill="url(#leafGrad)"
              opacity="0.6"
            />
            <path
              d="M100,170 C70,120 40,110 50,70 C80,90 90,130 100,170 Z"
              fill="#34d399"
              opacity="0.4"
            />
            <path
              d="M100,170 C130,120 160,110 150,70 C120,90 110,130 100,170 Z"
              fill="#6ee7b7"
              opacity="0.4"
            />
            <line x1="100" y1="170" x2="100" y2="30" stroke="#fde047" strokeWidth="1.5" opacity="0.6" />
          </svg>
        );

      case 'nature_sahara_dunes':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-75 absolute inset-0 pointer-events-none">
            <circle cx="140" cy="65" r="28" fill="#fde047" opacity="0.6" />
            <path d="M-20,130 Q50,90 120,130 T240,110 L240,210 L-20,210 Z" fill="#ea580c" opacity="0.8" />
            <path d="M-20,160 Q60,120 140,160 T240,140 L240,210 L-20,210 Z" fill="#c2410c" opacity="0.9" />
            <path d="M-20,180 Q80,150 160,180 T240,170 L240,210 L-20,210 Z" fill="#7c2d12" />
          </svg>
        );

      case 'nature_ocean_abyss':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-65 absolute inset-0 pointer-events-none">
            <path d="M-20,60 C40,90 80,30 140,70 C180,100 200,50 230,80" fill="none" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
            <path d="M-20,100 C50,130 90,70 150,110 C190,140 210,90 230,120" fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
            <path d="M-20,140 C60,170 100,110 160,150 C200,180 220,130 230,160" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            <circle cx="70" cy="85" r="2" fill="#ffffff" />
            <circle cx="130" cy="120" r="3" fill="#67e8f9" />
            <circle cx="170" cy="70" r="1.5" fill="#ffffff" />
          </svg>
        );

      case 'nature_zen_bamboo':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-60 absolute inset-0 pointer-events-none">
            {/* Bamboo stalks */}
            <line x1="50" y1="0" x2="50" y2="200" stroke="#a7f3d0" strokeWidth="2.5" opacity="0.4" />
            <line x1="160" y1="0" x2="160" y2="200" stroke="#a7f3d0" strokeWidth="3" opacity="0.4" />
            {/* Zen stones */}
            <ellipse cx="100" cy="155" rx="35" ry="12" fill="#064e3b" stroke="#a7f3d0" strokeWidth="1" />
            <ellipse cx="100" cy="136" rx="26" ry="10" fill="#065f46" stroke="#a7f3d0" strokeWidth="1" />
            <ellipse cx="100" cy="120" rx="18" ry="7" fill="#047857" stroke="#a7f3d0" strokeWidth="1" />
            <ellipse cx="100" cy="108" rx="10" ry="5" fill="#10b981" />
          </svg>
        );

      // ----------------------------------------------------
      // 4. BUSINESS & FINANCE FIGURES
      // ----------------------------------------------------
      case 'business_obsidian_gold':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-80 absolute inset-0 pointer-events-none">
            <g fill="none" stroke="#fbbf24" strokeWidth="1.2">
              <rect x="25" y="25" width="150" height="150" rx="4" opacity="0.4" />
              <rect x="35" y="35" width="130" height="130" rx="2" opacity="0.8" />
              <polygon points="100,50 145,100 100,150 55,100" strokeWidth="1.5" />
            </g>
            <circle cx="100" cy="100" r="6" fill="#fbbf24" />
            <line x1="100" y1="40" x2="100" y2="160" stroke="#fbbf24" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />
          </svg>
        );

      case 'business_wallstreet_chart':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-70 absolute inset-0 pointer-events-none">
            <defs>
              <linearGradient id="chartFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d="M20,150 L60,135 L95,140 L130,90 L160,95 L185,45 L185,170 L20,170 Z" fill="url(#chartFill)" />
            <path d="M20,150 L60,135 L95,140 L130,90 L160,95 L185,45" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="185" cy="45" r="4" fill="#ffffff" />
          </svg>
        );

      case 'business_silicon_nodes':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-60 absolute inset-0 pointer-events-none">
            <g fill="none" stroke="#a5b4fc" strokeWidth="1.5">
              <polygon points="100,40 140,60 100,80 60,60" fill="rgba(165, 180, 252, 0.2)" />
              <polygon points="100,80 140,100 100,120 60,100" fill="rgba(165, 180, 252, 0.3)" />
              <polygon points="100,120 140,140 100,160 60,140" fill="rgba(165, 180, 252, 0.4)" />
              <line x1="60" y1="60" x2="60" y2="140" />
              <line x1="140" y1="60" x2="140" y2="140" />
              <line x1="100" y1="80" x2="100" y2="160" />
            </g>
          </svg>
        );

      // ----------------------------------------------------
      // 5. MINDSET & BIEN-ÊTRE FIGURES
      // ----------------------------------------------------
      case 'mindset_aura_halo':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-80 absolute inset-0 pointer-events-none">
            <defs>
              <radialGradient id="haloPink" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f472b6" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#c084fc" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="75" fill="url(#haloPink)" />
            <circle cx="100" cy="100" r="35" fill="#ffffff" opacity="0.3" filter="blur(6px)" />
            <circle cx="100" cy="70" r="3" fill="#ffffff" />
            <circle cx="100" cy="100" r="4" fill="#ffffff" />
            <circle cx="100" cy="130" r="3" fill="#ffffff" />
          </svg>
        );

      case 'mindset_solstice_sun':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-75 absolute inset-0 pointer-events-none">
            <circle cx="100" cy="100" r="34" fill="#fde047" opacity="0.8" />
            <g stroke="#fdba74" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
              <line x1="100" y1="45" x2="100" y2="25" />
              <line x1="100" y1="155" x2="100" y2="175" />
              <line x1="45" y1="100" x2="25" y2="100" />
              <line x1="155" y1="100" x2="175" y2="100" />
              <line x1="62" y1="62" x2="48" y2="48" />
              <line x1="138" y1="138" x2="152" y2="152" />
              <line x1="62" y1="138" x2="48" y2="152" />
              <line x1="138" y1="62" x2="152" y2="48" />
            </g>
          </svg>
        );

      case 'health_matcha_spiral':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-70 absolute inset-0 pointer-events-none">
            <path
              d="M100,100 A20,20 0 0,1 120,100 A35,35 0 0,1 85,100 A55,55 0 0,1 140,100 A75,75 0 0,1 65,100"
              fill="none"
              stroke="#6ee7b7"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="5" fill="#ffffff" />
          </svg>
        );

      // ----------------------------------------------------
      // 6. SCI-FI & SPACE FIGURES
      // ----------------------------------------------------
      case 'scifi_supernova_ring':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-85 absolute inset-0 pointer-events-none">
            <defs>
              <radialGradient id="blackHole" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#000000" />
                <stop offset="60%" stopColor="#030712" />
                <stop offset="100%" stopColor="#fb7185" stopOpacity="0.8" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="30" fill="url(#blackHole)" />
            <ellipse cx="100" cy="100" rx="75" ry="24" fill="none" stroke="#fb7185" strokeWidth="3" opacity="0.9" transform="rotate(-20 100 100)" />
            <ellipse cx="100" cy="100" rx="85" ry="30" fill="none" stroke="#f43f5e" strokeWidth="1" opacity="0.5" transform="rotate(-20 100 100)" />
          </svg>
        );

      case 'scifi_cyber_horizon':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-75 absolute inset-0 pointer-events-none">
            {/* Retrowave Sun */}
            <circle cx="100" cy="90" r="38" fill="#e879f9" opacity="0.8" />
            <line x1="62" y1="80" x2="138" y2="80" stroke="#18032e" strokeWidth="3" />
            <line x1="65" y1="92" x2="135" y2="92" stroke="#18032e" strokeWidth="4" />
            <line x1="72" y1="104" x2="128" y2="104" stroke="#18032e" strokeWidth="5" />
            {/* Grid Floor */}
            <line x1="0" y1="130" x2="200" y2="130" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />
            <line x1="0" y1="150" x2="200" y2="150" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />
            <line x1="0" y1="175" x2="200" y2="175" stroke="#38bdf8" strokeWidth="2" opacity="0.8" />
            <line x1="100" y1="130" x2="100" y2="200" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />
            <line x1="100" y1="130" x2="30" y2="200" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />
            <line x1="100" y1="130" x2="170" y2="200" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />
          </svg>
        );

      // ----------------------------------------------------
      // 7. LITTÉRATURE & ART FIGURES
      // ----------------------------------------------------
      case 'lit_gallimard_border':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-80 absolute inset-0 pointer-events-none">
            <rect x="15" y="15" width="170" height="170" fill="none" stroke="#dc2626" strokeWidth="2.5" />
            <rect x="20" y="20" width="160" height="160" fill="none" stroke="#dc2626" strokeWidth="0.8" />
            {/* Classic ornament */}
            <circle cx="100" cy="40" r="3" fill="#dc2626" />
            <line x1="75" y1="40" x2="125" y2="40" stroke="#dc2626" strokeWidth="0.8" />
          </svg>
        );

      case 'lit_monochrome_typographic':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-40 absolute inset-0 pointer-events-none">
            <text x="25" y="110" fill="#ffffff" fontSize="84" fontFamily="serif" fontStyle="italic" fontWeight="bold">“</text>
            <line x1="25" y1="135" x2="175" y2="135" stroke="#ffffff" strokeWidth="2" />
            <rect x="25" y="145" width="40" height="6" fill="#ffffff" />
          </svg>
        );

      case 'art_bauhaus_prisme':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-75 absolute inset-0 pointer-events-none">
            <circle cx="75" cy="75" r="35" fill="#ef4444" opacity="0.8" />
            <polygon points="125,50 170,125 80,125" fill="#3b82f6" opacity="0.7" />
            <rect x="50" y="110" width="100" height="30" fill="#fbbf24" opacity="0.8" transform="rotate(-15 100 125)" />
          </svg>
        );

      case 'art_gradient_mesh':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-80 absolute inset-0 pointer-events-none">
            <defs>
              <filter id="meshBlur" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="16" />
              </filter>
            </defs>
            <circle cx="60" cy="60" r="50" fill="#4c1d95" filter="url(#meshBlur)" />
            <circle cx="140" cy="70" r="45" fill="#be185d" filter="url(#meshBlur)" />
            <circle cx="80" cy="140" r="55" fill="#ea580c" filter="url(#meshBlur)" />
            <circle cx="140" cy="140" r="40" fill="#fbbf24" filter="url(#meshBlur)" />
          </svg>
        );

      default:
        return null;
    }
  };

  // Font family helper
  const getFontFamilyClass = () => {
    switch (template.fontFamily) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
      case 'display':
        return 'font-extrabold tracking-tight';
      case 'sans':
      default:
        return 'font-sans';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden flex flex-col justify-between p-3.5 select-none transition-all shadow-md group ${
        sizeStyles[size]
      } ${isDarkText && !customImage ? 'text-slate-900' : 'text-white'} ${
        onClick ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02]' : ''
      } ${className}`}
      style={{
        background: customImage ? '#0f172a' : backgroundGradient
      }}
    >
      {/* Custom Imported Image if available */}
      {customImage ? (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={customImage}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Subtle bottom gradient to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
        </div>
      ) : (
        /* Embedded Vector Art / Apple Figure */
        <div className="absolute inset-0 z-0 overflow-hidden">
          {renderVectorFigure()}
        </div>
      )}

      {/* 3D Realistic Book Spine Reflection */}
      {showSpine && (
        <div
          className="absolute inset-y-0 left-0 w-3.5 bg-gradient-to-r from-black/40 via-white/10 to-transparent pointer-events-none z-20"
          style={{ mixBlendMode: 'overlay' }}
        />
      )}

      {/* Subtle glossy page edge highlight */}
      <div className="absolute inset-0 border border-white/15 rounded-[inherit] pointer-events-none z-20" />

      {/* TOP HEADER: Badge & Chapters / Series */}
      <div className="relative z-10 flex items-start justify-between gap-1">
        {showBadge && size !== 'nano' && (
          <span
            className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md backdrop-blur-md shadow-xs ${
              isDarkText
                ? 'bg-slate-900/10 text-slate-800 border border-slate-900/15'
                : 'bg-black/40 text-white/90 border border-white/15'
            }`}
          >
            {template.tagBadge || category}
          </span>
        )}

        {showChaptersCount && size !== 'nano' && (
          <span
            className={`text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-md ${
              isDarkText ? 'bg-slate-900/10 text-slate-700' : 'bg-black/40 text-white/80'
            }`}
          >
            {chaptersCount} ch.
          </span>
        )}
      </div>

      {/* BOTTOM / CENTER CONTENT: Title, Subtitle, Author */}
      <div className="relative z-10 mt-auto pt-2">
        <h4
          className={`${getFontFamilyClass()} font-extrabold leading-tight drop-shadow-sm ${
            size === 'nano'
              ? 'text-[7px] line-clamp-1'
              : size === 'thumb'
              ? 'text-[10px] line-clamp-2'
              : size === 'large'
              ? 'text-lg sm:text-xl line-clamp-3'
              : size === 'full'
              ? 'text-xl sm:text-2xl line-clamp-3'
              : 'text-xs sm:text-sm line-clamp-2'
          }`}
        >
          {title}
        </h4>

        {subtitle && (size === 'large' || size === 'full') && (
          <p
            className={`text-xs mt-1 line-clamp-2 opacity-85 font-normal leading-relaxed ${
              isDarkText ? 'text-slate-700' : 'text-slate-200'
            }`}
          >
            {subtitle}
          </p>
        )}

        {showAuthor && size !== 'nano' && (
          <div
            className={`text-[9px] sm:text-[10px] mt-1 font-medium flex items-center gap-1 opacity-90 ${
              isDarkText ? 'text-slate-700' : 'text-white/85'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: template.accentColor }} />
            <span className="truncate">{author}</span>
          </div>
        )}
      </div>
    </div>
  );
};
