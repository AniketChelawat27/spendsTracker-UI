export const ACTIVITY_TYPES = ['Income', 'Gift', 'Loan', 'Transfer', 'Other'] as const;

export const ACTIVITY_ICON: Record<string, string> = {
  Income: '💰',
  Gift: '🎁',
  Loan: '💳',
  Transfer: '🔄',
  Other: '📌'
};

export const ACTIVITY_COLOR: Record<string, string> = {
  Income: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Gift: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  Loan: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Transfer: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Other: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200'
};

/** Clay-style solid card background (white text on these) */
export const ACTIVITY_CARD_BG: Record<string, string> = {
  Income: 'bg-emerald-600',
  Gift: 'bg-clay-pink',
  Loan: 'bg-amber-600',
  Transfer: 'bg-clay-blue',
  Other: 'bg-neutral-600'
};

export const getActivityIcon = (type: string): string => ACTIVITY_ICON[type] ?? '📌';
export const getActivityColor = (type: string): string => ACTIVITY_COLOR[type] ?? ACTIVITY_COLOR.Other;
export const getActivityCardBg = (type: string): string => ACTIVITY_CARD_BG[type] ?? ACTIVITY_CARD_BG.Other;
