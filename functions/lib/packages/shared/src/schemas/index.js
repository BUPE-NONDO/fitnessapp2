"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSchema = exports.apiResponseSchema = exports.badgeDefinitionSchema = exports.badgeSchema = exports.createLogEntrySchema = exports.logEntrySchema = exports.updateGoalSchema = exports.createGoalSchema = exports.goalSchema = exports.createUserSchema = exports.userSchema = void 0;
const zod_1 = require("zod");
// User schemas
exports.userSchema = zod_1.z.object({
    uid: zod_1.z.string(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string().min(1),
    avatar: zod_1.z.string().url().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
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
// Badge schemas
exports.badgeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    userId: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    iconUrl: zod_1.z.string().url(),
    unlockedAt: zod_1.z.date(),
});
exports.badgeDefinitionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    iconUrl: zod_1.z.string().url(),
    criteria: zod_1.z.object({
        type: zod_1.z.enum(["streak", "total", "frequency"]),
        value: zod_1.z.number().positive(),
        metric: zod_1.z.string(),
    }),
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