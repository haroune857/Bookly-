// Clés API de secours intégrées pour l'environnement client et serverless Vercel
export const BUILTIN_API_KEYS = {
  groq: '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',
  gemini: 'AQ.Ab8RN6Ju0hqyZLn6aJxORmQCt8a7v7ekqQNlSiESAWzPSqFF8g',
  saspay: 'sk_live_w-C60s9lh93i0Ei1X17V6zhIeU8yZtkre0Rg1TvASS0',
  openrouter: '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'
};

export function getEffectiveGroqKey(): string {
  const envKey = (typeof process !== 'undefined' && process.env?.GROQ_API_KEY) ||
    ((typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GROQ_API_KEY) as string) ||
    ((typeof import.meta !== 'undefined' && (import.meta as any).env?.GROQ_API_KEY) as string);
  return (envKey && envKey.trim()) ? envKey.trim() : BUILTIN_API_KEYS.groq;
}

export function getEffectiveGeminiKey(): string {
  const envKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    ((typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) as string) ||
    ((typeof import.meta !== 'undefined' && (import.meta as any).env?.GEMINI_API_KEY) as string);
  return (envKey && envKey.trim()) ? envKey.trim() : BUILTIN_API_KEYS.gemini;
}

export function getEffectiveSaspayKey(): string {
  const envKey = (typeof process !== 'undefined' && process.env?.SASPAY_API_KEY) ||
    ((typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SASPAY_API_KEY) as string) ||
    ((typeof import.meta !== 'undefined' && (import.meta as any).env?.SASPAY_API_KEY) as string);
  return (envKey && envKey.trim()) ? envKey.trim() : BUILTIN_API_KEYS.saspay;
}

export function getEffectiveOpenRouterKey(): string {
  const envKey = (typeof process !== 'undefined' && process.env?.OPENROUTER_API_KEY) ||
    ((typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_OPENROUTER_API_KEY) as string) ||
    ((typeof import.meta !== 'undefined' && (import.meta as any).env?.OPENROUTER_API_KEY) as string);
  return (envKey && envKey.trim()) ? envKey.trim() : BUILTIN_API_KEYS.openrouter;
}
