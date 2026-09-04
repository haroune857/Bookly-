import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // Initialize Groq client
  let groq: Groq | null = null;
  function getGroq() {
    if (!groq && GROQ_API_KEY) {
      groq = new Groq({ apiKey: GROQ_API_KEY });
    }
    return groq;
  }

  // Initialize Gemini if key exists
  let genAI: GoogleGenAI | null = null;
  function getGenAI() {
    if (!genAI && process.env.GEMINI_API_KEY) {
      genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return genAI;
  }

  // OpenRouter configuration
  const OPENROUTER_MODELS = [
    'anthropic/claude-3.5-sonnet',
    'deepseek/deepseek-chat',
    'meta-llama/llama-3.3-70b-instruct',
    'openai/gpt-4o-mini',
    'mistralai/mistral-large-2411',
    'google/gemini-2.0-flash-001'
  ];

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGroqKey: Boolean(GROQ_API_KEY),
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      hasOpenRouterKey: Boolean(process.env.OPENROUTER_API_KEY),
      groqModel: 'qwen/qwen3.8-27b',
      openRouterModels: OPENROUTER_MODELS,
      time: new Date().toISOString()
    });
  });

  // Helper to remove any <think> tags from model outputs
  function cleanAiOutput(text: string): string {
    if (!text) return '';
    return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  }

  // Active Groq candidate models list in priority order (high-capacity models first)
  const GROQ_CHAT_MODELS = [
    'openai/gpt-oss-120b',
    'groq/compound',
    'openai/gpt-oss-20b',
    'groq/compound-mini',
    'qwen/qwen3.8-27b',
    'qwen/qwen3.6-27b'
  ];

  // Helper to call Groq with automatic model fallback & token limit protection
  async function callGroqWithFallback(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: { jsonMode?: boolean; maxTokens?: number; temperature?: number } = {}
  ): Promise<{ text: string; modelUsed: string }> {
    const groqClient = getGroq();
    if (!groqClient) {
      throw new Error('Groq client non initialisé');
    }

    const defaultMaxTokens = options.jsonMode ? 3500 : 2500;
    const requestedMaxTokens = options.maxTokens ?? defaultMaxTokens;

    let lastError: any = null;
    for (const model of GROQ_CHAT_MODELS) {
      // Qwen models on Groq on-demand tier have strict 1000 OTPM limits; clamp to safe boundary
      const isQwen = model.includes('qwen');
      let effectiveMaxTokens = isQwen ? Math.min(requestedMaxTokens, 850) : requestedMaxTokens;

      try {
        const payload: any = {
          messages,
          model,
          temperature: options.temperature ?? 0.7,
          max_tokens: effectiveMaxTokens
        };
        if (options.jsonMode) {
          payload.response_format = { type: 'json_object' };
        }

        const completion = await groqClient.chat.completions.create(payload);
        const rawText = completion.choices[0]?.message?.content || '';
        const cleaned = options.jsonMode ? rawText : cleanAiOutput(rawText);
        if (cleaned) {
          return { text: cleaned, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);

        // If rate limit / OTPM error occurs, try once with reduced tokens if possible
        if ((errMsg.includes('OTPM') || errMsg.includes('reduce max_tokens') || errMsg.includes('rate_limit_exceeded')) && effectiveMaxTokens > 700) {
          try {
            const retryPayload: any = {
              messages,
              model,
              temperature: options.temperature ?? 0.7,
              max_tokens: 650
            };
            if (options.jsonMode) {
              retryPayload.response_format = { type: 'json_object' };
            }
            const completion = await groqClient.chat.completions.create(retryPayload);
            const rawText = completion.choices[0]?.message?.content || '';
            const cleaned = options.jsonMode ? rawText : cleanAiOutput(rawText);
            if (cleaned) {
              return { text: cleaned, modelUsed: `${model} (safe-otpm)` };
            }
          } catch (retryErr: any) {
            console.warn(`Groq retry with 650 tokens failed for ${model}:`, retryErr.message);
          }
        }

        console.warn(`Groq model ${model} failed, trying next candidate:`, errMsg);
      }
    }

    // If all Groq models encounter limits, fall back to Gemini automatically
    try {
      console.log('Groq models unavailable or rate-limited; trying automatic Gemini fallback...');
      const sysMsg = messages.find((m) => m.role === 'system')?.content || 'Assistant Bookly Studio';
      const userMsgs = messages.filter((m) => m.role !== 'system').map((m) => `${m.role}: ${m.content}`).join('\n\n');
      const geminiRes = await callGeminiWithFallback(sysMsg, userMsgs || 'Bonjour');
      if (geminiRes && geminiRes.text) {
        return { text: geminiRes.text, modelUsed: `gemini_fallback (${geminiRes.modelUsed})` };
      }
    } catch (gemFallbackErr: any) {
      console.warn('Gemini safety fallback failed:', gemFallbackErr.message);
    }

    throw lastError || new Error('All Groq models and fallbacks failed');
  }

  // Helper to call Gemini with updated supported models
  async function callGeminiWithFallback(
    systemPrompt: string,
    userPrompt: string
  ): Promise<{ text: string; modelUsed: string }> {
    const gemini = getGenAI();
    if (!gemini) {
      throw new Error('Gemini API key not configured');
    }

    const geminiModels = ['gemini-3.6-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastError: any = null;

    for (const model of geminiModels) {
      try {
        const response = await gemini.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }]
        });
        if (response.text) {
          return { text: response.text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini model ${model} failed:`, err.message);
      }
    }

    throw lastError || new Error('All Gemini models failed');
  }

  // Helper to call OpenRouter with model candidates and fallback
  async function callOpenRouterWithFallback(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: { model?: string; jsonMode?: boolean; maxTokens?: number; temperature?: number } = {}
  ): Promise<{ text: string; modelUsed: string }> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('Clé API OpenRouter non configurée dans les variables d\'environnement');
    }

    const candidateModels = options.model
      ? [options.model, ...OPENROUTER_MODELS.filter((m) => m !== options.model)]
      : OPENROUTER_MODELS;

    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const body: any = {
          model,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? (options.jsonMode ? 3500 : 2500)
        };
        if (options.jsonMode) {
          body.response_format = { type: 'json_object' };
        }

        const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey.trim()}`,
            'HTTP-Referer': process.env.APP_URL || 'https://bookly.studio',
            'X-Title': 'Bookly Studio AI',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        if (!resp.ok) {
          const errText = await resp.text();
          throw new Error(`OpenRouter API status ${resp.status}: ${errText}`);
        }

        const data = await resp.json();
        const rawText = data.choices?.[0]?.message?.content || '';
        const cleaned = options.jsonMode ? rawText : cleanAiOutput(rawText);
        if (cleaned) {
          return { text: cleaned, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`OpenRouter model ${model} error:`, err.message);
      }
    }

    throw lastError || new Error('All OpenRouter models failed');
  }

  // AI Chat & Brainstorming Conversation Route
  app.post('/api/ai/chat', async (req, res) => {
    const { messages, context, systemInstruction: customSysPrompt } = req.body;

    const defaultSystemInstruction = `Tu es le Conseiller Éditorial, Sparring Partner et Mentor en Création de Livres & E-books de Bookly Studio.
Ton rôle est d'aider le créateur ou l'auteur à RÉFLÉCHIR, débattre, clarifier, structurer ses idées et bâtir des ouvrages à fort impact et forte valeur perçue (notamment monétisables sur Chariow, Mobile Money, WhatsApp, Amazon KDP, formations en ligne).

Postures et principes clés :
1. **Écoute & Dialogue actif** : Accueille chaque idée avec enthousiasme. Rebondis avec perspicacité et franchise constructive.
2. **Clarification & Questionnement** : Aide l'auteur à trouver son angle unique, sa promesse centrale et son audience cible.
3. **Propositions concrètes** : Propose des titres magnétiques, des plans de chapitres détaillés, des structures narratives ou des exercices pratiques.
4. **Formatage soigné** : Rédige toujours en français avec un Markdown très lisible (titres ###, puces claires, gras sur les concepts clés, encadrés de conseils).
5. **Contexte Bookly** : Tu es parfaitement aligné avec l'écosystème de création d'infoproduits numériques et d'e-books.`;

    const systemPrompt = customSysPrompt || (context ? `${defaultSystemInstruction}\n\nContexte actuel du projet:\n${context}` : defaultSystemInstruction);

    try {
      if (GROQ_API_KEY) {
        const formattedMessages = [
          { role: 'system' as const, content: systemPrompt },
          ...(messages || []).map((m: any) => ({
            role: (m.role === 'assistant' || m.role === 'model' ? 'assistant' : 'user') as 'assistant' | 'user',
            content: m.content || ''
          }))
        ];

        const { text, modelUsed } = await callGroqWithFallback(formattedMessages, { maxTokens: 3000 });
        return res.json({
          success: true,
          text,
          source: 'groq',
          model: modelUsed
        });
      }

      // Gemini Fallback if Groq unavailable
      const lastMsg = messages && messages.length > 0 ? messages[messages.length - 1].content : '';
      const { text, modelUsed } = await callGeminiWithFallback(systemPrompt, lastMsg);
      return res.json({
        success: true,
        text,
        source: 'gemini',
        model: modelUsed
      });
    } catch (err: any) {
      console.error('AI chat error:', err);
      // Try Gemini fallback
      try {
        const lastMsg = messages && messages.length > 0 ? messages[messages.length - 1].content : '';
        const { text, modelUsed } = await callGeminiWithFallback(systemPrompt, lastMsg);
        return res.json({ success: true, text, source: 'gemini_fallback', model: modelUsed });
      } catch (gemErr) {
        console.error('Gemini fallback error:', gemErr);
      }

      return res.json({
        success: true,
        text: generateFallbackChat(messages),
        source: 'local_template_error_fallback',
        warning: err.message
      });
    }
  });

  // AI Content & Book Generation Route
  app.post('/api/ai/generate', async (req, res) => {
    const { prompt, type, tone, topic, audience, chaptersCount, customInstructions } = req.body;
    const cleanTopic = topic || prompt || 'Création de Contenu & Monétisation';

    let systemPrompt = "Tu es l'assistant IA d'élite de Bookly Studio, spécialisé dans la rédaction d'e-books captivants, de guides professionnels et d'infoproduits à fort impact.";
    let userPrompt = prompt || '';

    if (type === 'brainstorm') {
      systemPrompt = "Tu es un Directeur de Publication et Stratège en Infoproduits pour Bookly Studio.";
      userPrompt = `Génère 5 concepts d'e-books percutants et à fort potentiel commercial sur le thème : "${cleanTopic}".
Audience ciblée : "${audience || 'Entrepreneurs, créateurs et professionnels'}".
Tonalité : "${tone || 'Inspirant et pragmatique'}".
Instructions spécifiques : "${customInstructions || 'Rendre actionnable et adapté au marché moderne'}"

Pour chaque concept, donne :
1. Titre magnétique & accrocheur
2. Sous-titre explicite (promesse concrète)
3. Genre & Catégorie
4. Résumé en 2-3 phrases percutantes
5. Sommaire des 4 grands chapitres clés
6. Pourquoi ce livre va se vendre / son facteur de différenciation

Formate la réponse en Markdown impeccable avec émoticônes et structure lisible en français.`;
    } else if (type === 'outline') {
      systemPrompt = "Tu es un Architecte Littéraire et Concepteur de Sommaires pour Bookly Studio.";
      userPrompt = `Conçois un sommaire complet et détaillé pour l'ouvrage suivant :
Titre du livre : "${cleanTopic}"
Audience visée : "${audience || 'Grand public et passionnés'}"
Nombre de chapitres : ${chaptersCount || 5} chapitres
Tonalité : "${tone || 'Professionnel, captivant et clair'}"
Instructions particulières : "${customInstructions || 'Inclure des méthodes concrètes, études de cas et exercices'}"

Pour chaque chapitre (du Chapitre 1 au Chapitre ${chaptersCount || 5}) :
- Titre clair et engageant
- 3 sous-sections détaillées (1.1, 1.2, 1.3)
- L'objectif pédagogique / résultat pour le lecteur
- Un conseil clé de rédaction ou une idée d'exercice pratique

Réponds en français avec une structure Markdown soignée.`;
    } else if (type === 'chapter' || type === 'continue') {
      systemPrompt = "Tu es un Auteur Émérite et Rédacteur Professionnel (Ghostwriter) pour Bookly Studio.";
      userPrompt = `Rédige un contenu riche, captivant et structuré pour le chapitre suivant :
Titre du livre : "${cleanTopic}"
Sujet / Titre du chapitre : "${prompt || 'Chapitre de contenu'}"
Tonalité : "${tone || 'Professionnel, engageant, bienveillant et fluide'}"
Instructions : "${customInstructions || 'Fournir un texte complet (600 à 900 mots), prêt pour un manuscrit de haute qualité'}"

Le chapitre doit contenir :
- Une introduction percutante avec mise en situation ou citation inspirante
- 2 à 3 sections de développement approfondies avec sous-titres (####)
- Des exemples concrets et des conseils pratiques immédiatement applicables
- Un encadré "💡 Action Immédiate" ou "Exercice d'application"
- Une brève conclusion / transition vers la suite

Rédige directement le contenu du chapitre en Markdown français fluide.`;
    } else if (type === 'rewrite') {
      systemPrompt = "Tu es un Styliste Littéraire et Éditeur en Chef pour Bookly Studio.";
      userPrompt = `Améliore, enrichis et reformule le texte suivant pour lui donner un style captivant, élégant et professionnel, tout en préservant le sens initial :\n\n${prompt}\n\nTonalité souhaitée : ${tone || 'Élégant, percutant et fluide'}.`;
    } else if (type === 'expand') {
      systemPrompt = "Tu es un Rédacteur Créatif pour Bookly Studio.";
      userPrompt = `Développe et approfondis le passage suivant en y ajoutant des analogies parlantes, des exemples pratiques concrets, des détails pertinents et des explications pas-à-pas :\n\n${prompt}`;
    } else if (type === 'summarize') {
      systemPrompt = "Tu es un Éditeur Synthétique pour Bookly Studio.";
      userPrompt = `Fais une synthèse percutante en 4 ou 5 points essentiels du texte suivant, avec les enseignements clés pour le lecteur :\n\n${prompt}`;
    }

    try {
      if (GROQ_API_KEY) {
        const { text, modelUsed } = await callGroqWithFallback([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ], { maxTokens: 3500 });

        return res.json({
          success: true,
          text,
          source: 'groq',
          model: modelUsed
        });
      }

      // Gemini Fallback
      const { text, modelUsed } = await callGeminiWithFallback(systemPrompt, userPrompt);
      return res.json({ success: true, text, source: 'gemini', model: modelUsed });
    } catch (err: any) {
      console.error('AI Generation error:', err);
      return res.json({
        success: true,
        text: generateFallbackContent(type, topic, audience, prompt),
        source: 'local_template_error_fallback',
        warning: err.message
      });
    }
  });

  // Specialized Route: Generate Complete E-book with all structured chapters
  app.post('/api/ai/generate-book', async (req, res) => {
    const { title, subtitle, category, author, audience, tone, chaptersCount = 5, customInstructions } = req.body;
    const cleanTitle = title || 'Nouvel E-book';
    const targetCount = Math.max(2, Math.min(10, chaptersCount));

    const promptForOutline = `Tu es un Directeur Éditorial d'élite pour Bookly.
Crée la structure exacte et complète d'un livre intitulé "${cleanTitle}" (${subtitle ? `Sous-titre: ${subtitle}` : ''}).
Catégorie : ${category || 'Infoproduit & Business'}
Auteur : ${author || 'Auteur Bookly'}
Audience : ${audience || 'Créateurs et Professionnels'}
Ton : ${tone || 'Inspirant, pragmatique et structuré'}
Nombre de chapitres : exactement ${targetCount} chapitres.

Génère une réponse au format JSON strict avec la structure suivante :
{
  "chapters": [
    {
      "number": 1,
      "title": "Titre du chapitre 1",
      "content": "Contenu complet en Markdown rédigé pour ce chapitre (minimum 350 mots avec sous-titres ###, conseils pratiques, exemples, et conclusion)"
    }
  ]
}

Assure-toi que le JSON est 100% valide et sans texte avant ou après. Rédige un contenu riche, captivant et directement publiable en français pour chaque chapitre.`;

    try {
      if (GROQ_API_KEY) {
        const { text: rawJson, modelUsed } = await callGroqWithFallback([
          { role: 'system', content: 'Tu es un générateur de livres au format JSON strict.' },
          { role: 'user', content: promptForOutline }
        ], { jsonMode: true, maxTokens: 4500 });

        // Parse JSON safely even if wrapped in backticks
        const cleanJsonStr = rawJson.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(cleanJsonStr);

        if (parsed.chapters && Array.isArray(parsed.chapters) && parsed.chapters.length > 0) {
          const formattedChapters = parsed.chapters.map((ch: any, i: number) => {
            const content = cleanAiOutput(ch.content || `### ${ch.title || `Chapitre ${i + 1}`}\n\nContenu rédigé.`);
            const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
            return {
              id: `ch-ai-${Date.now()}-${i + 1}`,
              title: ch.title || `Chapitre ${i + 1}`,
              content: content,
              wordCount: wordCount,
              completed: i === 0
            };
          });

          return res.json({
            success: true,
            chapters: formattedChapters,
            source: 'groq_json',
            model: modelUsed
          });
        }
      }
    } catch (err: any) {
      console.warn('Full book json generation fell back to sequential generation:', err.message);
    }

    // Fallback structured generation
    const fallbackChapters = [];
    for (let i = 1; i <= targetCount; i++) {
      const chTitle = i === 1 
        ? 'Chapitre 1 : Les Fondations & La Clarté de Vision' 
        : i === 2 
        ? 'Chapitre 2 : La Méthode Fondamentale Pas-à-Pas'
        : i === 3
        ? 'Chapitre 3 : Automatisation & Outils Stratégiques'
        : i === 4
        ? 'Chapitre 4 : La Monétisation & Les Canaux de Vente'
        : `Chapitre ${i} : Passage à l'Échelle & Pérennisation`;

      const content = `### ${chTitle}

Dans le cadre de **${cleanTitle}**, ce chapitre pose les jalons essentiels pour transformer une démarche théorique en résultats tangibles.

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
        content: content,
        wordCount: content.trim().split(/\s+/).filter(Boolean).length,
        completed: i === 1
      });
    }

    return res.json({
      success: true,
      chapters: fallbackChapters,
      source: 'smart_fallback'
    });
  });

  // Dedicated Route: Propose or refine chapter outline (list of titles)
  app.post('/api/ai/outline', async (req, res) => {
    const { title, subtitle, category, audience, tone, chaptersCount = 5 } = req.body;
    const cleanTitle = title || 'Mon Nouveau Livre';
    const targetCount = Math.max(2, Math.min(12, Number(chaptersCount) || 5));

    const promptForOutline = `Tu es un Directeur Éditorial expert en best-sellers pour Bookly.
Propose un plan complet et captivant de ${targetCount} chapitres pour le livre suivant :
- Titre : "${cleanTitle}"
${subtitle ? `- Sous-titre : "${subtitle}"` : ''}
- Catégorie : "${category || 'Business & Infoproduit'}"
- Public cible : "${audience || 'Grand public & Créateurs'}"
- Tonalité : "${tone || 'Pratique, inspirant et percutant'}"

Génère une réponse au format JSON strict avec uniquement une liste d'objets :
{
  "outline": [
    {
      "number": 1,
      "title": "Chapitre 1 : Titre accrocheur et précis",
      "summary": "Brève description en 1 phrase de ce que le lecteur va apprendre"
    }
  ]
}

Assure-toi qu'il y ait exactement ${targetCount} chapitres, avec une progression logique, rythmée et stimulante.`;

    try {
      if (GROQ_API_KEY) {
        const { text: rawJson, modelUsed } = await callGroqWithFallback([
          { role: 'system', content: 'Tu es un générateur de plans éditoriaux en JSON strict.' },
          { role: 'user', content: promptForOutline }
        ], { jsonMode: true, maxTokens: 2000 });

        const cleanJsonStr = rawJson.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(cleanJsonStr);

        if (parsed.outline && Array.isArray(parsed.outline) && parsed.outline.length > 0) {
          return res.json({
            success: true,
            outline: parsed.outline,
            source: 'groq',
            model: modelUsed
          });
        }
      }
    } catch (err: any) {
      console.warn('Outline generation failed, generating smart defaults:', err.message);
    }

    // Default outline fallback
    const defaultOutline = [];
    for (let i = 1; i <= targetCount; i++) {
      defaultOutline.push({
        number: i,
        title: i === 1 
          ? `Chapitre 1 : Les Fondations & Pourquoi ${cleanTitle}` 
          : i === 2 
          ? `Chapitre 2 : La Méthode Fondamentale Pas-à-Pas` 
          : i === 3 
          ? `Chapitre 3 : Les Erreurs Fatales à Éviter Absolument` 
          : i === 4 
          ? `Chapitre 4 : Stratégies Avancées & Déploiement` 
          : `Chapitre ${i} : Plan d'Action & Pérennisation`,
        summary: `Développement pratique de l'étape ${i} pour le lecteur.`
      });
    }

    return res.json({
      success: true,
      outline: defaultOutline,
      source: 'default_template'
    });
  });

  // Dedicated Route: Generate content for a single chapter with its custom title
  app.post('/api/ai/chapter-draft', async (req, res) => {
    const {
      bookTitle,
      chapterTitle,
      chapterNumber,
      totalChapters,
      audience,
      tone,
      customInstructions
    } = req.body;

    const systemPrompt = `Tu es un Ghostwriter d'élite et Auteur Référent pour Bookly Studio. Tu rédiges en français impeccable, avec une structure claire, vivante et captivante.`;
    const userPrompt = `Rédige l'intégralité du contenu pour le chapitre suivant :

Livre : "${bookTitle || 'Guide Pratique'}"
Chapitre ${chapterNumber || 1}${totalChapters ? ` sur ${totalChapters}` : ''} : "${chapterTitle || 'Chapitre de contenu'}"
Public visé : "${audience || 'Professionnels et passionnés'}"
Tonalité : "${tone || 'Pratique, engageant et motivant'}"
${customInstructions ? `Consignes particulières : "${customInstructions}"` : ''}

Structure demandée pour le chapitre (environ 500 à 800 mots) :
1. Titre du chapitre en gras et sous-titre accrocheur.
2. Introduction immersive : Pourquoi ce sujet est crucial et quelle promesse il apporte au lecteur.
3. 2 à 3 sections détaillées avec des sous-titres Markdown (####) expliquant la méthode et des exemples concrets.
4. Un encadré "💡 Action Immédiate" avec un exercice pas-à-pas à faire tout de suite.
5. Une synthèse des points clés à retenir et une transition vers la suite.

Rédige directement le texte complet en Markdown français prêt à être publié dans un e-book professionnel.`;

    try {
      if (GROQ_API_KEY) {
        const { text, modelUsed } = await callGroqWithFallback([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ], { maxTokens: 3500 });

        return res.json({
          success: true,
          content: text,
          wordCount: text.trim().split(/\s+/).filter(Boolean).length,
          source: 'groq',
          model: modelUsed
        });
      }

      const { text, modelUsed } = await callGeminiWithFallback(systemPrompt, userPrompt);
      return res.json({
        success: true,
        content: text,
        wordCount: text.trim().split(/\s+/).filter(Boolean).length,
        source: 'gemini',
        model: modelUsed
      });
    } catch (err: any) {
      console.error('Chapter draft error:', err);
      const fallbackText = `### ${chapterTitle || `Chapitre ${chapterNumber || 1}`}\n\nDans cette partie de **${bookTitle}**, nous explorons les concepts essentiels indispensables pour réussir.\n\n#### 1. Les Piliers Clés\n- Comprendre les attentes de votre public cible.\n- Mettre en place un cadre clair et mesurable.\n- Passer à l'action sans attendre la perfection.\n\n#### 2. Méthode Pratique\nChaque étape compte. Prenez le temps de documenter vos progrès et d'adapter votre stratégie selon les retours concrets.\n\n> 💡 **Action Immédiate** : Définissez dès aujourd'hui l'objectif numéro 1 que vous souhaitez accomplir cette semaine.`;
      return res.json({
        success: true,
        content: fallbackText,
        wordCount: fallbackText.trim().split(/\s+/).filter(Boolean).length,
        source: 'fallback'
      });
    }
  });

  // Dedicated OpenRouter AI Endpoint
  app.post('/api/ai/openrouter', async (req, res) => {
    const { prompt, systemPrompt, model, jsonMode, temperature } = req.body;

    const sys = systemPrompt || 'Tu es un assistant IA de haute voltige pour Bookly Studio.';
    const messages = [
      { role: 'system' as const, content: sys },
      { role: 'user' as const, content: prompt || 'Bonjour' }
    ];

    try {
      if (process.env.OPENROUTER_API_KEY) {
        const { text, modelUsed } = await callOpenRouterWithFallback(messages, {
          model,
          jsonMode,
          temperature
        });

        return res.json({
          success: true,
          content: text,
          model: modelUsed,
          source: 'openrouter'
        });
      }

      // Fallback to Groq if OpenRouter key not configured yet
      if (GROQ_API_KEY) {
        const { text, modelUsed } = await callGroqWithFallback(messages, {
          jsonMode,
          temperature
        });

        return res.json({
          success: true,
          content: text,
          model: modelUsed,
          source: 'groq_fallback'
        });
      }

      // Fallback to Gemini
      const { text, modelUsed } = await callGeminiWithFallback(sys, prompt);
      return res.json({
        success: true,
        content: text,
        model: modelUsed,
        source: 'gemini_fallback'
      });
    } catch (err: any) {
      console.error('OpenRouter route error:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Erreur lors de l\'appel IA'
      });
    }
  });

  // Dedicated AI Cover Advisor & Creative Direction Endpoint
  app.post('/api/ai/cover-advisor', async (req, res) => {
    const { title, subtitle, category, author, audience } = req.body;

    const systemPrompt = `Tu es un Directeur Artistique et Designer Graphique Senior d'édition de livres chez Bookly Studio.
Tu recommandes une direction artistique de couverture percutante, élégante et vendeuse au format JSON strict.`;

    const userPrompt = `Analyse ce projet de livre et génère la direction artistique idéale pour sa couverture :
- Titre : "${title || 'Livre'}"
- Sous-titre actuel : "${subtitle || 'Aucun'}"
- Catégorie : "${category || 'Non-Fiction'}"
- Auteur : "${author || 'Auteur'}"
- Public cible : "${audience || 'Grand public'}"

Voici les identifiants de modèles graphiques vectoriels disponibles :
- "apple-silk-ribbon" (Ruban de soie Apple vaporeux)
- "apple-frosted-orb" (Sphère givrée Apple)
- "apple-topographic-contour" (Courbes de niveau topographiques)
- "apple-titanium-mesh" (Titane brossé minimaliste sombre)
- "tech-neural-matrix" (Réseau de neurones IA lumineux)
- "tech-quantum-circuit" (Circuit quantique et microprocesseur or)
- "tech-neon-code" (Code cyberpunk matrix néon)
- "tech-cyber-grid" (Grille hexagonale technologique)
- "nature-boreal-canopy" (Feuillage émeraude et forêt boréale)
- "nature-sahara-dunes" (Dunes minérales terracotta et coucher de soleil)
- "nature-ocean-abyss" (Abysses bleues bioluminescentes)
- "nature-zen-bamboo" (Bambou zen et galets d'équilibre)
- "biz-obsidian-gold" (Obsidienne & cadre géométrique or)
- "scifi-supernova-ring" (Supernova cosmique & anneaux violets)
- "lit-gallimard-border" (Bordure classique blanche Gallimard)

Génère un JSON strict sous la forme :
{
  "recommendedTemplateId": "un des identifiants ci-dessus",
  "paletteName": "Nom élégant de la palette (ex: Émeraude & Or Pur)",
  "accentColor": "Code hexadécimal couleur d'accent (ex: #38bdf8 ou #fbbf24)",
  "subtitleSuggestion": "Proposition d'un sous-titre accrocheur et magnétique pour la couverture",
  "tagline": "Bref badge ou sur-titre (ex: Guide Pratique & Méthode)",
  "visualMood": "Description poétique et percutante de l'ambiance visuelle en 1 à 2 phrases"
}`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt }
    ];

    try {
      // 1. Try OpenRouter first if key present
      if (process.env.OPENROUTER_API_KEY) {
        try {
          const { text, modelUsed } = await callOpenRouterWithFallback(messages, {
            model: 'anthropic/claude-3.5-sonnet',
            jsonMode: true,
            maxTokens: 1500
          });
          const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
          const parsed = JSON.parse(cleanJson);
          return res.json({
            success: true,
            advice: {
              ...parsed,
              source: 'openrouter',
              modelUsed
            }
          });
        } catch (openRouterErr: any) {
          console.warn('OpenRouter cover advice failed, falling back to Groq:', openRouterErr.message);
        }
      }

      // 2. Try Groq
      if (GROQ_API_KEY) {
        try {
          const { text, modelUsed } = await callGroqWithFallback(messages, {
            jsonMode: true,
            maxTokens: 1500
          });
          const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
          const parsed = JSON.parse(cleanJson);
          return res.json({
            success: true,
            advice: {
              ...parsed,
              source: 'groq',
              modelUsed
            }
          });
        } catch (groqErr: any) {
          console.warn('Groq cover advice failed, falling back to Gemini:', groqErr.message);
        }
      }

      // 3. Try Gemini
      const gemini = getGenAI();
      if (gemini) {
        const { text, modelUsed } = await callGeminiWithFallback(systemPrompt, userPrompt);
        const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(cleanJson);
        return res.json({
          success: true,
          advice: {
            ...parsed,
            source: 'gemini',
            modelUsed
          }
        });
      }
    } catch (err: any) {
      console.error('Cover advisor error:', err);
    }

    // 4. Deterministic smart fallback
    const cat = (category || '').toLowerCase();
    const fallbackTemplate = cat.includes('tech') || cat.includes('ia')
      ? 'tech-neural-matrix'
      : cat.includes('nature') || cat.includes('bio')
      ? 'nature-boreal-canopy'
      : cat.includes('biz') || cat.includes('finance')
      ? 'biz-obsidian-gold'
      : 'apple-silk-ribbon';

    return res.json({
      success: true,
      advice: {
        recommendedTemplateId: fallbackTemplate,
        paletteName: 'Édition Harmonie & Clarté',
        accentColor: '#818cf8',
        subtitleSuggestion: subtitle || 'La méthode complète pour transformer vos idées en livre best-seller',
        tagline: 'Édition de Référence Bookly',
        visualMood: 'Atmosphère moderne, typographie raffinée et équilibre chromatique premium.',
        source: 'creative_engine'
      }
    });
  });

  // Chariow API Integration Proxy
  app.post('/api/chariow/sync', async (req, res) => {
    const { apiKey, storeId } = req.body;

    if (!apiKey && !storeId) {
      return res.status(400).json({ error: 'Clé API ou Store ID manquant' });
    }

    try {
      const demoData = {
        store_id: storeId || 'store_bookly_demo',
        total_revenue: 1845000,
        currency: 'FCFA',
        total_commissions: 368000,
        conversion_rate: 6.4,
        total_orders: 142,
        total_downloads: 1420,
        active_affiliates: 18,
        recent_sales: [
          { id: 'ORD-8941', product: 'Le Guide Pratique du Copywriting', amount: 15000, currency: 'FCFA', customer: 'Amadou D.', date: 'Il y a 10 min', status: 'Payé' },
          { id: 'ORD-8940', product: 'Stratégies de Marketing Digital', amount: 25000, currency: 'FCFA', customer: 'Fatou K.', date: 'Il y a 32 min', status: 'Payé' },
          { id: 'ORD-8939', product: 'Vente de Produits Digitaux VIP', amount: 45000, currency: 'FCFA', customer: 'Koffi M.', date: 'Il y a 1h', status: 'Payé' },
          { id: 'ORD-8938', product: 'L\'Art de la Méditation', amount: 10000, currency: 'FCFA', customer: 'Clarisse B.', date: 'Il y a 3h', status: 'Payé' }
        ],
        traffic: [
          { source: 'Réseaux Sociaux (TikTok / Instagram)', percentage: 46, visitors: 2840 },
          { source: 'Trafic Direct & Newsletter', percentage: 28, visitors: 1720 },
          { source: 'Réseau d\'Affiliation Chariow', percentage: 18, visitors: 1108 },
          { source: 'Canaux WhatsApp & Groupes VIP', percentage: 8, visitors: 492 }
        ],
        chart_data_7d: [
          { date: '18 Fév', revenue: 140000, orders: 12 },
          { date: '19 Fév', revenue: 210000, orders: 18 },
          { date: '20 Fév', revenue: 125000, orders: 10 },
          { date: '21 Fév', revenue: 290000, orders: 24 },
          { date: '22 Fév', revenue: 380000, orders: 31 },
          { date: '23 Fév', revenue: 245000, orders: 20 },
          { date: '24 Fév', revenue: 455000, orders: 37 }
        ]
      };

      res.json({ success: true, data: demoData });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bookly Studio running on http://0.0.0.0:${PORT} with Groq Llama 3.3 70B`);
  });
}

