// Design System Configuration for Fitness App
// Consistent UI/UX patterns using Tailwind CSS

export const designSystem = {
  // Color Palette
  colors: {
    primary: {
      50: 'bg-purple-50',
      100: 'bg-purple-100',
      500: 'bg-purple-500',
      600: 'bg-purple-600',
      700: 'bg-purple-700',
      900: 'bg-purple-900',
    },
    secondary: {
      50: 'bg-primary-50',
      100: 'bg-primary-100',
      500: 'bg-primary-500',
      600: 'bg-primary-600',
      700: 'bg-primary-700',
    },
    success: {
      50: 'bg-green-50',
      100: 'bg-green-100',
      500: 'bg-green-500',
      600: 'bg-green-600',
      700: 'bg-green-700',
    },
    warning: {
      50: 'bg-yellow-50',
      100: 'bg-yellow-100',
      500: 'bg-yellow-500',
      600: 'bg-yellow-600',
    },
    error: {
      50: 'bg-red-50',
      100: 'bg-red-100',
      500: 'bg-red-500',
      600: 'bg-red-600',
    },
    neutral: {
      50: 'bg-gray-50',
      100: 'bg-gray-100',
      200: 'bg-gray-200',
      300: 'bg-gray-300',
      400: 'bg-gray-400',
      500: 'bg-gray-500',
      600: 'bg-gray-600',
      700: 'bg-gray-700',
      800: 'bg-gray-800',
      900: 'bg-gray-900',
    },
  },

  // Typography
  typography: {
    h1: 'text-3xl md:text-4xl font-bold text-gray-900 dark:text-white',
    h2: 'text-2xl md:text-3xl font-bold text-gray-900 dark:text-white',
    h3: 'text-xl md:text-2xl font-semibold text-gray-900 dark:text-white',
    h4: 'text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100',
    h5: 'text-base md:text-lg font-medium text-gray-800 dark:text-gray-100',
    body: 'text-sm md:text-base text-gray-700 dark:text-gray-300',
    caption: 'text-xs md:text-sm text-gray-600 dark:text-gray-400',
    label: 'text-sm font-medium text-gray-700 dark:text-gray-300',
  },

  // Spacing
  spacing: {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
    '2xl': 'p-12',
  },

  // Borders & Radius (Circle-focused)
  borders: {
    none: 'border-0',
    thin: 'border border-gray-200 dark:border-gray-700',
    thick: 'border-2 border-gray-300 dark:border-gray-600',
    radius: {
      sm: 'rounded-xl',
      md: 'rounded-2xl',
      lg: 'rounded-3xl',
      full: 'rounded-full',
      circle: 'rounded-full',
    },
  },

  // Shadows
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    inner: 'shadow-inner',
  },

  // Component Variants
  components: {
    card: {
      base: 'bg-white dark:bg-gray-800 rounded-2xl shadow-circle border border-gray-200 dark:border-gray-700',
      hover: 'hover:shadow-circle-lg transition-all duration-200',
      interactive: 'cursor-pointer hover:shadow-circle-lg hover:scale-[1.02] transition-all duration-200',
    },
    button: {
      primary: 'bg-gradient-to-r from-purple-500 to-primary-600 hover:from-purple-600 hover:to-primary-700 text-white font-medium px-6 py-3 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-circle hover:shadow-circle-lg transform hover:scale-105',
      secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium px-6 py-3 rounded-2xl transition-all duration-200 shadow-circle',
      success: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-6 py-3 rounded-2xl transition-all duration-200 shadow-circle hover:shadow-circle-lg transform hover:scale-105',
      warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium px-6 py-3 rounded-2xl transition-all duration-200 shadow-circle hover:shadow-circle-lg transform hover:scale-105',
      danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium px-6 py-3 rounded-2xl transition-all duration-200 shadow-circle hover:shadow-circle-lg transform hover:scale-105',
      ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium px-6 py-3 rounded-2xl transition-all duration-200 shadow-circle',
    },
    input: {
      base: 'w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-circle',
      error: 'border-red-500 focus:ring-red-500',
      success: 'border-green-500 focus:ring-green-500',
    },
    badge: {
      primary: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      success: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      warning: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      error: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      neutral: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    },
  },

  // Layout
  layout: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    section: 'py-8 md:py-12',
    grid: {
      cols1: 'grid grid-cols-1 gap-6',
      cols2: 'grid grid-cols-1 md:grid-cols-2 gap-6',
      cols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
      cols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
    },
    flex: {
      center: 'flex items-center justify-center',
      between: 'flex items-center justify-between',
      start: 'flex items-center justify-start',
      end: 'flex items-center justify-end',
      col: 'flex flex-col',
      colCenter: 'flex flex-col items-center justify-center',
    },
  },

  // Animations
  animations: {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    bounce: 'animate-bounce',
    pulse: 'animate-pulse',
    spin: 'animate-spin',
  },

  // States
  states: {
    loading: 'opacity-50 pointer-events-none',
    disabled: 'opacity-50 cursor-not-allowed',
    active: 'ring-2 ring-blue-500 ring-offset-2',
    focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  },
};

// Utility functions for consistent styling
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const getVariant = (component: keyof typeof designSystem.components, variant: string) => {
  return designSystem.components[component]?.[variant as keyof typeof designSystem.components[typeof component]] || '';
};

export const getTypography = (variant: keyof typeof designSystem.typography) => {
  return designSystem.typography[variant];
};

export const getSpacing = (size: keyof typeof designSystem.spacing) => {
  return designSystem.spacing[size];
};

export const getColor = (color: keyof typeof designSystem.colors, shade: string) => {
  const colorObj = designSystem.colors[color];
  if (!colorObj || typeof colorObj !== 'object') return '';
  return (colorObj as any)[shade] || '';
};
