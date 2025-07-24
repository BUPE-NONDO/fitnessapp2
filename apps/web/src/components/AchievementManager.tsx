import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { achievementService, Achievement } from '@/services/achievementService';
import { 
  GoalCompletionCelebration, 
  StreakCelebration, 
  MilestoneAnimation 
} from './CelebrationAnimations';

interface AchievementManagerProps {
  onAchievementEarned?: (achievement: Achievement) => void;
}

export function AchievementManager({ onAchievementEarned }: AchievementManagerProps) {
  const { user } = useUser();
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (user) {
      checkForAchievements();
      
      // Set up periodic checking (every 30 seconds)
      const interval = setInterval(checkForAchievements, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    // Process achievement queue
    if (achievementQueue.length > 0 && !currentAchievement) {
      const nextAchievement = achievementQueue[0];
      setCurrentAchievement(nextAchievement);
      setAchievementQueue(prev => prev.slice(1));
      onAchievementEarned?.(nextAchievement);
    }
  }, [achievementQueue, currentAchievement, onAchievementEarned]);

  const checkForAchievements = async () => {
    if (!user || isChecking) return;

    try {
      setIsChecking(true);
      const newAchievements = await achievementService.checkForNewAchievements(user.uid);
      
      if (newAchievements.length > 0) {
        setAchievementQueue(prev => [...prev, ...newAchievements]);
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleAchievementClose = () => {
    if (currentAchievement) {
      achievementService.markAchievementCelebrated(currentAchievement.id);
      setCurrentAchievement(null);
    }
  };

  const renderAchievement = () => {
    if (!currentAchievement) return null;

    switch (currentAchievement.type) {
      case 'goal_completed':
        return (
          <GoalCompletionCelebration
            goal={{
              title: currentAchievement.title.replace('Goal Achieved!', '').trim(),
              id: currentAchievement.goalId
            }}
            show={true}
            onClose={handleAchievementClose}
          />
        );

      case 'streak_milestone':
        return (
          <StreakCelebration
            streakDays={currentAchievement.streakDays || 0}
            show={true}
            onClose={handleAchievementClose}
          />
        );

      case 'first_goal':
      case 'first_log':
      case 'consistency':
      case 'overachiever':
        return (
          <MilestoneAnimation
            milestone={{
              type: currentAchievement.type as any,
              title: currentAchievement.title,
              description: currentAchievement.description,
              icon: currentAchievement.icon
            }}
            show={true}
            onClose={handleAchievementClose}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {renderAchievement()}
      
      {/* Achievement Queue Indicator */}
      {achievementQueue.length > 0 && !currentAchievement && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-primary-500 text-white rounded-full p-3 shadow-lg animate-bounce">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🎉</span>
              <span className="text-sm font-medium">
                {achievementQueue.length} achievement{achievementQueue.length > 1 ? 's' : ''} earned!
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Hook for manual achievement checking
export function useAchievements() {
  const { user } = useUser();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const checkAchievements = async () => {
    if (!user) return [];

    try {
      setIsLoading(true);
      const newAchievements = await achievementService.checkForNewAchievements(user.uid);
      setAchievements(newAchievements);
      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const markCelebrated = (achievementId: string) => {
    achievementService.markAchievementCelebrated(achievementId);
    setAchievements(prev => 
      prev.map(achievement => 
        achievement.id === achievementId 
          ? { ...achievement, celebrated: true }
          : achievement
      )
    );
  };

  return {
    achievements,
    isLoading,
    checkAchievements,
    markCelebrated
  };
}

// Component for triggering celebrations manually (for testing)
export function CelebrationTrigger() {
  const [showGoalCelebration, setShowGoalCelebration] = useState(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [showMilestoneCelebration, setShowMilestoneCelebration] = useState(false);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-2">
      <button
        onClick={() => setShowGoalCelebration(true)}
        className="block bg-green-500 text-white px-3 py-1 rounded text-xs"
      >
        Test Goal
      </button>
      <button
        onClick={() => setShowStreakCelebration(true)}
        className="block bg-orange-500 text-white px-3 py-1 rounded text-xs"
      >
        Test Streak
      </button>
      <button
        onClick={() => setShowMilestoneCelebration(true)}
        className="block bg-purple-500 text-white px-3 py-1 rounded text-xs"
      >
        Test Milestone
      </button>

      <GoalCompletionCelebration
        goal={{ title: "Test Goal", id: "test" }}
        show={showGoalCelebration}
        onClose={() => setShowGoalCelebration(false)}
      />

      <StreakCelebration
        streakDays={7}
        show={showStreakCelebration}
        onClose={() => setShowStreakCelebration(false)}
      />

      <MilestoneAnimation
        milestone={{
          type: 'first_goal',
          title: 'First Goal Created!',
          description: 'Welcome to your fitness journey!',
          icon: '🎯'
        }}
        show={showMilestoneCelebration}
        onClose={() => setShowMilestoneCelebration(false)}
      />
    </div>
  );
}
