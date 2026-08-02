export const COLORS = {
  gold: '#c9900a',
  goldLight: '#fde68a',
  blue: '#2563eb',
  blueLight: '#eff6ff',
  purple: '#7c3aed',
  purpleLight: '#f5f3ff',
  red: '#dc2626',
  redLight: '#fff1f2',
  green: '#22c55e',
  greenLight: '#f0fdf4',
  amber: '#f59e0b',
  amberLight: '#fffbeb',
  sidebar: '#111111',
  text: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  border: '#e5e7eb',
  borderLight: '#f1f5f9',
  surface: '#f8fafc',
};

export const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  in_progress: { bg: '#eff6ff', text: '#1e40af', dot: '#2563eb' },
  pending: { bg: '#fef9c3', text: '#854d0e', dot: '#f59e0b' },
  trial_pending: { bg: '#f5f3ff', text: '#5b21b6', dot: '#7c3aed' },
  delivered: { bg: '#f0fdf4', text: '#15803d', dot: '#22c55e' },
  overdue: { bg: '#fff1f2', text: '#dc2626', dot: '#dc2626' },
  ready: { bg: '#f0fdf4', text: '#15803d', dot: '#22c55e' },
};

export const DONUT_COLORS: Record<string, string> = {
  in_progress: '#f59e0b',
  pending: '#2563eb',
  trial_pending: '#7c3aed',
  delivered: '#22c55e',
  overdue: '#dc2626',
  ready: '#16a34a',
};

export const PRODUCT_EMOJI: Record<string, string> = {
  trouser: '👖', pant: '👖', trousers: '👖',
  shirt: '👔',
  blazer: '🥼',
  sherwani: '🧣',
  kurta: '👘', kurti: '👘',
  shalwar: '👗', salwar: '👗',
  suit: '🎩',
};

export const productEmoji = (name: string) => {
  const key = (name || '').toLowerCase();
  const match = Object.keys(PRODUCT_EMOJI).find(k => key.includes(k));
  return match ? PRODUCT_EMOJI[match] : '👕';
};
