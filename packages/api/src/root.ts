import { friendshipRouter } from "./routers/friendships";
import { gameRouter } from "./routers/games";
import { userRouter } from "./routers/users";
// import { createCallerFactory, createTRPCRouter } from "./trpc";
import { createTRPCRouter } from "./trpc";

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

// export const createCaller = createCallerFactory<AppRouter>(appRouter);
