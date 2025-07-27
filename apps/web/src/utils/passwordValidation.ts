/**
 * STRICT PASSWORD VALIDATION - ENTERPRISE SECURITY
 * Developer: Bupe Nondo (bupe@hytel.io)
 * Organization: Hytel
 */

import { PasswordPolicyService, PasswordValidationResult as PolicyResult } from '@/services/passwordPolicyService';

export interface PasswordValidationResult {
  isValid: boolean;
  score: number;
  maxScore: number;
  percentage: number;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  strength: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  color: 'red' | 'orange' | 'yellow' | 'blue' | 'green';
  requirements: Array<{
    id: string;
    description: string;
    passed: boolean;
    points: number;
  }>;
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxLength?: number;
  preventCommonPasswords: boolean;
}

// STRICT PASSWORD POLICY - ENFORCED
export const STRICT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128,
  preventCommonPasswords: true
};

/**
 * STRICT PASSWORD VALIDATION - Uses enterprise-grade password policy
 * Minimum score of 100/140 points required to pass
 */
export function validatePassword(
  password: string,
  requirements: PasswordRequirements = STRICT_PASSWORD_REQUIREMENTS
): PasswordValidationResult {
  // Use the strict password policy service
  const policyResult = PasswordPolicyService.validatePassword(password);

  // Generate suggestions based on failed requirements
  const suggestions: string[] = [];

  policyResult.requirements.forEach(req => {
    if (!req.passed) {
      switch (req.id) {
        case 'length':
          suggestions.push('Use at least 8 characters');
          break;
        case 'uppercase':
          suggestions.push('Add an uppercase letter (A-Z)');
          break;
        case 'lowercase':
          suggestions.push('Add a lowercase letter (a-z)');
          break;
        case 'numbers':
          suggestions.push('Add a number (0-9)');
          break;
        case 'special':
          suggestions.push('Add a special character (!@#$%^&*...)');
          break;
        case 'noCommon':
          suggestions.push('Use a unique password that is not commonly used');
          break;
        case 'noSequential':
          suggestions.push('Avoid sequential characters (abc, 123)');
          break;
        case 'noRepetition':
          suggestions.push('Avoid repeating the same character multiple times');
          break;
        case 'minComplexity':
          suggestions.push('Use a mix of different character types');
          break;
      }
    }
  });

  // Add additional security suggestions
  if (policyResult.isValid) {
    suggestions.push('Consider using a password manager for better security');
    suggestions.push('Enable two-factor authentication when available');
  }

  return {
    isValid: policyResult.isValid,
    score: policyResult.score,
    maxScore: policyResult.maxScore,
    percentage: policyResult.percentage,
    errors: policyResult.errors,
    warnings: policyResult.warnings,
    suggestions,
    strength: policyResult.strength,
    color: policyResult.color,
    requirements: policyResult.requirements
  };
}

/**
 * STRICT PASSWORD STRENGTH ASSESSMENT
 * Based on percentage score from comprehensive validation
 */
export function getPasswordStrengthLabel(percentage: number): string {
  if (percentage >= 90) return 'Very Strong';
  if (percentage >= 75) return 'Strong';
  if (percentage >= 60) return 'Medium';
  if (percentage >= 40) return 'Weak';
  return 'Very Weak';
}

export function getPasswordStrengthColor(percentage: number): string {
  if (percentage >= 90) return 'text-green-600';
  if (percentage >= 75) return 'text-blue-600';
  if (percentage >= 60) return 'text-yellow-600';
  if (percentage >= 40) return 'text-orange-600';
  return 'text-red-600';
}

export function getPasswordStrengthBarColor(percentage: number): string {
  if (percentage >= 90) return 'bg-green-500';
  if (percentage >= 75) return 'bg-blue-500';
  if (percentage >= 60) return 'bg-yellow-500';
  if (percentage >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

/**
 * Get detailed password strength description
 */
export function getPasswordStrengthDescription(result: PasswordValidationResult): string {
  return PasswordPolicyService.getStrengthDescription(result);
}

/**
 * Check if password meets minimum security requirements
 */
export function isPasswordSecure(password: string): boolean {
  const result = validatePassword(password);
  return result.isValid && result.percentage >= 75; // Require 75%+ for "secure"
}

/**
 * Get security recommendations
 */
export function getSecurityRecommendations(): string[] {
  return PasswordPolicyService.getSecurityRecommendations();
}

/**
 * Check if password is commonly used
 */
export function isCommonPassword(password: string): boolean {
  return PasswordPolicyService.isCommonPassword(password);
}

// Export the strict policy service for advanced usage
export { PasswordPolicyService };
