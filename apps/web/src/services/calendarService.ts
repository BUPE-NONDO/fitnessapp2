import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CalendarEvent } from '@/components/ui/Calendar';

export interface ScheduledEvent extends Omit<CalendarEvent, 'date'> {
  id: string;
  userId: string;
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  recurringEndDate?: Timestamp;
}

export class CalendarService {
  private static readonly COLLECTION = 'scheduledEvents';

  /**
   * Create a new scheduled event
   */
  static async createEvent(
    userId: string, 
    eventData: Omit<CalendarEvent, 'id'>
  ): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, this.COLLECTION), {
        ...eventData,
        userId,
        date: Timestamp.fromDate(eventData.date),
        createdAt: now,
        updatedAt: now
      });

      console.log('✅ Event created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating event:', error);
      throw new Error('Failed to create event');
    }
  }

  /**
   * Update an existing event
   */
  static async updateEvent(
    eventId: string, 
    updates: Partial<Omit<CalendarEvent, 'id'>>
  ): Promise<void> {
    try {
      const eventRef = doc(db, this.COLLECTION, eventId);
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now()
      };

      if (updates.date) {
        updateData.date = Timestamp.fromDate(updates.date);
      }

      await updateDoc(eventRef, updateData);
      console.log('✅ Event updated:', eventId);
    } catch (error) {
      console.error('❌ Error updating event:', error);
      throw new Error('Failed to update event');
    }
  }

  /**
   * Delete an event
   */
  static async deleteEvent(eventId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION, eventId));
      console.log('✅ Event deleted:', eventId);
    } catch (error) {
      console.error('❌ Error deleting event:', error);
      throw new Error('Failed to delete event');
    }
  }

  /**
   * Get all events for a user
   */
  static async getUserEvents(userId: string): Promise<CalendarEvent[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('userId', '==', userId),
        orderBy('date', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const events: CalendarEvent[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as ScheduledEvent;
        events.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          date: data.date.toDate(),
          time: data.time,
          type: data.type,
          color: data.color
        });
      });

      console.log('✅ Retrieved events:', events.length);
      return events;
    } catch (error) {
      console.error('❌ Error getting user events:', error);
      throw new Error('Failed to get events');
    }
  }

  /**
   * Get events for a specific date range
   */
  static async getEventsInRange(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<CalendarEvent[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const events: CalendarEvent[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as ScheduledEvent;
        events.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          date: data.date.toDate(),
          time: data.time,
          type: data.type,
          color: data.color
        });
      });

      return events;
    } catch (error) {
      console.error('❌ Error getting events in range:', error);
      throw new Error('Failed to get events');
    }
  }

  /**
   * Create recurring events
   */
  static async createRecurringEvent(
    userId: string,
    eventData: Omit<CalendarEvent, 'id'>,
    pattern: 'daily' | 'weekly' | 'monthly',
    endDate: Date,
    occurrences?: number
  ): Promise<string[]> {
    try {
      const eventIds: string[] = [];
      const startDate = new Date(eventData.date);
      const finalEndDate = endDate;
      
      let currentDate = new Date(startDate);
      let count = 0;
      const maxOccurrences = occurrences || 52; // Default to 1 year

      while (currentDate <= finalEndDate && count < maxOccurrences) {
        const eventId = await this.createEvent(userId, {
          ...eventData,
          date: new Date(currentDate),
          title: `${eventData.title}${count > 0 ? ` (${count + 1})` : ''}`
        });
        
        eventIds.push(eventId);
        count++;

        // Calculate next occurrence
        switch (pattern) {
          case 'daily':
            currentDate.setDate(currentDate.getDate() + 1);
            break;
          case 'weekly':
            currentDate.setDate(currentDate.getDate() + 7);
            break;
          case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
        }
      }

      console.log('✅ Created recurring events:', eventIds.length);
      return eventIds;
    } catch (error) {
      console.error('❌ Error creating recurring events:', error);
      throw new Error('Failed to create recurring events');
    }
  }

  /**
   * Get upcoming events (next 7 days)
   */
  static async getUpcomingEvents(userId: string): Promise<CalendarEvent[]> {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return this.getEventsInRange(userId, today, nextWeek);
  }

  /**
   * Get today's events
   */
  static async getTodaysEvents(userId: string): Promise<CalendarEvent[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    return this.getEventsInRange(userId, startOfDay, endOfDay);
  }

  /**
   * Create achievement celebration event
   */
  static async createAchievementEvent(
    userId: string,
    achievementTitle: string,
    achievementDate: Date = new Date()
  ): Promise<string> {
    return this.createEvent(userId, {
      title: `🏆 ${achievementTitle}`,
      description: 'Achievement unlocked! Celebrate your progress.',
      date: achievementDate,
      type: 'achievement',
      color: 'bg-yellow-500'
    });
  }

  /**
   * Create workout reminder event
   */
  static async createWorkoutReminder(
    userId: string,
    workoutTitle: string,
    workoutDate: Date,
    reminderTime: string = '09:00'
  ): Promise<string> {
    return this.createEvent(userId, {
      title: workoutTitle,
      description: 'Scheduled workout session',
      date: workoutDate,
      time: reminderTime,
      type: 'workout',
      color: 'bg-blue-500'
    });
  }

  /**
   * Create goal deadline event
   */
  static async createGoalDeadline(
    userId: string,
    goalTitle: string,
    deadlineDate: Date
  ): Promise<string> {
    return this.createEvent(userId, {
      title: `🎯 ${goalTitle} Deadline`,
      description: 'Goal deadline approaching',
      date: deadlineDate,
      type: 'goal',
      color: 'bg-green-500'
    });
  }
}
