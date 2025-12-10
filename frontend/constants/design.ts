// Chekinn Design System - Premium, Quiet, Human
// Philosophy: A quiet place to think things through

export const Colors = {
  // Backgrounds (warm off-whites, NOT pure white)
  background: '#FAFAF8',        // Primary warm off-white
  surface: '#F3F4F2',           // Chat area, slightly darker warm neutral
  card: '#F0F1EF',              // Assistant message background
  
  // Text (deep charcoal, NOT black)
  text: {
    primary: '#1F2933',         // Deep charcoal for primary text
    secondary: '#6B7280',       // Warm grey for secondary text
    tertiary: '#9CA3AF',        // Light grey
    placeholder: '#D1D5DB',     // Very light grey
  },
  
  // Accent (ONE muted accent only - desaturated blue/slate)
  accent: '#5B7C99',            // Desaturated dusty blue
  accentLight: '#7B98B3',       // Lighter version
  accentDark: '#4A6480',        // Darker version
  
  // Functional colors (muted, minimal)
  success: '#6B8E76',           // Muted sage
  error: '#A67C6D',             // Muted terracotta
  
  // Overlays
  overlay: 'rgba(31, 41, 51, 0.4)',
  overlayLight: 'rgba(31, 41, 51, 0.1)',
};

export const Spacing = {
  // Generous spacing - "almost too much breathing room"
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 64,
  
  // Screen margins (larger than typical)
  screenPadding: 24,
  sectionGap: 32,
};

export const Typography = {
  // Font family: Inter (locked - do not change)
  family: 'Inter',
  
  // Exact sizes per spec
  sizes: {
    label: 12,           // Labels / hints: 12-13px
    helper: 15,          // Subtext / helper: 15-16px
    base: 16,            // Chat messages: 16px
    subheadline: 18,     // Larger body text
    headline: 22,        // Onboarding headline: 22-24px
  },
  
  // Line heights per spec
  lineHeights: {
    headline: 1.3,       // Onboarding headline
    helper: 1.45,        // Subtext / helper
    chat: 1.55,          // Chat messages
  },
  
  // Weights (NO bold above 600)
  weights: {
    normal: '400',       // Default
    medium: '500',       // User messages, emphasis
    semibold: '600',     // Maximum weight allowed
  },
};

export const BorderRadius = {
  // Soft rounded corners (no sharp edges)
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadows = {
  // Very subtle, never harsh
  soft: {
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  gentle: {
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
};

export const Animations = {
  // Slow, soft easing curves
  duration: {
    fast: 200,
    base: 300,
    slow: 500,
    verySlow: 800,
  },
  
  // Gentle easing (no aggressive spring)
  easing: 'ease-out',
};

// Design principles as code
export const DesignPrinciples = {
  // Maximum emojis per screen
  maxEmojisPerScreen: 1,
  
  // Intentional delays (ms)
  thinkingDelay: 800,      // Before AI responds
  transitionDelay: 300,    // Between screens
  
  // Button psychology
  buttonsShouldFeel: 'optional', // not assertive
  
  // Interaction pace
  pace: 'patient',         // not instant
};
