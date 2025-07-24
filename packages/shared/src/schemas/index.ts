import { z } from "zod";

// User schemas
export const userSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  avatar: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
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

// Badge schemas
export const badgeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string(),
  iconUrl: z.string().url(),
  unlockedAt: z.date(),
});

export const badgeDefinitionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  iconUrl: z.string().url(),
  criteria: z.object({
    type: z.enum(["streak", "total", "frequency"]),
    value: z.number().positive(),
    metric: z.string(),
  }),
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
