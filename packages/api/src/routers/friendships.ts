import { clerkClient } from "@clerk/nextjs";
import { and, desc, eq, or } from "drizzle-orm";
import { z } from "zod";

import type { db as Drizzle } from "@zkarcade/db";
import { friendRequests, friendships } from "@zkarcade/db/schema/friendships";

import { pusher } from "../pusher/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

interface CleanSentRequest {
  requestId: number;
  receiverId: string;
}

interface CleanReceivedRequest {
  requestId: number;
  senderId: string;
}

const getFriendRequest = async (requestId: number, db: typeof Drizzle) => {
  const friendRequestsPrepared = db.query.friendRequests
    .findFirst({
      where: eq(friendRequests.requestId, requestId),
      orderBy: desc(friendRequests.updatedAt),
    })
    .prepare();

  const execute = await friendRequestsPrepared.execute();

  return execute;
};

export const friendshipRouter = createTRPCRouter({
  getUsersFriends: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId;

    const friendsPrepared = ctx.db.query.friendships
      .findMany({
        where: or(
          eq(friendships.userId, userId),
          eq(friendships.friendId, userId),
        ),
        with: {
          user: true,
          friend: true,
        },
      })
      .prepare();

    const friends = await friendsPrepared.execute();

    const cleanedFriends = [];

    for (const friend of friends) {
      if (friend.userId === userId) {
        cleanedFriends.push(friend.friend);
      } else {
        cleanedFriends.push(friend.user);
      }
    }

    return cleanedFriends;
  }),

  deleteFriend: protectedProcedure
    .input(z.object({ userId: z.string().min(1), friendId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
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

  getFriendRequests: protectedProcedure
    .input(
      z.object({
        role: z.enum(["sender", "receiver"]).optional(),
        status: z.enum(["pending", "accepted", "declined"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;

      let whereClause;

      if (input.role === "sender") {
        whereClause = eq(friendRequests.senderId, userId);
      } else if (input.role === "receiver") {
        whereClause = eq(friendRequests.receiverId, userId);
      } else {
        whereClause = or(
          eq(friendRequests.senderId, userId),
          eq(friendRequests.receiverId, userId),
        );
      }

      if (input.status !== undefined) {
        whereClause = and(whereClause, eq(friendRequests.status, input.status));
      }

      const friendRequestsPrepared = ctx.db.query.friendRequests
        .findMany({
          where: whereClause,
          with: {
            sender: true,
            receiver: true,
          },
        })
        .prepare();

      const requests = await friendRequestsPrepared.execute();

      const finalRequests = await Promise.all(
        requests.map(async (request) => {
          const user = await clerkClient.users.getUser(request.senderId);

          return {
            requestId: request.requestId,
            sender: {
              id: request.senderId,
              username: request.sender.username,
              imageUrl: user.imageUrl,
            },
          };
        }),
      );

      return finalRequests;
    }),

  getAllRequestsToUser: protectedProcedure
    .input(
      z.object({
        type: z.enum(["pending", "accepted", "declined"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      const friendRequestsPrepared = ctx.db.query.friendRequests
        .findMany({
          where:
            input.type !== undefined
              ? and(
                  eq(friendRequests.receiverId, userId),
                  eq(friendRequests.status, input.type),
                )
              : eq(friendRequests.receiverId, userId),
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
      console.log("inside sendFriendRequest");
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
        imageUrl: user.imageUrl,
        requestId: Number(res.insertId),
      });

      const cutId = input.receiverId.split("_")[1];
      console.log("cutId: ", cutId);
      // should only do this when they are online
      await pusher.trigger(`user-${cutId}-friends`, `friend-request-pending`, {
        username: user.username,
        imageUrl: user.imageUrl,
        requestId: Number(res.insertId),
        showToast: true,
      });
    }),

  getFriendRequest: publicProcedure
    .input(z.object({ requestId: z.number() }))
    .query(async ({ ctx, input }) => {
      const friendRequest = await getFriendRequest(input.requestId, ctx.db);

      return friendRequest;

      // const friendRequestsPrepared = ctx.db.query.friendRequests
      //   .findFirst({
      //     where: eq(friendRequests.requestId, input.requestId),
      //     orderBy: desc(friendRequests.updatedAt),
      //   })
      //   .prepare();

      // const execute = await friendRequestsPrepared.execute();

      // return execute;
    }),

  acceptFriendRequest: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const friendRequest = await getFriendRequest(input.requestId, ctx.db);

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

      const cutReceiverId = friendRequest.receiverId.split("_")[1];
      const cutSenderId = friendRequest.senderId.split("_")[1];

      await pusher.trigger(`user-${cutReceiverId}-friends`, `friend-added`, {
        username: friend.username,
        imageUrl: friend.imageUrl,
        showToast: false,
      });

      // Will need to config this so it only works when the user
      // is online. Otherwise, it will be a waste.
      await pusher.trigger(`user-${cutSenderId}-friends`, `friend-added`, {
        username: user.username,
        imageUrl: user.imageUrl,
        showToast: true,
      });
    }),

  declineFriendRequest: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const friendRequest = await getFriendRequest(input.requestId, ctx.db);

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
