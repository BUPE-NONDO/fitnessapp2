import { useState, useEffect } from 'react';
import { CalendarEvent } from '@/components/ui/Calendar';
import { CalendarService } from '@/services/calendarService';
import { useUser } from '@/hooks/useUser';

export function useCalendar() {
  const { user } = useUser();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user events
  const loadEvents = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const userEvents = await CalendarService.getUserEvents(user.uid);
      setEvents(userEvents);
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new event
  const createEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      const eventId = await CalendarService.createEvent(user.uid, eventData);
      
      // Add to local state
      const newEvent: CalendarEvent = {
        ...eventData,
        id: eventId
      };
      setEvents(prev => [...prev, newEvent].sort((a, b) => a.date.getTime() - b.date.getTime()));
      
      return eventId;
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
      throw err;
    }
  };

  // Update event
  const updateEvent = async (eventId: string, updates: Partial<Omit<CalendarEvent, 'id'>>) => {
    try {
      setError(null);
      await CalendarService.updateEvent(eventId, updates);
      
      // Update local state
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { ...event, ...updates }
            : event
        ).sort((a, b) => a.date.getTime() - b.date.getTime())
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update event');
      throw err;
    }
  };

  // Delete event
  const deleteEvent = async (eventId: string) => {
    try {
      setError(null);
      await CalendarService.deleteEvent(eventId);
      
      // Remove from local state
      setEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete event');
      throw err;
    }
  };

  // Get events for specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  // Get upcoming events (next 7 days)
  const getUpcomingEvents = (): CalendarEvent[] => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return events.filter(event => 
      event.date >= today && event.date <= nextWeek
    ).slice(0, 5); // Limit to 5 events
  };

  // Get today's events
  const getTodaysEvents = (): CalendarEvent[] => {
    const today = new Date();
    return events.filter(event => 
      event.date.toDateString() === today.toDateString()
    );
  };

  // Create achievement celebration
  const createAchievementCelebration = async (achievementTitle: string, date?: Date) => {
    if (!user) return;

    return createEvent({
      title: `🏆 ${achievementTitle}`,
      description: 'Achievement unlocked! Celebrate your progress.',
      date: date || new Date(),
      type: 'achievement',
      color: 'bg-yellow-500'
    });
  };

  // Create workout reminder
  const createWorkoutReminder = async (
    workoutTitle: string, 
    date: Date, 
    time: string = '09:00'
  ) => {
    if (!user) return;

    return createEvent({
      title: workoutTitle,
      description: 'Scheduled workout session',
      date,
      time,
      type: 'workout',
      color: 'bg-blue-500'
    });
  };

  // Create goal deadline
  const createGoalDeadline = async (goalTitle: string, deadlineDate: Date) => {
    if (!user) return;

    return createEvent({
      title: `🎯 ${goalTitle} Deadline`,
      description: 'Goal deadline approaching',
      date: deadlineDate,
      type: 'goal',
      color: 'bg-green-500'
    });
  };

  // Create recurring events
  const createRecurringEvent = async (
    eventData: Omit<CalendarEvent, 'id'>,
    pattern: 'daily' | 'weekly' | 'monthly',
    endDate: Date,
    occurrences?: number
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      const eventIds = await CalendarService.createRecurringEvent(
        user.uid,
        eventData,
        pattern,
        endDate,
        occurrences
      );
      
      // Reload events to get all created events
      await loadEvents();
      
      return eventIds;
    } catch (err: any) {
      setError(err.message || 'Failed to create recurring events');
      throw err;
    }
  };

  // Load events when user changes
  useEffect(() => {
    if (user) {
      loadEvents();
    } else {
      setEvents([]);
    }
  }, [user]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    events,
    loading,
    error,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    getUpcomingEvents,
    getTodaysEvents,
    createAchievementCelebration,
    createWorkoutReminder,
    createGoalDeadline,
    createRecurringEvent
  };
}
