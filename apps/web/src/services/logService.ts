import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CreateLogEntry, LogEntry } from '@fitness-app/shared';

export class LogService {
  private collectionName = 'logs';

  /**
   * Create a new log entry
   */
  async createLog(userId: string, logData: CreateLogEntry): Promise<LogEntry> {
    try {
      console.log('Creating log:', { userId, logData });

      const logToCreate = {
        ...logData,
        userId,
        date: logData.date ? Timestamp.fromDate(logData.date) : Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, this.collectionName), logToCreate);
      
      console.log('Log created with ID:', docRef.id);

      const createdLog: LogEntry = {
        id: docRef.id,
        ...logData,
        userId,
        date: logData.date || new Date(),
        createdAt: logToCreate.createdAt.toDate(),
        updatedAt: logToCreate.updatedAt.toDate(),
      };

      return createdLog;
    } catch (error) {
      console.error('Error creating log:', error);
      throw new Error(`Failed to create log: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all logs for a user
   */
  async getUserLogs(userId: string): Promise<LogEntry[]> {
    try {
      console.log('Fetching logs for user:', userId);

      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      const logs: LogEntry[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as LogEntry;
      });

      console.log('Fetched logs:', logs.length);
      return logs;
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw new Error(`Failed to fetch logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get logs for a specific goal
   */
  async getLogsByGoal(goalId: string): Promise<LogEntry[]> {
    try {
      console.log('Fetching logs for goal:', goalId);

      const q = query(
        collection(db, this.collectionName),
        where('goalId', '==', goalId),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      const logs: LogEntry[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as LogEntry;
      });

      console.log('Fetched logs for goal:', logs.length);
      return logs;
    } catch (error) {
      console.error('Error fetching logs by goal:', error);
      throw new Error(`Failed to fetch logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a specific log by ID
   */
  async getLog(logId: string): Promise<LogEntry | null> {
    try {
      const docRef = doc(db, this.collectionName, logId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          date: data.date?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as LogEntry;
      }

      return null;
    } catch (error) {
      console.error('Error fetching log:', error);
      throw new Error(`Failed to fetch log: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update a log entry
   */
  async updateLog(logId: string, updates: Partial<CreateLogEntry>): Promise<LogEntry> {
    try {
      const docRef = doc(db, this.collectionName, logId);
      
      const updateData = {
        ...updates,
        ...(updates.date && { date: Timestamp.fromDate(updates.date) }),
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, updateData);

      // Fetch and return the updated log
      const updatedLog = await this.getLog(logId);
      if (!updatedLog) {
        throw new Error('Log not found after update');
      }

      return updatedLog;
    } catch (error) {
      console.error('Error updating log:', error);
      throw new Error(`Failed to update log: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a log entry
   */
  async deleteLog(logId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, logId);
      await deleteDoc(docRef);
      console.log('Log deleted:', logId);
    } catch (error) {
      console.error('Error deleting log:', error);
      throw new Error(`Failed to delete log: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get logs within a date range
   */
  async getLogsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<LogEntry[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      const logs: LogEntry[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as LogEntry;
      });

      return logs;
    } catch (error) {
      console.error('Error fetching logs by date range:', error);
      throw new Error(`Failed to fetch logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const logService = new LogService();
