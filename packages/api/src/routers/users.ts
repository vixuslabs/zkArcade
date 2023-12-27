import { clerkClient } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { users } from "@zkarcade/db/schema/users";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getUser: protectedProcedure
    .input(z.object({ username: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      // testing prepared statements
      const query = ctx.db.query.users
        .findFirst({
          where: eq(users.username, input.username),
        })
        .prepare();

      const userDB = await query.execute();

      if (!userDB) {
        return null;
      }

      return {
        id: userDB.id,
        username: userDB.username,
        image_url: userDB.imageUrl,
      };
    }),

  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const userClerk = await clerkClient.users.getUser(ctx.auth.userId);

    const query = ctx.db.query.users
      .findFirst({
        where: eq(users.id, userClerk.id),
      })
      .prepare();

    const userDB = await query.execute();

    if (!userDB) return null;

    return {
      id: userClerk.id,
      username: userDB.username,
      image_url: userDB.imageUrl,
    };
  }),

  createUser: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        username: z.string().min(1),
        imageUrl: z.string().min(1),
        email: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(users).values({
        id: input.id,
        username: input.username,
        imageUrl: input.imageUrl,
        email: input.email,
      });
    }),

  updateUser: publicProcedure
    .input(
      z.object({
        id: z.string().startsWith("user_"),
        username: z.string().optional(),
        imageUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: Partial<typeof users.$inferSelect> = {};

      console.log("input", input);

      if (input.username !== undefined) {
        updateData.username = input.username;
      }

      if (input.imageUrl !== undefined) {
        updateData.imageUrl = input.imageUrl;
      }

      /**
       * TODO: Check if username already exists
       */

      await ctx.db
        .update(users)
        .set({ ...updateData })
        .where(eq(users.id, input.id));
    }),

  deleteUser: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(users).where(eq(users.id, input.id));
    }),
});
