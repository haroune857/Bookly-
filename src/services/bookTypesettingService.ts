import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  UnderlineType,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  convertInchesToTwip
} from 'docx';
import { jsPDF } from 'jspdf';
import { Project, LibraryBook, Chapter } from '../types';
import { generateCoverPageHtml } from './coverVectorRenderer';

export interface FormattedPage {
  pageNumber: number;
  chapterTitle: string;
  chapterNumber?: number;
  isCover?: boolean;
  isToc?: boolean;
  isChapterOpener?: boolean;
  contentHtml: string;
  wordCount: number;
}

export interface BookStructure {
  title: string;
  subtitle?: string;
  author: string;
  category: string;
  coverGradient?: string;
  coverTemplateId?: string;
  coverFigure?: string;
  coverCustomImage?: string;
  coverLayout?: string;
  coverAccentColor?: string;
  chapters: Chapter[];
  pages: FormattedPage[];
  totalWords: number;
  totalPages: number;
}

/**
 * Nettoie le texte pour éliminer les résidus de Markdown brut (astérisques, dièses, etc.)
 * et le convertir en HTML sémantique riche et soigné.
 */
export function cleanAndFormatTextToHtml(rawText: string): string {
  if (!rawText) return '';

  let text = rawText;

  // 1. Convert headers (strictly removing any leftover hashes in title text)
  text = text.replace(/^\s*#{4,6}\s*(.+?)\s*#*$/gm, (_, p1) => `<h4 class="book-h4">${p1.replace(/#+/g, '').trim()}</h4>`);
  text = text.replace(/^\s*#{3}\s*(.+?)\s*#*$/gm, (_, p1) => `<h3 class="book-h3">${p1.replace(/#+/g, '').trim()}</h3>`);
  text = text.replace(/^\s*#{2}\s*(.+?)\s*#*$/gm, (_, p1) => `<h2 class="book-h2">${p1.replace(/#+/g, '').trim()}</h2>`);
  text = text.replace(/^\s*#{1}\s*(.+?)\s*#*$/gm, (_, p1) => `<h1 class="book-h1">${p1.replace(/#+/g, '').trim()}</h1>`);
  text = text.replace(/^\s*#+\s*$/gm, ''); // Supprime les dièses isolés

  // 2. Underlines (convert <u> or __text__ to underline tag)
  text = text.replace(/<u>(.*?)<\/u>/gi, '<span class="book-underline">$1</span>');
  text = text.replace(/__(.*?)__/g, '<span class="book-underline">$1</span>');

  // 3. Bold (**text** -> <strong>text</strong>)
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-950 dark:text-white">$1</strong>');

  // 4. Italic (*text* or _text_ -> <em>text</em>)
  text = text.replace(/\*([^\*]+)\*/g, '<em class="italic">$1</em>');
  text = text.replace(/_([^_]+)_/g, '<em class="italic">$1</em>');

  // 5. Blockquotes / Encadrés (> text)
  text = text.replace(/^>\s+(.+)$/gm, '<blockquote class="book-blockquote">$1</blockquote>');

  // 6. Action boxes / Callouts
  text = text.replace(/(💡|🎯|📌)\s*\*{0,2}(.*?)\*{0,2}\s*:\s*(.+)/g, '<div class="book-callout"><strong class="book-callout-title">$1 $2 :</strong> $3</div>');

  // 7. Bullet lists
  text = text.replace(/^[\*\-]\s+(.+)$/gm, '<li class="book-li">$1</li>');
  // Wrap sequential <li> in <ul>
  text = text.replace(/(<li class="book-li">.*<\/li>(\n|$) *)+/g, '<ul class="book-ul">$&</ul>');

  // 8. Numbered lists
  text = text.replace(/^\d+\.\s+(.+)$/gm, '<li class="book-oli">$1</li>');
  text = text.replace(/(<li class="book-oli">.*<\/li>(\n|$) *)+/g, '<ol class="book-ol">$&</ol>');

  // 9. Horizontal rules / Dividers
  text = text.replace(/^---$/gm, '<div class="book-separator"><span>✦ ✦ ✦</span></div>');

  // 10. Clean any leftover mid-sentence or orphaned raw hashtags (# or ##)
  text = text.replace(/(^|\n)\s*#{1,6}\s+/g, '$1');
  text = text.replace(/\s+#{1,6}\s+/g, ' - ');
  text = text.replace(/#{1,6}/g, '');

  // 11. Paragraphs : split by double line breaks and wrap non-heading non-list lines in <p>
  const lines = text.split(/\n\n+/);
  const formattedParagraphs = lines.map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (
      trimmed.startsWith('<h1') ||
      trimmed.startsWith('<h2') ||
      trimmed.startsWith('<h3') ||
      trimmed.startsWith('<h4') ||
      trimmed.startsWith('<ul') ||
      trimmed.startsWith('<ol') ||
      trimmed.startsWith('<blockquote') ||
      trimmed.startsWith('<div class="book-callout"') ||
      trimmed.startsWith('<div class="book-separator"')
    ) {
      return trimmed;
    }
    return `<p class="book-p">${trimmed.replace(/\n/g, '<br/>')}</p>`;
  });

  return formattedParagraphs.filter(Boolean).join('\n');
}

/**
 * Supprime absolument TOUS les marqueurs Markdown bruts (hashtags, astérisques) pour le texte pur.
 */
export function stripMarkdownToPureText(text: string): string {
  if (!text) return '';
  return text
    .replace(/^\s*#+\s*/gm, '') // Enlève #, ##, ### en début de ligne
    .replace(/\s*#+\s*$/gm, '') // Enlève # en fin de ligne
    .replace(/#{1,6}/g, '')     // Enlève tout résidu de hashtag
    .replace(/\*\*(.*?)\*\*/g, '$1') // Enlève **
    .replace(/\*(.*?)\*/g, '$1') // Enlève *
    .replace(/__(.*?)__/g, '$1') // Enlève __
    .replace(/_(.*?)_/g, '$1') // Enlève _
    .replace(/^>\s+/gm, '') // Enlève >
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // Enlève code backticks
    .replace(/<u>(.*?)<\/u>/gi, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .trim();
}

/**
 * Découpe intelligemment le contenu d'un livre en pages réelles A4 (environ 320-380 mots par page de livre selon les titres).
 */
export function paginateBook(
  item: Project | LibraryBook
): BookStructure {
  const isProject = 'chapters' in item;
  const title = item.title;
  const subtitle = 'subtitle' in item ? item.subtitle : undefined;
  const author = item.author || 'Jean Dupont';
  const category = item.category || 'Non classé';
  const coverGradient = 'coverGradient' in item ? item.coverGradient : undefined;
  const coverTemplateId = 'coverTemplateId' in item ? (item as any).coverTemplateId : undefined;
  const coverFigure = 'coverFigure' in item ? (item as any).coverFigure : undefined;
  const coverCustomImage = 'coverCustomImage' in item ? (item as any).coverCustomImage : undefined;
  const coverLayout = 'coverLayout' in item ? (item as any).coverLayout : undefined;
  const coverAccentColor = 'coverAccentColor' in item ? (item as any).coverAccentColor : undefined;

  const chapters: Chapter[] = isProject
    ? (item as Project).chapters
    : (item as LibraryBook).content.map((text, idx) => ({
        id: `lib-ch-${idx + 1}`,
        title: `Section ${idx + 1}`,
        content: text,
        wordCount: text.split(/\s+/).filter(Boolean).length,
        completed: true
      }));

  const pages: FormattedPage[] = [];
  let pageCounter = 1;

  // Page 1: Couverture A4
  pages.push({
    pageNumber: pageCounter++,
    chapterTitle: 'Couverture',
    isCover: true,
    contentHtml: '',
    wordCount: 0
  });

  // Page 2: Sommaire / Table des Matières A4
  pages.push({
    pageNumber: pageCounter++,
    chapterTitle: 'Table des Matières',
    isToc: true,
    contentHtml: '',
    wordCount: 0
  });

  // Pages des Chapitres au format standard A4
  chapters.forEach((ch, chIdx) => {
    const rawContent = ch.content || 'Contenu en cours de rédaction...';
    const paragraphs = rawContent.split(/\n\n+/).filter((p) => p.trim().length > 0);

    let currentPageParagraphs: string[] = [];
    let currentWordCount = 0;
    let isFirstPageOfChapter = true;

    paragraphs.forEach((p) => {
      const words = p.trim().split(/\s+/).filter(Boolean).length;
      // Sur une page A4 avec police 11pt, interligne 1.6 et marges 20mm, ~320-360 mots par page
      const maxWordsThisPage = isFirstPageOfChapter ? 280 : 350;

      if (currentWordCount + words > maxWordsThisPage && currentPageParagraphs.length > 0) {
        const rawPageText = currentPageParagraphs.join('\n\n');
        pages.push({
          pageNumber: pageCounter++,
          chapterTitle: ch.title,
          chapterNumber: chIdx + 1,
          isChapterOpener: isFirstPageOfChapter,
          contentHtml: cleanAndFormatTextToHtml(rawPageText),
          wordCount: currentWordCount
        });
        currentPageParagraphs = [p];
        currentWordCount = words;
        isFirstPageOfChapter = false;
      } else {
        currentPageParagraphs.push(p);
        currentWordCount += words;
      }
    });

    if (currentPageParagraphs.length > 0) {
      const rawPageText = currentPageParagraphs.join('\n\n');
      pages.push({
        pageNumber: pageCounter++,
        chapterTitle: ch.title,
        chapterNumber: chIdx + 1,
        isChapterOpener: isFirstPageOfChapter,
        contentHtml: cleanAndFormatTextToHtml(rawPageText),
        wordCount: currentWordCount
      });
    }
  });

  const totalWords = chapters.reduce((acc, c) => acc + (c.wordCount || 0), 0);

  return {
    title,
    subtitle,
    author,
    category,
    coverGradient,
    coverTemplateId,
    coverFigure,
    coverCustomImage,
    coverLayout,
    coverAccentColor,
    chapters,
    pages,
    totalWords,
    totalPages: pages.length
  };
}

/**
 * Génère un document Microsoft Word (.docx) authentique et professionnel avec mise en page A4,
 * titres hiérarchisés, sauts de page, en-têtes, pieds de page et numérotation.
 */
export async function generateDocxBlob(item: Project | LibraryBook): Promise<Blob> {
  const structure = paginateBook(item);
  const docChildren: (Paragraph | Table)[] = [];

  // 1. Page de Garde / Couverture Word
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1400, after: 300 },
      children: [
        new TextRun({
          text: structure.category.toUpperCase(),
          size: 20, // 10pt
          color: '6366F1',
          bold: true,
          font: 'Calibri'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 400 },
      children: [
        new TextRun({
          text: structure.title,
          size: 48, // 24pt
          bold: true,
          color: '0F172A',
          font: 'Georgia'
        })
      ]
    })
  );

  if (structure.subtitle) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 600 },
        children: [
          new TextRun({
            text: structure.subtitle,
            size: 26, // 13pt
            italics: true,
            color: '475569',
            font: 'Georgia'
          })
        ]
      })
    );
  }

  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1200, after: 200 },
      children: [
        new TextRun({
          text: `Par ${structure.author}`,
          size: 24, // 12pt
          bold: true,
          color: '1E293B',
          font: 'Calibri'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 800 },
      children: [
        new TextRun({
          text: 'Édition Bookly Studio • Format Manuscrit A4',
          size: 18,
          color: '94A3B8',
          font: 'Calibri'
        })
      ]
    }),
    new Paragraph({
      children: [new PageBreak()]
    })
  );

  // 2. Sommaire / Table des Matières
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 300 },
      children: [
        new TextRun({
          text: 'TABLE DES MATIÈRES',
          size: 32,
          bold: true,
          color: '4F46E5',
          font: 'Georgia'
        })
      ]
    })
  );

  structure.chapters.forEach((ch, idx) => {
    docChildren.push(
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [
          new TextRun({
            text: `Chapitre ${idx + 1} : `,
            bold: true,
            color: '4F46E5',
            font: 'Calibri'
          }),
          new TextRun({
            text: stripMarkdownToPureText(ch.title),
            color: '1E293B',
            font: 'Calibri'
          })
        ]
      })
    );
  });

  docChildren.push(
    new Paragraph({
      children: [new PageBreak()]
    })
  );

  // 3. Chapitres et Contenu
  structure.chapters.forEach((ch, idx) => {
    // Titre du chapitre
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 600, after: 300 },
        children: [
          new TextRun({
            text: stripMarkdownToPureText(ch.title),
            size: 36, // 18pt
            bold: true,
            color: '0F172A',
            font: 'Georgia'
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 50, after: 300 },
        children: [
          new TextRun({
            text: `Section ${idx + 1} sur ${structure.chapters.length} • Guide Complet`,
            size: 18,
            italics: true,
            color: '64748B',
            font: 'Calibri'
          })
        ]
      })
    );

    // Paragraphes du chapitre
    const lines = (ch.content || '').split(/\n\n+/);
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Titres H2 / H3 / H4
      if (trimmed.startsWith('## ')) {
        docChildren.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: stripMarkdownToPureText(trimmed),
                size: 28,
                bold: true,
                color: '334155',
                font: 'Georgia'
              })
            ]
          })
        );
      } else if (trimmed.startsWith('### ') || trimmed.startsWith('#### ')) {
        docChildren.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: stripMarkdownToPureText(trimmed),
                size: 24,
                bold: true,
                color: '4F46E5',
                font: 'Georgia'
              })
            ]
          })
        );
      } else if (trimmed.startsWith('> ')) {
        // Citation / Encadré
        docChildren.push(
          new Paragraph({
            spacing: { before: 200, after: 200 },
            indent: { left: convertInchesToTwip(0.4) },
            children: [
              new TextRun({
                text: stripMarkdownToPureText(trimmed),
                italics: true,
                color: '475569',
                size: 22,
                font: 'Georgia'
              })
            ]
          })
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        // Puces
        const listItems = trimmed.split('\n');
        listItems.forEach((li) => {
          docChildren.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { before: 80, after: 80 },
              children: [
                new TextRun({
                  text: stripMarkdownToPureText(li),
                  size: 22,
                  color: '1E293B',
                  font: 'Calibri'
                })
              ]
            })
          );
        });
      } else {
        // Paragraphe standard propre
        docChildren.push(
          new Paragraph({
            spacing: { before: 120, after: 120, line: 360 }, // 1.5 line spacing
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: stripMarkdownToPureText(trimmed),
                size: 22, // 11pt
                color: '1E293B',
                font: 'Calibri'
              })
            ]
          })
        );
      }
    });

    // Saut de page après chaque chapitre (sauf le dernier)
    if (idx < structure.chapters.length - 1) {
      docChildren.push(
        new Paragraph({
          children: [new PageBreak()]
        })
      );
    }
  });

  // Création du document DOCX aux normes strictes A4 (210mm x 297mm)
  const doc = new Document({
    creator: structure.author,
    title: structure.title,
    description: structure.subtitle || 'E-book professionnel créé avec Bookly Studio',
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // 210mm in twips (ISO standard A4 width)
              height: 16838 // 297mm in twips (ISO standard A4 height)
            },
            margin: {
              top: 1134, // 20mm
              right: 1134, // 20mm
              bottom: 1134, // 20mm
              left: 1134 // 20mm
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${structure.title} • Bookly Studio`,
                    size: 16,
                    color: '94A3B8',
                    font: 'Calibri'
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: '- Page ',
                    size: 18,
                    color: '64748B',
                    font: 'Calibri'
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    color: '64748B',
                    font: 'Calibri'
                  }),
                  new TextRun({
                    text: ' -',
                    size: 18,
                    color: '64748B',
                    font: 'Calibri'
                  })
                ]
              })
            ]
          })
        },
        children: docChildren
      }
    ]
  });

  return await Packer.toBlob(doc);
}

/**
 * Génère le code HTML complet autonome et imprimable en A4 / PDF (sans astérisques ni dièses),
 * 100% lisible et ouvrable sur n'importe quel appareil (ordinateur, iPhone, iPad, Android).
 */
export function generatePrintableBookHtml(item: Project | LibraryBook): string {
  const structure = paginateBook(item);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0">
  <title>${structure.title} - Manuscrit A4</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');

    @page {
      size: 210mm 297mm portrait;
      margin: 18mm 16mm 20mm 16mm;
      @bottom-center {
        content: counter(page);
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 9pt;
        color: #64748b;
      }
    }

    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background-color: #0f172a;
      font-family: 'Merriweather', Georgia, serif;
      color: #0f172a;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Style Page Standard A4 (210mm x 297mm) */
    .a4-page {
      width: 210mm;
      min-height: 297mm;
      max-width: 210mm;
      aspect-ratio: 210 / 297;
      padding: 22mm 20mm 24mm 20mm;
      margin: 18px auto;
      background: #ffffff;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
      border-radius: 4px;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      break-after: page;
    }

    /* Responsive Wrapper for Mobile & Tablet screens */
    @media screen and (max-width: 900px) {
      body {
        padding: 10px;
        background-color: #1e293b;
      }
      .a4-page {
        width: 100%;
        max-width: 100%;
        min-height: auto;
        aspect-ratio: auto;
        padding: 24px 18px;
        margin: 12px 0;
        border-radius: 12px;
      }
    }

    /* Running Header & Footer */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
      margin-bottom: 24px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
    }

    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      margin-top: 24px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 8.5pt;
      color: #94a3b8;
    }
    .page-number {
      font-weight: 700;
      color: #334155;
    }

    /* Cover Page */
    .cover-page {
      background: ${structure.coverGradient || 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)'};
      color: #ffffff;
      padding: 35mm 25mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: center;
    }
    .cover-category {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 11pt;
      font-weight: 800;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #a5b4fc;
    }
    .cover-title {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 32pt;
      font-weight: 700;
      line-height: 1.2;
      margin: 20px 0;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    .cover-subtitle {
      font-family: 'Merriweather', serif;
      font-size: 14pt;
      font-style: italic;
      line-height: 1.5;
      color: #e2e8f0;
      max-width: 80%;
      margin: 0 auto;
    }
    .cover-footer {
      border-top: 1px solid rgba(255,255,255,0.2);
      padding-top: 15px;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .cover-author {
      font-size: 15pt;
      font-weight: 700;
    }
    .cover-brand {
      font-size: 9pt;
      opacity: 0.8;
      margin-top: 4px;
    }

    /* Table of Contents */
    .toc-title {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 22pt;
      text-align: center;
      color: #1e1b4b;
      margin-bottom: 30px;
      border-bottom: 2px solid #4338ca;
      padding-bottom: 10px;
    }
    .toc-item {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 10px 0;
      border-bottom: 1px dotted #cbd5e1;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 11pt;
    }
    .toc-num {
      font-weight: 800;
      color: #4338ca;
      margin-right: 10px;
    }
    .toc-name {
      font-weight: 600;
      color: #0f172a;
      flex: 1;
    }

    /* Chapter Title Opener */
    .chapter-opener {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e2e8f0;
    }
    .chapter-eyebrow {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 10pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #6366f1;
    }
    .chapter-main-title {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 22pt;
      font-weight: 700;
      color: #0f172a;
      margin: 10px 0;
      line-height: 1.3;
    }

    /* Book Typography Inside Pages */
    .book-content {
      font-size: 11pt;
      line-height: 1.8;
      text-align: justify;
      color: #0f172a;
    }
    .book-h1 { font-family: 'Cinzel', serif; font-size: 18pt; color: #1e1b4b; margin: 24px 0 12px 0; }
    .book-h2 { font-family: 'Merriweather', serif; font-size: 14pt; color: #334155; margin: 20px 0 10px 0; font-weight: 700; }
    .book-h3 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12pt; color: #4338ca; margin: 16px 0 8px 0; font-weight: 700; }
    .book-h4 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11pt; color: #0f172a; margin: 12px 0 6px 0; font-weight: 700; }
    .book-p { margin: 0 0 14px 0; text-indent: 1.5em; }
    .book-p:first-of-type { text-indent: 0; }
    .book-underline { text-decoration: underline; text-decoration-color: #6366f1; text-underline-offset: 3px; font-weight: 600; }
    .book-blockquote {
      border-left: 3px solid #6366f1;
      padding: 8px 16px;
      margin: 16px 0;
      font-style: italic;
      color: #334155;
      background: #f8fafc;
      border-radius: 0 8px 8px 0;
    }
    .book-callout {
      background: #f5f3ff;
      border: 1px solid #ddd6fe;
      border-left: 4px solid #7c3aed;
      padding: 12px 16px;
      border-radius: 8px;
      margin: 16px 0;
      font-size: 10.5pt;
    }
    .book-callout-title { color: #5b21b6; }
    .book-ul, .book-ol { margin: 12px 0 16px 20px; padding-left: 10px; }
    .book-li, .book-oli { margin-bottom: 6px; }
    .book-separator { text-align: center; margin: 20px 0; color: #94a3b8; font-size: 10pt; letter-spacing: 0.3em; }

    /* Print Specific Rules */
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      body { background: none; margin: 0; padding: 0; }
      .a4-page {
        margin: 0;
        box-shadow: none;
        width: 210mm !important;
        min-height: 297mm !important;
        page-break-after: always;
        break-after: page;
      }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>

  <!-- Controls for browser preview -->
  <div class="no-print" style="position: fixed; top: 15px; right: 20px; z-index: 999; display: flex; gap: 10px; background: white; padding: 10px 18px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); font-family: 'Plus Jakarta Sans', sans-serif;">
    <button onclick="window.print()" style="background: #4f46e5; color: white; border: none; padding: 8px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
      🖨️ Imprimer / Sauvegarder en PDF
    </button>
    <button onclick="window.close()" style="background: #f1f5f9; color: #475569; border: none; padding: 8px 14px; border-radius: 10px; font-weight: 600; cursor: pointer;">
      Fermer
    </button>
  </div>

  <!-- 1. Couverture A4 Haute Définition avec Graphisme & Image -->
  ${generateCoverPageHtml({
    title: structure.title,
    subtitle: structure.subtitle,
    author: structure.author,
    category: structure.category,
    coverGradient: structure.coverGradient,
    coverTemplateId: structure.coverTemplateId,
    coverFigure: structure.coverFigure,
    coverCustomImage: structure.coverCustomImage,
    coverLayout: structure.coverLayout,
    coverAccentColor: structure.coverAccentColor
  })}

  <!-- 2. Table des matières -->
  <div class="a4-page">
    <div class="page-header">
      <span>${structure.title}</span>
      <span>Sommaire</span>
    </div>
    <div>
      <h2 class="toc-title">Table des Matières</h2>
      ${structure.chapters.map((ch, idx) => `
        <div class="toc-item">
          <span class="toc-num">0${idx + 1}</span>
          <span class="toc-name">${stripMarkdownToPureText(ch.title)}</span>
          <span class="page-number">p. ${idx + 3}</span>
        </div>
      `).join('')}
    </div>
    <div class="page-footer">
      <span>Bookly Studio</span>
      <span class="page-number">- 2 -</span>
    </div>
  </div>

  <!-- 3. Pages des Chapitres -->
  ${structure.pages.filter(p => !p.isCover && !p.isToc).map(page => `
    <div class="a4-page">
      <div class="page-header">
        <span>${structure.title}</span>
        <span>${stripMarkdownToPureText(page.chapterTitle)}</span>
      </div>

      <div class="book-content">
        ${page.isChapterOpener ? `
          <div class="chapter-opener">
            <span class="chapter-eyebrow">Chapitre ${page.chapterNumber || ''}</span>
            <h2 class="chapter-main-title">${stripMarkdownToPureText(page.chapterTitle)}</h2>
          </div>
        ` : ''}
        ${page.contentHtml}
      </div>

      <div class="page-footer">
        <span>${structure.author}</span>
        <span class="page-number">- ${page.pageNumber} -</span>
      </div>
    </div>
  `).join('')}

</body>
</html>`;
}

/**
 * Génère un véritable fichier PDF Haute Définition / 4K au format livre standard A4 (210x297mm)
 * prêt pour l'impression ou la lecture numérique avec page de couverture professionnelle,
 * table des matières reliée et mise en page typographique rigoureuse.
 */
export async function generatePdfBlob(item: Project | LibraryBook): Promise<Blob> {
  const structure = paginateBook(item);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // 1. PAGE DE COUVERTURE (Style Manuscrit Élégant)
  // Fond noble ardoise / bleu nuit
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 297, 'F');

  // Cadre double ornemental doré
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.8);
  doc.rect(12, 12, 186, 273);
  doc.setLineWidth(0.3);
  doc.rect(14.5, 14.5, 181, 268);

  // Catégorie en haut
  doc.setTextColor(245, 158, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text((structure.category || 'LIVRE DIGITAL').toUpperCase(), 105, 48, { align: 'center' });

  // Titre principal au centre
  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  const titleLines = doc.splitTextToSize(structure.title, 155);
  doc.text(titleLines, 105, 95, { align: 'center' });

  // Sous-titre
  if (structure.subtitle) {
    doc.setTextColor(203, 213, 225);
    doc.setFont('times', 'italic');
    doc.setFontSize(13);
    const subtitleLines = doc.splitTextToSize(structure.subtitle, 150);
    const subY = 95 + titleLines.length * 9 + 8;
    doc.text(subtitleLines, 105, subY, { align: 'center' });
  }

  // Filet décoratif central
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.5);
  doc.line(75, 160, 135, 160);

  // Auteur
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(`Par ${structure.author}`, 105, 218, { align: 'center' });

  // Mention éditeur Bookly Studio
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('ÉDITION BOOKLY STUDIO • MANUSCRIT CERTIFIÉ A4 4K', 105, 268, { align: 'center' });

  // 2. SOMMAIRE / TABLE DES MATIÈRES
  doc.addPage();
  doc.setFillColor(255, 255, 255);

  // En-tête courant haut
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(structure.title.slice(0, 45), 20, 15);
  doc.text('Sommaire', 190, 15, { align: 'right' });
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(20, 18, 190, 18);

  // Titre du Sommaire
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text('Table des Matières', 105, 36, { align: 'center' });

  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.6);
  doc.line(85, 41, 125, 41);

  // Liste des chapitres
  let tocY = 56;
  structure.chapters.forEach((ch, idx) => {
    if (tocY > 265) {
      doc.addPage();
      tocY = 30;
    }
    const num = String(idx + 1).padStart(2, '0');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(99, 102, 241);
    doc.text(num, 22, tocY);

    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    const chTitle = stripMarkdownToPureText(ch.title).slice(0, 52);
    doc.text(chTitle, 34, tocY);

    // Ligne pointillée
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.line(140, tocY - 1, 178, tocY - 1);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`p. ${idx + 3}`, 190, tocY, { align: 'right' });

    tocY += 11;
  });

  // Pied de page sommaire
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('- Page 2 -', 105, 287, { align: 'center' });

  // 3. PAGES DES CHAPITRES
  let globalPageNumber = 3;

  structure.chapters.forEach((ch, chIdx) => {
    doc.addPage();

    // En-tête courant
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(structure.title.slice(0, 40), 20, 15);
    doc.text(stripMarkdownToPureText(ch.title).slice(0, 40), 190, 15, { align: 'right' });
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(20, 18, 190, 18);

    // Titre du chapitre
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(99, 102, 241);
    doc.text(`CHAPITRE ${chIdx + 1}`, 20, 30);

    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    const cleanTitle = stripMarkdownToPureText(ch.title);
    const titleSplits = doc.splitTextToSize(cleanTitle, 170);
    doc.text(titleSplits, 20, 39);

    let curY = 41 + titleSplits.length * 6;
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.6);
    doc.line(20, curY, 60, curY);
    curY += 9;

    // Découpage du contenu en paragraphes
    const rawContent = ch.content || 'Contenu en cours de rédaction...';
    const paragraphs = rawContent.split(/\n\n+/).filter((p) => p.trim().length > 0);

    paragraphs.forEach((p) => {
      const cleanP = stripMarkdownToPureText(p);
      if (!cleanP) return;

      doc.setFont('times', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);

      const lines = doc.splitTextToSize(cleanP, 170);
      const neededHeight = lines.length * 5.6 + 4;

      if (curY + neededHeight > 275) {
        // Pied de page avant saut
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(`- Page ${globalPageNumber} -`, 105, 287, { align: 'center' });
        globalPageNumber++;

        doc.addPage();
        // En-tête courant
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(structure.title.slice(0, 40), 20, 15);
        doc.text(stripMarkdownToPureText(ch.title).slice(0, 40), 190, 15, { align: 'right' });
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(20, 18, 190, 18);

        curY = 28;
      }

      doc.text(lines, 20, curY);
      curY += lines.length * 5.6 + 4;
    });

    // Pied de page fin de chapitre
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`- Page ${globalPageNumber} -`, 105, 287, { align: 'center' });
    globalPageNumber++;
  });

  return doc.output('blob');
}
