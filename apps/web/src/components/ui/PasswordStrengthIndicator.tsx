import React from 'react';
import {
  validatePassword,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
  getPasswordStrengthBarColor,
  STRICT_PASSWORD_REQUIREMENTS,
  PasswordRequirements
} from '@/utils/passwordValidation';

interface PasswordStrengthIndicatorProps {
  password: string;
  requirements?: PasswordRequirements;
  showRequirements?: boolean;
  compact?: boolean;
  className?: string;
}

export function PasswordStrengthIndicator({
  password,
  requirements = STRICT_PASSWORD_REQUIREMENTS,
  showRequirements = true,
  compact = false,
  className = ''
}: PasswordStrengthIndicatorProps) {
  const validation = validatePassword(password, requirements);
  const strengthLabel = getPasswordStrengthLabel(validation.percentage);
  const strengthColor = getPasswordStrengthColor(validation.percentage);
  const barColor = getPasswordStrengthBarColor(validation.percentage);

  if (!password) return null;

  if (compact) {
    return (
      <div className={`space-y-1 ${className}`}>
        {/* Ultra Compact Strength Bar */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-slate-700/50 rounded-full h-1">
            <div
              className={`h-1 rounded-full transition-all duration-300 ${barColor}`}
              style={{ width: `${validation.percentage}%` }}
            />
          </div>
          <span className={`text-xs font-medium ${strengthColor} min-w-0`}>
            {validation.percentage}%
          </span>
        </div>

        {/* Show only critical errors */}
        {!validation.isValid && validation.errors.length > 0 && (
          <div className="text-xs text-red-400">
            {validation.errors.slice(0, 1).join('')}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-300">Password Strength</span>
          <span className={`text-sm font-medium ${strengthColor}`}>
            {strengthLabel}
          </span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${validation.percentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">Score: {validation.score}/{validation.maxScore}</span>
          <span className="text-slate-400">{validation.percentage}%</span>
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-200">Security Requirements:</h4>
          <div className="space-y-1">
            {validation.requirements.map((req, index) => (
              <RequirementItem
                key={req.id}
                met={req.passed}
                text={req.description}
                points={req.points}
              />
            ))}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Minimum score required: 100 points for account creation
          </div>
        </div>
      )}

      {/* Errors */}
      {validation.errors.length > 0 && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <div key={index} className="flex items-center space-x-2 text-red-400">
              <span className="text-xs">❌</span>
              <span className="text-xs">{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <div className="space-y-1">
          <h5 className="text-xs font-medium text-yellow-400">⚠️ Warnings:</h5>
          {validation.warnings.map((warning, index) => (
            <div key={index} className="flex items-center space-x-2 text-yellow-400">
              <span className="text-xs">⚠️</span>
              <span className="text-xs">{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {validation.suggestions.length > 0 && (
        <div className="space-y-1">
          <h5 className="text-xs font-medium text-slate-300">💡 Security Tips:</h5>
          {validation.suggestions.slice(0, 3).map((suggestion, index) => (
            <div key={index} className="flex items-center space-x-2 text-blue-400">
              <span className="text-xs">💡</span>
              <span className="text-xs">{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface RequirementItemProps {
  met: boolean;
  text: string;
  points?: number;
}

function RequirementItem({ met, text, points }: RequirementItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className={`text-xs ${met ? 'text-green-400' : 'text-slate-400'}`}>
          {met ? '✅' : '⭕'}
        </span>
        <span className={`text-xs ${met ? 'text-green-400' : 'text-slate-400'}`}>
          {text}
        </span>
      </div>
      {points && (
        <span className={`text-xs font-mono ${met ? 'text-green-400' : 'text-slate-500'}`}>
          +{points}
        </span>
      )}
    </div>
  );
}
