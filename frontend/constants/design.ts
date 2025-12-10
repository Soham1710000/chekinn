// Chekinn Design System
// Philosophy: Warm, human, private — never loud or gamified

export const Colors = {
  // Warm off-whites (primary backgrounds)
  background: '#FAF9F6',        // Parchment white
  surface: '#F5F3EF',           // Warm ivory
  card: '#EFEDE8',              // Soft sand
  
  // Soft greys with warmth (not cold)
  text: {
    primary: '#3D3A36',         // Warm charcoal (not black)
    secondary: '#6B6762',       // Warm grey
    tertiary: '#8F8B86',        // Light warm grey
    placeholder: '#B5B1AC',     // Very light warm grey
  },
  
  // Accent (muted, warm)
  accent: '#A58673',            // Warm clay/terracotta (very subtle)
  accentLight: '#C4B5A8',       // Lighter clay
  accentDark: '#8B7465',        // Darker clay
  
  // Functional colors (muted)
  success: '#7D9B76',           // Muted sage green
  error: '#B5826F',             // Muted terracotta (not red)
  warning: '#BFA57E',           // Warm sand
  
  // Transparent overlays
  overlay: 'rgba(61, 58, 54, 0.4)',
  overlayLight: 'rgba(61, 58, 54, 0.1)',
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
  // Slightly larger than normal, soft weights
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,       // Body text slightly large
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },
  
  // Line heights larger than normal
  lineHeights: {
    tight: 1.3,
    base: 1.6,      // More breathing room
    relaxed: 1.8,
  },
  
  // Soft weights (never shout)
  weights: {
    normal: '400',
    medium: '500',  // Use sparingly
    semibold: '600', // Use very rarely
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