function generateFallbackChat(messages: any[]): string {
  const lastMsg = (messages && messages.length > 0 ? messages[messages.length - 1].content : '').toLowerCase();

  if (lastMsg.includes('plan') || lastMsg.includes('sommaire') || lastMsg.includes('chapitre')) {
    return `### 📑 Sommaire Stratégique Proposé par l'IA

Voici une proposition de structure captivante en 5 chapitres pour votre ouvrage :

#### 🔹 Chapitre 1 : Le Déclic & Le Diagnostic
- Identifier le problème racine ignoré par 90% des personnes.
- Briser les croyances limitantes de votre thématique.
- Établir le bilan de départ pour mesurer le progrès.

#### 🔹 Chapitre 2 : La Méthode Centrale (Le Framework)
- Les 3 piliers indispensables pour structurer son approche.
- Études de cas concrètes et applications immédiates.
- Fiches de travail pour chaque concept.

#### 🔹 Chapitre 3 : Automatisation & Outils Essentiels
- L'écosystème numérique pour gagner du temps.
- Utiliser l'IA pour démultiplier votre production.
- Raccourcis et templates réutilisables.

#### 🔹 Chapitre 4 : La Mise en Vente & La Monétisation
- Créer une offre irrésistible et fixer le juste prix.
- Connecter les paiements instantanés (Mobile Money & Chariow).
- Déployer un réseau d'affiliés pour maximiser la portée.

#### 🔹 Chapitre 5 : Pérennisation & Clôture Inspirante
- Bâtir une communauté d'ambassadeurs.
- Passerelle vers vos prochaines masterclasses et formations.
- Mot de la fin et manifeste pour le lecteur.

Souhaitez-vous que nous ajustions un chapitre en particulier ou voulez-vous créer directement le projet dans Bookly ?`;
  }

  return `C'est une excellente perspective ! Pour transformer cette idée en un livre magnétique et rentable :

1. **La Promesse Unique :** Quelle est la transformation concrète qu'un lecteur obtiendra après avoir lu ce livre ?
2. **Le Public Cible :** S'agit-il de débutants, d'intermédiaires ou de professionnels cherchant une méthode avancée ?
3. **Le Style :** Préférez-vous un ton direct et percutant, ou un guide exhaustif pas-à-pas ?

Dites-moi comment vous visualisez ces éléments et nous pourrons immédiatement générer le sommaire complet !`;
}

