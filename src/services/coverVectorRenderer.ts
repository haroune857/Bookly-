import { EbookCoverTemplate } from '../types';
import { getCoverTemplateById, findCoverTemplateByGradientOrCategory } from '../data/coverTemplatesData';

/**
 * Génère le balisage vectoriel SVG pur correspondant aux 24 modèles graphiques de Bookly Studio.
 * Ce SVG peut être injecté dans un document HTML autonome, imprimé en A4 ou converti en PDF.
 */
export function getCoverFigureSvg(
  figureType: string,
  accentColor: string = '#818cf8',
  secondaryColor: string = '#c084fc'
): string {
  switch (figureType) {
    case 'apple_silk_ribbon':
      return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; position: absolute; inset: 0; opacity: 0.85; pointer-events: none;">
          <defs>
            <linearGradient id="silkGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#6366f1" stop-opacity="0.8" />
              <stop offset="50%" stop-color="#c084fc" stop-opacity="0.6" />
              <stop offset="100%" stop-color="#ec4899" stop-opacity="0.2" />
            </linearGradient>
            <linearGradient id="silkGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.7" />
              <stop offset="70%" stop-color="#818cf8" stop-opacity="0.4" />
              <stop offset="100%" stop-color="#a855f7" stop-opacity="0.0" />
            </linearGradient>
            <filter id="glowSilk" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <circle cx="100" cy="100" r="60" fill="#a855f7" opacity="0.15" filter="url(#glowSilk)" />
          <path d="M-20,160 C40,80 70,180 130,90 C170,30 210,120 230,60" fill="none" stroke="url(#silkGrad1)" stroke-width="28" stroke-linecap="round" />
          <path d="M-10,120 C50,190 100,50 160,140 C190,180 210,70 230,40" fill="none" stroke="url(#silkGrad2)" stroke-width="16" stroke-linecap="round" />
          <path d="M20,180 C80,100 120,140 180,60" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="4 6" opacity="0.5" />
        </svg>
      `;

    case 'apple_frosted_orb':
      return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; position: absolute; inset: 0; opacity: 0.9; pointer-events: none;">
          <defs>
            <radialGradient id="orbGrad" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8" />
              <stop offset="25%" stop-color="#38bdf8" stop-opacity="0.6" />
              <stop offset="60%" stop-color="#818cf8" stop-opacity="0.3" />
              <stop offset="100%" stop-color="#0f172a" stop-opacity="0.1" />
            </radialGradient>
            <radialGradient id="orbHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.4" />
              <stop offset="70%" stop-color="#a855f7" stop-opacity="0.1" />
              <stop offset="100%" stop-color="#000000" stop-opacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="70" fill="url(#orbHalo)" />
          <circle cx="100" cy="100" r="42" fill="url(#orbGrad)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
          <ellipse cx="88" cy="85" rx="14" ry="7" fill="#ffffff" opacity="0.6" transform="rotate(-30 88 85)" />
          <circle cx="100" cy="100" r="54" fill="none" stroke="rgba(56, 189, 248, 0.3)" stroke-width="1" stroke-dasharray="3 5" />
        </svg>
      `;

    case 'apple_topographic_contour':
      return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; position: absolute; inset: 0; opacity: 0.65; pointer-events: none;">
          <defs>
            <linearGradient id="topoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${accentColor || '#f97316'}" />
              <stop offset="100%" stop-color="${secondaryColor || '#fbbf24'}" />
            </linearGradient>
          </defs>
          <path d="M-10,40 Q60,10 110,60 T220,50" fill="none" stroke="url(#topoGrad)" stroke-width="1.2" />
          <path d="M-10,70 Q70,40 120,90 T220,80" fill="none" stroke="url(#topoGrad)" stroke-width="1.2" />
          <path d="M-10,100 Q80,70 130,120 T220,110" fill="none" stroke="url(#topoGrad)" stroke-width="1.6" />
          <path d="M-10,130 Q90,100 140,150 T220,140" fill="none" stroke="url(#topoGrad)" stroke-width="1.2" />
          <path d="M-10,160 Q100,130 150,180 T220,170" fill="none" stroke="url(#topoGrad)" stroke-width="1.2" />
          <circle cx="130" cy="120" r="3" fill="${accentColor || '#f97316'}" />
          <text x="138" y="122" fill="${secondaryColor || '#fbbf24'}" font-size="6" font-family="monospace" opacity="0.8">4 810 M</text>
        </svg>
      `;

    case 'apple_concentric_sonar':
      return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; position: absolute; inset: 0; opacity: 0.55; pointer-events: none;">
          <circle cx="100" cy="100" r="15" fill="none" stroke="#60a5fa" stroke-width="1.5" />
          <circle cx="100" cy="100" r="30" fill="none" stroke="#60a5fa" stroke-width="1.2" opacity="0.8" />
          <circle cx="100" cy="100" r="48" fill="none" stroke="#60a5fa" stroke-width="1" opacity="0.6" stroke-dasharray="6 4" />
          <circle cx="100" cy="100" r="68" fill="none" stroke="#60a5fa" stroke-width="0.8" opacity="0.4" />
          <circle cx="100" cy="100" r="88" fill="none" stroke="#60a5fa" stroke-width="0.5" opacity="0.25" />
          <circle cx="100" cy="100" r="4" fill="#93c5fd" />
        </svg>
      `;

    case 'apple_prism_lens':
      return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; position: absolute; inset: 0; opacity: 0.85; pointer-events: none;">
          <polygon points="100,45 150,140 50,140" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" />
          <line x1="10" y1="110" x2="80" y2="95" stroke="#ffffff" stroke-width="2" opacity="0.9" />
          <line x1="120" y1="100" x2="195" y2="65" stroke="#f43f5e" stroke-width="2.5" opacity="0.8" />
          <line x1="120" y1="105" x2="195" y2="85" stroke="#eab308" stroke-width="2.5" opacity="0.8" />
          <line x1="120" y1="110" x2="195" y2="105" stroke="#10b981" stroke-width="2.5" opacity="0.8" />
          <line x1="120" y1="115" x2="195" y2="125" stroke="#3b82f6" stroke-width="2.5" opacity="0.8" />
          <line x1="120" y1="120" x2="195" y2="145" stroke="#a855f7" stroke-width="2.5" opacity="0.8" />
        </svg>
      `;

    case 'apple_titanium_mesh':
      return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; position: absolute; inset: 0; opacity: 0.45; pointer-events: none;">
          <defs>
            <pattern id="tiGrid" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="8" cy="8" r="1.5" fill="#cbd5e1" />
              <path d="M0,8 L16,8 M8,0 L8,16" stroke="rgba(203, 213, 225, 0.15)" stroke-width="0.5" />
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#tiGrid)" />
          <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(203, 213, 225, 0.4)" stroke-width="1" />
          <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(203, 213, 225, 0.6)" stroke-width="1.5" stroke-dasharray="4 4" />
        </svg>
      `;

    case 'tech_neural_matrix':
      return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; position: absolute; inset: 0; opacity: 0.75; pointer-events: none;">
          <g stroke="#38bdf8" stroke-width="1" opacity="0.4">
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
      `;

    case 'tech_quantum_circuit':
      return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; position: absolute; inset: 0; opacity: 0.75; pointer-events: none;">
          <g fill="none" stroke="#eab308" stroke-width="1.5">
            <path d="M20,50 L70,50 L90,70 L140,70 L160,90" />
            <path d="M40,160 L80,160 L100,140 L150,140" />
            <path d="M100,40 L100,80 L120,100 L120,160" />
            <circle cx="70" cy="50" r="2.5" fill="#eab308" />
            <circle cx="140" cy="70" r="2.5" fill="#eab308" />
            <circle cx="100" cy="140" r="2.5" fill="#eab308" />
            <circle cx="120" cy="100" r="3" fill="#ffffff" />
          </g>
          <rect x="85" y="85" width="30" height="30" rx="4" fill="rgba(234, 179, 8, 0.15)" stroke="#eab308" stroke-width="1.5" />
        </svg>
      `;

    case 'nature_boreal_canopy':
      return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; position: absolute; inset: 0; opacity: 0.75; pointer-events: none;">
          <defs>
            <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#34d399" />
              <stop offset="100%" stop-color="#059669" />
            </linearGradient>
          </defs>
          <path d="M100,170 C100,100 60,70 100,20 C140,70 100,100 100,170 Z" fill="url(#leafGrad)" opacity="0.6" />
          <path d="M100,170 C70,120 40,110 50,70 C80,90 90,130 100,170 Z" fill="#34d399" opacity="0.4" />
          <path d="M100,170 C130,120 160,110 150,70 C120,90 110,130 100,170 Z" fill="#6ee7b7" opacity="0.4" />
          <line x1="100" y1="170" x2="100" y2="30" stroke="#fde047" stroke-width="1.5" opacity="0.6" />
        </svg>
      `;

    case 'business_obsidian_gold':
      return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; position: absolute; inset: 0; opacity: 0.85; pointer-events: none;">
          <g fill="none" stroke="#fbbf24" stroke-width="1.2">
            <rect x="25" y="25" width="150" height="150" rx="4" opacity="0.4" />
            <rect x="35" y="35" width="130" height="130" rx="2" opacity="0.8" />
            <polygon points="100,50 145,100 100,150 55,100" stroke-width="1.5" />
          </g>
          <circle cx="100" cy="100" r="6" fill="#fbbf24" />
          <line x1="100" y1="40" x2="100" y2="160" stroke="#fbbf24" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.5" />
        </svg>
      `;

    case 'scifi_supernova_ring':
      return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; position: absolute; inset: 0; opacity: 0.85; pointer-events: none;">
          <defs>
            <radialGradient id="novaGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ec4899" stop-opacity="0.9" />
              <stop offset="50%" stop-color="#8b5cf6" stop-opacity="0.4" />
              <stop offset="100%" stop-color="#000000" stop-opacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="70" fill="url(#novaGlow)" />
          <ellipse cx="100" cy="100" rx="65" ry="24" fill="none" stroke="#ec4899" stroke-width="1.5" transform="rotate(-25 100 100)" />
          <circle cx="100" cy="100" r="16" fill="#ffffff" />
        </svg>
      `;

    case 'lit_gallimard_border':
      return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; position: absolute; inset: 0; opacity: 0.9; pointer-events: none;">
          <rect x="14" y="14" width="172" height="172" fill="none" stroke="#b91c1c" stroke-width="1.2" />
          <rect x="18" y="18" width="164" height="164" fill="none" stroke="#1c1917" stroke-width="0.6" />
          <line x1="30" y1="100" x2="170" y2="100" stroke="#b91c1c" stroke-width="0.8" opacity="0.6" />
        </svg>
      `;

    default:
      // Élégant motif d'ondes et prismes universel
      return `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; position: absolute; inset: 0; opacity: 0.65; pointer-events: none;">
          <defs>
            <linearGradient id="defGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${accentColor || '#6366f1'}" stop-opacity="0.8" />
              <stop offset="100%" stop-color="${secondaryColor || '#a855f7'}" stop-opacity="0.2" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="60" fill="url(#defGrad)" opacity="0.3" />
          <circle cx="100" cy="100" r="45" fill="none" stroke="${accentColor || '#6366f1'}" stroke-width="1" opacity="0.5" />
          <circle cx="100" cy="100" r="25" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.7" />
        </svg>
      `;
  }
}

