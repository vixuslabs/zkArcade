import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { users } from "@/server/db/schema/users";
import { eq } from "drizzle-orm";

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

      return await query.execute();
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
