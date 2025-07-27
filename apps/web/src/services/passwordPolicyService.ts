/**
 * Strict Password Policy Service
 * Developer: Bupe Nondo (bupe@hytel.io)
 * Organization: Hytel
 */

export interface PasswordRequirement {
  id: string;
  description: string;
  regex?: RegExp;
  check?: (password: string) => boolean;
  points: number;
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: number;
  maxScore: number;
  percentage: number;
  strength: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  color: 'red' | 'orange' | 'yellow' | 'blue' | 'green';
  errors: string[];
  warnings: string[];
  requirements: Array<{
    id: string;
    description: string;
    passed: boolean;
    points: number;
  }>;
}

export interface PasswordPolicyConfig {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
  passwordHistoryCount: number;
  maxFailedAttempts: number;
  lockoutDuration: number; // minutes
  passwordExpiry: number; // days
  enforceComplexity: boolean;
}

// Comprehensive list of blocked common passwords
const BLOCKED_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'dragon',
  'master', 'hello', 'freedom', 'whatever', 'qazwsx', 'trustno1',
  'jordan', 'harley', 'robert', 'matthew', 'daniel', 'andrew',
  'joshua', 'anthony', 'william', 'david', 'charles', 'joseph',
  'thomas', 'christopher', 'blink182', 'iloveyou', 'princess',
  'rockyou', 'babygirl', 'lovely', 'jessica', 'michael', 'ashley',
  'nicole', 'chelsea', 'biteme', 'access', 'yankees', '987654321',
  'dallas', 'austin', 'thunder', 'taylor', 'matrix', 'corvette',
  'martin', 'heather', 'secret', 'merlin', 'diamond', 'freeuser',
  'hunter', 'tennis', 'cookie', 'tiger', 'cool', 'michelle',
  'purple', 'money', 'loveme', 'phoenix', 'bailey', 'sara',
  'summer', 'family', 'flowers', 'computer', 'lauren', 'gemini',
  'mother', 'beautiful', 'special', 'water', 'friend', 'goodluck',
  'hammer', 'silver', 'cooper', 'nothing', 'patricia', 'pepper',
  'john', 'good', 'security', 'magic', 'marcus', 'venus',
  'rainbow', 'jackass', 'sorry', 'helpme', 'dolphins', 'caroline',
  'greatest', 'stupid', 'spring', 'scott', 'golden', 'password1',
  '12345678', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'login',
  'pass', 'test', 'guest', 'user', 'root', 'administrator'
];

// Strict password policy configuration
const STRICT_PASSWORD_POLICY: PasswordPolicyConfig = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  passwordHistoryCount: 5,
  maxFailedAttempts: 5,
  lockoutDuration: 15,
  passwordExpiry: 90,
  enforceComplexity: true
};

// Password requirements with scoring
const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: 'length',
    description: 'At least 8 characters long',
    regex: /.{8,}/,
    points: 20
  },
  {
    id: 'uppercase',
    description: 'Contains uppercase letter (A-Z)',
    regex: /[A-Z]/,
    points: 20
  },
  {
    id: 'lowercase',
    description: 'Contains lowercase letter (a-z)',
    regex: /[a-z]/,
    points: 20
  },
  {
    id: 'numbers',
    description: 'Contains number (0-9)',
    regex: /[0-9]/,
    points: 20
  },
  {
    id: 'special',
    description: 'Contains special character (!@#$%^&*)',
    regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    points: 20
  },
  {
    id: 'noCommon',
    description: 'Not a common password',
    check: (password: string) => !BLOCKED_PASSWORDS.includes(password.toLowerCase()),
    points: 15
  },
  {
    id: 'noSequential',
    description: 'No sequential characters (abc, 123)',
    check: (password: string) => {
      const sequential = [
        'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk', 'jkl', 'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz',
        '123', '234', '345', '456', '567', '678', '789', '890', '012'
      ];
      return !sequential.some(seq => password.toLowerCase().includes(seq));
    },
    points: 10
  },
  {
    id: 'noRepetition',
    description: 'No excessive character repetition',
    check: (password: string) => !/(.)\1{2,}/.test(password),
    points: 10
  },
  {
    id: 'minComplexity',
    description: 'Good character variety',
    check: (password: string) => {
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
      return [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length >= 3;
    },
    points: 5
  }
];

