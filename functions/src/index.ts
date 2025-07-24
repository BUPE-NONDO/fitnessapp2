// Firebase Cloud Functions entry point with tRPC router
import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { initTRPC } from "@trpc/server";
import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { z } from "zod";
import * as admin from "firebase-admin";

// Import schemas from shared package
import {
  userSchema,
  goalSchema,
  createGoalSchema,
  logEntrySchema,
  createLogEntrySchema,
  apiResponseSchema,
} from "@fitness-app/shared";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Initialize tRPC
const t = initTRPC.create();

// Create router
const appRouter = t.router({
  // Health check
  health: t.procedure.query(() => {
    logger.info("Health check called");
    return { status: "ok", timestamp: new Date().toISOString() };
  }),

  // User procedures
  user: t.router({
    // Get current user profile
    getProfile: t.procedure
      .input(z.object({ uid: z.string() }))
      .query(async ({ input }) => {
        logger.info("Getting user profile", { uid: input.uid });

        try {
          const userDoc = await db.collection("users").doc(input.uid).get();

          if (!userDoc.exists) {
            throw new Error("User not found");
          }

          return {
            success: true,
            data: userDoc.data(),
          };
        } catch (error) {
          logger.error("Error getting user profile", error);
          throw new Error("Failed to get user profile");
        }
      }),
  }),

  // Goal procedures
  goal: t.router({
    // Get all goals for a user
    getAll: t.procedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ input }) => {
        logger.info("Getting all goals", { userId: input.userId });

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
        } catch (error) {
          logger.error("Error getting goals", error);
          throw new Error("Failed to get goals");
        }
      }),

    // Create a new goal
    create: t.procedure
      .input(createGoalSchema.extend({ userId: z.string() }))
      .mutation(async ({ input }) => {
        logger.info("Creating goal", { userId: input.userId, title: input.title });

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
        } catch (error) {
          logger.error("Error creating goal", error);
          throw new Error("Failed to create goal");
        }
      }),

    // Update an existing goal
    update: t.procedure
      .input(
        z.object({
          id: z.string(),
          userId: z.string(),
          title: z.string().optional(),
          description: z.string().optional(),
          metric: z.enum(["count", "duration", "distance", "weight"]).optional(),
          target: z.number().positive().optional(),
          frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        logger.info("Updating goal", { goalId: input.id, userId: input.userId });

        try {
          const { id, userId, ...updateData } = input;

          // Verify goal ownership
          const goalDoc = await db.collection("goals").doc(id).get();
          if (!goalDoc.exists) {
            throw new Error("Goal not found");
          }

          const goalData = goalDoc.data();
          if (goalData?.userId !== userId) {
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
        } catch (error) {
          logger.error("Error updating goal", error);
          throw new Error("Failed to update goal");
        }
      }),

    // Delete a goal (soft delete by setting isActive to false)
    delete: t.procedure
      .input(z.object({ id: z.string(), userId: z.string() }))
      .mutation(async ({ input }) => {
        logger.info("Deleting goal", { goalId: input.id, userId: input.userId });

        try {
          // Verify goal ownership
          const goalDoc = await db.collection("goals").doc(input.id).get();
          if (!goalDoc.exists) {
            throw new Error("Goal not found");
          }

          const goalData = goalDoc.data();
          if (goalData?.userId !== input.userId) {
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
        } catch (error) {
          logger.error("Error deleting goal", error);
          throw new Error("Failed to delete goal");
        }
      }),

    // Get a single goal by ID
    getById: t.procedure
      .input(z.object({ id: z.string(), userId: z.string() }))
      .query(async ({ input }) => {
        logger.info("Getting goal by ID", { goalId: input.id, userId: input.userId });

        try {
          const goalDoc = await db.collection("goals").doc(input.id).get();

          if (!goalDoc.exists) {
            throw new Error("Goal not found");
          }

          const goalData = goalDoc.data();
          if (goalData?.userId !== input.userId) {
            throw new Error("Unauthorized: Goal does not belong to user");
          }

          return {
            success: true,
            data: { id: goalDoc.id, ...goalData },
          };
        } catch (error) {
          logger.error("Error getting goal by ID", error);
          throw new Error("Failed to get goal");
        }
      }),
  }),

  // Log procedures
  log: t.router({
    // Get all logs for a user
    getAll: t.procedure
      .input(z.object({ userId: z.string(), limit: z.number().optional().default(100) }))
      .query(async ({ input }) => {
        logger.info("Getting all logs for user", { userId: input.userId });

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
        } catch (error) {
          logger.error("Error getting all logs", error);
          throw new Error("Failed to get logs");
        }
      }),

    // Get logs for a specific goal
    getByGoal: t.procedure
      .input(z.object({ goalId: z.string(), userId: z.string(), limit: z.number().optional().default(50) }))
      .query(async ({ input }) => {
        logger.info("Getting logs by goal", { goalId: input.goalId, userId: input.userId });

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
        } catch (error) {
          logger.error("Error getting logs", error);
          throw new Error("Failed to get logs");
        }
      }),

    // Create a new log entry
    create: t.procedure
      .input(createLogEntrySchema.extend({ userId: z.string() }))
      .mutation(async ({ input }) => {
        logger.info("Creating log entry", { goalId: input.goalId, userId: input.userId });

        try {
          // Verify goal ownership
          const goalDoc = await db.collection("goals").doc(input.goalId).get();
          if (!goalDoc.exists) {
            throw new Error("Goal not found");
          }

          const goalData = goalDoc.data();
          if (goalData?.userId !== input.userId) {
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
        } catch (error) {
          logger.error("Error creating log entry", error);
          throw new Error("Failed to create log entry");
        }
      }),

    // Update a log entry
    update: t.procedure
      .input(
        z.object({
          id: z.string(),
          userId: z.string(),
          date: z.date().optional(),
          value: z.number().positive().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        logger.info("Updating log entry", { logId: input.id, userId: input.userId });

        try {
          const { id, userId, ...updateData } = input;

          // Verify log ownership
          const logDoc = await db.collection("logs").doc(id).get();
          if (!logDoc.exists) {
            throw new Error("Log entry not found");
          }

          const logData = logDoc.data();
          if (logData?.userId !== userId) {
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
        } catch (error) {
          logger.error("Error updating log entry", error);
          throw new Error("Failed to update log entry");
        }
      }),

    // Delete a log entry
    delete: t.procedure
      .input(z.object({ id: z.string(), userId: z.string() }))
      .mutation(async ({ input }) => {
        logger.info("Deleting log entry", { logId: input.id, userId: input.userId });

        try {
          // Verify log ownership
          const logDoc = await db.collection("logs").doc(input.id).get();
          if (!logDoc.exists) {
            throw new Error("Log entry not found");
          }

          const logData = logDoc.data();
          if (logData?.userId !== input.userId) {
            throw new Error("Unauthorized: Log entry does not belong to user");
          }

          // Delete the log entry
          await db.collection("logs").doc(input.id).delete();

          return {
            success: true,
            data: { id: input.id, deleted: true },
          };
        } catch (error) {
          logger.error("Error deleting log entry", error);
          throw new Error("Failed to delete log entry");
        }
      }),
  }),
});

// Export type definition of API
export type AppRouter = typeof appRouter;

// Create HTTP handler
const handler = createHTTPHandler({
  router: appRouter,
  createContext: () => ({}),
});

// Export the tRPC API as a Firebase Function
export const api = onRequest(
  {
    cors: true,
    maxInstances: 10,
  },
  (req, res) => {
    logger.info("tRPC API called", { method: req.method, url: req.url });
    return handler(req, res);
  }
);
