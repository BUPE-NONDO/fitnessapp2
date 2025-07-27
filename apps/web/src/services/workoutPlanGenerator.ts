import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { OnboardingData } from '@/components/onboarding/OnboardingWizard';

// Types for workout plan structure
export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  sets: number;
  reps: string;
  duration?: string;
  restTime: string;
  calories?: number;
  videoUrl?: string;
  imageUrl?: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export class WorkoutPlanGenerator {
  private static readonly COLLECTION_NAME = 'workout_plans';

  /**
   * Generate a comprehensive workout plan based on onboarding data
   */
  static async generateWorkoutPlan(userId: string, onboardingData: OnboardingData): Promise<WorkoutPlan> {
    try {
      console.log('🏋️ Generating comprehensive workout plan for user:', userId);
      console.log('📊 Using onboarding data:', onboardingData);

      // Create the workout plan
      console.log('🔨 Creating personalized plan...');
      const workoutPlan = await this.createPersonalizedPlan(userId, onboardingData);
      console.log('✅ Plan created:', workoutPlan.id, workoutPlan.title);

      // Save to main workout_plans collection
      console.log('💾 Saving to main workout_plans collection...');
      const planDocRef = doc(db, this.COLLECTION_NAME, workoutPlan.id);
      await setDoc(planDocRef, {
        ...workoutPlan,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log('✅ Saved to main collection');

      console.log('✅ Workout plan generated and saved successfully');
      return workoutPlan;

    } catch (error) {
      console.error('❌ Failed to generate workout plan:', error);
      console.error('Error details:', error);
      throw new Error(`Failed to generate workout plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a personalized workout plan based on user data
   */
  private static async createPersonalizedPlan(userId: string, data: OnboardingData): Promise<WorkoutPlan> {
    const planId = `plan_${userId}_${Date.now()}`;
    const goal = data.primaryGoal || 'general-fitness';
    const fitnessLevel = data.fitnessLevel || 'beginner';
    const workoutsPerWeek = data.workoutDaysPerWeek || 3;
    const availableTime = parseInt(data.availableTime || '30');

    // Get exercises based on goal and fitness level
    const exercises = await this.getExercisesForGoal(goal, fitnessLevel);
    
    // Create weekly schedule
    const weeklySchedule = this.createWeeklySchedule(
      workoutsPerWeek,
      goal,
      fitnessLevel,
      availableTime,
      exercises,
      Array.isArray(data.equipmentAccess) ? data.equipmentAccess : []
    );

    // Calculate total calories
    const estimatedCaloriesPerWeek = weeklySchedule.reduce(
      (total, day) => total + day.totalCalories, 0
    );

    const workoutPlan: WorkoutPlan = {
      id: planId,
      userId,
      title: this.generatePlanTitle(goal, fitnessLevel),
      description: this.generatePlanDescription(goal, fitnessLevel, workoutsPerWeek),
      goal,
      fitnessLevel,
      duration: this.calculatePlanDuration(goal, fitnessLevel),
      workoutsPerWeek,
      estimatedCaloriesPerWeek,
      weeklySchedule,
      progressTracking: {
        currentWeek: 1,
        completedWorkouts: 0,
        totalWorkouts: workoutsPerWeek * this.calculatePlanDuration(goal, fitnessLevel),
        startDate: new Date(),
        lastUpdated: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return workoutPlan;
  }

  /**
   * Get exercises suitable for specific goal and fitness level
   */
  private static async getExercisesForGoal(goal: string, fitnessLevel: string): Promise<Exercise[]> {
    // For now, return predefined exercises. In production, this would query Firestore
    return this.getPredefinedExercises(goal, fitnessLevel);
  }

  /**
   * Create weekly workout schedule
   */
  private static createWeeklySchedule(
    workoutsPerWeek: number,
    goal: string,
    fitnessLevel: string,
    availableTime: number,
    exercises: Exercise[],
    equipment: string[]
  ): WorkoutDay[] {
    const schedule: WorkoutDay[] = [];
    const workoutTypes = this.getWorkoutTypes(goal);
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Distribute workouts across the week
    const workoutDays = this.selectWorkoutDays(workoutsPerWeek);

    workoutDays.forEach((dayIndex, workoutIndex) => {
      const workoutType = workoutTypes[workoutIndex % workoutTypes.length];
      const dayExercises = this.selectExercisesForWorkout(
        exercises,
        workoutType,
        fitnessLevel,
        availableTime,
        equipment
      );

      const workoutDay: WorkoutDay = {
        id: `day_${dayIndex}`,
        dayOfWeek: daysOfWeek[dayIndex],
        name: `${workoutType.charAt(0).toUpperCase() + workoutType.slice(1)} Workout`,
        type: workoutType,
        duration: availableTime,
        exercises: dayExercises,
        warmUp: this.getWarmUpExercises(fitnessLevel),
        coolDown: this.getCoolDownExercises(),
        totalCalories: this.calculateWorkoutCalories(dayExercises, availableTime),
      };

      schedule.push(workoutDay);
    });

    return schedule;
  }

  /**
   * Get predefined exercises based on goal and fitness level
   */
  private static getPredefinedExercises(goal: string, fitnessLevel: string): Exercise[] {
    const baseExercises: Exercise[] = [
      {
        id: 'pushups',
        name: 'Push-ups',
        category: 'strength',
        muscleGroups: ['chest', 'shoulders', 'triceps'],
        equipment: ['bodyweight'],
        difficulty: fitnessLevel as any,
        instructions: [
          'Start in plank position with hands shoulder-width apart',
          'Lower your body until chest nearly touches the floor',
          'Push back up to starting position',
          'Keep your core tight throughout the movement'
        ],
        sets: fitnessLevel === 'beginner' ? 2 : fitnessLevel === 'intermediate' ? 3 : 4,
        reps: fitnessLevel === 'beginner' ? '8-12' : fitnessLevel === 'intermediate' ? '12-15' : '15-20',
        restTime: '60 seconds',
        calories: 8,
      },
      {
        id: 'squats',
        name: 'Bodyweight Squats',
        category: 'strength',
        muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
        equipment: ['bodyweight'],
        difficulty: fitnessLevel as any,
        instructions: [
          'Stand with feet shoulder-width apart',
          'Lower your body as if sitting back into a chair',
          'Keep your chest up and knees behind toes',
          'Return to standing position'
        ],
        sets: fitnessLevel === 'beginner' ? 2 : fitnessLevel === 'intermediate' ? 3 : 4,
        reps: fitnessLevel === 'beginner' ? '10-15' : fitnessLevel === 'intermediate' ? '15-20' : '20-25',
        restTime: '60 seconds',
        calories: 10,
      },
      {
        id: 'plank',
        name: 'Plank',
        category: 'core',
        muscleGroups: ['core', 'shoulders'],
        equipment: ['bodyweight'],
        difficulty: fitnessLevel as any,
        instructions: [
          'Start in push-up position',
          'Hold your body in a straight line',
          'Keep your core tight and breathe normally',
          'Hold for the specified duration'
        ],
        sets: fitnessLevel === 'beginner' ? 2 : fitnessLevel === 'intermediate' ? 3 : 4,
        reps: '1',
        duration: fitnessLevel === 'beginner' ? '30 seconds' : fitnessLevel === 'intermediate' ? '45 seconds' : '60 seconds',
        restTime: '60 seconds',
        calories: 5,
      },
    ];

    // Add goal-specific exercises
    if (goal === 'lose-weight') {
      baseExercises.push({
        id: 'jumping_jacks',
        name: 'Jumping Jacks',
        category: 'cardio',
        muscleGroups: ['full-body'],
        equipment: ['bodyweight'],
        difficulty: fitnessLevel as any,
        instructions: [
          'Start standing with feet together',
          'Jump while spreading legs and raising arms overhead',
          'Jump back to starting position',
          'Maintain a steady rhythm'
        ],
        sets: 3,
        reps: fitnessLevel === 'beginner' ? '20' : fitnessLevel === 'intermediate' ? '30' : '40',
        restTime: '30 seconds',
        calories: 12,
      });
    }

    return baseExercises;
  }

  // Helper methods
  private static generatePlanTitle(goal: string, fitnessLevel: string): string {
    const goalTitles = {
      'lose-weight': 'Weight Loss',
      'gain-muscle': 'Muscle Building',
      'improve-endurance': 'Endurance',
      'general-fitness': 'General Fitness',
      'tone-body': 'Body Toning',
    };
    
    const levelText = fitnessLevel.charAt(0).toUpperCase() + fitnessLevel.slice(1);
    return `${goalTitles[goal as keyof typeof goalTitles] || 'Fitness'} - ${levelText} Plan`;
  }

  private static generatePlanDescription(goal: string, fitnessLevel: string, workoutsPerWeek: number): string {
    return `A personalized ${fitnessLevel} level workout plan designed for ${goal.replace('-', ' ')}. Includes ${workoutsPerWeek} workouts per week with progressive difficulty.`;
  }

  private static calculatePlanDuration(goal: string, fitnessLevel: string): number {
    // Duration in weeks
    const baseDuration = fitnessLevel === 'beginner' ? 4 : fitnessLevel === 'intermediate' ? 6 : 8;
    return goal === 'lose-weight' ? baseDuration + 2 : baseDuration;
  }

  private static getWorkoutTypes(goal: string): string[] {
    const workoutTypes = {
      'lose-weight': ['cardio', 'strength', 'hiit'],
      'gain-muscle': ['strength', 'strength', 'strength'],
      'improve-endurance': ['cardio', 'cardio', 'strength'],
      'general-fitness': ['strength', 'cardio', 'flexibility'],
      'tone-body': ['strength', 'cardio', 'core'],
    };
    
    return workoutTypes[goal as keyof typeof workoutTypes] || workoutTypes['general-fitness'];
  }

  private static selectWorkoutDays(workoutsPerWeek: number): number[] {
    const schedules = {
      2: [1, 4], // Tuesday, Friday
      3: [1, 3, 5], // Tuesday, Thursday, Saturday
      4: [1, 2, 4, 5], // Tuesday, Wednesday, Friday, Saturday
      5: [0, 1, 2, 4, 5], // Monday, Tuesday, Wednesday, Friday, Saturday
      6: [0, 1, 2, 3, 4, 5], // Monday-Saturday
      7: [0, 1, 2, 3, 4, 5, 6], // Every day
    };
    
    return schedules[workoutsPerWeek as keyof typeof schedules] || schedules[3];
  }

  private static selectExercisesForWorkout(
    exercises: Exercise[],
    workoutType: string,
    _fitnessLevel: string,
    availableTime: number,
    _equipment: string[]
  ): Exercise[] {
    // Filter exercises by type and equipment
    const filteredExercises = exercises.filter(exercise => 
      exercise.category === workoutType || workoutType === 'strength'
    );

    // Select appropriate number of exercises based on available time
    const exerciseCount = Math.floor(availableTime / 8); // ~8 minutes per exercise
    return filteredExercises.slice(0, Math.max(3, exerciseCount));
  }

  private static getWarmUpExercises(_fitnessLevel: string): Exercise[] {
    return [
      {
        id: 'warmup_march',
        name: 'Marching in Place',
        category: 'warmup',
        muscleGroups: ['legs'],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        instructions: ['March in place lifting knees high', 'Swing arms naturally', 'Maintain steady pace'],
        sets: 1,
        reps: '1',
        duration: '2 minutes',
        restTime: '0',
        calories: 3,
      }
    ];
  }

  private static getCoolDownExercises(): Exercise[] {
    return [
      {
        id: 'cooldown_stretch',
        name: 'Full Body Stretch',
        category: 'cooldown',
        muscleGroups: ['full-body'],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        instructions: ['Hold each stretch for 30 seconds', 'Breathe deeply', 'Don\'t bounce'],
        sets: 1,
        reps: '1',
        duration: '5 minutes',
        restTime: '0',
        calories: 2,
      }
    ];
  }

  private static calculateWorkoutCalories(exercises: Exercise[], duration: number): number {
    const baseCalories = exercises.reduce((total, exercise) => total + (exercise.calories || 0), 0);
    return Math.round(baseCalories * (duration / 30)); // Scale based on workout duration
  }

  /**
   * Update workout plan progress
   */
  static async updateProgress(_userId: string, planId: string, completedWorkout: boolean): Promise<void> {
    try {
      const planRef = doc(db, this.COLLECTION_NAME, planId);
      const planDoc = await getDoc(planRef);
      
      if (!planDoc.exists()) {
        throw new Error('Workout plan not found');
      }

      const plan = planDoc.data() as WorkoutPlan;
      
      if (completedWorkout) {
        plan.progressTracking.completedWorkouts += 1;
      }
      
      plan.progressTracking.lastUpdated = new Date();
      
      await updateDoc(planRef, {
        progressTracking: plan.progressTracking,
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Workout plan progress updated');
    } catch (error) {
      console.error('❌ Failed to update workout plan progress:', error);
      throw error;
    }
  }

  /**
   * Get user's active workout plan
   */
  static async getUserWorkoutPlan(_userId: string): Promise<WorkoutPlan | null> {
    try {
      // First check user's subcollection for active plan
      // const userPlansRef = collection(db, 'users', userId, 'workout_plans');
      // For now, we'll implement a simple query - in production you'd query for active plans

      // This is a simplified version - you'd typically query for the most recent active plan
      return null; // Placeholder - implement based on your needs
    } catch (error) {
      console.error('❌ Failed to get user workout plan:', error);
      return null;
    }
  }
}
