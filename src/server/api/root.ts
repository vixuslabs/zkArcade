import { createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "@/server/api/routers/user";
import { friendshipRouter } from "@/server/api/routers/friendship";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  // post: postRouter,
  users: userRouter,
  friendships: friendshipRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
