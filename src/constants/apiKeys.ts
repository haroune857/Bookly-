/**
 * Server-side API key access only.
 *
 * Secrets must be provided through server environment variables.
 * Never hard-code provider keys or expose them through VITE_* variables:
 * VITE_* values are bundled into the browser.
 */
function getServerEnv(name: string): string {
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[name];
    return typeof value === 'string' ? value.trim() : '';
  }
  return '';
}

export function getEffectiveGroqKey(): string {
  return getServerEnv('GROQ_API_KEY');
}

export function getEffectiveGeminiKey(): string {
  return getServerEnv('GEMINI_API_KEY');
}

export function getEffectiveSaspayKey(): string {
  return getServerEnv('SASPAY_API_KEY');
}

export function getEffectiveOpenRouterKey(): string {
  return getServerEnv('OPENROUTER_API_KEY');
}