export interface CoverRenderOptions {
  title: string;
  subtitle?: string;
  author: string;
  category?: string;
  coverGradient?: string;
  coverTemplateId?: string;
  coverFigure?: string;
  coverCustomImage?: string;
  coverLayout?: string;
  coverAccentColor?: string;
}

/**
 * Génère le balisage HTML complet de la page de couverture A4 avec TOUS les visuels réels :
 * - Arrière-plan dégradé ou image personnalisée pleine page
 * - Motifs vectoriels haute résolution SVG
 * - Tranche de livre 3D réaliste
 * - Badge catégorie / série
 * - Typographie éditoriale haute lisibilité
 * - Pied de page d'édition
 */
export function generateCoverPageHtml(options: CoverRenderOptions): string {
  const {
    title,
    subtitle,
    author,
    category = 'Non-Fiction',
    coverGradient,
    coverTemplateId,
    coverCustomImage,
    coverAccentColor
  } = options;

  let template: EbookCoverTemplate;
  if (coverTemplateId) {
    template = getCoverTemplateById(coverTemplateId);
  } else {
    template = findCoverTemplateByGradientOrCategory(coverGradient, category);
  }

  const bgGradient = coverGradient || template.gradient || 'linear-gradient(145deg, #090d16 0%, #1e1b4b 50%, #311042 100%)';
  const accent = coverAccentColor || template.accentColor || '#818cf8';
  const secondary = template.secondaryColor || '#c084fc';
  const tag = template.tagBadge || category;
  const isDark = template.textColor === 'dark' && !coverCustomImage;
  const textCol = isDark ? '#0f172a' : '#ffffff';
  const subTextCol = isDark ? '#334155' : 'rgba(255,255,255,0.85)';

  const vectorFigureSvg = coverCustomImage ? '' : getCoverFigureSvg(template.figureType, accent, secondary);

  return `
    <div class="a4-page cover-page-full" style="
      width: 210mm;
      min-height: 297mm;
      max-width: 210mm;
      position: relative;
      overflow: hidden;
      margin: 0 auto;
      background: ${coverCustomImage ? '#090d16' : bgGradient};
      color: ${textCol};
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
      padding: 30mm 24mm;
      page-break-after: always;
      break-after: page;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    ">
      
      <!-- IMAGE DE FOND PERSONNALISÉE (SI DISPONIBLE) -->
      ${coverCustomImage ? `
        <div style="position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; overflow: hidden;">
          <img src="${coverCustomImage}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" />
          <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.65) 60%, rgba(0,0,0,0.92) 100%);"></div>
        </div>
      ` : `
        <!-- FIGURES VECTORIELLES SVG EN HAUTE RÉSOLUTION -->
        <div style="position: absolute; inset: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; overflow: hidden;">
          ${vectorFigureSvg}
        </div>
      `}

      <!-- EFFET DE TRANCHE DE LIVRE 3D (SPINE) -->
      <div style="
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: 16mm;
        background: linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(255,255,255,0.12) 25%, rgba(0,0,0,0.2) 60%, transparent 100%);
        pointer-events: none;
        z-index: 10;
      "></div>

      <!-- CADRE ÉDITORIAL DÉLICAT -->
      <div style="
        position: absolute;
        top: 14mm;
        bottom: 14mm;
        left: 14mm;
        right: 14mm;
        border: 1px solid ${isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)'};
        border-radius: 4px;
        pointer-events: none;
        z-index: 5;
      "></div>

      <!-- EN-TÊTE : BADGE ET CATÉGORIE -->
      <div style="position: relative; z-index: 15; text-align: left;">
        <span style="
          display: inline-block;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 9.5pt;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          padding: 5px 14px;
          border-radius: 6px;
          background: ${isDark ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.45)'};
          color: ${isDark ? '#0f172a' : '#ffffff'};
          border: 1px solid ${isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.25)'};
          backdrop-filter: blur(8px);
        ">
          ${tag}
        </span>
      </div>

      <!-- CENTRE : TITRE MAGNÉTIQUE ET SOUS-TITRE -->
      <div style="position: relative; z-index: 15; margin: auto 0; text-align: left; max-width: 90%;">
        <div style="width: 45px; height: 4px; background: ${accent}; border-radius: 2px; margin-bottom: 22px;"></div>
        
        <h1 style="
          font-family: 'Cinzel', 'Merriweather', Georgia, serif;
          font-size: 34pt;
          font-weight: 800;
          line-height: 1.18;
          color: ${textCol};
          margin: 0 0 16px 0;
          text-shadow: ${isDark ? 'none' : '0 3px 12px rgba(0,0,0,0.6)'};
          letter-spacing: -0.01em;
        ">
          ${title}
        </h1>

        ${subtitle ? `
          <p style="
            font-family: 'Merriweather', Georgia, serif;
            font-size: 13.5pt;
            font-style: italic;
            line-height: 1.55;
            color: ${subTextCol};
            margin: 0;
            max-width: 95%;
            text-shadow: ${isDark ? 'none' : '0 2px 6px rgba(0,0,0,0.5)'};
          ">
            ${subtitle}
          </p>
        ` : ''}
      </div>

      <!-- PIED DE PAGE : AUTEUR ET MAISON D'ÉDITION -->
      <div style="
        position: relative;
        z-index: 15;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        border-top: 1px solid ${isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)'};
        padding-top: 18px;
        font-family: 'Plus Jakarta Sans', sans-serif;
      ">
        <div>
          <div style="font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.75; margin-bottom: 2px;">
            Auteur Référent
          </div>
          <div style="font-size: 14pt; font-weight: 700; color: ${textCol}; display: flex; items-center: center; gap: 8px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${accent}; margin-right: 6px;"></span>
            ${author}
          </div>
        </div>

        <div style="text-align: right; font-size: 8.5pt; opacity: 0.8; line-height: 1.4;">
          <div style="font-weight: 700;">Éditions Bookly Studio</div>
          <div style="font-size: 7.5pt; opacity: 0.7;">Format Manuscrit A4 • Tous Droits Réservés</div>
        </div>
      </div>

    </div>
  `;
}
