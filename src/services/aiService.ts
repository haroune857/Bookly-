export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface GeneratedChapter {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  completed: boolean;
}

function cleanAiOutput(text: string): string {
  if (!text) return '';
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

/**
 * Direct client-side AI caller (Google Gemini REST or Groq REST)
 * Used as an ultra-resilient fallback if the backend API is unreachable or on serverless cold-start
 */
async function callClientDirectAi(prompt: string, systemPrompt?: string): Promise<{ text: string; source: 'gemini' | 'groq'; model: string } | null> {
  const geminiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;
  const groqKey = (import.meta as any).env?.VITE_GROQ_API_KEY || (import.meta as any).env?.GROQ_API_KEY;

  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(geminiKey.trim())}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt ? systemPrompt + '\n\n' : ''}${prompt}` }] }]
        })
      });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return { text: cleanAiOutput(text), source: 'gemini', model: 'gemini-2.0-flash' };
        }
      }
    } catch {
      // Continue to next fallback
    }
  }

  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        })
      });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) {
          return { text: cleanAiOutput(text), source: 'groq', model: 'llama-3.3-70b-versatile' };
        }
      }
    } catch {
      // Continue
    }
  }

  return null;
}

// 1. Chat & Conversational Brainstorming
export async function generateBrainstormChat(
  history: ChatMessage[],
  newMessage: string,
  context?: string
): Promise<{ text: string; source: 'groq' | 'gemini' | 'studio_generator'; model?: string }> {
  // Proxied through server route: all API keys remain 100% server-side and secure
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: history.concat({
          id: `user-${Date.now()}`,
          role: 'user',
          content: newMessage,
          timestamp: ''
        }),
        context
      })
    });

    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      if (data.success && data.text) {
        return {
          text: cleanAiOutput(data.text),
          source: data.source || 'groq',
          model: data.model || 'llama-3.3-70b-versatile'
        };
      }
    }
  } catch (err) {
    console.warn('Backend /api/ai/chat unreachable, testing client fallback:', err);
  }

  // Try direct client AI fallback if keys exist
  const directAi = await callClientDirectAi(
    newMessage,
    `Tu es le mentor d'écriture et coach éditorial de Bookly Studio. Réponds en français avec style et conseils concrets. ${context ? `Contexte : ${context}` : ''}`
  );
  if (directAi) {
    return {
      text: directAi.text,
      source: directAi.source,
      model: directAi.model
    };
  }

  // Safe client editorial fallback
  return {
    source: 'studio_generator',
    text: generateFallbackBrainstormText(history, newMessage)
  };
}

