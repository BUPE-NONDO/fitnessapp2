"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
// Firebase Cloud Functions entry point with tRPC router
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
const server_1 = require("@trpc/server");
const standalone_1 = require("@trpc/server/adapters/standalone");
const zod_1 = require("zod");
const admin = __importStar(require("firebase-admin"));
// Import schemas from shared package
const shared_1 = require("@fitness-app/shared");
// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// Initialize tRPC
const t = server_1.initTRPC.create();
// Create router
const appRouter = t.router({
    // Health check
    health: t.procedure.query(() => {
        firebase_functions_1.logger.info("Health check called");
        return { status: "ok", timestamp: new Date().toISOString() };
    }),
    // User procedures
    user: t.router({
        // Get current user profile
        getProfile: t.procedure
            .input(zod_1.z.object({ uid: zod_1.z.string() }))
            .query(async ({ input }) => {
            firebase_functions_1.logger.info("Getting user profile", { uid: input.uid });
            try {
                const userDoc = await db.collection("users").doc(input.uid).get();
                if (!userDoc.exists) {
                    throw new Error("User not found");
                }
                return {
                    success: true,
                    data: userDoc.data(),
                };
            }
            catch (error) {
                firebase_functions_1.logger.error("Error getting user profile", error);
                throw new Error("Failed to get user profile");
            }
        }),
    }),
    // Goal procedures
    goal: t.router({
        // Get all goals for a user
        getAll: t.procedure
            .input(zod_1.z.object({ userId: zod_1.z.string() }))
            .query(async ({ input }) => {
            firebase_functions_1.logger.info("Getting all goals", { userId: input.userId });
            try {
                const goalsSnapshot = await db
                    .collection("goals")
                    .where("userId", "==", input.userId)
                    .where("isActive", "==", true)
                    .orderBy("createdAt", "desc")
                    .get();
                const goals = goalsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                return {
                    success: true,
                    data: goals,
                };
            }
            catch (error) {
                firebase_functions_1.logger.error("Error getting goals", error);
                throw new Error("Failed to get goals");
            }
        }),
        // Create a new goal
        create: t.procedure
            .input(shared_1.createGoalSchema.extend({ userId: zod_1.z.string() }))
            .mutation(async ({ input }) => {
            firebase_functions_1.logger.info("Creating goal", { userId: input.userId, title: input.title });
            try {
                const goalData = {
                    ...input,
                    isActive: true,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                };
                const goalRef = await db.collection("goals").add(goalData);
                return {
                    success: true,
                    data: { id: goalRef.id, ...goalData },
                };
            }
            catch (error) {
                firebase_functions_1.logger.error("Error creating goal", error);
                throw new Error("Failed to create goal");
            }
        }),
        // Update an existing goal
        update: t.procedure
            .input(zod_1.z.object({
            id: zod_1.z.string(),
            userId: zod_1.z.string(),
            title: zod_1.z.string().optional(),
            description: zod_1.z.string().optional(),
            metric: zod_1.z.enum(["count", "duration", "distance", "weight"]).optional(),
            target: zod_1.z.number().positive().optional(),
            frequency: zod_1.z.enum(["daily", "weekly", "monthly"]).optional(),
            isActive: zod_1.z.boolean().optional(),
        }))
            .mutation(async ({ input }) => {
            firebase_functions_1.logger.info("Updating goal", { goalId: input.id, userId: input.userId });
            try {
                const { id, userId, ...updateData } = input;
                // Verify goal ownership
                const goalDoc = await db.collection("goals").doc(id).get();
                if (!goalDoc.exists) {
                    throw new Error("Goal not found");
                }
                const goalData = goalDoc.data();
                if ((goalData === null || goalData === void 0 ? void 0 : goalData.userId) !== userId) {
                    throw new Error("Unauthorized: Goal does not belong to user");
                }
                // Update the goal
                const updatedData = {
                    ...updateData,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                };
                await db.collection("goals").doc(id).update(updatedData);
                return {
                    success: true,
                    data: { id, ...goalData, ...updatedData },
                };
            }
            catch (error) {
                firebase_functions_1.logger.error("Error updating goal", error);
                throw new Error("Failed to update goal");
            }
        }),
        // Delete a goal (soft delete by setting isActive to false)
        delete: t.procedure
            .input(zod_1.z.object({ id: zod_1.z.string(), userId: zod_1.z.string() }))
            .mutation(async ({ input }) => {
            firebase_functions_1.logger.info("Deleting goal", { goalId: input.id, userId: input.userId });
            try {
                // Verify goal ownership
                const goalDoc = await db.collection("goals").doc(input.id).get();
                if (!goalDoc.exists) {
                    throw new Error("Goal not found");
                }
                const goalData = goalDoc.data();
                if ((goalData === null || goalData === void 0 ? void 0 : goalData.userId) !== input.userId) {
                    throw new Error("Unauthorized: Goal does not belong to user");
                }
                // Soft delete by setting isActive to false
                await db.collection("goals").doc(input.id).update({
                    isActive: false,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                return {
                    success: true,
                    data: { id: input.id, deleted: true },
                };
            }
            catch (error) {
                firebase_functions_1.logger.error("Error deleting goal", error);
                throw new Error("Failed to delete goal");
            }
        }),
        // Get a single goal by ID
        getById: t.procedure
            .input(zod_1.z.object({ id: zod_1.z.string(), userId: zod_1.z.string() }))
            .query(async ({ input }) => {
            firebase_functions_1.logger.info("Getting goal by ID", { goalId: input.id, userId: input.userId });
            try {
                const goalDoc = await db.collection("goals").doc(input.id).get();
                if (!goalDoc.exists) {
                    throw new Error("Goal not found");
                }
                const goalData = goalDoc.data();
                if ((goalData === null || goalData === void 0 ? void 0 : goalData.userId) !== input.userId) {
                    throw new Error("Unauthorized: Goal does not belong to user");
                }
                return {
                    success: true,
                    data: { id: goalDoc.id, ...goalData },
                };
            }
            catch (error) {
                firebase_functions_1.logger.error("Error getting goal by ID", error);
                throw new Error("Failed to get goal");
            }
        }),
    }),
    // Log procedures
    log: t.router({
        // Get all logs for a user
        getAll: t.procedure
            .input(zod_1.z.object({ userId: zod_1.z.string(), limit: zod_1.z.number().optional().default(100) }))
            .query(async ({ input }) => {
            firebase_functions_1.logger.info("Getting all logs for user", { userId: input.userId });
            try {
                const logsSnapshot = await db
                    .collection("logs")
                    .where("userId", "==", input.userId)
                    .orderBy("date", "desc")
                    .limit(input.limit)
                    .get();
                const logs = logsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                return {
                    success: true,
                    data: logs,
                };
            }
            catch (error) {
                firebase_functions_1.logger.error("Error getting all logs", error);
                throw new Error("Failed to get logs");
            }
        }),
        // Get logs for a specific goal
        getByGoal: t.procedure
            .input(zod_1.z.object({ goalId: zod_1.z.string(), userId: zod_1.z.string(), limit: zod_1.z.number().optional().default(50) }))
            .query(async ({ input }) => {
            firebase_functions_1.logger.info("Getting logs by goal", { goalId: input.goalId, userId: input.userId });
            try {
                const logsSnapshot = await db
                    .collection("logs")
                    .where("goalId", "==", input.goalId)
                    .where("userId", "==", input.userId)
                    .orderBy("date", "desc")
                    .limit(input.limit)
                    .get();
                const logs = logsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                return {
                    success: true,
                    data: logs,
                };
            }
            catch (error) {
                firebase_functions_1.logger.error("Error getting logs", error);
                throw new Error("Failed to get logs");
            }
        }),
        // Create a new log entry
        create: t.procedure
            .input(shared_1.createLogEntrySchema.extend({ userId: zod_1.z.string() }))
            .mutation(async ({ input }) => {
            firebase_functions_1.logger.info("Creating log entry", { goalId: input.goalId, userId: input.userId });
            try {
                // Verify goal ownership
                const goalDoc = await db.collection("goals").doc(input.goalId).get();
                if (!goalDoc.exists) {
                    throw new Error("Goal not found");
                }
                const goalData = goalDoc.data();
                if ((goalData === null || goalData === void 0 ? void 0 : goalData.userId) !== input.userId) {
                    throw new Error("Unauthorized: Goal does not belong to user");
                }
                const logData = {
                    ...input,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                };
                const logRef = await db.collection("logs").add(logData);
                return {
                    success: true,
                    data: { id: logRef.id, ...logData },
                };
            }
            catch (error) {
                firebase_functions_1.logger.error("Error creating log entry", error);
                throw new Error("Failed to create log entry");
            }
        }),
        // Update a log entry
        update: t.procedure
            .input(zod_1.z.object({
            id: zod_1.z.string(),
            userId: zod_1.z.string(),
            date: zod_1.z.date().optional(),
            value: zod_1.z.number().positive().optional(),
            notes: zod_1.z.string().optional(),
        }))
            .mutation(async ({ input }) => {
            firebase_functions_1.logger.info("Updating log entry", { logId: input.id, userId: input.userId });
            try {
                const { id, userId, ...updateData } = input;
                // Verify log ownership
                const logDoc = await db.collection("logs").doc(id).get();
                if (!logDoc.exists) {
                    throw new Error("Log entry not found");
                }
                const logData = logDoc.data();
                if ((logData === null || logData === void 0 ? void 0 : logData.userId) !== userId) {
                    throw new Error("Unauthorized: Log entry does not belong to user");
                }
                // Update the log entry
                const updatedData = {
                    ...updateData,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                };
                await db.collection("logs").doc(id).update(updatedData);
                return {
                    success: true,
                    data: { id, ...logData, ...updatedData },
                };
            }
            catch (error) {
                firebase_functions_1.logger.error("Error updating log entry", error);
                throw new Error("Failed to update log entry");
            }
        }),
        // Delete a log entry
        delete: t.procedure
            .input(zod_1.z.object({ id: zod_1.z.string(), userId: zod_1.z.string() }))
            .mutation(async ({ input }) => {
            firebase_functions_1.logger.info("Deleting log entry", { logId: input.id, userId: input.userId });
            try {
                // Verify log ownership
                const logDoc = await db.collection("logs").doc(input.id).get();
                if (!logDoc.exists) {
                    throw new Error("Log entry not found");
                }
                const logData = logDoc.data();
                if ((logData === null || logData === void 0 ? void 0 : logData.userId) !== input.userId) {
                    throw new Error("Unauthorized: Log entry does not belong to user");
                }
                // Delete the log entry
                await db.collection("logs").doc(input.id).delete();
                return {
                    success: true,
                    data: { id: input.id, deleted: true },
                };
            }
            catch (error) {
                firebase_functions_1.logger.error("Error deleting log entry", error);
                throw new Error("Failed to delete log entry");
            }
        }),
    }),
});
// Create HTTP handler
const handler = (0, standalone_1.createHTTPHandler)({
    router: appRouter,
    createContext: () => ({}),
});
// Export the tRPC API as a Firebase Function
exports.api = (0, https_1.onRequest)({
    cors: true,
    maxInstances: 10,
}, (req, res) => {
    firebase_functions_1.logger.info("tRPC API called", { method: req.method, url: req.url });
    return handler(req, res);
});
//# sourceMappingURL=index.js.map