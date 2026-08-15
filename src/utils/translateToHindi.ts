// Free, no-signup translation for arbitrary free-text (job card notes,
// special instructions) — unlike garment type/fit, which are fixed enums
// translated via a hardcoded lookup table, notes can be anything staff type,
// so they need an actual translation call rather than a dictionary.
const cache = new Map<string, string>();

// Throws on network failure or an unusable response — callers (useHindiText)
// decide the fallback/error UX, this just does the raw translation.
export const translateToHindi = async (text: string): Promise<string> => {
  const trimmed = (text || '').trim();
  if (!trimmed) return text;

  const cached = cache.get(trimmed);
  if (cached) return cached;

  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=en|hi`
  );
  const data = await res.json();
  const translated = data?.responseData?.translatedText;
  if (typeof translated === 'string' && translated.trim()) {
    cache.set(trimmed, translated);
    return translated;
  }
  throw new Error('Translation unavailable');
};
