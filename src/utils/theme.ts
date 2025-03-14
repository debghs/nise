// Theme configuration for consistent styling across the app

export const colors = {
  // Primary colors
  primary: '#3498db',       // A more modern blue than the current #007AFF
  primaryDark: '#2980b9',   // Darker shade for pressed states
  primaryLight: '#e1f0fa',  // Light shade for backgrounds
  
  // Secondary colors
  secondary: '#2ecc71',     // Green for success/confirmation
  secondaryDark: '#27ae60', // Darker green
  
  // Accent colors
  accent: '#9b59b6',        // Purple for highlighting special elements
  
  // Neutral colors
  background: '#ffffff',    // Main background
  card: '#f8f9fa',          // Card backgrounds
  text: '#2c3e50',          // Main text color
  textLight: '#7f8c8d',     // Secondary text color
  border: '#dfe4ea',        // Border color
  
  // Feedback colors
  success: '#2ecc71',       // Success messages
  warning: '#f39c12',       // Warning messages
  error: '#e74c3c',         // Error messages
  info: '#3498db',          // Info messages
  
  // Tag colors
  tagBackground: '#f1f2f6',
  tagSelected: '#3498db',
  tagText: '#2c3e50',
  tagTextSelected: '#ffffff',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999, // For circular elements
};

export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// Common button styles
export const buttonStyles = {
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  text: {
    color: colors.primary,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  textSecondary: {
    color: colors.text,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
};

// Common input styles
export const inputStyles = {
  default: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.text,
  },
  focused: {
    borderColor: colors.primary,
  },
  error: {
    borderColor: colors.error,
  },
};

// Common card styles
export const cardStyles = {
  default: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.small,
  },
};

// Animation timing
export const animation = {
  fast: 200,
  medium: 300,
  slow: 500,
};
