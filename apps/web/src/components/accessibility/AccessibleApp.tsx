import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AccessibleAppProps {
  children: React.ReactNode;
  className?: string;
}

export function AccessibleApp({ children, className }: AccessibleAppProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Check for high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    setHighContrast(contrastQuery.matches);
    
    const handleContrastChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches);
    };
    
    contrastQuery.addEventListener('change', handleContrastChange);
    
    // Focus-visible polyfill
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setFocusVisible(true);
      }
    };
    
    const handleMouseDown = () => {
      setFocusVisible(false);
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return (
    <div 
      className={cn(
        'accessible-app',
        {
          'reduced-motion': reducedMotion,
          'high-contrast': highContrast,
          'focus-visible': focusVisible,
        },
        className
      )}
      role="application"
      aria-label="FitnessApp - Your Personal Fitness Journey"
    >
      {/* Skip Links */}
      <div className="skip-links">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <a href="#navigation" className="skip-link">
          Skip to navigation
        </a>
      </div>

      {/* Live Region for Announcements */}
      <div
        id="live-region"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Alert Region for Urgent Messages */}
      <div
        id="alert-region"
        role="alert"
        aria-live="assertive"
        className="sr-only"
      />

      {/* Main Application */}
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}

// Accessibility utilities
export const announceToScreenReader = (message: string, urgent = false) => {
  const region = document.getElementById(urgent ? 'alert-region' : 'live-region');
  if (region) {
    region.textContent = message;
    // Clear after announcement
    setTimeout(() => {
      region.textContent = '';
    }, 1000);
  }
};

export const focusElement = (selector: string) => {
  const element = document.querySelector(selector) as HTMLElement;
  if (element) {
    element.focus();
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

// Focus trap for modals
export class FocusTrap {
  private container: HTMLElement;
  private focusableElements: HTMLElement[];
  private firstFocusable: HTMLElement;
  private lastFocusable: HTMLElement;
  private previouslyFocused: HTMLElement | null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.previouslyFocused = document.activeElement as HTMLElement;
    this.updateFocusableElements();
    this.activate();
  }

  private updateFocusableElements() {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    this.focusableElements = Array.from(
      this.container.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];

    this.firstFocusable = this.focusableElements[0];
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === this.firstFocusable) {
          e.preventDefault();
          this.lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === this.lastFocusable) {
          e.preventDefault();
          this.firstFocusable?.focus();
        }
      }
    }

    if (e.key === 'Escape') {
      this.deactivate();
    }
  };

  activate() {
    this.container.addEventListener('keydown', this.handleKeyDown);
    this.firstFocusable?.focus();
  }

  deactivate() {
    this.container.removeEventListener('keydown', this.handleKeyDown);
    this.previouslyFocused?.focus();
  }
}

// Accessible form validation
export interface ValidationResult {
  isValid: boolean;
  errors: { field: string; message: string; }[];
}

export const validateForm = (formData: Record<string, any>, rules: Record<string, any>): ValidationResult => {
  const errors: { field: string; message: string; }[] = [];

  Object.entries(rules).forEach(([field, rule]) => {
    const value = formData[field];
    
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors.push({
        field,
        message: `${rule.label || field} is required`
      });
    }

    if (value && rule.minLength && value.toString().length < rule.minLength) {
      errors.push({
        field,
        message: `${rule.label || field} must be at least ${rule.minLength} characters`
      });
    }

    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors.push({
        field,
        message: rule.patternMessage || `${rule.label || field} format is invalid`
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Accessible progress announcements
export const announceProgress = (current: number, total: number, context: string) => {
  const percentage = Math.round((current / total) * 100);
  const message = `${context}: ${percentage}% complete. ${current} of ${total} items.`;
  announceToScreenReader(message);
};

// Color contrast checker
export const checkContrast = (foreground: string, background: string): number => {
  // Simplified contrast ratio calculation
  // In production, use a proper color contrast library
  const getLuminance = (color: string): number => {
    // This is a simplified version - use proper color parsing in production
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

export default AccessibleApp;
