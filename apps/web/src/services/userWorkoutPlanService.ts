import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export interface WorkoutPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  goal: string;
  fitnessLevel: string;
  duration: number; // weeks
  workoutsPerWeek: number;
  estimatedCaloriesPerWeek: number;
  weeklySchedule: WorkoutDay[];
  progressTracking: {
    currentWeek: number;
    completedWorkouts: number;
    totalWorkouts: number;
    startDate: Date;
    lastUpdated: Date;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutDay {
  id: string;
  dayOfWeek: string;
  name: string;
  type: string;
  duration: number;
  exercises: Exercise[];
  warmUp: Exercise[];
  coolDown: Exercise[];
  totalCalories: number;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscle: string;
  equipment: string;
  difficulty: string;
  sets: number;
  reps: string;
  duration?: number;
  restTime: number;
  instructions: string[];
  tips: string[];
  calories: number;
}

export class UserWorkoutPlanService {
  /**
   * Get the user's current active workout plan
   */
  static async getCurrentWorkoutPlan(userId: string): Promise<WorkoutPlan | null> {
    try {
      console.log(`🔍 Fetching current workout plan for user: ${userId}`);

      // First, check if user has a current workout plan ID in their profile
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentPlanId = userData.currentWorkoutPlanId;
        
        if (currentPlanId) {
          console.log(`📋 Found current plan ID: ${currentPlanId}`);
          return await this.getWorkoutPlanById(userId, currentPlanId);
        }
      }

      // If no current plan ID, get the most recent active plan
      console.log(`🔍 No current plan ID found, searching for most recent active plan...`);
      return await this.getMostRecentActivePlan(userId);
    } catch (error) {
      console.error('❌ Error fetching current workout plan:', error);
      return null;
    }
  }

  /**
   * Get a specific workout plan by ID
   */
  static async getWorkoutPlanById(userId: string, planId: string): Promise<WorkoutPlan | null> {
    try {
      const planRef = doc(db, 'users', userId, 'workout_plans', planId);
      const planDoc = await getDoc(planRef);
      
      if (planDoc.exists()) {
        const planData = planDoc.data();
        console.log(`✅ Found workout plan: ${planData.title}`);
        
        return {
          id: planDoc.id,
          ...planData,
          createdAt: planData.createdAt?.toDate() || new Date(),
          updatedAt: planData.updatedAt?.toDate() || new Date(),
          progressTracking: {
            ...planData.progressTracking,
            startDate: planData.progressTracking?.startDate?.toDate() || new Date(),
            lastUpdated: planData.progressTracking?.lastUpdated?.toDate() || new Date(),
          }
        } as WorkoutPlan;
      }
      
      console.log(`❌ Workout plan not found: ${planId}`);
      return null;
    } catch (error) {
      console.error('❌ Error fetching workout plan by ID:', error);
      return null;
    }
  }

  /**
   * Get the most recent active workout plan
   */
  static async getMostRecentActivePlan(userId: string): Promise<WorkoutPlan | null> {
    try {
      const plansRef = collection(db, 'users', userId, 'workout_plans');
      const q = query(
        plansRef,
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const planDoc = querySnapshot.docs[0];
        const planData = planDoc.data();
        console.log(`✅ Found most recent active plan: ${planData.title}`);
        
        return {
          id: planDoc.id,
          ...planData,
          createdAt: planData.createdAt?.toDate() || new Date(),
          updatedAt: planData.updatedAt?.toDate() || new Date(),
          progressTracking: {
            ...planData.progressTracking,
            startDate: planData.progressTracking?.startDate?.toDate() || new Date(),
            lastUpdated: planData.progressTracking?.lastUpdated?.toDate() || new Date(),
          }
        } as WorkoutPlan;
      }
      
      console.log(`❌ No active workout plans found for user: ${userId}`);
      return null;
    } catch (error) {
      console.error('❌ Error fetching most recent active plan:', error);
      return null;
    }
  }

  /**
   * Get all workout plans for a user
   */
  static async getAllWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
    try {
      const plansRef = collection(db, 'users', userId, 'workout_plans');
      const q = query(plansRef, orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      const plans: WorkoutPlan[] = [];
      
      querySnapshot.forEach((doc) => {
        const planData = doc.data();
        plans.push({
          id: doc.id,
          ...planData,
          createdAt: planData.createdAt?.toDate() || new Date(),
          updatedAt: planData.updatedAt?.toDate() || new Date(),
          progressTracking: {
            ...planData.progressTracking,
            startDate: planData.progressTracking?.startDate?.toDate() || new Date(),
            lastUpdated: planData.progressTracking?.lastUpdated?.toDate() || new Date(),
          }
        } as WorkoutPlan);
      });
      
      console.log(`✅ Found ${plans.length} workout plans for user: ${userId}`);
      return plans;
    } catch (error) {
      console.error('❌ Error fetching all workout plans:', error);
      return [];
    }
  }

  /**
   * Check if user has any workout plans
   */
  static async hasWorkoutPlan(userId: string): Promise<boolean> {
    try {
      const currentPlan = await this.getCurrentWorkoutPlan(userId);
      return currentPlan !== null;
    } catch (error) {
      console.error('❌ Error checking if user has workout plan:', error);
      return false;
    }
  }
}
