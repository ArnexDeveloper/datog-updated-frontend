// Free, no-signup translation for arbitrary free-text (job card notes,
// special instructions) — unlike garment type/fit, which are fixed enums
// translated via a hardcoded lookup table, notes can be anything staff type,
// so they need an actual translation call rather than a dictionary.
const cache = new Map<string, string>();

export const translateToHindi = async (text: string): Promise<string> => {
  const trimmed = (text || '').trim();
  if (!trimmed) return text;

  const cached = cache.get(trimmed);
  if (cached) return cached;

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=en|hi`
    );
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (typeof translated === 'string' && translated.trim()) {
      cache.set(trimmed, translated);
      return translated;
    }
  } catch {
    // Network/API failure — fall through to returning the original text
    // below, so a translation hiccup never blocks printing a job card.
  }
  return text;
};