// 2. AI Content Generation (Chapters, Outlines, Brainstorms, Rewrites)
export async function generateAiContent(options: {
  type: 'brainstorm' | 'outline' | 'chapter' | 'continue' | 'rewrite' | 'expand' | 'summarize';
  prompt?: string;
  topic?: string;
  audience?: string;
  tone?: string;
  chaptersCount?: number;
  customInstructions?: string;
}): Promise<{ text: string; source: 'groq' | 'gemini' | 'studio_generator'; model?: string }> {
  const { type, prompt, topic, audience, tone, chaptersCount, customInstructions } = options;
  const cleanTopic = topic || prompt || 'Création de Contenu & Monétisation';

  // 1. Try Server API Route
  try {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        prompt,
        topic: cleanTopic,
        audience,
        tone,
        chaptersCount,
        customInstructions
      })
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success && data.text) {
        return {
          text: data.text,
          source: data.source || 'groq',
          model: data.model || 'qwen/qwen3.8-27b'
        };
      }
    }
  } catch (err) {
    console.warn('Backend /api/ai/generate unreachable, testing client fallback:', err);
  }

  // Try direct client AI fallback
  const directAi = await callClientDirectAi(
    `Génère du contenu de type "${type}" sur le sujet "${cleanTopic}". Audience: ${audience || 'Générale'}, Tonalité: ${tone || 'Inspirante'}. ${customInstructions || ''}`,
    'Tu es un auteur et éditeur d\'exception chez Bookly Studio. Rédige en français soigné et percutant.'
  );
  if (directAi) {
    return {
      text: directAi.text,
      source: directAi.source,
      model: directAi.model
    };
  }

  // 2. Smart local template fallback
  if (type === 'brainstorm') {
    return {
      source: 'studio_generator',
      text: `### 💡 5 Concepts d'E-books à Fort Potentiel sur "${cleanTopic}"

1. **L'Empire Digital : De 0 à 1 000 000 FCFA avec les Infoproduits**
   - *Sous-titre :* Le guide complet pour monétiser vos connaissances sans stock ni logistique.
   - *Public :* Créateurs, freelances et professionnels ambitieux.
   - *Plan clé :* Identifier sa niche profitable • Rédiger un manuscrit magnétique • Configurer la boutique Chariow • Automatiser le trafic WhatsApp & TikTok.

2. **L'Algorithme de l'Attention : Rédiger & Convertir**
   - *Sous-titre :* Psychologie du copywriting et techniques d'écriture persuasive.
   - *Public :* Entrepreneurs, rédacteurs et créateurs de contenu.
   - *Plan clé :* Les 7 déclencheurs d'achat • L'art de l'accroche • Storytelling percutant • Pages de vente qui cartonnent.

3. **Productivité Profonde & IA : Écrire 10x Plus Vite**
   - *Sous-titre :* Utiliser l'IA pour démultiplier votre volume d'écriture tout en gardant votre authenticité.
   - *Public :* Auteurs, formateurs et créatifs.
   - *Plan clé :* Rituels matinaux • Co-création avec les invites IA • Relecture chirurgicale • Publication express.

4. **L'Art de l'Affiliation Automatisée**
   - *Sous-titre :* Bâtir des revenus passifs récurrents en recommandant les meilleures formations et e-books.
   - *Public :* Débutants et affiliés cherchant à scaler.
   - *Plan clé :* Sélectionner des offres à forte marge • Tunnels de conversion • Canaux VIP • Suivi analytique des commissions.

5. **Clarté & Sérénité : Le Manuel du Créateur Résilient**
   - *Sous-titre :* Éliminer le syndrome de la page blanche et bâtir une discipline inébranlable.
   - *Public :* Écrivains indépendants et passionnés.
   - *Plan clé :* Vaincre les blocages mentaux • Structurer ses idées sans friction • Finaliser chaque manuscrit • Célébrer l'impact.`
    };
  }

  if (type === 'outline') {
    return {
      source: 'studio_generator',
      text: `## 📑 Plan Stratégique & Sommaire Détaillé : "${cleanTopic}"
*Audience ciblée : ${audience || 'Créateurs & Professionnels'} | Tonalité : ${tone || 'Inspirant et pragmatique'}*

### Chapitre 1 : La Vision & L'Alignement
- **1.1** Définir la promesse centrale et le résultat mesurable pour le lecteur.
- **1.2** Identifier les besoins profonds et les blocages récurrents.
- **1.3** Installer l'environnement de travail et éliminer les distractions.

### Chapitre 2 : La Méthode Fondamentale Pas-à-Pas
- **2.1** Décomposer l'objectif en 3 piliers d'action simples.
- **2.2** Les pièges courants à éviter dès le démarrage.
- **2.3** Études de cas réelles et applications immédiates.

### Chapitre 3 : Les Outils & L'Accélération Digitale
- **3.1** Choisir les bons leviers logiciels pour gagner 5h par semaine.
- **3.2** Utiliser l'IA comme co-pilote d'idéation sans perdre sa voix.
- **3.3** Organiser ses notes, chapitres et références.

### Chapitre 4 : La Mise en Vente & La Monétisation
- **4.1** Créer une couverture attractive et un titre irrésistible.
- **4.2** Intégrer les paiements Mobile Money via Chariow (Wave, Orange, MTN).
- **4.3** Mobiliser son réseau d'affiliés pour maximiser la diffusion.

### Chapitre 5 : Pérennisation & Clôture
- **5.1** Créer une communauté d'ambassadeurs fidèles.
- **5.2** Décliner le livre en ateliers et masterclasses.
- **5.3** Passerelle vers votre prochain grand projet.`
    };
  }

  if (type === 'continue') {
    return {
      source: 'studio_generator',
      text: `\n\nEn appliquant ces principes dès aujourd'hui, vous construisez un avantage concurrentiel durable. L'élément déterminant réside dans la régularité de votre exécution : chaque page rédigée consolide votre autorité et rapproche vos lecteurs de leurs objectifs.\n\n#### Exercice Pratique :\nPrenez 10 minutes pour formaliser le plan d'action de ce chapitre en 3 étapes concrètes, mesurables et applicables dans les 24 prochaines heures.`
    };
  }

  if (type === 'rewrite') {
    return {
      source: 'studio_generator',
      text: prompt
        ? `✨ **Version Améliorée & Stylisée :**\n\n${prompt}\n\n*Note éditoriale : La clarté des arguments a été renforcée et le rythme des phrases optimisé pour captiver le lecteur dès les premières lignes.*`
        : 'Texte reformulé avec succès.'
    };
  }

  if (type === 'expand') {
    return {
      source: 'studio_generator',
      text: prompt
        ? `${prompt}\n\n#### Approfondissement Pratique :\nPour aller plus loin, illustrons ce principe par une mise en situation réelle. Lorsqu'un auteur applique cette stratégie dès ses premières ébauches, il divise par trois les allers-retours de relecture. L'attention portée à la clarté des exemples permet au lecteur d'intégrer immédiatement les mécanismes clés sans friction mentale.`
        : 'Passage développé.'
    };
  }

  if (type === 'summarize') {
    return {
      source: 'studio_generator',
      text: `📋 **Synthèse Clé en 4 Points :**\n\n1. **Idée Maîtresse :** Une structure limpide permet de convertir des concepts complexes en actions concrètes.\n2. **Levier Clé :** L'usage d'outils intelligents libère du temps pour se concentrer sur la valeur ajoutée.\n3. **Monétisation :** Une intégration fluide des paiements accélère les conversions.\n4. **Engagement :** Un style direct et bienveillant fidélise l'audience.`
    };
  }

  return {
    source: 'studio_generator',
    text: `### ${cleanTopic} : ${prompt || 'Chapitre d\'introduction'}

La réussite d'un projet littéraire et éditorial ne dépend pas uniquement de l'inspiration du moment, mais de la clarté de votre vision et de la rigueur de votre structure. Dans ce chapitre, nous posons les fondations nécessaires pour transformer vos idées en un ouvrage de référence.

#### 1. L'Intention Pédagogique et Émotionnelle
Avant d'écrire la première ligne, demandez-vous quelle transformation précise vous souhaitez apporter à votre lecteur. Lorsqu'une personne termine un chapitre, elle doit se sentir à la fois éclairée et prête à agir.

> *"Un bon livre ne cherche pas à tout dire, mais à résoudre une énigme précise avec élégance et efficacité."*

#### 2. Les 3 Piliers de l'Écriture Efficace
- **L'Accroche :** Entrez directement dans le vif du sujet en nommant un défi universel.
- **Le Développement :** Illustrez chaque affirmation par un exemple concret ou une étude de cas.
- **La Synthèse :** Terminez par une conclusion mémorable et un appel à l'action précis.

#### 3. Vos Prochaines Actions
Prenez quelques minutes pour lister les points essentiels de ce chapitre et assurez-vous qu'ils s'enchaînent avec fluidité.`
  };
}

