import { useState, useEffect } from 'react';
import { BadgeProgress, badgeService } from '@/services/badgeService';
import { useUser } from '@/hooks/useUser';

interface BadgeSummaryProps {
  userId?: string;
  maxDisplay?: number;
  showProgress?: boolean;
  compact?: boolean;
}

export function BadgeSummary({ 
  userId, 
  maxDisplay = 6, 
  showProgress = false,
  compact = false 
}: BadgeSummaryProps) {
  const { user } = useUser();
  const [badges, setBadges] = useState<BadgeProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.uid;

  useEffect(() => {
    if (targetUserId) {
      loadBadges();
    }
  }, [targetUserId]);

  const loadBadges = async () => {
    if (!targetUserId) return;

    try {
      setLoading(true);
      const progress = await badgeService.getBadgeProgress(targetUserId);
      setBadges(progress);
    } catch (error) {
      console.error('Error loading badge summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={compact ? 'space-y-2' : 'space-y-4'}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className={`grid gap-2 ${compact ? 'grid-cols-6' : 'grid-cols-3'}`}>
            {[...Array(maxDisplay)].map((_, i) => (
              <div key={i} className={`bg-gray-200 rounded ${compact ? 'h-8 w-8' : 'h-12 w-12'}`}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const earnedBadges = badges.filter(b => b.earned);
  const recentBadges = earnedBadges
    .sort((a, b) => (b.earnedAt?.getTime() || 0) - (a.earnedAt?.getTime() || 0))
    .slice(0, maxDisplay);

  const totalPoints = earnedBadges.reduce((sum, badge) => sum + (badge.badgeDefinition.points || 0), 0);

  if (compact) {
    return (
      <div className="flex items-center space-x-3">
        {/* Badge Icons */}
        <div className="flex -space-x-1">
          {recentBadges.slice(0, 4).map((badgeProgress, index) => (
            <div
              key={badgeProgress.badgeDefinition.id}
              className="w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center text-sm shadow-sm"
              style={{ zIndex: 4 - index }}
              title={badgeProgress.badgeDefinition.name}
            >
              {badgeProgress.badgeDefinition.icon}
            </div>
          ))}
          {earnedBadges.length > 4 && (
            <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-gray-200 flex items-center justify-center text-xs text-gray-600 shadow-sm">
              +{earnedBadges.length - 4}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="text-sm text-gray-600">
          <span className="font-medium">{earnedBadges.length}</span> badges
          {totalPoints > 0 && (
            <span className="ml-2">
              <span className="font-medium">{totalPoints}</span> pts
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Recent Badges</h3>
        <div className="text-sm text-gray-600">
          {earnedBadges.length} earned • {totalPoints} points
        </div>
      </div>

      {/* Badge Grid */}
      {recentBadges.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {recentBadges.map((badgeProgress) => (
            <div
              key={badgeProgress.badgeDefinition.id}
              className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm mb-2">
                {badgeProgress.badgeDefinition.icon}
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-gray-900 truncate w-full">
                  {badgeProgress.badgeDefinition.name}
                </p>
                {badgeProgress.earnedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    {badgeProgress.earnedAt.toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="text-3xl mb-2">🏆</div>
          <p className="text-sm text-gray-600">No badges earned yet</p>
          <p className="text-xs text-gray-500 mt-1">Complete goals to earn badges!</p>
        </div>
      )}

      {/* Progress Indicators */}
      {showProgress && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Next Badges</h4>
          {badges
            .filter(b => !b.earned && b.progress.percentage > 0)
            .sort((a, b) => b.progress.percentage - a.progress.percentage)
            .slice(0, 3)
            .map((badgeProgress) => (
              <div key={badgeProgress.badgeDefinition.id} className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center text-lg opacity-60">
                  {badgeProgress.badgeDefinition.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {badgeProgress.badgeDefinition.name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {Math.round(badgeProgress.progress.percentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, badgeProgress.progress.percentage)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* View All Link */}
      {earnedBadges.length > maxDisplay && (
        <div className="text-center">
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All {earnedBadges.length} Badges
          </button>
        </div>
      )}
    </div>
  );
}

interface BadgeStatsProps {
  userId?: string;
}

export function BadgeStats({ userId }: BadgeStatsProps) {
  const { user } = useUser();
  const [badges, setBadges] = useState<BadgeProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.uid;

  useEffect(() => {
    if (targetUserId) {
      loadBadges();
    }
  }, [targetUserId]);

  const loadBadges = async () => {
    if (!targetUserId) return;

    try {
      setLoading(true);
      const progress = await badgeService.getBadgeProgress(targetUserId);
      setBadges(progress);
    } catch (error) {
      console.error('Error loading badge stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  const earnedBadges = badges.filter(b => b.earned);
  const totalPoints = earnedBadges.reduce((sum, badge) => sum + (badge.badgeDefinition.points || 0), 0);
  
  const rarityCount = earnedBadges.reduce((acc, badge) => {
    const rarity = badge.badgeDefinition.rarity;
    acc[rarity] = (acc[rarity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryCount = earnedBadges.reduce((acc, badge) => {
    const category = badge.badgeDefinition.category;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    {
      label: 'Total Badges',
      value: earnedBadges.length,
      icon: '🏆',
      color: 'text-yellow-600'
    },
    {
      label: 'Total Points',
      value: totalPoints,
      icon: '⭐',
      color: 'text-blue-600'
    },
    {
      label: 'Legendary',
      value: rarityCount.legendary || 0,
      icon: '👑',
      color: 'text-yellow-600'
    },
    {
      label: 'Epic',
      value: rarityCount.epic || 0,
      icon: '💜',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <span className="text-2xl mr-3">{stat.icon}</span>
              <div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryCount).length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Badges by Category</h4>
          <div className="space-y-2">
            {Object.entries(categoryCount).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{category}</span>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
