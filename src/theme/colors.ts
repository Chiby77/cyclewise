// Shared color tokens — mirrors tailwind.config.js so SVG / LinearGradient
// props (which can't take Tailwind classes) stay in sync with the rest of
// the UI. If you rebrand, update both this file and tailwind.config.js.
export const colors = {
  pinkPrimary: '#F06292',
  pinkDark: '#E91E63',
  pinkLight: '#FCE4EC',
  pinkSoft: '#FDEEF5',
  pinkPastel: '#F48FB1',
  pinkPastelLight: '#F8BBD0',
  teal: '#26C6DA',
  tealDark: '#00ACC1',
  tealLight: '#E0F7FA',
  lightBlue: '#E1F5FE',
  bg: '#F2F2F7',
  card: '#FFFFFF',
  text: '#1C1C1E',
  muted: '#8E8E93',
  amber: '#B45309',
  amberBg: '#FEF3C7',
  blue: '#2196F3',
  blueDark: '#1E88E5',
  blueLight: '#42A5F5',

  // Dark Mode Tokens
  darkBg: '#121214',
  darkCard: '#1E1E22',
  darkText: '#F3F4F6',
  darkMuted: '#9CA3AF',
  darkBorder: '#374151',
  darkPinkPrimary: '#EC407A',
  darkTeal: '#00ACC1',
};

export function getThemeColors(isDark: boolean) {
  return {
    bg: isDark ? colors.darkBg : colors.bg,
    card: isDark ? colors.darkCard : colors.card,
    text: isDark ? colors.darkText : colors.text,
    muted: isDark ? colors.darkMuted : colors.muted,
    border: isDark ? colors.darkBorder : '#E5E7EB',
    pinkPrimary: isDark ? colors.darkPinkPrimary : colors.pinkPrimary,
    teal: isDark ? colors.darkTeal : colors.teal,
    gradientHeader: isDark ? (['#880E4F', '#4A148C'] as const) : (['#F06292', '#E91E63'] as const),
    gradientCard: isDark ? (['#1E1E22', '#2A2A30'] as const) : (['#FFFFFF', '#FDEEF5'] as const),
  };
}
