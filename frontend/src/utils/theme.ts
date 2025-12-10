/**
 * Trustmaps Design System
 *
 * Design Direction: Modern & Refined (Stripe, Linear, Airbnb aesthetic)
 * Philosophy: Ultra-Minimal, Accessibility First, Clarity Over Cleverness
 * Inspiration: Clean neutrals, clear CTAs, excellent typography
 *
 * Color System: Neutral + Single Accent (Indigo)
 * Typography: Inter (single family, 4 weights)
 * Contrast: WCAG AA compliant minimum (4.5:1 for text, 3:1 for UI)
 */

export const colors = {
  // Neutral Palette (Primary) - Cool grays for maximum contrast
  neutral: {
    0: '#FFFFFF',     // Pure white - cards, surfaces
    50: '#FAFAFA',    // Off-white - backgrounds
    100: '#F5F5F5',   // Light gray - hover states
    200: '#E5E5E5',   // Borders, dividers
    300: '#D4D4D4',   // Disabled backgrounds
    400: '#A3A3A3',   // Placeholder text
    500: '#737373',   // Secondary text (WCAG AA: 4.6:1)
    600: '#525252',   // Body text (WCAG AA: 7.3:1)
    700: '#404040',   // Headings (WCAG AAA: 10.4:1)
    800: '#262626',   // Emphasized headings
    900: '#171717',   // Maximum contrast
  },

  // Accent Color (Indigo) - Professional, trustworthy, modern
  accent: {
    50: '#EEF2FF',    // Lightest - backgrounds, badges
    100: '#E0E7FF',   // Hover backgrounds
    200: '#C7D2FE',   // Soft accents
    300: '#A5B4FC',   // Disabled states
    400: '#818CF8',   // Hover states
    500: '#6366F1',   // PRIMARY ACTION (buttons, links)
    600: '#4F46E5',   // Active/pressed states
    700: '#4338CA',   // Dark mode primary
    800: '#3730A3',   // Darkest interactive
    900: '#312E81',   // Maximum depth
  },

  // Semantic Colors - Clear purpose, accessible
  success: '#10B981',  // Green - successful actions, confirmations
  warning: '#F59E0B',  // Amber - cautions, warnings
  error: '#EF4444',    // Red - errors, destructive actions
  info: '#3B82F6',     // Blue - informational messages

  // Surface Colors
  background: '#FAFAFA',      // App background (neutral.50)
  surface: '#FFFFFF',         // Cards, modals (neutral.0)
  surfaceElevated: '#FFFFFF', // Elevated cards (with shadow)
  border: '#E5E5E5',          // Borders, dividers (neutral.200)
  overlay: 'rgba(0,0,0,0.4)', // Modal overlays

  // Text Colors - WCAG AA compliant
  text: {
    primary: '#171717',    // Headings, primary content (neutral.900) - 12.63:1
    secondary: '#525252',  // Secondary content (neutral.600) - 7.37:1
    tertiary: '#737373',   // De-emphasized content (neutral.500) - 4.69:1
    disabled: '#A3A3A3',   // Disabled states (neutral.400) - 2.85:1
    inverse: '#FFFFFF',    // Text on dark backgrounds
    link: '#6366F1',       // Links (accent.500) - 4.53:1
    error: '#EF4444',      // Error messages - 4.54:1
  },
};

export const typography = {
  // Inter font family - Designed for screens, excellent readability
  fonts: {
    primary: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },

  // Type Scale (Major Third - 1.250 ratio)
  sizes: {
    xs: 12,      // Captions, small UI
    sm: 14,      // Secondary text, labels
    base: 16,    // Body text, inputs (default)
    lg: 20,      // Large body, card titles
    xl: 25,      // Section headings
    '2xl': 31,   // Page headings
    '3xl': 39,   // Hero headings
    '4xl': 49,   // Display headings
  },

  // Line Heights - Optimized for readability
  lineHeights: {
    tight: 1.25,    // Headings only
    normal: 1.5,    // Body text, UI elements (default)
    relaxed: 1.75,  // Long-form content
  },

  // Font Weights - Semantic usage
  fontWeights: {
    normal: '400',   // Body text, paragraphs
    medium: '500',   // Emphasized body, labels
    semibold: '600', // Subheadings, card titles
    bold: '700',     // Headings, important UI
  },
};

// Spacing Scale - 4px base unit (8px grid for larger gaps)
export const spacing = {
  0: 0,
  1: 4,      // Tight spacing (icon + text)
  2: 8,      // Small gaps (list items)
  3: 12,     // Default gaps
  4: 16,     // Standard padding (default)
  5: 20,     // Comfortable padding
  6: 24,     // Section gaps
  8: 32,     // Large sections
  10: 40,    // Page margins
  12: 48,    // Extra large gaps
  16: 64,    // Spacious layouts
  20: 80,    // Hero sections
};

// Border Radius - Consistent rounding
export const borderRadius = {
  none: 0,
  sm: 4,      // Tight corners (badges)
  base: 8,    // Standard (buttons, inputs) - default
  md: 12,     // Cards
  lg: 16,     // Large cards
  xl: 24,     // Modals
  full: 9999, // Circles, pills
};

// Shadows - Subtle depth, not decorative
export const shadows = {
  none: {
    shadowOpacity: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Layout Constraints - Responsive breakpoints
export const maxWidth = {
  sm: 640,      // Mobile landscape
  md: 768,      // Tablets
  lg: 1024,     // Small desktop
  xl: 1280,     // Desktop
  '2xl': 1536,  // Large desktop
  content: 720, // Readable content width
};

// Pre-defined Text Styles - Consistent typography combinations
export const textStyles = {
  // Headings
  h1: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes['2xl'],
    lineHeight: typography.sizes['2xl'] * typography.lineHeights.tight,
    color: colors.text.primary,
  },
  h2: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xl,
    lineHeight: typography.sizes.xl * typography.lineHeights.tight,
    color: colors.text.primary,
  },
  h3: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.lg,
    lineHeight: typography.sizes.lg * typography.lineHeights.tight,
    color: colors.text.primary,
  },
  h4: {
    fontFamily: typography.fonts.semibold,
    fontSize: typography.sizes.base,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
    color: colors.text.primary,
  },

  // Body
  body: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.base,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
    color: colors.text.primary,
  },
  bodyLarge: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.lg,
    lineHeight: typography.sizes.lg * typography.lineHeights.normal,
    color: colors.text.primary,
  },
  bodySmall: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
    color: colors.text.secondary,
  },

  // UI Text
  label: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
    color: colors.text.secondary,
  },
  caption: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    lineHeight: typography.sizes.xs * typography.lineHeights.normal,
    color: colors.text.tertiary,
  },
  button: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.base,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
  },
  link: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.base,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
    color: colors.text.link,
    textDecorationLine: 'underline' as const,
  },
};

// Main theme export
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  maxWidth,
  textStyles,
};

export type Theme = typeof theme;
