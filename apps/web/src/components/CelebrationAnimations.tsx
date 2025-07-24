import { useState, useEffect } from 'react';

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

interface CelebrationProps {
  show: boolean;
  onComplete?: () => void;
  type?: 'confetti' | 'fireworks' | 'sparkles';
  duration?: number;
  intensity?: 'low' | 'medium' | 'high';
}

export function CelebrationAnimation({ 
  show, 
  onComplete, 
  type = 'confetti',
  duration = 3000,
  intensity = 'medium'
}: CelebrationProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const particleCount = {
    low: 30,
    medium: 50,
    high: 80
  }[intensity];

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  useEffect(() => {
    if (show && !isAnimating) {
      startCelebration();
    }
  }, [show]);

  const createParticle = (index: number): ConfettiParticle => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    return {
      id: index,
      x: centerX + (Math.random() - 0.5) * 200,
      y: centerY + (Math.random() - 0.5) * 100,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.random() * -8 - 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10
    };
  };

  const startCelebration = () => {
    setIsAnimating(true);
    
    const newParticles = Array.from({ length: particleCount }, (_, i) => createParticle(i));
    setParticles(newParticles);

    const animationInterval = setInterval(() => {
      setParticles(prevParticles => 
        prevParticles.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.3, // gravity
          rotation: particle.rotation + particle.rotationSpeed
        })).filter(particle => particle.y < window.innerHeight + 50)
      );
    }, 16);

    setTimeout(() => {
      clearInterval(animationInterval);
      setParticles([]);
      setIsAnimating(false);
      onComplete?.();
    }, duration);
  };

  if (!show && !isAnimating) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {type === 'confetti' && particles.map(particle => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%'
          }}
        />
      ))}
      
      {type === 'sparkles' && particles.map(particle => (
        <div
          key={particle.id}
          className="absolute animate-pulse"
          style={{
            left: particle.x,
            top: particle.y,
            fontSize: particle.size * 2,
            transform: `rotate(${particle.rotation}deg)`
          }}
        >
          ✨
        </div>
      ))}
    </div>
  );
}

interface GoalCompletionCelebrationProps {
  goal: any;
  show: boolean;
  onClose: () => void;
}

export function GoalCompletionCelebration({ goal, show, onClose }: GoalCompletionCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (show) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show) return null;

  return (
    <>
      <CelebrationAnimation 
        show={showConfetti} 
        type="confetti"
        intensity="high"
        onComplete={() => setShowConfetti(false)}
      />
      
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 animate-fade-in">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center animate-scale-in">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Goal Achieved!
          </h2>
          
          <h3 className="text-xl font-semibold text-primary-600 mb-4">
            {goal?.title}
          </h3>
          
          <p className="text-gray-600 mb-6">
            Congratulations! You've successfully completed your goal. 
            Keep up the amazing work!
          </p>
          
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">+50</div>
              <div className="text-sm text-gray-500">Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">🏆</div>
              <div className="text-sm text-gray-500">Achievement</div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="btn btn-primary w-full"
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
}

interface StreakCelebrationProps {
  streakDays: number;
  show: boolean;
  onClose: () => void;
}

export function StreakCelebration({ streakDays, show, onClose }: StreakCelebrationProps) {
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    if (show) {
      setShowSparkles(true);
      const timer = setTimeout(() => {
        setShowSparkles(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show) return null;

  const getStreakMessage = (days: number) => {
    if (days >= 30) return "Incredible dedication!";
    if (days >= 14) return "You're on fire!";
    if (days >= 7) return "Amazing consistency!";
    return "Great streak!";
  };

  const getStreakEmoji = (days: number) => {
    if (days >= 30) return "👑";
    if (days >= 14) return "🔥";
    if (days >= 7) return "⚡";
    return "🌟";
  };

  return (
    <>
      <CelebrationAnimation 
        show={showSparkles} 
        type="sparkles"
        intensity="medium"
        duration={2500}
      />
      
      <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
        <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-center">
            <div className="text-3xl mr-3 animate-pulse">
              {getStreakEmoji(streakDays)}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">
                {streakDays} Day Streak!
              </h3>
              <p className="text-sm opacity-90">
                {getStreakMessage(streakDays)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-2 text-white hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

interface MilestoneAnimationProps {
  milestone: {
    type: 'first_goal' | 'first_log' | 'week_complete' | 'month_complete';
    title: string;
    description: string;
    icon: string;
  };
  show: boolean;
  onClose: () => void;
}

export function MilestoneAnimation({ milestone, show, onClose }: MilestoneAnimationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center animate-scale-in">
        <div className="text-6xl mb-4 animate-bounce">
          {milestone.icon}
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {milestone.title}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {milestone.description}
        </p>
        
        <div className="w-full bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full mb-4 animate-pulse"></div>
        
        <button
          onClick={onClose}
          className="btn btn-primary"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}
