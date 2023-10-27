import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { users } from "@/server/db/schema";

export const userRouter = createTRPCRouter({
  getUser: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(({ ctx, input }) => {
      return ctx.db.query.users.findFirst({
        with: { id: input.id },
      });
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
      console.log("input", input);
      console.log(`ctx`, ctx);
      await ctx.db.insert(users).values({
        id: input.id,
        username: input.username,
        firstName: input.firstName,
        email: input.email,
      });
    }),

  // updateUser: protectedProcedure.
});
