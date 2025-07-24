import { useState, useEffect } from 'react';
import { BadgeDefinition, UserBadge, BadgeProgress, badgeService } from '@/services/badgeService';
import { useUser } from '@/hooks/useUser';

interface BadgeCardProps {
  badge: BadgeDefinition;
  earned?: boolean;
  earnedAt?: Date;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
}

export function BadgeCard({ 
  badge, 
  earned = false, 
  earnedAt, 
  progress, 
  size = 'medium',
  showProgress = true 
}: BadgeCardProps) {
  const sizeClasses = {
    small: 'w-16 h-16 text-2xl',
    medium: 'w-20 h-20 text-3xl',
    large: 'w-24 h-24 text-4xl'
  };

  const rarityColors = {
    common: 'border-gray-300 bg-gray-50',
    rare: 'border-blue-300 bg-blue-50',
    epic: 'border-purple-300 bg-purple-50',
    legendary: 'border-yellow-300 bg-yellow-50'
  };

  const progressPercentage = progress?.percentage || 0;

  return (
    <div className={`relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
      earned 
        ? `${rarityColors[badge.rarity]} shadow-sm` 
        : 'border-gray-200 bg-gray-100 opacity-60'
    }`}>
      {/* Badge Icon */}
      <div className={`${sizeClasses[size]} mx-auto mb-3 rounded-full flex items-center justify-center ${
        earned ? 'bg-white shadow-sm' : 'bg-gray-200'
      }`}>
        <span className={earned ? '' : 'grayscale opacity-50'}>
          {badge.icon}
        </span>
      </div>

      {/* Badge Info */}
      <div className="text-center">
        <h3 className={`font-semibold ${earned ? 'text-gray-900' : 'text-gray-500'} ${
          size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base'
        }`}>
          {badge.name}
        </h3>
        
        <p className={`text-xs mt-1 ${earned ? 'text-gray-600' : 'text-gray-400'}`}>
          {badge.description}
        </p>

        {/* Earned Date */}
        {earned && earnedAt && (
          <p className="text-xs text-gray-500 mt-2">
            Earned {earnedAt.toLocaleDateString()}
          </p>
        )}

        {/* Progress Bar */}
        {!earned && showProgress && progress && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{progress.current}</span>
              <span>{progress.target}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, progressPercentage)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round(progressPercentage)}% complete
            </p>
          </div>
        )}

        {/* Rarity Indicator */}
        <div className="mt-2">
          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
            badge.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
            badge.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
            badge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-600'
          }`}>
            {badge.rarity}
          </span>
        </div>
      </div>

      {/* Earned Badge Glow Effect */}
      {earned && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />
      )}
    </div>
  );
}

interface BadgeGridProps {
  badges: BadgeProgress[];
  title?: string;
  showEarnedOnly?: boolean;
  maxDisplay?: number;
  size?: 'small' | 'medium' | 'large';
}

export function BadgeGrid({ 
  badges, 
  title = "Achievements", 
  showEarnedOnly = false,
  maxDisplay,
  size = 'medium'
}: BadgeGridProps) {
  const filteredBadges = showEarnedOnly 
    ? badges.filter(b => b.earned)
    : badges;

  const displayBadges = maxDisplay 
    ? filteredBadges.slice(0, maxDisplay)
    : filteredBadges;

  const earnedCount = badges.filter(b => b.earned).length;
  const totalCount = badges.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <div className="text-sm text-gray-600">
          {earnedCount} of {totalCount} earned
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span>{Math.round((earnedCount / totalCount) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(earnedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Badge Grid */}
      <div className={`grid gap-4 ${
        size === 'small' ? 'grid-cols-6 md:grid-cols-8' :
        size === 'large' ? 'grid-cols-2 md:grid-cols-3' :
        'grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
      }`}>
        {displayBadges.map((badgeProgress) => (
          <BadgeCard
            key={badgeProgress.badgeDefinition.id}
            badge={badgeProgress.badgeDefinition}
            earned={badgeProgress.earned}
            earnedAt={badgeProgress.earnedAt}
            progress={badgeProgress.progress}
            size={size}
          />
        ))}
      </div>

      {/* Show More Link */}
      {maxDisplay && filteredBadges.length > maxDisplay && (
        <div className="text-center">
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All {filteredBadges.length} Badges
          </button>
        </div>
      )}

      {/* Empty State */}
      {displayBadges.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showEarnedOnly ? 'No badges earned yet' : 'No badges available'}
          </h3>
          <p className="text-gray-600">
            {showEarnedOnly 
              ? 'Start completing goals to earn your first badge!'
              : 'Badge definitions will appear here when available.'
            }
          </p>
        </div>
      )}
    </div>
  );
}

interface BadgeNotificationProps {
  badge: UserBadge;
  badgeDefinition: BadgeDefinition;
  onClose: () => void;
  show: boolean;
}

export function BadgeNotification({ badge, badgeDefinition, onClose, show }: BadgeNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 5000); // Auto-close after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-white rounded-lg shadow-lg border-2 border-yellow-300 p-6 max-w-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">
              {badgeDefinition.icon}
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Badge Earned!
              </h3>
              <button
                onClick={onClose}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {badgeDefinition.name}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {badgeDefinition.description}
            </p>
            <div className="mt-3">
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                badgeDefinition.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                badgeDefinition.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                badgeDefinition.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-600'
              }`}>
                {badgeDefinition.rarity} • {badgeDefinition.points} points
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BadgeManager() {
  const { user } = useUser();
  const [badges, setBadges] = useState<BadgeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBadges, setNewBadges] = useState<{ badge: UserBadge; definition: BadgeDefinition }[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<{ badge: UserBadge; definition: BadgeDefinition } | null>(null);

  useEffect(() => {
    if (user) {
      loadBadges();
      checkForNewBadges();
    }
  }, [user]);

  const loadBadges = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const progress = await badgeService.getBadgeProgress(user.uid);
      setBadges(progress);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewBadges = async () => {
    if (!user) return;

    try {
      const newlyEarned = await badgeService.checkAndAwardBadges(user.uid);
      
      if (newlyEarned.length > 0) {
        const definitions = await badgeService.loadBadgeDefinitions();
        const newBadgeData = newlyEarned.map(badge => ({
          badge,
          definition: definitions.find(d => d.id === badge.badgeDefinitionId)!
        })).filter(item => item.definition);

        setNewBadges(newBadgeData);
        
        // Show first notification
        if (newBadgeData.length > 0) {
          setCurrentNotification(newBadgeData[0]);
          setShowNotification(true);
        }

        // Reload badges to show updated state
        await loadBadges();
      }
    } catch (error) {
      console.error('Error checking for new badges:', error);
    }
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
    setCurrentNotification(null);
    
    // Show next notification if any
    const remainingBadges = newBadges.slice(1);
    if (remainingBadges.length > 0) {
      setNewBadges(remainingBadges);
      setTimeout(() => {
        setCurrentNotification(remainingBadges[0]);
        setShowNotification(true);
      }, 500);
    } else {
      setNewBadges([]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BadgeGrid badges={badges} />
      
      {/* Badge Notification */}
      {currentNotification && (
        <BadgeNotification
          badge={currentNotification.badge}
          badgeDefinition={currentNotification.definition}
          onClose={handleNotificationClose}
          show={showNotification}
        />
      )}
    </div>
  );
}