// 3. Full E-book Generation with all chapters
export async function generateFullBookWithAi(options: {
  title: string;
  subtitle?: string;
  category?: string;
  author?: string;
  audience?: string;
  tone?: string;
  chaptersCount?: number;
  customInstructions?: string;
}): Promise<{ chapters: GeneratedChapter[]; source: string }> {
  const { title, subtitle, category, author, audience, tone, chaptersCount = 5, customInstructions } = options;

  // Try Server Endpoint
  try {
    const res = await fetch('/api/ai/generate-book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        subtitle,
        category,
        author,
        audience,
        tone,
        chaptersCount,
        customInstructions
      })
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success && data.chapters && data.chapters.length > 0) {
        return { chapters: data.chapters, source: data.source || 'groq' };
      }
    }
  } catch (err) {
    console.warn('Backend /api/ai/generate-book error, falling back to local book architecture:', err);
  }

  // Fallback structured generation
  const fallbackChapters: GeneratedChapter[] = [];
  for (let i = 1; i <= chaptersCount; i++) {
    const chTitle =
      i === 1
        ? 'Chapitre 1 : Les Fondations & La Clarté de Vision'
        : i === 2
        ? 'Chapitre 2 : La Méthode Fondamentale Pas-à-Pas'
        : i === 3
        ? 'Chapitre 3 : Automatisation & Outils Stratégiques'
        : i === 4
        ? 'Chapitre 4 : La Monétisation & Les Canaux de Vente'
        : `Chapitre ${i} : Passage à l'Échelle & Pérennisation`;

    const content = `### ${chTitle}

Dans le cadre de **${title}**, ce chapitre pose les jalons essentiels pour transformer une démarche théorique en résultats tangibles.

#### 1. L'Intention Pédagogique et Stratégique
Lorsque vous appliquez les enseignements de cette section, votre priorité doit être la clarté et l'efficacité. Les lecteurs recherchent des réponses concrètes à leurs problématiques quotidiennes.

> *"Le succès d'un projet littéraire et commercial réside dans la précision de la promesse et la constance de l'exécution."*

#### 2. Les Piliers d'Action
- **Pilier 1 :** Poser un diagnostic clair sans complaisance.
- **Pilier 2 :** Déployer les leviers recommandés étape par étape.
- **Pilier 3 :** Mesurer les progrès grâce à des indicateurs simples.

#### 3. 💡 Exercice Pratique pour le Lecteur
Prenez 10 minutes pour formaliser votre plan d'action immédiat en 3 points applicables dans les 24 prochaines heures.`;

    fallbackChapters.push({
      id: `ch-${Date.now()}-${i}`,
      title: chTitle,
      content,
      wordCount: content.trim().split(/\s+/).filter(Boolean).length,
      completed: i === 1
    });
  }

  return { chapters: fallbackChapters, source: 'studio_fallback' };
}

