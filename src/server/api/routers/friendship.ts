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
import { pusher } from "@/pusher/server";
import { clerkClient } from "@clerk/nextjs";

type CleanSentRequest = {
  requestId: number;
  receiverId: string;
};

type CleanReceivedRequest = {
  requestId: number;
  senderId: string;
};

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

  deleteAllFriends: publicProcedure
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

      const allRequests = await ctx.db.query.friendRequests.findMany({
        where: or(
          eq(friendRequests.senderId, userId),
          eq(friendRequests.receiverId, userId),
        ),
        orderBy: desc(friendRequests.updatedAt),
      });

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

      console.log("senderId: ", senderId);

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
        // throw new Error("Friend request already accepted");
      }

      const res = await ctx.db.insert(friendRequests).values({
        senderId: senderId,
        receiverId: input.receiverId,
      });

      const user = await clerkClient.users.getUser(senderId);

      console.log({
        username: user.username,
        firstName: user.firstName,
        imageUrl: user.imageUrl,
        requestId: Number(res.insertId),
      });

      // should only do this when they are online
      await pusher.trigger(
        "friends",
        `user:${input.receiverId}:friend-request-pending`,
        {
          username: user.username,
          firstName: user.firstName,
          imageUrl: user.imageUrl,
          requestId: res.insertId,
          showToast: true,
        },
      );
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
        userId: friendRequest.receiverId,
        friendId: friendRequest.senderId,
      });

      const friend = await clerkClient.users.getUser(friendRequest.senderId);

      const user = await clerkClient.users.getUser(friendRequest.receiverId);

      await pusher.trigger(
        "friends",
        `user:${friendRequest.receiverId}:friend-added`,
        {
          username: friend.username,
          firstName: friend.firstName,
          imageUrl: friend.imageUrl,
          showToast: false,
        },
      );

      // Will need to config this so it only works when the user
      // is online. Otherwise, it will be a waste.
      await pusher.trigger(
        "friends",
        `user:${friendRequest.senderId}:friend-added`,
        {
          username: user.username,
          firstName: user.firstName,
          imageUrl: user.imageUrl,
          showToast: true,
        },
      );
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
