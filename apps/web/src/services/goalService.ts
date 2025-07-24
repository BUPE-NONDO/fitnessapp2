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
import { CreateGoal, Goal } from '@fitness-app/shared';

export class GoalService {
  private collectionName = 'goals';

  /**
   * Create a new goal
   */
  async createGoal(userId: string, goalData: CreateGoal): Promise<Goal> {
    try {
      console.log('Creating goal:', { userId, goalData });

      const goalToCreate = {
        ...goalData,
        userId,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, this.collectionName), goalToCreate);
      
      console.log('Goal created with ID:', docRef.id);

      const createdGoal: Goal = {
        id: docRef.id,
        ...goalToCreate,
        createdAt: goalToCreate.createdAt.toDate(),
        updatedAt: goalToCreate.updatedAt.toDate(),
      };

      return createdGoal;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw new Error(`Failed to create goal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all goals for a user
   */
  async getUserGoals(userId: string): Promise<Goal[]> {
    try {
      console.log('Fetching goals for user:', userId);

      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      const goals: Goal[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Goal;
      });

      console.log('Fetched goals:', goals.length);
      return goals;
    } catch (error) {
      console.error('Error fetching goals:', error);
      throw new Error(`Failed to fetch goals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a specific goal by ID
   */
  async getGoal(goalId: string): Promise<Goal | null> {
    try {
      const docRef = doc(db, this.collectionName, goalId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Goal;
      }

      return null;
    } catch (error) {
      console.error('Error fetching goal:', error);
      throw new Error(`Failed to fetch goal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update a goal
   */
  async updateGoal(goalId: string, updates: Partial<CreateGoal>): Promise<Goal> {
    try {
      const docRef = doc(db, this.collectionName, goalId);
      
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, updateData);

      // Fetch and return the updated goal
      const updatedGoal = await this.getGoal(goalId);
      if (!updatedGoal) {
        throw new Error('Goal not found after update');
      }

      return updatedGoal;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw new Error(`Failed to update goal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a goal
   */
  async deleteGoal(goalId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, goalId);
      await deleteDoc(docRef);
      console.log('Goal deleted:', goalId);
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw new Error(`Failed to delete goal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Toggle goal active status
   */
  async toggleGoalStatus(goalId: string): Promise<Goal> {
    try {
      const goal = await this.getGoal(goalId);
      if (!goal) {
        throw new Error('Goal not found');
      }

      return await this.updateGoal(goalId, { 
        isActive: !goal.isActive 
      });
    } catch (error) {
      console.error('Error toggling goal status:', error);
      throw new Error(`Failed to toggle goal status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const goalService = new GoalService();