function generateFallbackContent(type?: string, topic?: string, audience?: string, prompt?: string): string {
  const cleanTopic = topic || 'Création de Contenu & Monétisation';
  if (type === 'brainstorm') {
    return `### 💡 5 Idées de Livres Clés sur "${cleanTopic}"

1. **L'Empire Digital : De 0 à 1 000 000 FCFA avec des Infoproduits**
   - *Sous-titre :* Le guide étape par étape pour monétiser vos compétences sans stock ni logistique.
   - *Public :* Créateurs, freelances et étudiants ambitieux.
   - *Chapitres clés :* Trouver sa niche profitable • Créer un e-book irrésistible • Configurer sa boutique Chariow • Automatiser le trafic WhatsApp et TikTok.

2. **L'Algorithme de l'Attention : Captiver & Convertir**
   - *Sous-titre :* Psychologie du storytelling moderne et techniques de copywriting pour vendre.
   - *Public :* Marketeurs, rédacteurs et community managers.
   - *Chapitres clés :* Les 7 déclencheurs émotionnels • L'art de l'accroche • Transformer des abonnés en acheteurs • Tunnels de vente haute conversion.

3. **Productivité Profonde & IA : Écrire 10x Plus Vite**
   - *Sous-titre :* Utiliser l'intelligence artificielle générative pour rédiger des livres de référence.
   - *Public :* Auteurs, formateurs et entrepreneurs pressés.
   - *Chapitres clés :* Structuration par prompts • Co-écriture assistée • Relecture & personnalisation • Publication multi-plateformes.

4. **L'Art de l'Affiliation Automatisée**
   - *Sous-titre :* Générer des commissions passives en recommandant les meilleurs programmes et outils.
   - *Public :* Débutants et affiliés cherchant à scaler.
   - *Chapitres clés :* Sélectionner des offres à forte marge • Construire une liste e-mail fidèle • Campagnes WhatsApp virales • Analyse du ROI.

5. **Clarté & Sérénité : Le Manuel du Créateur Résilient**
   - *Sous-titre :* Surmonter le syndrome de la page blanche et bâtir une routine créative inébranlable.
   - *Public :* Écrivains indépendants et créatifs.
   - *Chapitres clés :* Rituels matinaux d'écriture • Gérer la charge mentale • Terminer son premier manuscrit • Célébrer chaque étape.`;
  }

  if (type === 'outline') {
    return `## 📑 Plan Détaillé du Livre : "${cleanTopic}"
*Audience ciblée : ${audience || 'Professionnels & Créateurs'}*

### Chapitre 1 : Les Fondations & La Clarté de Vision
- **1.1** Définir la promesse unique de votre ouvrage.
- **1.2** Comprendre en profondeur les douleurs et désirs de vos lecteurs.
- **1.3** Installer votre environnement d'écriture et éliminer le bruit.
*Conseil d'écriture :* Commencez par une anecdote personnelle forte pour créer un lien immédiat.

### Chapitre 2 : La Méthode Pas-à-Pas
- **2.1** Décomposer le problème central en 3 piliers simples.
- **2.2** Les erreurs courantes à éviter absolument.
- **2.3** Les raccourcis éprouvés et études de cas réels.
*Conseil d'écriture :* Utilisez des listes à puces et des schémas mentaux pour faciliter la rétention.

### Chapitre 3 : Automatisation & Outils Intelligents
- **3.1** Déployer les bons outils numériques pour gagner du temps.
- **3.2** Utiliser l'IA comme co-pilote d'idéation sans perdre votre style.
- **3.3** Organiser vos notes et références sans friction.
*Conseil d'écriture :* Donnez des exemples pratiques et des templates prêts à l'emploi.

### Chapitre 4 : La Mise sur le Marché & La Vente
- **4.1** Créer une couverture percutante qui attire le regard.
- **4.2** Fixer le juste prix et intégrer une passerelle Chariow.
- **4.3** Mobiliser votre réseau d'affiliés pour démultiplier les ventes.
*Conseil d'écriture :* Insérez des appels à l'action clairs à la fin de chaque section.

### Chapitre 5 : Pérennisation & Expansion
- **5.1** Bâtir une communauté d'ambassadeurs autour de vos livres.
- **5.2** Décliner le livre en ateliers, formations et masterclasses.
- **5.3** Conclusion inspirante : Votre prochain chapitre commence maintenant.`;
  }

  return `### ${cleanTopic} : ${prompt || 'Chapitre d\'introduction'}

La création de contenu moderne ne dépend plus uniquement du temps passé devant une page blanche, mais de la clarté de votre intention et de la puissance des outils que vous maîtrisez. Dans ce chapitre, nous explorons comment transformer une simple idée brute en un ouvrage structuré et captivant.

#### 1. Pourquoi la structure bat toujours l'inspiration
L'inspiration est une étincelle imprévisible ; la structure est le moteur qui fait avancer le projet jusqu'à son terme. Lorsque vous définissez précisément le résultat attendu par votre lecteur dès les premières pages, chaque paragraphe devient une brique indispensable.

> *"Un livre réussi n'est pas celui qui dit tout, mais celui qui résout avec brio un problème précis pour une personne précise."*

#### 2. Les 3 leviers de l'impact immédiat
- **L'Accroche Émotionnelle :** Parlez directement au défi quotidien rencontré par votre audience.
- **La Démonstration Pratique :** Évitez la théorie abstraite ; partagez une méthode applicable dans les 24 heures.
- **La Validation Progressive :** Guidez le lecteur avec des mini-victoires à chaque fin de section.

#### 3. Passer à l'action
Prenez 15 minutes aujourd'hui pour noter les 3 grandes transformations que votre lecteur vivra après avoir terminé cet ouvrage. C'est votre boussole éditoriale pour la suite.`;
}

startServer();
