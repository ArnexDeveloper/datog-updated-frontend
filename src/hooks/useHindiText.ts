import { useEffect, useState } from 'react';
import { translateToHindi } from '../utils/translateToHindi';

export interface HindiTextResult {
  text: string | undefined;
  loading: boolean;
  error: boolean;
}

// Translates `text` to Hindi when lang === 'hi', otherwise passes it through
// unchanged. Shows the original text while the translation is in flight or
// if it fails, so the print view never blocks or goes blank — `loading`/
// `error` are exposed separately so callers can show their own feedback
// (skeletons, a disabled toggle, an inline error message).
export const useHindiText = (text: string | undefined, lang: 'en' | 'hi'): HindiTextResult => {
  const [result, setResult] = useState(text);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!text || lang !== 'hi') {
      setResult(text);
      setLoading(false);
      setError(false);
      return;
    }
    let cancelled = false;
    setResult(text);
    setLoading(true);
    setError(false);
    translateToHindi(text)
      .then(translated => {
        if (cancelled) return;
        setResult(translated);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setResult(text);
        setError(true);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [text, lang]);

  return { text: result, loading, error };
};
