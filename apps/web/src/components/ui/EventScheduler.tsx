import React, { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';
import { CalendarEvent } from './Calendar';

interface EventSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  selectedDate?: Date;
  editEvent?: CalendarEvent;
}

export function EventScheduler({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  editEvent
}: EventSchedulerProps) {
  const [title, setTitle] = useState(editEvent?.title || '');
  const [description, setDescription] = useState(editEvent?.description || '');
  const [date, setDate] = useState(
    editEvent?.date || selectedDate || new Date()
  );
  const [time, setTime] = useState(editEvent?.time || '09:00');
  const [type, setType] = useState<CalendarEvent['type']>(editEvent?.type || 'workout');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const eventTypes = [
    { value: 'workout', label: 'Workout', icon: 'fitness_center', color: 'bg-blue-500' },
    { value: 'achievement', label: 'Achievement', icon: 'emoji_events', color: 'bg-yellow-500' },
    { value: 'goal', label: 'Goal', icon: 'flag', color: 'bg-green-500' },
    { value: 'reminder', label: 'Reminder', icon: 'notifications', color: 'bg-purple-500' }
  ] as const;

  const workoutTemplates = [
    'Morning Yoga',
    'Cardio Session',
    'Strength Training',
    'HIIT Workout',
    'Swimming',
    'Running',
    'Cycling',
    'Pilates',
    'Stretching',
    'Custom Workout'
  ];

  const handleSave = () => {
    if (!title.trim()) return;

    const eventData: Omit<CalendarEvent, 'id'> = {
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      type,
      color: eventTypes.find(t => t.value === type)?.color
    };

    onSave(eventData);
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setDate(new Date());
    setTime('09:00');
    setType('workout');
    setIsRecurring(false);
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (dateString: string) => {
    setDate(new Date(dateString));
  };

  const handleQuickTemplate = (template: string) => {
    setTitle(template);
    if (template.includes('Yoga') || template.includes('Stretching')) {
      setType('workout');
      setTime('07:00');
    } else if (template.includes('Cardio') || template.includes('HIIT')) {
      setType('workout');
      setTime('18:00');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editEvent ? 'Edit Event' : 'Schedule New Event'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Event Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {eventTypes.map(eventType => (
                <button
                  key={eventType.value}
                  onClick={() => setType(eventType.value)}
                  className={cn(
                    'flex items-center space-x-2 p-3 rounded-lg border-2 transition-all',
                    type === eventType.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  )}
                >
                  <div className={cn('w-4 h-4 rounded', eventType.color)}></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {eventType.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Templates (for workouts) */}
          {type === 'workout' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Quick Templates
              </label>
              <div className="flex flex-wrap gap-2">
                {workoutTemplates.slice(0, 6).map(template => (
                  <button
                    key={template}
                    onClick={() => handleQuickTemplate(template)}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about your event..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={formatDate(date)}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time
              </label>
              <input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Recurring Options */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <input
                id="recurring"
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="recurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Repeat this event
              </label>
            </div>
            
            {isRecurring && (
              <select
                value={recurringPattern}
                onChange={(e) => setRecurringPattern(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {editEvent ? 'Update' : 'Schedule'} Event
          </button>
        </div>
      </div>
    </div>
  );
}
