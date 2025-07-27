import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'balance';
  muscleGroups: string[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  tips: string[];
  imageUrl?: string;
  videoUrl?: string;
}

export interface WorkoutSet {
  exerciseId: string;
  sets: number;
  reps?: number;
  duration?: number; // in seconds
  weight?: number;
  restTime: number; // in seconds
  notes?: string;
}

export interface WorkoutRoutine {
  id: string;
  userId: string;
  name: string;
  description: string;
  goal: string; // from onboarding
  difficulty: string; // from onboarding
  duration: number; // weeks
  daysPerWeek: number;
  exercises: WorkoutSet[];
  schedule: string[]; // days of week
  createdAt: Date;
  isActive: boolean;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  routineId: string;
  date: Date;
  exercises: Array<{
    exerciseId: string;
    sets: Array<{
      reps?: number;
      weight?: number;
      duration?: number;
      completed: boolean;
    }>;
    completed: boolean;
  }>;
  duration: number; // actual workout duration in minutes
  notes?: string;
  completed: boolean;
}

export class WorkoutRoutineService {
  private static readonly ROUTINES_COLLECTION = 'workout_routines';
  private static readonly SESSIONS_COLLECTION = 'workout_sessions';

  /**
   * Generate a personalized workout routine based on onboarding data
   */
  static async generateRoutine(
    userId: string,
    onboardingData: {
      goal: string;
      fitnessLevel: string;
      workoutDays: number;
      duration: number;
      equipment: string[];
      preferences: string[];
    }
  ): Promise<WorkoutRoutine> {
    try {
      const exercises = await this.getExercisesForGoal(onboardingData.goal, onboardingData.fitnessLevel);
      const routine = this.createRoutineFromTemplate(userId, onboardingData, exercises);
      
      const docRef = await addDoc(collection(db, this.ROUTINES_COLLECTION), {
        ...routine,
        createdAt: Timestamp.now(),
      });

      return { ...routine, id: docRef.id };
    } catch (error) {
      console.error('Failed to generate routine:', error);
      throw new Error('Failed to generate workout routine');
    }
  }

  /**
   * Get exercises suitable for a specific goal and fitness level
   */
  private static async getExercisesForGoal(goal: string, fitnessLevel: string): Promise<Exercise[]> {
    // For now, return mock exercises. In production, this would query the database
    return this.getMockExercises(goal, fitnessLevel);
  }

  /**
   * Create a routine from template based on user preferences
   */
  private static createRoutineFromTemplate(
    userId: string,
    onboardingData: any,
    exercises: Exercise[]
  ): Omit<WorkoutRoutine, 'id'> {
    const routineTemplates = {
      'lose_weight': {
        name: 'Weight Loss Transformation',
        description: 'High-intensity workouts designed to burn calories and build lean muscle',
        daysPerWeek: Math.min(onboardingData.workoutDays, 5),
        schedule: this.getScheduleForDays(onboardingData.workoutDays),
      },
      'gain_muscle': {
        name: 'Muscle Building Program',
        description: 'Progressive strength training to build muscle mass and strength',
        daysPerWeek: Math.min(onboardingData.workoutDays, 6),
        schedule: this.getScheduleForDays(onboardingData.workoutDays),
      },
      'improve_endurance': {
        name: 'Endurance Enhancement',
        description: 'Cardiovascular and muscular endurance training program',
        daysPerWeek: Math.min(onboardingData.workoutDays, 5),
        schedule: this.getScheduleForDays(onboardingData.workoutDays),
      },
      'general_fitness': {
        name: 'Complete Fitness Program',
        description: 'Well-rounded program combining strength, cardio, and flexibility',
        daysPerWeek: Math.min(onboardingData.workoutDays, 4),
        schedule: this.getScheduleForDays(onboardingData.workoutDays),
      },
    };

    const template = routineTemplates[onboardingData.goal as keyof typeof routineTemplates] || 
                    routineTemplates.general_fitness;

    return {
      userId,
      name: template.name,
      description: template.description,
      goal: onboardingData.goal,
      difficulty: onboardingData.fitnessLevel,
      duration: onboardingData.duration,
      daysPerWeek: template.daysPerWeek,
      exercises: this.createWorkoutSets(exercises, onboardingData.fitnessLevel),
      schedule: template.schedule,
      createdAt: new Date(),
      isActive: true,
    };
  }

  /**
   * Get workout schedule based on days per week
   */
  private static getScheduleForDays(daysPerWeek: number): string[] {
    const schedules = {
      1: ['Monday'],
      2: ['Monday', 'Thursday'],
      3: ['Monday', 'Wednesday', 'Friday'],
      4: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
      5: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      6: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      7: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    };

    return schedules[Math.min(daysPerWeek, 7) as keyof typeof schedules] || schedules[3];
  }

  /**
   * Create workout sets from exercises
   */
  private static createWorkoutSets(exercises: Exercise[], fitnessLevel: string): WorkoutSet[] {
    const levelMultipliers = {
      beginner: { sets: 2, reps: 8, rest: 90 },
      intermediate: { sets: 3, reps: 10, rest: 75 },
      advanced: { sets: 4, reps: 12, rest: 60 },
    };

    const multiplier = levelMultipliers[fitnessLevel as keyof typeof levelMultipliers] || 
                     levelMultipliers.beginner;

    return exercises.slice(0, 6).map(exercise => ({
      exerciseId: exercise.id,
      sets: multiplier.sets,
      reps: exercise.category === 'cardio' ? undefined : multiplier.reps,
      duration: exercise.category === 'cardio' ? 300 : undefined, // 5 minutes for cardio
      restTime: multiplier.rest,
    }));
  }