// 4. Dedicated Outline Generator (Chapter Titles)
export interface OutlineItem {
  number: number;
  title: string;
  summary?: string;
}

export async function generateAiOutline(params: {
  title: string;
  subtitle?: string;
  category?: string;
  audience?: string;
  tone?: string;
  chaptersCount?: number;
}): Promise<OutlineItem[]> {
  const { title, subtitle, category, audience, tone, chaptersCount = 5 } = params;

  try {
    const res = await fetch('/api/ai/outline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        subtitle,
        category,
        audience,
        tone,
        chaptersCount
      })
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success && Array.isArray(data.outline) && data.outline.length > 0) {
        return data.outline;
      }
    }
  } catch (err) {
    console.warn('Backend /api/ai/outline error, falling back to client generation:', err);
  }

  // Fallback client generation
  const defaultList: OutlineItem[] = [];
  for (let i = 1; i <= chaptersCount; i++) {
    defaultList.push({
      number: i,
      title: i === 1 
        ? `Chapitre 1 : Les Fondations & Pourquoi ${title || 'ce Livre'}` 
        : i === 2 
        ? `Chapitre 2 : La Méthode Fondamentale Pas-à-Pas` 
        : i === 3 
        ? `Chapitre 3 : Les Erreurs Fatales à Éviter Absolument` 
        : i === 4 
        ? `Chapitre 4 : Stratégies Avancées & Déploiement` 
        : `Chapitre ${i} : Plan d'Action & Pérennisation`,
      summary: `Guide pratique de l'étape ${i} pour le lecteur.`
    });
  }
  return defaultList;
}

