import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { users } from "@/server/db/schema/users";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs";

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

      const userClerk = await clerkClient.users.getUser(userDB.id);

      return {
        id: userDB.id,
        username: userDB.username,
        firstName: userDB.firstName,
        image_url: userClerk.imageUrl,
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
      firstName: userDB.firstName,
      image_url: userClerk.imageUrl,
    };
  }),

  createUser: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        username: z.string().min(1),
        firstName: z.string().min(1).optional(),
        email: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(users).values({
        id: input.id,
        username: input.username,
        firstName: input.firstName,
        email: input.email,
      });
    }),

  deleteUser: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(users).where(eq(users.id, input.id));
    }),

  // updateUser: protectedProcedure.
});
