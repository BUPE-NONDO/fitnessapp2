import { z } from "zod";

// Progress tracking schemas
export const progressStatsSchema = z.object({
  currentStreak: z.number().default(0),
  longestStreak: z.number().default(0),
  totalWorkouts: z.number().default(0),
  totalGoalsCompleted: z.number().default(0),
  weeklyGoalProgress: z.number().min(0).max(100).default(0),
  monthlyGoalProgress: z.number().min(0).max(100).default(0),
  lastActivityDate: z.date().optional(),
});

export const onboardingProgressSchema = z.object({
  step: z.number().min(1).max(10),
  completedSteps: z.array(z.number()),
  skippedSteps: z.array(z.number()),
  startedAt: z.date(),
  completedAt: z.date().optional(),
  data: z.record(z.any()).optional(),
});

export const dailyGoalSchema = z.object({
  id: z.string(),
  type: z.enum(["workout", "steps", "water", "sleep", "meditation"]),
  target: z.number().positive(),
  current: z.number().min(0).default(0),
  unit: z.string(),
  completed: z.boolean().default(false),
  date: z.date(),
});

export const weeklyGoalSchema = z.object({
  id: z.string(),
  type: z.enum(["workouts", "active_days", "total_duration", "weight_loss"]),
  target: z.number().positive(),
  current: z.number().min(0).default(0),
  unit: z.string(),
  completed: z.boolean().default(false),
  weekStart: z.date(),
  weekEnd: z.date(),
});

// User schemas
export const userSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  avatar: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Enhanced progress tracking
  progressStats: progressStatsSchema.optional(),
  onboardingProgress: onboardingProgressSchema.optional(),
  dailyGoals: z.array(dailyGoalSchema).default([]),
  weeklyGoals: z.array(weeklyGoalSchema).default([]),
  // Preferences
  preferences: z.object({
    notifications: z.boolean().default(true),
    reminderTime: z.string().optional(),
    weekStartsOn: z.enum(["sunday", "monday"]).default("monday"),
    units: z.enum(["metric", "imperial"]).default("metric"),
  }).optional(),
});

export const createUserSchema = userSchema.omit({
  uid: true,
  createdAt: true,
  updatedAt: true,
});

// Goal schemas
export const goalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  metric: z.enum(["count", "duration", "distance", "weight"]),
  target: z.number().positive(),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createGoalSchema = goalSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const updateGoalSchema = createGoalSchema.partial();

// LogEntry schemas
export const logEntrySchema = z.object({
  id: z.string(),
  goalId: z.string(),
  userId: z.string(),
  date: z.date(),
  value: z.number().positive(),
  notes: z.string().max(500).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createLogEntrySchema = logEntrySchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

// Enhanced Badge schemas
export const badgeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  badgeDefinitionId: z.string(),
  earnedAt: z.date(),
  metadata: z.record(z.any()).optional(),
  celebrated: z.boolean().default(false),
  progress: z.number().min(0).max(100).optional(),
});

export const badgeDefinitionSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  icon: z.string(), // Lucide icon name
  iconColor: z.string().optional(),
  category: z.enum([
    "onboarding",
    "milestone",
    "streak",
    "achievement",
    "consistency",
    "performance",
    "social",
    "progress",
    "goal"
  ]),
  requirements: z.object({
    type: z.string(),
    count: z.number().optional(),
    percentage: z.number().optional(),
    days: z.number().optional(),
    value: z.number().optional(),
    goalType: z.string().optional(),
  }),
  rarity: z.enum(["common", "rare", "epic", "legendary"]),
  points: z.number().min(0),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Progress milestone schema
export const progressMilestoneSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(["daily_goal", "weekly_goal", "streak", "total_workouts", "weight_milestone"]),
  value: z.number(),
  achievedAt: z.date(),
  celebrated: z.boolean().default(false),
});

// Admin user schemas
export const adminRoleSchema = z.enum(["super_admin", "admin", "moderator", "support"]);

export const adminPermissionSchema = z.object({
  users: z.object({
    view: z.boolean().default(false),
    create: z.boolean().default(false),
    edit: z.boolean().default(false),
    delete: z.boolean().default(false),
    suspend: z.boolean().default(false),
  }),
  content: z.object({
    view: z.boolean().default(false),
    create: z.boolean().default(false),
    edit: z.boolean().default(false),
    delete: z.boolean().default(false),
  }),
  analytics: z.object({
    view: z.boolean().default(false),
    export: z.boolean().default(false),
  }),
  system: z.object({
    view: z.boolean().default(false),
    settings: z.boolean().default(false),
    logs: z.boolean().default(false),
  }),
});

export const adminUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  role: adminRoleSchema,
  permissions: adminPermissionSchema,
  isActive: z.boolean().default(true),
  lastLogin: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().optional(), // Admin who created this user
});

export const createAdminUserSchema = adminUserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
});

// Audit log schema
export const auditLogSchema = z.object({
  id: z.string(),
  adminId: z.string(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string().optional(),
  details: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  timestamp: z.date(),
});

// System stats schema
export const systemStatsSchema = z.object({
  totalUsers: z.number(),
  activeUsers: z.number(),
  newUsersToday: z.number(),
  newUsersThisWeek: z.number(),
  totalGoals: z.number(),
  completedGoals: z.number(),
  totalWorkouts: z.number(),
  totalBadgesEarned: z.number(),
  averageSessionDuration: z.number(),
  retentionRate: z.number(),
  lastUpdated: z.date(),
});

// API Response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  total: z.number().int().nonnegative().optional(),
});

// Export types
export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type Goal = z.infer<typeof goalSchema>;
export type CreateGoal = z.infer<typeof createGoalSchema>;
export type UpdateGoal = z.infer<typeof updateGoalSchema>;
export type LogEntry = z.infer<typeof logEntrySchema>;
export type CreateLogEntry = z.infer<typeof createLogEntrySchema>;
export type Badge = z.infer<typeof badgeSchema>;
export type BadgeDefinition = z.infer<typeof badgeDefinitionSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
export type Pagination = z.infer<typeof paginationSchema>;

// Additional types that were missing
export type ProgressStats = z.infer<typeof progressStatsSchema>;
export type OnboardingProgress = z.infer<typeof onboardingProgressSchema>;
export type DailyGoal = z.infer<typeof dailyGoalSchema>;
export type WeeklyGoal = z.infer<typeof weeklyGoalSchema>;

// Placeholder types for admin functionality (to be implemented)
export type AdminUser = {
  uid: string;
  email: string;
  role: AdminRole;
  permissions: AdminPermission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateAdminUser = Omit<AdminUser, 'uid' | 'createdAt' | 'updatedAt'>;

export type AdminRole = 'super_admin' | 'admin' | 'moderator';

export type AdminPermission =
  | 'read_users'
  | 'write_users'
  | 'delete_users'
  | 'read_analytics'
  | 'manage_content'
  | 'system_admin';

export type AuditLog = {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  details?: Record<string, any>;
};

export type SystemStats = {
  totalUsers: number;
  activeUsers: number;
  totalGoals: number;
  totalWorkouts: number;
  lastUpdated: Date;
};

export type ProgressMilestone = {
  id: string;
  type: 'streak' | 'workout_count' | 'goal_completion' | 'weight_loss';
  threshold: number;
  title: string;
  description: string;
  badgeId?: string;
};
