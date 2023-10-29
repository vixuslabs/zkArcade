import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { friendships, friendRequests } from "@/server/db/schema/friendships";
import { users } from "@/server/db/schema/users";
import { eq, inArray, and, or, desc } from "drizzle-orm";
import { api } from "@/trpc/server";

type CleanSentRequest = {
  requestId: number;
  receiverId: string;
};

type CleanReceivedRequest = {
  requestId: number;
  senderId: string;
};

interface FriendRequest {
  sentRequests: CleanSentRequest[];
  receivedRequests: CleanReceivedRequest[];
}

export const friendshipRouter = createTRPCRouter({
  getUsersFriends: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId;
    const friendshipsInitiatedByUserPrepared = ctx.db.query.friendships
      .findMany({
        // where: eq(friendships.userId, input.userId),
        where: eq(friendships.userId, userId),
      })
      .prepare();

    const friendshipsReceivedByUserPrepared = ctx.db.query.friendships
      .findMany({
        // where: eq(friendships.friendId, input.userId),
        where: eq(friendships.friendId, userId),
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

  getAllRequestsToUser: protectedProcedure
    .input(
      z.object({
        type: z.enum(["all", "pending", "accepted", "declined"]).default("all"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      const friendRequestsPrepared = ctx.db.query.friendRequests
        .findMany({
          where: eq(friendRequests.receiverId, userId),
        })
        .prepare();

      const execute = await friendRequestsPrepared.execute();

      return execute;
    }),

  getAllRequestsFromUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId;
    const friendRequestsPrepared = ctx.db.query.friendRequests
      .findMany({
        where: eq(friendRequests.senderId, userId),
      })
      .prepare();

    const execute = await friendRequestsPrepared.execute();

    return execute;
  }),

  getAllFriendRequests: protectedProcedure
    .input(
      z.object({
        type: z.enum(["pending", "declined", "accepted", "all"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      // const sentRequestsPrepared = ctx.db.query.friendRequests
      //   .findMany({
      //     where: eq(friendRequests.senderId, input.userId),
      //   })
      //   .prepare();

      // const receivedRequestsPrepared = ctx.db.query.friendRequests
      //   .findMany({
      //     where: eq(friendRequests.receiverId, input.userId),
      //   })
      //   .prepare();

      // const sentRequests = await sentRequestsPrepared.execute();
      // const receivedRequests = await receivedRequestsPrepared.execute();

      // const sentRequests = await api.friendships.getAllRequestsFromUser.query({
      //   userId: input.userId,
      // });

      // const receivedRequests = await api.friendships.getAllRequestsToUser.query(
      //   {
      //     userId: input.userId,
      //   },
      // );

      const allRequests = await ctx.db.query.friendRequests.findMany({
        where: or(
          eq(friendRequests.senderId, userId),
          eq(friendRequests.receiverId, userId),
        ),
        orderBy: desc(friendRequests.updatedAt),
      });

      // let cleanedSentRequests_: CleanSentRequest[] = [];
      // let cleanedReceivedRequests_: CleanReceivedRequest[] = [];

      const [cleanedSentRequests, cleanedReceivedRequests] = allRequests
        .filter((filterR) => {
          if (input.type === "all") {
            return true;
          } else {
            return filterR.status === input.type;
          }
        })
        .reduce(
          (acc, curr) => {
            if (curr.senderId === userId) {
              acc[0].push({
                requestId: curr.requestId,
                receiverId: curr.receiverId,
              });
            } else {
              acc[1].push({
                requestId: curr.requestId,
                senderId: curr.senderId,
              });
            }
            return acc;
          },
          [[], []] as [CleanSentRequest[], CleanReceivedRequest[]],
        );

      // const cleanedSentRequests: CleanSentRequest[] = sentRequests
      //   .filter((filterR) => {
      //     if (input.type === "all") {
      //       return true;
      //     } else {
      //       return filterR.status === input.type;
      //     }
      //   })
      //   .map((mapR) => {
      //     return {
      //       requestId: mapR.requestId,
      //       receiverId: mapR.receiverId,
      //     };
      //   });

      // const cleanedReceivedRequests: CleanReceivedRequest[] = receivedRequests
      //   .filter((filterR) => {
      //     if (input.type === "all") {
      //       return true;
      //     } else {
      //       return filterR.status === input.type;
      //     }
      //   })
      //   .map((mapR) => {
      //     return {
      //       requestId: mapR.requestId,
      //       senderId: mapR.senderId,
      //     };
      //   });

      return {
        sentRequests: cleanedSentRequests,
        receivedRequests: cleanedReceivedRequests,
      };
    }),

  sendFriendRequest: protectedProcedure
    .input(
      z.object({
        receiverId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // need to check if friendship already exists, if so, return error

      const senderId = ctx.auth.userId;

      const friendRequestExists = await ctx.db.query.friendRequests.findFirst({
        where: or(
          and(
            eq(friendRequests.senderId, senderId),
            eq(friendRequests.receiverId, input.receiverId),
          ),
          and(
            eq(friendRequests.senderId, input.receiverId),
            eq(friendRequests.receiverId, senderId),
          ),
        ),
        orderBy: desc(friendRequests.createdAt),
      });

      if (friendRequestExists?.status === "pending") {
        throw new Error("Friend request already sent");
      } else if (friendRequestExists?.status === "accepted") {
        throw new Error("Friend request already accepted");
      } else if (friendRequestExists?.status === "declined") {
        // await ctx.db
        //   .update(friendRequests)
        //   .set({ status: "pending" })
        //   .where(
        //     or(
        //       and(
        //         eq(friendships.userId, input.senderId),
        //         eq(friendships.friendId, input.receiverId),
        //       ),
        //       and(
        //         eq(friendships.userId, input.receiverId),
        //         eq(friendships.friendId, input.senderId),
        //       ),
        //     ),
        //   );
        console.log("friend request already declined");
      }

      await ctx.db.insert(friendRequests).values({
        senderId: senderId,
        receiverId: input.receiverId,
      });
    }),

  getFriendRequest: publicProcedure
    .input(z.object({ requestId: z.number() }))
    .query(async ({ ctx, input }) => {
      const friendRequestsPrepared = ctx.db.query.friendRequests
        .findFirst({
          where: eq(friendRequests.requestId, input.requestId),
          orderBy: desc(friendRequests.updatedAt),
        })
        .prepare();

      const execute = await friendRequestsPrepared.execute();

      return execute;
    }),

  acceptFriendRequest: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const friendRequest = await api.friendships.getFriendRequest.query({
        requestId: input.requestId,
      });

      if (!friendRequest) {
        throw new Error("Friend request not found");
      }

      if (friendRequest.status === "accepted") {
        throw new Error("Friend request already accepted");
      } else if (friendRequest.status === "declined") {
        throw new Error("Friend request already declined");
      }

      await ctx.db
        .update(friendRequests)
        .set({ status: "accepted" })
        .where(eq(friendRequests.requestId, input.requestId));

      await ctx.db.insert(friendships).values({
        userId: friendRequest.senderId,
        friendId: friendRequest.receiverId,
      });
    }),

  declineFriendRequest: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const friendRequest = await api.friendships.getFriendRequest.query({
        requestId: input.requestId,
      });

      if (!friendRequest) {
        throw new Error("Friend request not found");
      }

      if (friendRequest.status === "accepted") {
        throw new Error("Friend request already accepted");
      } else if (friendRequest.status === "declined") {
        throw new Error("Friend request already declined");
      }

      await ctx.db
        .update(friendRequests)
        .set({ status: "declined" })
        .where(eq(friendRequests.requestId, input.requestId));
    }),
});
