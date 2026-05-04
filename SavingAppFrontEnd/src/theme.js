export const getTheme = (isDark) => ({
  // Backgrounds
  bg: isDark ? '#13111a' : '#f0f2f5',
  bgCard: isDark ? '#1c1828' : '#ffffff',
  bgInput: isDark ? '#13111a' : '#f5f6f8',
  bgHover: isDark ? '#2a2535' : '#f0f2f5',
  bgNav: isDark ? '#100e1a' : '#ffffff',
  bgAccent: isDark
    ? 'rgba(196,75,138,0.15)'
    : 'rgba(196,75,138,0.1)',
  bgSelected: isDark
    ? 'rgba(196,75,138,0.2)'
    : 'rgba(196,75,138,0.08)',

  // Borders
  border: isDark ? '#2a2535' : '#e2e0ec',
  borderLight: isDark ? '#1e1b2e' : '#eeecf5',

  // Text
  textPrimary: isDark ? '#f0eeff' : '#1a1628',
  textSecondary: isDark ? '#7a7390' : '#5a5570',
  textMuted: isDark ? '#4a4560' : '#9896b0',
  textOnAccent: '#ffffff',

  // Inputs
  inputBg: isDark ? '#0d0b14' : '#f5f6fa',
  inputBorder: isDark ? '#2a2535' : '#dddbe8',
  inputText: isDark ? '#c9c4e8' : '#1a1628',
  inputPlaceholder: isDark ? '#4a4560' : '#9896b0',

  // Status
  green: '#16a34a',
  greenLight: '#3ecf8e',
  greenBg: isDark ? 'rgba(62,207,142,0.12)' : 'rgba(22,163,74,0.08)',
  greenBorder: isDark ? '#3ecf8e' : '#16a34a',

  red: '#dc2626',
  redLight: '#ef4444',
  redBg: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(220,38,38,0.08)',
  redBorder: isDark ? '#ef4444' : '#dc2626',

  yellow: '#d97706',
  yellowLight: '#f59e0b',
  yellowBg: isDark ? 'rgba(245,158,11,0.12)' : 'rgba(217,119,6,0.08)',
  yellowBorder: isDark ? '#f59e0b' : '#d97706',

  purple: '#7c3aed',
  purpleBg: isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.08)',

  // Brand
  accent: '#c44b8a',
  accentOrange: '#e8632a',
  accentGradient: 'linear-gradient(135deg, #c44b8a, #e8632a)',

  // Shadows
  shadow: isDark
    ? 'none'
    : '0 1px 4px rgba(0,0,0,0.08)',
  shadowCard: isDark
    ? 'none'
    : '0 2px 8px rgba(0,0,0,0.06)',
  shadowNav: isDark
    ? 'none'
    : '0 2px 12px rgba(0,0,0,0.08)',
  shadowDropdown: isDark
    ? '0 8px 24px rgba(0,0,0,0.4)'
    : '0 8px 24px rgba(0,0,0,0.12)',
})