import { CoverRenderOptions, getCoverFigureSvg } from './coverVectorRenderer';
import { getCoverTemplateById, findCoverTemplateByGradientOrCategory } from '../data/coverTemplatesData';
import { EbookCoverTemplate } from '../types';

export interface AiCoverAdvice {
  recommendedTemplateId: string;
  paletteName: string;
  accentColor: string;
  subtitleSuggestion: string;
  tagline: string;
  visualMood: string;
  source: 'openrouter' | 'groq' | 'gemini' | 'creative_engine';
  modelUsed?: string;
}

/**
 * Service complet de génération et d'importation de page de garde Bookly Studio
 */
export const coverGenerationService = {
  /**
   * Génère un motif abstrait haute définition sur Canvas et le renvoie en Data URL.
   * Permet à l'utilisateur de créer instantanément des couvertures uniques sans outil externe.
   */
  generateProceduralArtwork(
    type: 'silk' | 'mesh' | 'cosmic' | 'geometric' | 'gold_minimal',
    primaryColor: string = '#6366f1',
    secondaryColor: string = '#ec4899',
    width = 1414,
    height = 2000
  ): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Fond de base sombre ou dégradé
    const baseGrad = ctx.createLinearGradient(0, 0, width, height);
    baseGrad.addColorStop(0, '#090d16');
    baseGrad.addColorStop(0.5, '#0f172a');
    baseGrad.addColorStop(1, '#020617');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.save();

    if (type === 'silk') {
      // Rubans de soie lumineux et vaporeux
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        const startY = height * 0.3 + i * 120;
        ctx.moveTo(-100, startY);
        ctx.bezierCurveTo(
          width * 0.3,
          startY - 250 + (i % 2) * 150,
          width * 0.7,
          startY + 300 - (i % 2) * 200,
          width + 100,
          startY - 50
        );

        const strokeGrad = ctx.createLinearGradient(0, 0, width, height);
        strokeGrad.addColorStop(0, primaryColor);
        strokeGrad.addColorStop(1, secondaryColor);

        ctx.strokeStyle = strokeGrad;
        ctx.lineWidth = 45 + i * 15;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.35 - i * 0.04;
        ctx.stroke();
      }
    } else if (type === 'mesh') {
      // Dégradé Mesh multicolore fluide
      const numBlobs = 8;
      for (let i = 0; i < numBlobs; i++) {
        const cx = (width * (0.2 + (i % 4) * 0.22));
        const cy = (height * (0.2 + Math.floor(i / 4) * 0.45));
        const rad = width * (0.35 + (i % 3) * 0.1);

        const radGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, rad);
        const col = i % 2 === 0 ? primaryColor : secondaryColor;
        radGrad.addColorStop(0, col);
        radGrad.addColorStop(0.7, col + '40');
        radGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = radGrad;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'cosmic') {
      // Nébuleuse et poussière stellaire
      const halo = ctx.createRadialGradient(width * 0.5, height * 0.45, 20, width * 0.5, height * 0.45, width * 0.6);
      halo.addColorStop(0, primaryColor + 'cc');
      halo.addColorStop(0.5, secondaryColor + '66');
      halo.addColorStop(1, 'transparent');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, height);

      // Particules stellaires
      ctx.fillStyle = '#ffffff';
      for (let p = 0; p < 180; p++) {
        const px = Math.random() * width;
        const py = Math.random() * height;
        const pSize = Math.random() * 3 + 1;
        ctx.globalAlpha = Math.random() * 0.8 + 0.2;
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'geometric') {
      // Grille polygonale et prisme
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 0.4;
      const step = 90;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      // Losange central
      ctx.beginPath();
      ctx.moveTo(width / 2, height * 0.25);
      ctx.lineTo(width * 0.85, height * 0.5);
      ctx.lineTo(width / 2, height * 0.75);
      ctx.lineTo(width * 0.15, height * 0.5);
      ctx.closePath();
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 6;
      ctx.globalAlpha = 0.8;
      ctx.stroke();
    } else {
      // Minimal or & obsidienne
      const goldGrad = ctx.createLinearGradient(0, 0, width, height);
      goldGrad.addColorStop(0, '#f59e0b');
      goldGrad.addColorStop(0.5, '#fbbf24');
      goldGrad.addColorStop(1, '#d97706');

      ctx.strokeStyle = goldGrad;
      ctx.lineWidth = 4;
      ctx.globalAlpha = 0.7;
      ctx.strokeRect(100, 100, width - 200, height - 200);
      ctx.strokeRect(120, 120, width - 240, height - 240);

      ctx.beginPath();
      ctx.arc(width / 2, height * 0.45, 140, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    // Effet de tranche de livre 3D
    const spineGrad = ctx.createLinearGradient(0, 0, 120, 0);
    spineGrad.addColorStop(0, 'rgba(0,0,0,0.65)');
    spineGrad.addColorStop(0.3, 'rgba(255,255,255,0.18)');
    spineGrad.addColorStop(0.7, 'rgba(0,0,0,0.3)');
    spineGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = spineGrad;
    ctx.fillRect(0, 0, 120, height);

    return canvas.toDataURL('image/png', 0.95);
  },

  /**
   * Rend une couverture complète (avec titre, auteur, badge, illustrations)
   * sur un canvas haute résolution de 1414 x 2000 px et renvoie une image PNG.
   */
  async renderHighResCoverPng(options: CoverRenderOptions): Promise<string> {
    const width = 1414;
    const height = 2000;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

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

    const accent = coverAccentColor || template.accentColor || '#818cf8';

    // 1. Fond
    if (coverCustomImage) {
      // Charger l'image personnalisée
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // Object cover fit
          const hRatio = canvas.width / img.width;
          const vRatio = canvas.height / img.height;
          const ratio = Math.max(hRatio, vRatio);
          const centerShiftX = (canvas.width - img.width * ratio) / 2;
          const centerShiftY = (canvas.height - img.height * ratio) / 2;
          ctx.drawImage(img, 0, 0, img.width, img.height, centerShiftX, centerShiftY, img.width * ratio, img.height * ratio);

          // Vignette sombre par-dessus pour lisibilité
          const overlay = ctx.createLinearGradient(0, 0, 0, height);
          overlay.addColorStop(0, 'rgba(0,0,0,0.35)');
          overlay.addColorStop(0.5, 'rgba(0,0,0,0.65)');
          overlay.addColorStop(1, 'rgba(0,0,0,0.92)');
          ctx.fillStyle = overlay;
          ctx.fillRect(0, 0, width, height);
          resolve();
        };
        img.onerror = () => {
          // Fallback fond dégradé
          const grad = ctx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, '#090d16');
          grad.addColorStop(1, '#1e1b4b');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
          resolve();
        };
        img.src = coverCustomImage;
      });
    } else {
      // Fond dégradé du modèle
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#311042');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Dessiner la figure vectorielle SVG sur le canvas
      const svgString = getCoverFigureSvg(template.figureType, accent, template.secondaryColor);
      const cleanSvg = svgString.replace(/style="[^"]*"/, 'width="1414" height="2000"');
      const blob = new Blob([cleanSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      await new Promise<void>((resolve) => {
        const svgImg = new Image();
        svgImg.onload = () => {
          ctx.drawImage(svgImg, 0, 0, width, height);
          URL.revokeObjectURL(url);
          resolve();
        };
        svgImg.onerror = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
        svgImg.src = url;
      });
    }

    // 2. Tranche 3D de livre
    const spine = ctx.createLinearGradient(0, 0, 110, 0);
    spine.addColorStop(0, 'rgba(0,0,0,0.6)');
    spine.addColorStop(0.25, 'rgba(255,255,255,0.15)');
    spine.addColorStop(0.65, 'rgba(0,0,0,0.25)');
    spine.addColorStop(1, 'transparent');
    ctx.fillStyle = spine;
    ctx.fillRect(0, 0, 110, height);

    // 3. Cadre ornemental
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 2;
    ctx.strokeRect(90, 90, width - 180, height - 180);

    // 4. Badge Catégorie
    const tagText = (template.tagBadge || category).toUpperCase();
    ctx.font = 'bold 26px sans-serif';
    const tagWidth = ctx.measureText(tagText).width;
    const tagX = 140;
    const tagY = 160;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.roundRect ? ctx.roundRect(tagX, tagY, tagWidth + 40, 48, 8) : ctx.fillRect(tagX, tagY, tagWidth + 40, 48);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(tagText, tagX + 20, tagY + 34);

    // 5. Barre d'accentuation
    ctx.fillStyle = accent;
    ctx.fillRect(140, height * 0.42, 120, 8);

    // 6. Titre de l'Ebook (multi-lignes)
    ctx.font = 'bold 84px serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 4;

    const maxTitleWidth = width - 280;
    const words = title.split(' ');
    let currentLine = '';
    let textY = height * 0.48;

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTitleWidth && currentLine) {
        ctx.fillText(currentLine, 140, textY);
        currentLine = words[i];
        textY += 102;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      ctx.fillText(currentLine, 140, textY);
      textY += 102;
    }

    // 7. Sous-titre
    if (subtitle) {
      ctx.font = 'italic 36px serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.shadowBlur = 8;
      const subWords = subtitle.split(' ');
      let subLine = '';
      let subY = textY + 20;

      for (let i = 0; i < subWords.length; i++) {
        const testSub = subLine ? `${subLine} ${subWords[i]}` : subWords[i];
        if (ctx.measureText(testSub).width > maxTitleWidth && subLine) {
          ctx.fillText(subLine, 140, subY);
          subLine = subWords[i];
          subY += 48;
        } else {
          subLine = testSub;
        }
      }
      if (subLine) {
        ctx.fillText(subLine, 140, subY);
      }
    }

    // 8. Pied de page Auteur & Brand
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(140, height - 260, width - 280, 2);

    ctx.font = '22px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('AUTEUR RÉFÉRENT', 140, height - 215);

    // Accent dot
    ctx.beginPath();
    ctx.arc(148, height - 165, 8, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();

    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(author, 172, height - 153);

    // Maison d'édition à droite
    ctx.textAlign = 'right';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('Éditions Bookly Studio', width - 140, height - 170);
    ctx.font = '20px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fillText('Édition Intégrale • Manuscrit A4', width - 140, height - 140);
    ctx.textAlign = 'left';

    return canvas.toDataURL('image/png', 0.95);
  },

  /**
   * Télécharge la couverture haute résolution directement sur l'ordinateur de l'utilisateur.
   */
  async downloadCoverAsPng(options: CoverRenderOptions, filename?: string): Promise<void> {
    const dataUrl = await this.renderHighResCoverPng(options);
    if (!dataUrl) return;

    const safeTitle = (options.title || 'Livre')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    const link = document.createElement('a');
    link.download = filename || `${safeTitle}_Couverture_HD.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Interroge l'IA (OpenRouter en priorité, ou Groq/Gemini en relai) pour recommander
   * une direction artistique, un modèle de couverture adapté, et une accroche magnétique.
   */
  async getAiCoverAdvice(book: {
    title: string;
    subtitle?: string;
    category: string;
    author?: string;
    audience?: string;
  }): Promise<AiCoverAdvice> {
    try {
      const res = await fetch('/api/ai/cover-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.advice) {
          return data.advice;
        }
      }
    } catch (err) {
      console.warn('AI cover advisor network error, falling back to local heuristic:', err);
    }

    // Heuristique locale intelligente selon la catégorie
    const cat = (book.category || '').toLowerCase();
    if (cat.includes('tech') || cat.includes('ia') || cat.includes('code')) {
      return {
        recommendedTemplateId: 'tech-neural-matrix',
        paletteName: 'Cyber Neural Cyan',
        accentColor: '#38bdf8',
        subtitleSuggestion: 'Comprendre, déployer et maîtriser la révolution numérique pas-à-pas',
        tagline: 'Guide Stratégique & Technique',
        visualMood: 'Haute technologie, synapses lumineuses et élégance futuriste.',
        source: 'creative_engine'
      };
    } else if (cat.includes('nature') || cat.includes('bio') || cat.includes('santé') || cat.includes('éco')) {
      return {
        recommendedTemplateId: 'nature-boreal-canopy',
        paletteName: 'Émeraude Boréale & Or',
        accentColor: '#34d399',
        subtitleSuggestion: 'L\'art de renouer avec les équilibres fondamentaux du vivant',
        tagline: 'Édition Botanique & Harmonie',
        visualMood: 'Profondeur végétale, canopée émeraude et lumière d\'aube dorée.',
        source: 'creative_engine'
      };
    } else if (cat.includes('business') || cat.includes('finance') || cat.includes('argent')) {
      return {
        recommendedTemplateId: 'biz-obsidian-gold',
        paletteName: 'Obsidienne & Or Pur',
        accentColor: '#fbbf24',
        subtitleSuggestion: 'Les principes intangibles pour bâtir et développer vos actifs',
        tagline: 'Stratégie & Haute Performance',
        visualMood: 'Luxe minimaliste, géométrie dorée et fond sombre intemporel.',
        source: 'creative_engine'
      };
    }

    return {
      recommendedTemplateId: 'apple-silk-ribbon',
      paletteName: 'Apple Aurora Silk',
      accentColor: '#818cf8',
      subtitleSuggestion: 'La méthode claire et inspirante pour accomplir vos projets littéraires',
      tagline: 'Édition Référence Bookly',
      visualMood: 'Courbes de soie fluide, esthétique Apple épurée et modernité absolue.',
      source: 'creative_engine'
    };
  }
};
