import { CreateGoal } from '@fitness-app/shared';

export interface GoalTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fitnessGoals: string[]; // Which fitness goals this template applies to
  fitnessLevel: string[]; // Which fitness levels this template applies to
  goals: Omit<CreateGoal, 'userId'>[];
}

export class GoalTemplateService {
  private static templates: GoalTemplate[] = [
    // Weight Loss Templates
    {
      id: 'weight_loss_beginner',
      name: 'Weight Loss - Beginner',
      description: 'A gentle start to your weight loss journey',
      category: 'weight_loss',
      fitnessGoals: ['weight_loss'],
      fitnessLevel: ['beginner'],
      goals: [
        {
          title: 'Daily Walk',
          description: 'Take a 30-minute walk every day',
          metric: 'duration',
          target: 30,
          frequency: 'daily',
        },
        {
          title: 'Weekly Cardio Sessions',
          description: 'Complete 3 cardio workouts per week',
          metric: 'count',
          target: 3,
          frequency: 'weekly',
        },
        {
          title: 'Daily Water Intake',
          description: 'Drink 8 glasses of water daily',
          metric: 'count',
          target: 8,
          frequency: 'daily',
        },
      ],
    },
    {
      id: 'weight_loss_intermediate',
      name: 'Weight Loss - Intermediate',
      description: 'Accelerate your weight loss with structured workouts',
      category: 'weight_loss',
      fitnessGoals: ['weight_loss'],
      fitnessLevel: ['intermediate'],
      goals: [
        {
          title: 'HIIT Workouts',
          description: 'Complete 4 HIIT sessions per week',
          metric: 'count',
          target: 4,
          frequency: 'weekly',
        },
        {
          title: 'Daily Cardio',
          description: '45 minutes of cardio daily',
          metric: 'duration',
          target: 45,
          frequency: 'daily',
        },
        {
          title: 'Strength Training',
          description: '2 strength training sessions per week',
          metric: 'count',
          target: 2,
          frequency: 'weekly',
        },
      ],
    },

    // Muscle Gain Templates
    {
      id: 'muscle_gain_beginner',
      name: 'Muscle Building - Beginner',
      description: 'Start building muscle with basic strength training',
      category: 'muscle_gain',
      fitnessGoals: ['muscle_gain'],
      fitnessLevel: ['beginner'],
      goals: [
        {
          title: 'Strength Training',
          description: 'Complete 3 strength training sessions per week',
          metric: 'count',
          target: 3,
          frequency: 'weekly',
        },
        {
          title: 'Protein Intake',
          description: 'Consume adequate protein daily',
          metric: 'count',
          target: 100, // grams
          frequency: 'daily',
        },
        {
          title: 'Rest Days',
          description: 'Take 2 complete rest days per week',
          metric: 'count',
          target: 2,
          frequency: 'weekly',
        },
      ],
    },
    {
      id: 'muscle_gain_intermediate',
      name: 'Muscle Building - Intermediate',
      description: 'Advanced muscle building with progressive overload',
      category: 'muscle_gain',
      fitnessGoals: ['muscle_gain'],
      fitnessLevel: ['intermediate', 'advanced'],
      goals: [
        {
          title: 'Heavy Lifting Sessions',
          description: 'Complete 4-5 strength training sessions per week',
          metric: 'count',
          target: 4,
          frequency: 'weekly',
        },
        {
          title: 'Progressive Overload',
          description: 'Increase weight or reps weekly',
          metric: 'count',
          target: 1,
          frequency: 'weekly',
        },
        {
          title: 'Compound Movements',
          description: 'Focus on compound exercises daily',
          metric: 'count',
          target: 3,
          frequency: 'daily',
        },
      ],
    },

    // Endurance Templates
    {
      id: 'endurance_beginner',
      name: 'Endurance Building - Beginner',
      description: 'Build cardiovascular endurance gradually',
      category: 'endurance',
      fitnessGoals: ['endurance'],
      fitnessLevel: ['beginner'],
      goals: [
        {
          title: 'Daily Cardio',
          description: 'Complete 20-30 minutes of cardio daily',
          metric: 'duration',
          target: 25,
          frequency: 'daily',
          isActive: true,
        },
        {
          title: 'Weekly Long Session',
          description: 'One longer cardio session per week',
          metric: 'duration',
          target: 45,
          frequency: 'weekly',
          isActive: true,
        },
        {
          title: 'Active Recovery',
          description: 'Light activity on rest days',
          metric: 'duration',
          target: 15,
          frequency: 'daily',
          isActive: true,
        },
      ],
    },

    // Strength Templates
    {
      id: 'strength_beginner',
      name: 'Strength Building - Beginner',
      description: 'Build foundational strength with basic movements',
      category: 'strength',
      fitnessGoals: ['strength'],
      fitnessLevel: ['beginner'],
      goals: [
        {
          title: 'Bodyweight Exercises',
          description: 'Complete bodyweight workout 3x per week',
          metric: 'count',
          target: 3,
          frequency: 'weekly',
          isActive: true,
        },
        {
          title: 'Core Strengthening',
          description: 'Daily core exercises',
          metric: 'duration',
          target: 10,
          frequency: 'daily',
          isActive: true,
        },
        {
          title: 'Flexibility Work',
          description: 'Stretching sessions 2x per week',
          metric: 'count',
          target: 2,
          frequency: 'weekly',
          isActive: true,
        },
      ],
    },

    // General Fitness Templates
    {
      id: 'general_fitness_beginner',
      name: 'General Fitness - Beginner',
      description: 'Well-rounded fitness routine for overall health',
      category: 'general_fitness',
      fitnessGoals: ['general_fitness'],
      fitnessLevel: ['beginner'],
      goals: [
        {
          title: 'Mixed Workouts',
          description: 'Variety of exercises 4x per week',
          metric: 'count',
          target: 4,
          frequency: 'weekly',
          isActive: true,
        },
        {
          title: 'Daily Steps',
          description: 'Walk 8,000 steps daily',
          metric: 'count',
          target: 8000,
          frequency: 'daily',
          isActive: true,
        },
        {
          title: 'Weekly Active Time',
          description: 'Total active time per week',
          metric: 'duration',
          target: 150, // minutes
          frequency: 'weekly',
          isActive: true,
        },
      ],
    },

    // Flexibility Templates
    {
      id: 'flexibility_all_levels',
      name: 'Flexibility & Mobility',
      description: 'Improve flexibility and mobility',
      category: 'flexibility',
      fitnessGoals: ['flexibility'],
      fitnessLevel: ['beginner', 'intermediate', 'advanced'],
      goals: [
        {
          title: 'Daily Stretching',
          description: 'Stretch for 15 minutes daily',
          metric: 'duration',
          target: 15,
          frequency: 'daily',
          isActive: true,
        },
        {
          title: 'Yoga Sessions',
          description: 'Complete 2 yoga sessions per week',
          metric: 'count',
          target: 2,
          frequency: 'weekly',
          isActive: true,
        },
        {
          title: 'Mobility Work',
          description: 'Mobility exercises 3x per week',
          metric: 'count',
          target: 3,
          frequency: 'weekly',
          isActive: true,
        },
      ],
    },
  ];