export class PasswordPolicyService {
  private static readonly MAX_SCORE = PASSWORD_REQUIREMENTS.reduce((sum, req) => sum + req.points, 0);
  private static readonly MIN_PASSING_SCORE = 100; // Require at least 100 points to pass

  /**
   * Validate password against strict policy
   */
  static validatePassword(password: string): PasswordValidationResult {
    const results: PasswordValidationResult = {
      isValid: false,
      score: 0,
      maxScore: this.MAX_SCORE,
      percentage: 0,
      strength: 'Very Weak',
      color: 'red',
      errors: [],
      warnings: [],
      requirements: []
    };

    // Check each requirement
    PASSWORD_REQUIREMENTS.forEach(req => {
      let passed = false;
      
      if (req.regex) {
        passed = req.regex.test(password);
      } else if (req.check) {
        passed = req.check(password);
      }

      results.requirements.push({
        id: req.id,
        description: req.description,
        passed: passed,
        points: passed ? req.points : 0
      });

      if (passed) {
        results.score += req.points;
      } else {
        results.errors.push(req.description);
      }
    });

    // Calculate strength and percentage
    results.percentage = Math.round((results.score / results.maxScore) * 100);
    results.isValid = results.score >= this.MIN_PASSING_SCORE;

    // Determine strength level and color
    if (results.percentage >= 90) {
      results.strength = 'Very Strong';
      results.color = 'green';
    } else if (results.percentage >= 75) {
      results.strength = 'Strong';
      results.color = 'blue';
    } else if (results.percentage >= 60) {
      results.strength = 'Medium';
      results.color = 'yellow';
    } else if (results.percentage >= 40) {
      results.strength = 'Weak';
      results.color = 'orange';
    } else {
      results.strength = 'Very Weak';
      results.color = 'red';
    }

    // Add warnings for medium strength passwords
    if (results.percentage >= 60 && results.percentage < 75) {
      results.warnings.push('Consider adding more character variety for better security');
    }

    return results;
  }

  /**
   * Check if password is in blocked list
   */
  static isCommonPassword(password: string): boolean {
    return BLOCKED_PASSWORDS.includes(password.toLowerCase());
  }

  /**
   * Get password policy configuration
   */
  static getPolicy(): PasswordPolicyConfig {
    return { ...STRICT_PASSWORD_POLICY };
  }

  /**
   * Get password requirements list
   */
  static getRequirements(): PasswordRequirement[] {
    return [...PASSWORD_REQUIREMENTS];
  }

  /**
   * Generate password strength description
   */
  static getStrengthDescription(result: PasswordValidationResult): string {
    const { strength, percentage } = result;
    
    switch (strength) {
      case 'Very Strong':
        return `Excellent! Your password is very secure (${percentage}% strength).`;
      case 'Strong':
        return `Good! Your password is strong (${percentage}% strength).`;
      case 'Medium':
        return `Okay. Your password is acceptable but could be stronger (${percentage}% strength).`;
      case 'Weak':
        return `Weak. Your password needs improvement (${percentage}% strength).`;
      case 'Very Weak':
        return `Very weak. Your password is not secure (${percentage}% strength).`;
      default:
        return `Password strength: ${percentage}%`;
    }
  }

  /**
   * Get security recommendations
   */
  static getSecurityRecommendations(): string[] {
    return [
      'Use a unique password for each account',
      'Consider using a password manager',
      'Enable two-factor authentication when available',
      'Avoid using personal information in passwords',
      'Change passwords regularly (every 90 days)',
      'Never share your password with others',
      'Use passphrases with random words for better security'
    ];
  }

  /**
   * Check password against history (placeholder for future implementation)
   */
  static async checkPasswordHistory(userId: string, newPassword: string): Promise<boolean> {
    // TODO: Implement password history checking with Firestore
    // This would check against the last 5 passwords for the user
    console.log('Password history check for user:', userId);
    return true; // Allow for now
  }

  /**
   * Log security event (placeholder for future implementation)
   */
  static async logSecurityEvent(userId: string, eventType: string, details: any): Promise<void> {
    // TODO: Implement security event logging to Firestore
    console.log('Security event:', { userId, eventType, details, timestamp: new Date() });
  }
}

export default PasswordPolicyService;
