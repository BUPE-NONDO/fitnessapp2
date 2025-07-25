import React, { useState, useEffect } from 'react';
import { Icon, BadgeIcon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  type: 'onboarding' | 'progress' | 'milestone' | 'streak' | 'goal';
}

interface AchievementCelebrationProps {
  achievement: Achievement;
  isVisible: boolean;
  onClose: () => void;
  onShare?: () => void;
}

export function AchievementCelebration({ 
  achievement, 
  isVisible, 
  onClose, 
  onShare 
}: AchievementCelebrationProps) {
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'celebrate' | 'exit'>('enter');
  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([]);

  useEffect(() => {
    if (isVisible) {
      // Generate confetti pieces
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][Math.floor(Math.random() * 5)],
        delay: Math.random() * 2,
      }));
      setConfettiPieces(pieces);

      // Animation sequence
      setAnimationPhase('enter');
      
      const celebrateTimer = setTimeout(() => {
        setAnimationPhase('celebrate');
      }, 500);

      return () => clearTimeout(celebrateTimer);
    }
  }, [isVisible]);

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityText = (rarity: string) => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  const handleClose = () => {
    setAnimationPhase('exit');
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiPieces.map((piece) => (
          <div
            key={piece.id}
            className="absolute w-2 h-2 rounded-full animate-bounce"
            style={{
              left: `${piece.x}%`,
              top: `${piece.y}%`,
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: '3s',
            }}
          />
        ))}
      </div>

      {/* Main Modal */}
      <div
        className={cn(
          'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transition-all duration-500',
          animationPhase === 'enter' && 'scale-50 opacity-0',
          animationPhase === 'celebrate' && 'scale-100 opacity-100',
          animationPhase === 'exit' && 'scale-95 opacity-0'
        )}
      >
        {/* Header with Rarity Indicator */}
        <div className={cn(
          'h-2 bg-gradient-to-r',
          getRarityGradient(achievement.rarity)
        )} />

        {/* Content */}
        <div className="p-8 text-center space-y-6">
          {/* Achievement Icon */}
          <div className="relative">
            <div
              className={cn(
                'w-24 h-24 mx-auto rounded-full flex items-center justify-center shadow-2xl transition-all duration-1000',
                animationPhase === 'celebrate' && 'animate-pulse scale-110'
              )}
              style={{
                background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
              }}
            >
              <div className={cn(
                'w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center',
                'bg-gradient-to-br',
                getRarityGradient(achievement.rarity)
              )}>
                <BadgeIcon 
                  name={achievement.icon as any} 
                  rarity={achievement.rarity}
                  size="lg"
                  className="text-white"
                />
              </div>
            </div>
            
            {/* Sparkle Effects */}
            {animationPhase === 'celebrate' && (
              <>
                <div className="absolute -top-2 -right-2 animate-ping">
                  <Icon name="sparkles" size={16} className="text-yellow-400" />
                </div>
                <div className="absolute -bottom-2 -left-2 animate-ping" style={{ animationDelay: '0.5s' }}>
                  <Icon name="sparkles" size={12} className="text-blue-400" />
                </div>
                <div className="absolute top-0 left-0 animate-ping" style={{ animationDelay: '1s' }}>
                  <Icon name="sparkles" size={14} className="text-purple-400" />
                </div>
              </>
            )}
          </div>

          {/* Achievement Info */}
          <div className="space-y-3">
            <div className={cn(
              'inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r',
              getRarityGradient(achievement.rarity)
            )}>
              {getRarityText(achievement.rarity)} Achievement
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {achievement.title}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400">
              {achievement.description}
            </p>

            {/* Points */}
            <div className="flex items-center justify-center space-x-2">
              <Icon name="star" size={20} className="text-yellow-500" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                +{achievement.points} points
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {onShare && (
              <button
                onClick={onShare}
                className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Icon name="sparkles" size={18} />
                <span>Share</span>
              </button>
            )}
            
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors duration-200"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Milestone Celebration Component
interface MilestoneCelebrationProps {
  milestone: {
    title: string;
    description: string;
    value: number;
    type: 'streak' | 'workouts' | 'goals' | 'weight';
    icon: string;
  };
  isVisible: boolean;
  onClose: () => void;
}

export function MilestoneCelebration({ 
  milestone, 
  isVisible, 
  onClose 
}: MilestoneCelebrationProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={cn(
        'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-8 text-center space-y-6 transition-all duration-500',
        isAnimating ? 'scale-110' : 'scale-100'
      )}>
        {/* Milestone Icon */}
        <div className="relative">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <Icon name={milestone.icon as any} size={40} className="text-white" />
          </div>
          
          {/* Celebration Ring */}
          <div className={cn(
            'absolute inset-0 border-4 border-green-400 rounded-full',
            isAnimating && 'animate-ping'
          )} />
        </div>

        {/* Milestone Info */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Milestone Reached! 🎉
          </h2>
          
          <div className="text-4xl font-bold text-green-500">
            {milestone.value}
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {milestone.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400">
            {milestone.description}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}

// Onboarding Completion Celebration
interface OnboardingCelebrationProps {
  isVisible: boolean;
  onClose: () => void;
  userName?: string;
}

export function OnboardingCelebration({ 
  isVisible, 
  onClose, 
  userName 
}: OnboardingCelebrationProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        if (step < 2) {
          setStep(step + 1);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, step]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center z-50 p-4">
      <div className="text-center text-white space-y-8 max-w-md">
        {/* Step 1: Welcome */}
        {step >= 0 && (
          <div className={cn(
            'transition-all duration-1000',
            step === 0 ? 'opacity-100 scale-100' : 'opacity-50 scale-95'
          )}>
            <div className="w-32 h-32 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6">
              <Icon name="rocket" size={64} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Welcome{userName ? `, ${userName}` : ''}! 🎉
            </h1>
            <p className="text-xl text-blue-100">
              Your fitness journey begins now
            </p>
          </div>
        )}

        {/* Step 2: Goals Set */}
        {step >= 1 && (
          <div className={cn(
            'transition-all duration-1000',
            step === 1 ? 'opacity-100 scale-100' : 'opacity-50 scale-95'
          )}>
            <div className="w-24 h-24 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6">
              <Icon name="target" size={48} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">
              Goals Set! ✅
            </h2>
            <p className="text-blue-100">
              Your personalized plan is ready
            </p>
          </div>
        )}

        {/* Step 3: Ready to Start */}
        {step >= 2 && (
          <div className={cn(
            'transition-all duration-1000',
            step === 2 ? 'opacity-100 scale-100' : 'opacity-50 scale-95'
          )}>
            <div className="w-24 h-24 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6">
              <Icon name="zap" size={48} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">
              Let's Get Started! 💪
            </h2>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Start My Journey
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AchievementCelebration;
