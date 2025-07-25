import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get theme from localStorage or use default
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fitness-app-theme') as Theme;
      return stored || defaultTheme;
    }
    return defaultTheme;
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Function to get system theme preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Update actual theme based on theme setting
  useEffect(() => {
    const updateActualTheme = () => {
      let newActualTheme: 'light' | 'dark';
      
      if (theme === 'system') {
        newActualTheme = getSystemTheme();
      } else {
        newActualTheme = theme;
      }
      
      setActualTheme(newActualTheme);
      
      // Update document class
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(newActualTheme);
      
      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', newActualTheme === 'dark' ? '#1f2937' : '#ffffff');
      }
    };

    updateActualTheme();

    // Listen for system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateActualTheme();
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Save theme to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fitness-app-theme', theme);
    }
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme: handleSetTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme toggle component
interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeToggle({ className = '', showLabel = false, size = 'md' }: ThemeToggleProps) {
  const { theme, actualTheme, setTheme } = useTheme();

  const themes: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' },
  ];

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  const buttonSizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  if (showLabel) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme:</span>
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {themes.map((themeOption) => (
            <button
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={`${buttonSizeClasses[size]} rounded-md font-medium transition-all duration-200 ${
                theme === themeOption.value
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title={`Switch to ${themeOption.label} theme`}
            >
              <span className="mr-1">{themeOption.icon}</span>
              {themeOption.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        const currentIndex = themes.findIndex(t => t.value === theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex].value);
      }}
      className={`${sizeClasses[size]} ${className} flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 border border-gray-200 dark:border-gray-600`}
      title={`Current: ${theme} (${actualTheme}). Click to cycle themes.`}
    >
      <span className="transition-transform duration-200 hover:scale-110">
        {actualTheme === 'dark' ? '🌙' : '☀️'}
      </span>
    </button>
  );
}

// Advanced theme toggle with dropdown
export function ThemeDropdown({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { value: 'light' as Theme, label: 'Light', icon: '☀️', description: 'Light theme' },
    { value: 'dark' as Theme, label: 'Dark', icon: '🌙', description: 'Dark theme' },
    { value: 'system' as Theme, label: 'System', icon: '💻', description: 'Follow system preference' },
  ];

  const currentTheme = themes.find(t => t.value === theme);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 border border-gray-200 dark:border-gray-600"
      >
        <span>{currentTheme?.icon}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentTheme?.label}
        </span>
        <span className="text-gray-400">▼</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="py-1">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    setTheme(themeOption.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                    theme === themeOption.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span>{themeOption.icon}</span>
                  <div>
                    <div className="font-medium">{themeOption.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {themeOption.description}
                    </div>
                  </div>
                  {theme === themeOption.value && (
                    <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ThemeProvider;