  /**
   * Get mock exercises for development
   */
  private static getMockExercises(goal: string, fitnessLevel: string): Exercise[] {
    const allExercises: Exercise[] = [
      {
        id: 'push-ups',
        name: 'Push-ups',
        category: 'strength',
        muscleGroups: ['chest', 'shoulders', 'triceps'],
        equipment: [],
        difficulty: 'beginner',
        instructions: [
          'Start in a plank position with hands slightly wider than shoulders',
          'Lower your body until chest nearly touches the floor',
          'Push back up to starting position',
          'Keep your body in a straight line throughout'
        ],
        tips: ['Keep core engaged', 'Don\'t let hips sag', 'Control the movement'],
      },
      {
        id: 'squats',
        name: 'Bodyweight Squats',
        category: 'strength',
        muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
        equipment: [],
        difficulty: 'beginner',
        instructions: [
          'Stand with feet shoulder-width apart',
          'Lower your body as if sitting back into a chair',
          'Keep chest up and knees behind toes',
          'Return to standing position'
        ],
        tips: ['Keep weight on heels', 'Don\'t let knees cave in', 'Go as low as comfortable'],
      },
      {
        id: 'plank',
        name: 'Plank Hold',
        category: 'strength',
        muscleGroups: ['core', 'shoulders'],
        equipment: [],
        difficulty: 'beginner',
        instructions: [
          'Start in push-up position',
          'Hold your body in a straight line',
          'Keep core engaged and breathe normally',
          'Hold for specified duration'
        ],
        tips: ['Don\'t hold breath', 'Keep hips level', 'Engage glutes'],
      },
      {
        id: 'jumping-jacks',
        name: 'Jumping Jacks',
        category: 'cardio',
        muscleGroups: ['full-body'],
        equipment: [],
        difficulty: 'beginner',
        instructions: [
          'Start standing with feet together, arms at sides',
          'Jump feet apart while raising arms overhead',
          'Jump back to starting position',
          'Maintain steady rhythm'
        ],
        tips: ['Land softly', 'Keep core engaged', 'Modify by stepping if needed'],
      },
      {
        id: 'lunges',
        name: 'Forward Lunges',
        category: 'strength',
        muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
        equipment: [],
        difficulty: 'intermediate',
        instructions: [
          'Step forward with one leg',
          'Lower hips until both knees are at 90 degrees',
          'Push back to starting position',
          'Alternate legs'
        ],
        tips: ['Keep front knee over ankle', 'Don\'t let back knee touch ground', 'Keep torso upright'],
      },
      {
        id: 'mountain-climbers',
        name: 'Mountain Climbers',
        category: 'cardio',
        muscleGroups: ['core', 'shoulders', 'legs'],
        equipment: [],
        difficulty: 'intermediate',
        instructions: [
          'Start in plank position',
          'Bring one knee toward chest',
          'Quickly switch legs',
          'Maintain plank position throughout'
        ],
        tips: ['Keep hips level', 'Don\'t bounce', 'Breathe steadily'],
      },
    ];

    // Filter exercises based on goal and fitness level
    return allExercises.filter(exercise => {
      const levelMatch = exercise.difficulty === fitnessLevel || 
                        (fitnessLevel === 'intermediate' && exercise.difficulty === 'beginner') ||
                        (fitnessLevel === 'advanced');
      
      const goalMatch = goal === 'lose_weight' ? true : // All exercises good for weight loss
                       goal === 'gain_muscle' ? exercise.category === 'strength' :
                       goal === 'improve_endurance' ? exercise.category === 'cardio' || exercise.category === 'strength' :
                       true; // general fitness

      return levelMatch && goalMatch;
    });
  }

  /**
   * Get user's active routine
   */
  static async getUserRoutine(userId: string): Promise<WorkoutRoutine | null> {
    try {
      const q = query(
        collection(db, this.ROUTINES_COLLECTION),
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
      } as WorkoutRoutine;
    } catch (error) {
      console.error('Failed to get user routine:', error);
      return null;
    }
  }

  /**
   * Start a workout session
   */
  static async startWorkoutSession(
    userId: string,
    routineId: string
  ): Promise<WorkoutSession> {
    try {
      // User data isolation is handled by Firestore security rules

      const routine = await this.getUserRoutine(userId);
      if (!routine) throw new Error('No active routine found');

      const session: Omit<WorkoutSession, 'id'> = {
        userId,
        routineId,
        date: new Date(),
        exercises: routine.exercises.map(exercise => ({
          exerciseId: exercise.exerciseId,
          sets: Array(exercise.sets).fill(null).map(() => ({
            reps: exercise.reps,
            weight: exercise.weight,
            duration: exercise.duration,
            completed: false,
          })),
          completed: false,
        })),
        duration: 0,
        completed: false,
      };

      const docRef = await addDoc(collection(db, this.SESSIONS_COLLECTION), {
        ...session,
        date: Timestamp.now(),
      });

      return { ...session, id: docRef.id };
    } catch (error) {
      console.error('Failed to start workout session:', error);
      throw new Error('Failed to start workout session');
    }
  }

  /**
   * Complete a workout session
   */
  static async completeWorkoutSession(
    sessionId: string,
    duration: number,
    notes?: string
  ): Promise<void> {
    try {
      await updateDoc(doc(db, this.SESSIONS_COLLECTION, sessionId), {
        completed: true,
        duration,
        notes: notes || '',
        completedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Failed to complete workout session:', error);
      throw new Error('Failed to complete workout session');
    }
  }

  /**
   * Get exercise by ID
   */
  static getExerciseById(exerciseId: string): Exercise | null {
    const exercises = this.getMockExercises('general_fitness', 'beginner');
    return exercises.find(ex => ex.id === exerciseId) || null;
  }
}

export default WorkoutRoutineService;
