"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSchema = exports.apiResponseSchema = exports.systemStatsSchema = exports.auditLogSchema = exports.createAdminUserSchema = exports.adminUserSchema = exports.adminPermissionSchema = exports.adminRoleSchema = exports.progressMilestoneSchema = exports.badgeDefinitionSchema = exports.badgeSchema = exports.createLogEntrySchema = exports.logEntrySchema = exports.updateGoalSchema = exports.createGoalSchema = exports.goalSchema = exports.createUserSchema = exports.userSchema = exports.weeklyGoalSchema = exports.dailyGoalSchema = exports.onboardingProgressSchema = exports.progressStatsSchema = void 0;
const zod_1 = require("zod");
// Progress tracking schemas
exports.progressStatsSchema = zod_1.z.object({
    currentStreak: zod_1.z.number().default(0),
    longestStreak: zod_1.z.number().default(0),
    totalWorkouts: zod_1.z.number().default(0),
    totalGoalsCompleted: zod_1.z.number().default(0),
    weeklyGoalProgress: zod_1.z.number().min(0).max(100).default(0),
    monthlyGoalProgress: zod_1.z.number().min(0).max(100).default(0),
    lastActivityDate: zod_1.z.date().optional(),
});
exports.onboardingProgressSchema = zod_1.z.object({
    step: zod_1.z.number().min(1).max(10),
    completedSteps: zod_1.z.array(zod_1.z.number()),
    skippedSteps: zod_1.z.array(zod_1.z.number()),
    startedAt: zod_1.z.date(),
    completedAt: zod_1.z.date().optional(),
    data: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.dailyGoalSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.enum(["workout", "steps", "water", "sleep", "meditation"]),
    target: zod_1.z.number().positive(),
    current: zod_1.z.number().min(0).default(0),
    unit: zod_1.z.string(),
    completed: zod_1.z.boolean().default(false),
    date: zod_1.z.date(),
});
exports.weeklyGoalSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.enum(["workouts", "active_days", "total_duration", "weight_loss"]),
    target: zod_1.z.number().positive(),
    current: zod_1.z.number().min(0).default(0),
    unit: zod_1.z.string(),
    completed: zod_1.z.boolean().default(false),
    weekStart: zod_1.z.date(),
    weekEnd: zod_1.z.date(),
});
// User schemas
exports.userSchema = zod_1.z.object({
    uid: zod_1.z.string(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string().min(1),
    avatar: zod_1.z.string().url().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    // Enhanced progress tracking
    progressStats: exports.progressStatsSchema.optional(),
    onboardingProgress: exports.onboardingProgressSchema.optional(),
    dailyGoals: zod_1.z.array(exports.dailyGoalSchema).default([]),
    weeklyGoals: zod_1.z.array(exports.weeklyGoalSchema).default([]),
    // Preferences
    preferences: zod_1.z.object({
        notifications: zod_1.z.boolean().default(true),
        reminderTime: zod_1.z.string().optional(),
        weekStartsOn: zod_1.z.enum(["sunday", "monday"]).default("monday"),
        units: zod_1.z.enum(["metric", "imperial"]).default("metric"),
    }).optional(),
});
exports.createUserSchema = exports.userSchema.omit({
    uid: true,
    createdAt: true,
    updatedAt: true,
});
// Goal schemas
exports.goalSchema = zod_1.z.object({
    id: zod_1.z.string(),
    userId: zod_1.z.string(),
    title: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().max(500).optional(),
    metric: zod_1.z.enum(["count", "duration", "distance", "weight"]),
    target: zod_1.z.number().positive(),
    frequency: zod_1.z.enum(["daily", "weekly", "monthly"]),
    isActive: zod_1.z.boolean().default(true),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.createGoalSchema = exports.goalSchema.omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
});
exports.updateGoalSchema = exports.createGoalSchema.partial();
// LogEntry schemas
exports.logEntrySchema = zod_1.z.object({
    id: zod_1.z.string(),
    goalId: zod_1.z.string(),
    userId: zod_1.z.string(),
    date: zod_1.z.date(),
    value: zod_1.z.number().positive(),
    notes: zod_1.z.string().max(500).optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.createLogEntrySchema = exports.logEntrySchema.omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
});
// Enhanced Badge schemas
exports.badgeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    userId: zod_1.z.string(),
    badgeDefinitionId: zod_1.z.string(),
    earnedAt: zod_1.z.date(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
    celebrated: zod_1.z.boolean().default(false),
    progress: zod_1.z.number().min(0).max(100).optional(),
});
exports.badgeDefinitionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().max(500),
    icon: zod_1.z.string(), // Lucide icon name
    iconColor: zod_1.z.string().optional(),
    category: zod_1.z.enum([
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
    requirements: zod_1.z.object({
        type: zod_1.z.string(),
        count: zod_1.z.number().optional(),
        percentage: zod_1.z.number().optional(),
        days: zod_1.z.number().optional(),
        value: zod_1.z.number().optional(),
        goalType: zod_1.z.string().optional(),
    }),
    rarity: zod_1.z.enum(["common", "rare", "epic", "legendary"]),
    points: zod_1.z.number().min(0),
    order: zod_1.z.number().default(0),
    isActive: zod_1.z.boolean().default(true),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
// Progress milestone schema
exports.progressMilestoneSchema = zod_1.z.object({
    id: zod_1.z.string(),
    userId: zod_1.z.string(),
    type: zod_1.z.enum(["daily_goal", "weekly_goal", "streak", "total_workouts", "weight_milestone"]),
    value: zod_1.z.number(),
    achievedAt: zod_1.z.date(),
    celebrated: zod_1.z.boolean().default(false),
});
// Admin user schemas
exports.adminRoleSchema = zod_1.z.enum(["super_admin", "admin", "moderator", "support"]);
exports.adminPermissionSchema = zod_1.z.object({
    users: zod_1.z.object({
        view: zod_1.z.boolean().default(false),
        create: zod_1.z.boolean().default(false),
        edit: zod_1.z.boolean().default(false),
        delete: zod_1.z.boolean().default(false),
        suspend: zod_1.z.boolean().default(false),
    }),
    content: zod_1.z.object({
        view: zod_1.z.boolean().default(false),
        create: zod_1.z.boolean().default(false),
        edit: zod_1.z.boolean().default(false),
        delete: zod_1.z.boolean().default(false),
    }),
    analytics: zod_1.z.object({
        view: zod_1.z.boolean().default(false),
        export: zod_1.z.boolean().default(false),
    }),
    system: zod_1.z.object({
        view: zod_1.z.boolean().default(false),
        settings: zod_1.z.boolean().default(false),
        logs: zod_1.z.boolean().default(false),
    }),
});
exports.adminUserSchema = zod_1.z.object({
    id: zod_1.z.string(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string().min(1),
    role: exports.adminRoleSchema,
    permissions: exports.adminPermissionSchema,
    isActive: zod_1.z.boolean().default(true),
    lastLogin: zod_1.z.date().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    createdBy: zod_1.z.string().optional(), // Admin who created this user
});
exports.createAdminUserSchema = exports.adminUserSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    lastLogin: true,
});
// Audit log schema
exports.auditLogSchema = zod_1.z.object({
    id: zod_1.z.string(),
    adminId: zod_1.z.string(),
    action: zod_1.z.string(),
    resource: zod_1.z.string(),
    resourceId: zod_1.z.string().optional(),
    details: zod_1.z.record(zod_1.z.any()).optional(),
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
    timestamp: zod_1.z.date(),
});
// System stats schema
exports.systemStatsSchema = zod_1.z.object({
    totalUsers: zod_1.z.number(),
    activeUsers: zod_1.z.number(),
    newUsersToday: zod_1.z.number(),
    newUsersThisWeek: zod_1.z.number(),
    totalGoals: zod_1.z.number(),
    completedGoals: zod_1.z.number(),
    totalWorkouts: zod_1.z.number(),
    totalBadgesEarned: zod_1.z.number(),
    averageSessionDuration: zod_1.z.number(),
    retentionRate: zod_1.z.number(),
    lastUpdated: zod_1.z.date(),
});
// API Response schemas
exports.apiResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    message: zod_1.z.string().optional(),
    data: zod_1.z.any().optional(),
});
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.number().int().positive().default(1),
    limit: zod_1.z.number().int().positive().max(100).default(10),
    total: zod_1.z.number().int().nonnegative().optional(),
});
//# sourceMappingURL=index.js.map