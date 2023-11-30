import { createTRPCRouter } from "./trpc";
import { userRouter } from "./routers/user";
import { friendshipRouter } from "./routers/friendship";
import { gameRouter } from "./routers/game";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  users: userRouter,
  friendships: friendshipRouter,
  games: gameRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