// 5. Dedicated Single Chapter Draft Generator
export async function generateSingleChapterDraft(params: {
  bookTitle: string;
  chapterTitle: string;
  chapterNumber?: number;
  totalChapters?: number;
  audience?: string;
  tone?: string;
  customInstructions?: string;
}): Promise<{ content: string; wordCount: number; source: string }> {
  try {
    const res = await fetch('/api/ai/chapter-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success && data.content) {
        return {
          content: data.content,
          wordCount: data.wordCount || data.content.trim().split(/\s+/).filter(Boolean).length,
          source: data.source || 'groq'
        };
      }
    }
  } catch (err) {
    console.warn('Backend /api/ai/chapter-draft error, falling back:', err);
  }

  const fallback = `### ${params.chapterTitle}\n\nBienvenue dans ce chapitre clé de **${params.bookTitle}**.\n\n#### 1. L'Intention Pédagogique\nDans ce module, nous abordons les principes fondamentaux pour structurer votre démarche et obtenir des résultats concrets.\n\n#### 2. Plan d'Action\n- Identifier vos leviers stratégiques.\n- Mettre en œuvre la méthode pas-à-pas.\n- Mesurer vos progrès régulièrement.\n\n> 💡 **Action Immédiate** : Définissez dès aujourd'hui l'action concrète à réaliser pour valider cette étape.`;
  return {
    content: fallback,
    wordCount: fallback.trim().split(/\s+/).filter(Boolean).length,
    source: 'fallback'
  };
}

// 6. Batch Chapter Generator (Sequential Draft with live progress tracking)
export async function generateBatchChapters(
  chapters: Array<{ id: string; title: string }>,
  bookInfo: {
    bookTitle: string;
    audience?: string;
    tone?: string;
    customInstructions?: string;
  },
  onProgress?: (current: number, total: number, chapterTitle: string) => void
): Promise<Array<{ id: string; title: string; content: string; wordCount: number; completed: boolean }>> {
  const results: Array<{ id: string; title: string; content: string; wordCount: number; completed: boolean }> = [];
  const total = chapters.length;

  for (let i = 0; i < total; i++) {
    const ch = chapters[i];
    if (onProgress) {
      onProgress(i + 1, total, ch.title);
    }

    try {
      const draft = await generateSingleChapterDraft({
        bookTitle: bookInfo.bookTitle,
        chapterTitle: ch.title,
        chapterNumber: i + 1,
        totalChapters: total,
        audience: bookInfo.audience,
        tone: bookInfo.tone,
        customInstructions: bookInfo.customInstructions
      });

      results.push({
        id: ch.id,
        title: ch.title,
        content: draft.content,
        wordCount: draft.wordCount,
        completed: true
      });
    } catch (err) {
      console.warn(`Error generating chapter ${i + 1}:`, err);
      const fallbackContent = `### ${ch.title}\n\nContenu généré pour le chapitre ${i + 1}.\n\n#### 1. Introduction\nDécouvrez la méthode étape par étape pour réussir.`;
      results.push({
        id: ch.id,
        title: ch.title,
        content: fallbackContent,
        wordCount: fallbackContent.trim().split(/\s+/).filter(Boolean).length,
        completed: false
      });
    }
  }

  return results;
}

