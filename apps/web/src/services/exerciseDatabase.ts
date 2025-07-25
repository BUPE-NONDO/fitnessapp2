import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { Exercise } from './workoutPlanGenerator';

export class ExerciseDatabase {
  private static readonly COLLECTION_NAME = 'exercises';

  /**
   * Initialize the exercise database with predefined exercises
   */
  static async initializeExerciseDatabase(): Promise<void> {
    try {
      console.log('🏋️ Initializing exercise database...');
      
      const exercises = this.getPredefinedExercises();
      
      for (const exercise of exercises) {
        const exerciseRef = doc(db, this.COLLECTION_NAME, exercise.id);
        await setDoc(exerciseRef, {
          ...exercise,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      
      console.log(`✅ Exercise database initialized with ${exercises.length} exercises`);
    } catch (error) {
      console.error('❌ Failed to initialize exercise database:', error);
      throw error;
    }
  }

  /**
   * Get exercises by category and difficulty
   */
  static async getExercisesByCategory(
    category: string,
    difficulty?: string,
    equipment?: string[]
  ): Promise<Exercise[]> {
    try {
      const exercisesRef = collection(db, this.COLLECTION_NAME);
      let q = query(exercisesRef, where('category', '==', category));
      
      if (difficulty) {
        q = query(q, where('difficulty', '==', difficulty));
      }
      
      const querySnapshot = await getDocs(q);
      const exercises: Exercise[] = [];
      
      querySnapshot.forEach((doc) => {
        const exercise = doc.data() as Exercise;
        
        // Filter by equipment if specified
        if (equipment && equipment.length > 0) {
          const hasRequiredEquipment = exercise.equipment.some(eq => 
            equipment.includes(eq) || eq === 'bodyweight'
          );
          if (hasRequiredEquipment) {
            exercises.push(exercise);
          }
        } else {
          exercises.push(exercise);
        }
      });
      
      return exercises;
    } catch (error) {
      console.error('❌ Failed to get exercises by category:', error);
      return [];
    }
  }

  /**
   * Get all exercises for a specific muscle group
   */
  static async getExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
    try {
      const exercisesRef = collection(db, this.COLLECTION_NAME);
      const q = query(exercisesRef, where('muscleGroups', 'array-contains', muscleGroup));
      
      const querySnapshot = await getDocs(q);
      const exercises: Exercise[] = [];
      
      querySnapshot.forEach((doc) => {
        exercises.push(doc.data() as Exercise);
      });
      
      return exercises;
    } catch (error) {
      console.error('❌ Failed to get exercises by muscle group:', error);
      return [];
    }
  }

  /**
   * Get predefined exercises for database initialization
   */
  private static getPredefinedExercises(): Exercise[] {
    return [
      // Bodyweight Strength Exercises
      {
        id: 'pushups',
        name: 'Push-ups',
        category: 'strength',
        muscleGroups: ['chest', 'shoulders', 'triceps', 'core'],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        instructions: [
          'Start in plank position with hands shoulder-width apart',
          'Lower your body until chest nearly touches the floor',
          'Push back up to starting position',
          'Keep your core tight throughout the movement'
        ],
        sets: 3,
        reps: '8-15',
        restTime: '60 seconds',
        calories: 8,
      },
      {
        id: 'squats',
        name: 'Bodyweight Squats',
        category: 'strength',
        muscleGroups: ['quadriceps', 'glutes', 'hamstrings', 'calves'],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        instructions: [
          'Stand with feet shoulder-width apart',
          'Lower your body as if sitting back into a chair',
          'Keep your chest up and knees behind toes',
          'Return to standing position'
        ],
        sets: 3,
        reps: '12-20',
        restTime: '60 seconds',
        calories: 10,
      },
      {
        id: 'lunges',
        name: 'Forward Lunges',
        category: 'strength',
        muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        instructions: [
          'Step forward with one leg',
          'Lower your hips until both knees are bent at 90 degrees',
          'Push back to starting position',
          'Alternate legs'
        ],
        sets: 3,
        reps: '10-15 each leg',
        restTime: '60 seconds',
        calories: 9,
      },
      {
        id: 'plank',
        name: 'Plank',
        category: 'core',
        muscleGroups: ['core', 'shoulders', 'back'],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        instructions: [
          'Start in push-up position',
          'Hold your body in a straight line',
          'Keep your core tight and breathe normally',
          'Hold for the specified duration'
        ],
        sets: 3,
        reps: '1',
        duration: '30-60 seconds',
        restTime: '60 seconds',
        calories: 5,
      },
      {
        id: 'mountain_climbers',
        name: 'Mountain Climbers',
        category: 'cardio',
        muscleGroups: ['core', 'shoulders', 'legs'],
        equipment: ['bodyweight'],
        difficulty: 'intermediate',
        instructions: [
          'Start in plank position',
          'Bring one knee toward your chest',
          'Quickly switch legs',
          'Maintain a fast pace'
        ],
        sets: 3,
        reps: '20-30',
        restTime: '45 seconds',
        calories: 12,
      },
      {
        id: 'burpees',
        name: 'Burpees',
        category: 'cardio',
        muscleGroups: ['full-body'],
        equipment: ['bodyweight'],
        difficulty: 'advanced',
        instructions: [
          'Start standing',
          'Drop into squat position with hands on floor',
          'Jump feet back into plank position',
          'Do a push-up',
          'Jump feet back to squat position',
          'Jump up with arms overhead'
        ],
        sets: 3,
        reps: '5-15',
        restTime: '90 seconds',
        calories: 15,
      },
      {
        id: 'jumping_jacks',
        name: 'Jumping Jacks',
        category: 'cardio',
        muscleGroups: ['full-body'],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        instructions: [
          'Start standing with feet together',
          'Jump while spreading legs and raising arms overhead',
          'Jump back to starting position',
          'Maintain a steady rhythm'
        ],
        sets: 3,
        reps: '20-40',
        restTime: '30 seconds',
        calories: 12,
      },
      {
        id: 'high_knees',
        name: 'High Knees',
        category: 'cardio',
        muscleGroups: ['legs', 'core'],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        instructions: [
          'Stand with feet hip-width apart',
          'Run in place lifting knees as high as possible',
          'Pump your arms',
          'Maintain quick pace'
        ],
        sets: 3,
        reps: '30 seconds',
        restTime: '30 seconds',
        calories: 10,
      },
      {
        id: 'wall_sit',
        name: 'Wall Sit',
        category: 'strength',
        muscleGroups: ['quadriceps', 'glutes'],
        equipment: ['wall'],
        difficulty: 'intermediate',
        instructions: [
          'Stand with back against wall',
          'Slide down until thighs are parallel to floor',
          'Keep knees at 90 degrees',
          'Hold position'
        ],
        sets: 3,
        reps: '1',
        duration: '30-60 seconds',
        restTime: '60 seconds',
        calories: 6,
      },
      {
        id: 'tricep_dips',
        name: 'Tricep Dips',
        category: 'strength',
        muscleGroups: ['triceps', 'shoulders'],
        equipment: ['chair', 'bench'],
        difficulty: 'intermediate',
        instructions: [
          'Sit on edge of chair with hands gripping the seat',
          'Slide forward off the chair',
          'Lower your body by bending elbows',
          'Push back up to starting position'
        ],
        sets: 3,
        reps: '8-15',
        restTime: '60 seconds',
        calories: 7,
      },
      // Dumbbell Exercises
      {
        id: 'dumbbell_chest_press',
        name: 'Dumbbell Chest Press',
        category: 'strength',
        muscleGroups: ['chest', 'shoulders', 'triceps'],
        equipment: ['dumbbells', 'bench'],
        difficulty: 'intermediate',
        instructions: [
          'Lie on bench with dumbbells in each hand',
          'Start with arms extended above chest',
          'Lower weights to chest level',
          'Press back up to starting position'
        ],
        sets: 3,
        reps: '8-12',
        restTime: '90 seconds',
        calories: 10,
      },
      {
        id: 'dumbbell_rows',
        name: 'Dumbbell Rows',
        category: 'strength',
        muscleGroups: ['back', 'biceps'],
        equipment: ['dumbbells'],
        difficulty: 'intermediate',
        instructions: [
          'Bend forward at hips with dumbbell in each hand',
          'Pull weights up to your ribs',
          'Squeeze shoulder blades together',
          'Lower weights with control'
        ],
        sets: 3,
        reps: '10-15',
        restTime: '60 seconds',
        calories: 9,
      },
      {
        id: 'dumbbell_shoulder_press',
        name: 'Dumbbell Shoulder Press',
        category: 'strength',
        muscleGroups: ['shoulders', 'triceps'],
        equipment: ['dumbbells'],
        difficulty: 'intermediate',
        instructions: [
          'Stand with dumbbells at shoulder height',
          'Press weights overhead',
          'Lower back to shoulder level',
          'Keep core engaged'
        ],
        sets: 3,
        reps: '8-12',
        restTime: '60 seconds',
        calories: 8,
      },
      // Flexibility/Yoga
      {
        id: 'child_pose',
        name: 'Child\'s Pose',
        category: 'flexibility',
        muscleGroups: ['back', 'hips'],
        equipment: ['mat'],
        difficulty: 'beginner',
        instructions: [
          'Kneel on floor with big toes touching',
          'Sit back on your heels',
          'Extend arms forward and lower forehead to floor',
          'Hold and breathe deeply'
        ],
        sets: 1,
        reps: '1',
        duration: '30-60 seconds',
        restTime: '0',
        calories: 2,
      },
      {
        id: 'downward_dog',
        name: 'Downward Facing Dog',
        category: 'flexibility',
        muscleGroups: ['shoulders', 'hamstrings', 'calves'],
        equipment: ['mat'],
        difficulty: 'beginner',
        instructions: [
          'Start on hands and knees',
          'Tuck toes under and lift hips up',
          'Straighten legs and arms',
          'Form inverted V shape'
        ],
        sets: 1,
        reps: '1',
        duration: '30-60 seconds',
        restTime: '0',
        calories: 3,
      },
    ];
  }

  /**
   * Add a custom exercise to the database
   */
  static async addCustomExercise(exercise: Omit<Exercise, 'id'>): Promise<string> {
    try {
      const exerciseId = `custom_${Date.now()}`;
      const exerciseRef = doc(db, this.COLLECTION_NAME, exerciseId);
      
      await setDoc(exerciseRef, {
        ...exercise,
        id: exerciseId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ Custom exercise added successfully');
      return exerciseId;
    } catch (error) {
      console.error('❌ Failed to add custom exercise:', error);
      throw error;
    }
  }

  /**
   * Get exercises suitable for a specific goal
   */
  static async getExercisesForGoal(goal: string, fitnessLevel: string): Promise<Exercise[]> {
    const goalExerciseMap = {
      'lose-weight': ['cardio', 'strength'],
      'gain-muscle': ['strength'],
      'improve-endurance': ['cardio'],
      'general-fitness': ['strength', 'cardio', 'flexibility'],
      'tone-body': ['strength', 'cardio'],
    };

    const categories = goalExerciseMap[goal as keyof typeof goalExerciseMap] || ['strength', 'cardio'];
    const allExercises: Exercise[] = [];

    for (const category of categories) {
      const exercises = await this.getExercisesByCategory(category, fitnessLevel);
      allExercises.push(...exercises);
    }

    return allExercises;
  }
}
