import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { friendships } from "@/server/db/schema/friendships";
import { users } from "@/server/db/schema/users";
import { eq, inArray, and, or } from "drizzle-orm";

export const friendshipRouter = createTRPCRouter({
  getUsersFriends: protectedProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const friendshipsInitiatedByUserPrepared = ctx.db.query.friendships
        .findMany({
          where: eq(friendships.userId, input.userId),
        })
        .prepare();

      const friendshipsReceivedByUserPrepared = ctx.db.query.friendships
        .findMany({
          where: eq(friendships.friendId, input.userId),
        })
        .prepare();

      const friendshipsInitiatedByUser =
        await friendshipsInitiatedByUserPrepared.execute();

      const friendshipsReceivedByUser =
        await friendshipsReceivedByUserPrepared.execute();

      const friendIdsInitiatedByUser = friendshipsInitiatedByUser.map(
        (f) => f.friendId,
      );
      const friendIdsReceivedByUser = friendshipsReceivedByUser.map(
        (f) => f.userId,
      );

      const allFriendIds = [
        ...new Set([...friendIdsInitiatedByUser, ...friendIdsReceivedByUser]),
      ];

      if (allFriendIds.length === 0) {
        return [];
      }

      const friends = await ctx.db.query.users.findMany({
        where: inArray(users.id, allFriendIds),
      });

      return friends;
    }),

  addFriend: protectedProcedure
    .input(z.object({ userId: z.string().min(1), friendId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // need to check if friendship already exists, if so, return error
      // also need to check if user is trying to add themselves as a friend, if so, return error
      // as well as ensure that the friend request has been accepted by the friend, if not, return error
      await ctx.db.insert(friendships).values({
        userId: input.userId,
        friendId: input.friendId,
      });
    }),

  deleteFriend: protectedProcedure
    .input(z.object({ userId: z.string().min(1), friendId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      //   return await ctx.db
      //     .delete(friendships)
      //     .where(
      //       and(
      //         eq(friendships.userId, input.userId),
      //         eq(friendships.friendId, input.friendId),
      //       ),
      //     );

      return await ctx.db
        .delete(friendships)
        .where(
          or(
            and(
              eq(friendships.userId, input.userId),
              eq(friendships.friendId, input.friendId),
            ),
            and(
              eq(friendships.userId, input.friendId),
              eq(friendships.friendId, input.userId),
            ),
          ),
        );
    }),

  deleteAllFriends: protectedProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .delete(friendships)
        .where(
          or(
            eq(friendships.userId, input.userId),
            eq(friendships.friendId, input.userId),
          ),
        );
    }),
});
