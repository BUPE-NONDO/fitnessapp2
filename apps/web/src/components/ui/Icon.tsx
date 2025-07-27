import React from 'react';

// Temporary fallback icons using emojis until lucide-react is installed
const fallbackIcons = {
  // Fitness & Health Icons
  activity: '🏃',
  dumbbell: '🏋️',
  heart: '❤️',
  target: '🎯',
  trending_up: '📈',
  zap: '⚡',
  timer: '⏱️',
  calendar: '📅',

  // Progress & Achievement Icons
  trophy: '🏆',
  award: '🥇',
  medal: '🏅',
  star: '⭐',
  crown: '👑',
  flame: '🔥',
  check_circle: '✅',
  circle: '⭕',

  // Navigation & UI Icons
  home: '🏠',
  user: '👤',
  settings: '⚙️',
  menu: '☰',
  x: '❌',
  close: '✖️',
  cancel: '❌',
  chevron_right: '▶️',
  chevron_left: '◀️',
  chevron_up: '🔼',
  chevron_down: '🔽',
  plus: '➕',
  minus: '➖',

  // Goal & Progress Icons
  bar_chart: '📊',
  line_chart: '📈',
  pie_chart: '📊',
  trending_down: '📉',
  arrow_up: '⬆️',
  arrow_down: '⬇️',

  // Onboarding Icons
  user_plus: '👤➕',
  sparkles: '✨',
  rocket: '🚀',
  map_pin: '📍',
  clock: '🕐',

  // Badge Category Icons
  shield: '🛡️',
  gem: '💎',
  hexagon: '⬡',

  // Utility Icons
  eye: '👁️',
  eye_off: '🙈',
  lock: '🔒',
  unlock: '🔓',
  mail: '📧',
  phone: '📞',
} as const;

// Icon mapping for easy access (using fallback emojis for now)
export const iconMap = fallbackIcons;

export type IconName = keyof typeof iconMap;

interface IconProps {
  name: IconName;
  size?: number | string;
  className?: string;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  className = '',
  color = 'currentColor',
  strokeWidth = 2
}) => {
  const iconEmoji = iconMap[name];

  if (!iconEmoji) {
    console.warn(`Icon "${name}" not found in iconMap`);
    return null;
  }

  return (
    <span
      className={className}
      style={{
        fontSize: typeof size === 'number' ? `${size}px` : size,
        color,
        display: 'inline-block',
        lineHeight: 1
      }}
    >
      {iconEmoji}
    </span>
  );
};

// Badge-specific icon component with predefined styles
interface BadgeIconProps {
  name: IconName;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({ 
  name, 
  rarity = 'common', 
  size = 'md',
  className = '' 
}) => {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
  };
  
  const rarityColors = {
    common: 'text-gray-600',
    rare: 'text-blue-600',
    epic: 'text-purple-600',
    legendary: 'text-yellow-600',
  };
  
  return (
    <Icon
      name={name}
      size={sizeMap[size]}
      className={`${rarityColors[rarity]} ${className}`}
    />
  );
};

// Progress icon with dynamic color based on completion
interface ProgressIconProps {
  name: IconName;
  progress: number; // 0-100
  size?: number;
  className?: string;
}

export const ProgressIcon: React.FC<ProgressIconProps> = ({ 
  name, 
  progress, 
  size = 20,
  className = '' 
}) => {
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-600';
    if (progress >= 75) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    if (progress >= 25) return 'text-orange-600';
    return 'text-gray-400';
  };
  
  return (
    <Icon
      name={name}
      size={size}
      className={`${getProgressColor(progress)} ${className}`}
    />
  );
};

export default Icon;