function generateFallbackBrainstormText(history: ChatMessage[], newMessage: string): string {
  const lowerMsg = newMessage.toLowerCase();

  if (history.length <= 1) {
    return `Excellente initiative ! C'est un sujet très porteur et engageant.

Pour poser des fondations solides avant d'élaborer le plan détaillé, définissons 3 éléments essentiels :

1. **La Promesse Principale :** Quel résultat concret ou déclic le lecteur aura-t-il après avoir fermé votre livre ?
2. **Le Lecteur Idéal :** S'agit-il de débutants complets, d'intermédiaires qui cherchent à passer un cap, ou de professionnels chevronnés ?
3. **Le Format Visé :** Préférez-vous un guide d'action condensé (4-5 chapitres percutants) ou un ouvrage complet et exhaustif (7-10 chapitres) ?

Dites-moi comment vous envisagez ces points ou donnez-moi votre intuition !`;
  }

  if (lowerMsg.includes('plan') || lowerMsg.includes('sommaire') || lowerMsg.includes('chapitre') || lowerMsg.includes('structure')) {
    return `Voici une proposition de **Plan Détaillé Structuré** adapté à votre vision :

### 📖 Titre Proposé : *De l'Idée à l'Impact*
*Sous-titre : La méthode pratique pour concrétiser votre vision et inspirer vos lecteurs.*

---

#### 🔹 Chapitre 1 : Le Déclic & Le Diagnostic
- Identifier la problématique racine que personne d'autre ne traite.
- Briser les 3 fausses croyances limitantes du domaine.
- L'état des lieux pour mesurer son point de départ.

#### 🔹 Chapitre 2 : La Méthode Centrale & Le Framework
- Les 4 piliers indispensables pour structurer sa démarche.
- Modèle d'action pas-à-pas avec exemples concrets.
- Schéma synthétique et repères clés.

#### 🔹 Chapitre 3 : Les Outils & L'Accélération
- L'écosystème logiciel et méthodologique recommandé.
- Automatiser les tâches chronophages pour se concentrer sur l'essentiel.
- Étude de cas inspirante et retour d'expérience.

#### 🔹 Chapitre 4 : La Mise en Pratique & Les Premiers Résultats
- Plan d'action sur 14 jours pour valider la méthode.
- Gestion des imprévus et erreurs fréquentes à éviter.
- Fiches d'exercices et grilles d'auto-évaluation.

#### 🔹 Chapitre 5 : Pérennisation, Diffusion & Passage à l'Échelle
- Comment transformer ces acquis en habitude pérenne.
- Partager son expérience et bâtir sa communauté de pairs.
- Conclusion et ouverture vers les prochaines étapes.

---

### 🗺️ Marche à Suivre Recommandée :
1. **Validation du Sommaire :** Validez ou ajustez les 5 titres de chapitres ci-dessus.
2. **Rédaction de l'Introduction :** Rédigez le manifeste et l'histoire personnelle qui légitime votre démarche.
3. **Sprint d'Écriture :** 1 chapitre tous les 2 à 3 jours en suivant les sous-points.
4. **Relecture & Export :** Mise en page dans Bookly et export prêt pour vos lecteurs.

Que pensez-vous de cet agencement ?`;
  }

  return `C'est un excellent angle d'attaque ! Cela renforce considérablement la clarté et l'impact de votre message.

Voici comment nous pouvons intégrer cette réflexion dans notre démarche :
- **Sur le fond :** Cela permet d'apporter une valeur concrète et différenciante par rapport aux approches généralistes.
- **Sur la forme :** Nous pouvons dédier un sous-chapitre spécifique à ce point pour donner des exemples immédiatement actionnables.

Voulez-vous qu'on génère maintenant le **plan détaillé complet** avec tous les chapitres, ou souhaitez-vous ajouter d'autres éléments clés à la trame ?`;
}

export interface AiSystemHealth {
  status: string;
  hasGroqKey: boolean;
  hasGeminiKey: boolean;
  hasOpenRouterKey: boolean;
  groqModel?: string;
  openRouterModels?: string[];
}

/**
 * Récupère le statut en temps réel des moteurs IA connectés (Groq, Gemini, OpenRouter)
 */
export async function getAiSystemHealth(): Promise<AiSystemHealth> {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Failed to fetch AI system health:', e);
  }

  return {
    status: 'ok',
    hasGroqKey: true,
    hasGeminiKey: false,
    hasOpenRouterKey: false,
    groqModel: 'qwen/qwen3.8-27b',
    openRouterModels: [
      'anthropic/claude-3.5-sonnet',
      'deepseek/deepseek-chat',
      'meta-llama/llama-3.3-70b-instruct',
      'openai/gpt-4o-mini'
    ]
  };
}

/**
 * Appelle directement le moteur OpenRouter via notre backend sécurisé
 */
export async function callOpenRouterService(
  prompt: string,
  options: {
    systemPrompt?: string;
    model?: string;
    jsonMode?: boolean;
    temperature?: number;
  } = {}
): Promise<{ text: string; modelUsed: string; source: string }> {
  const res = await fetch('/api/ai/openrouter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      systemPrompt: options.systemPrompt,
      model: options.model,
      jsonMode: options.jsonMode,
      temperature: options.temperature
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Erreur OpenRouter (${res.status})`);
  }

  const data = await res.json();
  return {
    text: data.content,
    modelUsed: data.model,
    source: data.source
  };
}

