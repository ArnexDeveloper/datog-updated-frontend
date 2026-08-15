import { useEffect, useState } from 'react';
import { translateToHindi } from '../utils/translateToHindi';

// Returns `text` translated to Hindi when lang === 'hi', otherwise `text`
// unchanged. Shows the original text while the translation is in flight
// (or if it fails), so the print view never blocks or shows blank notes.
export const useHindiText = (text: string | undefined, lang: 'en' | 'hi'): string | undefined => {
  const [result, setResult] = useState(text);

  useEffect(() => {
    if (!text || lang !== 'hi') {
      setResult(text);
      return;
    }
    let cancelled = false;
    setResult(text);
    translateToHindi(text).then(translated => {
      if (!cancelled) setResult(translated);
    });
    return () => { cancelled = true; };
  }, [text, lang]);

  return result;
};