  /**
   * Get goal templates based on user's onboarding data
   */
  static getRecommendedTemplates(
    fitnessGoals: string[],
    fitnessLevel: string,
    _workoutDaysPerWeek?: number
  ): GoalTemplate[] {
    return this.templates.filter(template => {
      // Check if template matches any of the user's fitness goals
      const matchesGoals = template.fitnessGoals.some(goal => 
        fitnessGoals.includes(goal)
      );
      
      // Check if template matches user's fitness level
      const matchesLevel = template.fitnessLevel.includes(fitnessLevel);
      
      return matchesGoals && matchesLevel;
    });
  }

  /**
   * Get a specific template by ID
   */
  static getTemplate(templateId: string): GoalTemplate | undefined {
    return this.templates.find(template => template.id === templateId);
  }

  /**
   * Get all templates for a specific category
   */
  static getTemplatesByCategory(category: string): GoalTemplate[] {
    return this.templates.filter(template => template.category === category);
  }

  /**
   * Create goals from a template for a specific user
   */
  static createGoalsFromTemplate(
    templateId: string,
    userId: string
  ): CreateGoal[] {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    return template.goals.map(goal => ({
      ...goal,
      userId,
    }));
  }

  /**
   * Get all available templates
   */
  static getAllTemplates(): GoalTemplate[] {
    return this.templates;
  }

  /**
   * Customize template goals based on user preferences
   */
  static customizeTemplate(
    template: GoalTemplate,
    customizations: {
      workoutDaysPerWeek?: number;
      availableTime?: number; // minutes per day
      intensity?: 'low' | 'medium' | 'high';
    }
  ): GoalTemplate {
    const customizedGoals = template.goals.map(goal => {
      let customizedGoal = { ...goal };

      // Adjust based on available workout days
      if (customizations.workoutDaysPerWeek && goal.frequency === 'weekly') {
        const maxTarget = Math.min(goal.target, customizations.workoutDaysPerWeek);
        customizedGoal.target = maxTarget;
      }

      // Adjust based on available time
      if (customizations.availableTime && goal.metric === 'duration') {
        const maxDuration = Math.min(goal.target, customizations.availableTime);
        customizedGoal.target = maxDuration;
      }

      // Adjust based on intensity preference
      if (customizations.intensity) {
        const intensityMultiplier = {
          low: 0.7,
          medium: 1.0,
          high: 1.3,
        };
        
        if (goal.metric === 'count' || goal.metric === 'duration') {
          customizedGoal.target = Math.round(
            goal.target * intensityMultiplier[customizations.intensity]
          );
        }
      }

      return customizedGoal;
    });

    return {
      ...template,
      goals: customizedGoals,
    };
  }
}

export default GoalTemplateService;
