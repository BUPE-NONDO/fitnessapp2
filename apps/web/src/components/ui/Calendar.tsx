import React, { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  type: 'workout' | 'achievement' | 'goal' | 'reminder';
  description?: string;
  color?: string;
}

interface CalendarProps {
  events?: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onEventSelect?: (event: CalendarEvent) => void;
  onAddEvent?: (date: Date) => void;
  selectedDate?: Date;
  className?: string;
  showAddButton?: boolean;
}

export function Calendar({
  events = [],
  onDateSelect,
  onEventSelect,
  onAddEvent,
  selectedDate,
  className = '',
  showAddButton = true
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get first day of the month and calculate calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Generate calendar days
  const calendarDays = [];
  
  // Previous month days
  const prevMonth = new Date(currentYear, currentMonth - 1, 0);
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(currentYear, currentMonth - 1, prevMonth.getDate() - i),
      isCurrentMonth: false,
      isPrevMonth: true
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      date: new Date(currentYear, currentMonth, day),
      isCurrentMonth: true,
      isPrevMonth: false
    });
  }

  // Next month days to fill the grid
  const remainingDays = 42 - calendarDays.length; // 6 rows × 7 days
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      date: new Date(currentYear, currentMonth + 1, day),
      isCurrentMonth: false,
      isPrevMonth: false
    });
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'workout': return 'bg-blue-500';
      case 'achievement': return 'bg-yellow-500';
      case 'goal': return 'bg-green-500';
      case 'reminder': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const handleDateClick = (date: Date) => {
    onDateSelect?.(date);
  };

  const handleAddEvent = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddEvent?.(date);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700', className)}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setViewMode('month')}
              className={cn(
                'px-3 py-1 text-xs rounded-md transition-colors',
                viewMode === 'month'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                'px-3 py-1 text-xs rounded-md transition-colors',
                viewMode === 'week'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              Week
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <Icon name="chevron_left" size={20} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <Icon name="chevron_right" size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((calendarDay, index) => {
            const dayEvents = getEventsForDate(calendarDay.date);
            const isCurrentDay = isToday(calendarDay.date);
            const isSelectedDay = isSelected(calendarDay.date);

            return (
              <div
                key={index}
                onClick={() => handleDateClick(calendarDay.date)}
                className={cn(
                  'relative p-2 min-h-[60px] cursor-pointer transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600 rounded-lg',
                  {
                    'text-gray-400 dark:text-gray-600': !calendarDay.isCurrentMonth,
                    'text-gray-900 dark:text-white': calendarDay.isCurrentMonth,
                    'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700': isSelectedDay,
                    'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700': isCurrentDay && !isSelectedDay,
                  }
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    'text-sm font-medium',
                    isCurrentDay && 'text-green-600 dark:text-green-400'
                  )}>
                    {calendarDay.date.getDate()}
                  </span>
                  
                  {showAddButton && calendarDay.isCurrentMonth && (
                    <button
                      onClick={(e) => handleAddEvent(calendarDay.date, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all"
                      title="Add event"
                    >
                      <Icon name="add" size={12} />
                    </button>
                  )}
                </div>

                {/* Events */}
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventSelect?.(event);
                      }}
                      className={cn(
                        'text-xs px-2 py-1 rounded text-white cursor-pointer hover:opacity-80 transition-opacity',
                        event.color || getEventTypeColor(event.type)
                      )}
                      title={event.title}
                    >
                      {event.title.length > 10 ? `${event.title.slice(0, 10)}...` : event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
