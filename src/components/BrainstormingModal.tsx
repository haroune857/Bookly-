import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Copy,
  Plus,
  RefreshCw,
  Lightbulb,
  Check,
  BookOpen
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';
import { BooklyThinkingLogo } from './BooklyThinkingLogo';
import { ChatMessage, generateBrainstormChat } from '../services/aiService';

interface BrainstormingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProjectFromIdea: (idea: {
    title: string;
    category: string;
    description: string;
    chapters?: Array<{ title: string; content?: string }>;
  }) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const BrainstormingModal: React.FC<BrainstormingModalProps> = ({
  isOpen,
  onClose,
  onCreateProjectFromIdea,
  onShowToast
}) => {
  if (!isOpen) return null;

  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `👋 **Bonjour ! Je suis votre partenaire de brainstorming Bookly.**

Je suis là pour vous aider à **réfléchir**, clarifier vos idées, explorer différents angles et poser les fondations de votre prochain livre ou e-book.

Que vous ayez une simple intuition, un sujet précis, ou le besoin de débloquer une structure :
- 💡 **Quelle est l'idée ou le thème** qui vous trotte dans la tête ?
- 🎯 **Quel problème ou quelle transformation** souhaitez-vous apporter à vos lecteurs ?

Racontez-moi en toute liberté, même en quelques mots informels !`,
      timestamp: 'À l\'instant'
    }
  ]);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Focus input on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Suggested Starter Prompts
  const starterPrompts = [
    '💡 J\'ai une idée de sujet mais je ne sais pas par quel angle attaquer',
    '🎯 Aide-moi à trouver mon public cible et une promesse forte',
    '📑 Propose-moi un plan structuré en 5 chapitres captivants',
    '🧠 Challenge mon idée : quels sont les pièges et angles morts ?',
    '🗺️ Quelle méthode suivre pour rédiger mon livre étape par étape ?'
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isThinking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsThinking(true);

    try {
      const response = await generateBrainstormChat(newHistory, query);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      onShowToast('Erreur', 'Impossible de joindre le conseiller IA.', 'error');
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (msgId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(msgId);
    onShowToast('Copié', 'Texte copié dans le presse-papier.', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `👋 **Nouvelle session de brainstorming démarrée !**\n\nQuelle idée ou quel projet de livre souhaitez-vous explorer ensemble ?`,
        timestamp: 'À l\'instant'
      }
    ]);
    onShowToast('Nouvelle Session', 'Prêt pour une nouvelle réflexion créative.', 'info');
  };

  const handleQuickCreateProject = () => {
    const lastAiMsg = [...messages].reverse().find(m => m.role === 'assistant');
    const defaultTitle = 'Mon Nouveau Livre (Issu du Brainstorming)';
    
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    onCreateProjectFromIdea({
      title: defaultTitle,
      category: 'Création & Essai',
      description: 'Livre initié lors de la session de brainstorming avec l\'IA.',
      chapters: [
        { title: 'Introduction & Vision', content: lastAiMsg ? `### Notes issues du brainstorming :\n\n${lastAiMsg.content}` : '' },
        { title: 'Chapitre 1 : Les Fondations', content: '' },
        { title: 'Chapitre 2 : La Méthode', content: '' },
        { title: 'Chapitre 3 : La Mise en Pratique', content: '' },
        { title: 'Conclusion & Prochaines Étapes', content: '' }
      ]
    });

    onShowToast('Projet Créé', 'Vos réflexions sont prêtes dans l\'éditeur Bookly.', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/90 dark:bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <BooklyThinkingLogo size="md" isThinking={isThinking} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  Brainstorming IA
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
                  Groq IA Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Échangez librement avec l'IA pour réfléchir, trouver des angles originaux et structurer votre livre.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {messages.length > 2 && (
              <button
                onClick={handleQuickCreateProject}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold transition-colors"
                title="Créer un livre avec ces idées"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Ouvrir dans l'Éditeur</span>
              </button>
            )}

            <button
              onClick={handleResetChat}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Nouvelle conversation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Stream (High-contrast background and message bubbles) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-slate-100/70 dark:bg-slate-950/80">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="shrink-0 mt-0.5">
                    <BooklyThinkingLogo size="sm" isThinking={false} />
                  </div>
                )}

                <div
                  className={`max-w-[90%] sm:max-w-[82%] rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed shadow-sm transition-all ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/80 text-black dark:text-slate-50 rounded-tl-xs'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap leading-relaxed text-white font-normal">{msg.content}</p>
                  ) : (
                    <div className="space-y-2 text-black dark:text-slate-50 font-normal">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p className="text-black dark:text-slate-100 text-xs sm:text-sm leading-relaxed mb-2.5 last:mb-0 font-normal">
                              {children}
                            </p>
                          ),
                          h1: ({ children }) => (
                            <h1 className="text-base sm:text-lg font-bold text-black dark:text-white mt-3 mb-2">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-sm sm:text-base font-bold text-black dark:text-white mt-3 mb-2">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-400 mt-2.5 mb-1.5">
                              {children}
                            </h3>
                          ),
                          h4: ({ children }) => (
                            <h4 className="text-xs sm:text-sm font-bold text-black dark:text-white mt-2 mb-1">
                              {children}
                            </h4>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-bold text-black dark:text-white">
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic text-black dark:text-slate-100 font-medium">
                              {children}
                            </em>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-5 my-2 space-y-1.5 text-black dark:text-slate-100 text-xs sm:text-sm">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-5 my-2 space-y-1.5 text-black dark:text-slate-100 text-xs sm:text-sm">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="leading-relaxed text-black dark:text-slate-100">
                              {children}
                            </li>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-indigo-600 pl-3.5 py-2 my-2.5 italic text-black dark:text-slate-100 bg-indigo-50/80 dark:bg-indigo-950/60 rounded-r-lg font-medium">
                              {children}
                            </blockquote>
                          ),
                          code: ({ children }) => (
                            <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-semibold">
                              {children}
                            </code>
                          ),
                          hr: () => (
                            <hr className="my-3 border-slate-300 dark:border-slate-700" />
                          )
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}

                  {/* Footer metadata & copy action */}
                  {!isUser && (
                    <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{msg.timestamp}</span>
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500 font-medium">Copié</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copier</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Thinking Animation */}
          {isThinking && (
            <div className="flex items-center gap-3 animate-in fade-in duration-300">
              <BooklyThinkingLogo size="md" isThinking={true} />
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-sm flex items-center gap-2">
                <span className="text-xs font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent animate-pulse">
                  Bookly IA réfléchit avec vous...
                </span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length <= 3 && !isThinking && (
          <div className="px-4 py-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-slate-50 dark:bg-slate-900">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1" />
            {starterPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="px-3 py-1.5 rounded-xl text-[11px] font-medium bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/80 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-colors shadow-2xs shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez une question, partagez une idée, demandez des pistes de réflexion..."
              rows={2}
              className="flex-1 bg-transparent border-0 resize-none text-xs sm:text-sm text-black dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-hidden px-2 py-1 leading-relaxed font-normal"
            />

            <button
              id="btn-send-brainstorm"
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isThinking}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-40 disabled:hover:bg-indigo-600 shadow-xs shrink-0 active:scale-95"
              aria-label="Envoyer le message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 pt-2">
            <span>Appuyez sur <strong>Entrée</strong> pour envoyer &bull; <strong>Shift+Entrée</strong> pour un saut de ligne</span>
            <span className="hidden sm:inline">Brainstorming interactif Bookly Studio</span>
          </div>
        </div>

      </div>
    </div>
  );
};
