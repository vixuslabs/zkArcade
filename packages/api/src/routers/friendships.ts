import { and, desc, eq, or } from "drizzle-orm";
import { z } from "zod";

import type { db as Drizzle } from "@zkarcade/db";
import { friendRequests, friendships } from "@zkarcade/db/schema/friendships";
import { users } from "@zkarcade/db/schema/users";

import { pusher } from "../pusher/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

interface FriendData {
  username: string;
  imageUrl: string;
  id: string;
  requestId?: number;
  friendId?: string;
  showToast?: boolean;
  gameId?: string;
}

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

export const getUser = async (userId: string, db: typeof Drizzle) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const friendshipRouter = createTRPCRouter({
  getUsersFriends: protectedProcedure
    .input(z.object({ externalLink: z.boolean().optional().default(false) }))
    .query(async ({ input, ctx }) => {
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

      const friendshipsRaw = await friendsPrepared.execute();

      const cleanedFriends = [];

      for (const friendship of friendshipsRaw) {
        if (friendship.userId === userId) {
          if (input.externalLink) {
            friendship.friend.imageUrl = `/api/imageProxy?url=${encodeURIComponent(
              friendship.friend.imageUrl ?? "",
            )}`;
          }
          cleanedFriends.push(friendship.friend);
        } else {
          if (input.externalLink) {
            friendship.user.imageUrl = `/api/imageProxy?url=${encodeURIComponent(
              friendship.user.imageUrl ?? "",
            )}`;
          }
          cleanedFriends.push(friendship.user);
        }
      }

      return cleanedFriends;
    }),

  deleteFriend: protectedProcedure
    .input(z.object({ userId: z.string().min(1), friendId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const friendship = await ctx.db.query.friendships.findFirst({
        where: or(
          and(
            eq(friendships.userId, input.userId),
            eq(friendships.friendId, input.friendId),
          ),
          and(
            eq(friendships.userId, input.friendId),
            eq(friendships.friendId, input.userId),
          ),
        ),
        with: {
          user: true,
          friend: true,
        },
      });

      if (!friendship) {
        throw new Error("Friendship not found");
      }

      const deletedFriendRequest = await ctx.db
        .delete(friendRequests)
        .where(
          or(
            and(
              eq(friendRequests.senderId, input.userId),
              eq(friendRequests.receiverId, input.friendId),
            ),
            and(
              eq(friendRequests.senderId, input.friendId),
              eq(friendRequests.receiverId, input.userId),
            ),
          ),
        );

      if (deletedFriendRequest.rowsAffected === 0) {
        throw new Error("Deleted Friend request not found");
      }

      const res = await ctx.db
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

      if (res.rowsAffected === 0) {
        throw new Error("Friendship not found");
      }

      const pusherData: FriendData = {
        username: friendship.friend.username,
        imageUrl: `/api/imageProxy?url=${encodeURIComponent(
          friendship.friend.imageUrl ?? "",
        )}`,
        id: friendship.friend.id,
      };

      const cutUserId = input.userId.split("_")[1];

      await pusher.trigger(
        `user-${cutUserId}-friends`,
        `friend-deleted`,
        pusherData,
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
          // const user = await clerkClient.users.getUser(request.senderId);
          const user = await getUser(request.senderId, ctx.db);

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
          with: {
            sender: true,
            receiver: true,
          },
        })
        .prepare();

      const execute = await friendRequestsPrepared.execute();

      const friendRequestsFiltered = execute.map((request) => {
        return {
          ...request,
          type: "friendRequest" as "friendRequest" | "gameInvite",
        };
      });

      return friendRequestsFiltered;
      // return friendRequests;
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
        console.log("friend request already declined");
      }

      const res = await ctx.db.insert(friendRequests).values({
        senderId: senderId,
        receiverId: input.receiverId,
      });

      // const user = await clerkClient.users.getUser(senderId);
      const user = await getUser(senderId, ctx.db);

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
        imageUrl: `/api/imageProxy?url=${encodeURIComponent(
          user.imageUrl ?? "",
        )}`,
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

      // const friend = await clerkClient.users.getUser(friendRequest.senderId);
      const friend = await getUser(friendRequest.senderId, ctx.db);

      // const user = await clerkClient.users.getUser(friendRequest.receiverId);
      const user = await getUser(friendRequest.receiverId, ctx.db);

      const cutReceiverId = friendRequest.receiverId.split("_")[1];
      const cutSenderId = friendRequest.senderId.split("_")[1];

      await pusher.trigger(`user-${cutReceiverId}-friends`, `friend-added`, {
        username: friend.username,
        imageUrl: `/api/imageProxy?url=${encodeURIComponent(
          friend.imageUrl ?? "",
        )}`,
        showToast: false,
      });

      // Will need to config this so it only works when the user
      // is online. Otherwise, it will be a waste.
      await pusher.trigger(`user-${cutSenderId}-friends`, `friend-added`, {
        username: user.username,
        imageUrl: `/api/imageProxy?url=${encodeURIComponent(
          user.imageUrl ?? "",
        )}`,
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
