import { clerkClient } from "@clerk/nextjs";
import { and, eq, or } from "drizzle-orm";
import { z } from "zod";

import { gameInvites } from "@zkarcade/db/schema/games";
import { users } from "@zkarcade/db/schema/users";

import { pusher } from "../pusher/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const gameRouter = createTRPCRouter({
  sendGameInvite: protectedProcedure
    .input(
      z.object({
        receiverId: z.string().min(1),
        lobbyId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;

      const user = await clerkClient.users.getUser(userId);

      const receiver = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.receiverId),
      });

      if (!receiver) {
        throw new Error("Receiver not found");
      }

      await ctx.db.insert(gameInvites).values({
        lobbyId: input.lobbyId,
        senderId: user.id,
        receiverId: input.receiverId,
      });

      const cutId = input.receiverId.split("_")[1];

      await pusher.trigger(`user-${cutId}-friends`, `invite-sent`, {
        gameId: input.lobbyId,
        senderId: user.id,
        username: user.username,
      });
    }),

  acceptGameInvite: protectedProcedure
    .input(
      z.object({
        lobbyId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.db.query.gameInvites.findFirst({
        where: eq(gameInvites.lobbyId, input.lobbyId),
      });

      if (!invite) {
        throw new Error("Invite not found");
      }

      await ctx.db
        .update(gameInvites)
        .set({ status: "accepted" })
        .where(eq(gameInvites.lobbyId, input.lobbyId));

      const cutSenderId = invite.senderId.split("_")[1];
      const cutReceiverId = invite.receiverId.split("_")[1];

      await pusher.trigger(`user-${invite.senderId}-friends`, `accepted`, {
        gameId: input.lobbyId,
        id: cutSenderId,
        friendId: cutReceiverId,
      });

      await pusher.trigger(`user-${invite.receiverId}-friends`, `accepted`, {
        gameId: input.lobbyId,
        id: cutReceiverId,
        friendId: cutSenderId,
      });
    }),

  getGameInvites: protectedProcedure
    .input(
      z.object({
        role: z.enum(["sender", "receiver"]).optional(),
        status: z.enum(["accepted", "declined", "pending"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;

      let whereClause;

      if (input.role === "sender") {
        whereClause = eq(gameInvites.senderId, userId);
      } else if (input.role === "receiver") {
        whereClause = eq(gameInvites.receiverId, userId);
      } else {
        whereClause = or(
          eq(gameInvites.receiverId, userId),
          eq(gameInvites.senderId, userId),
        );
      }

      if (input.status !== undefined) {
        whereClause = and(whereClause, eq(gameInvites.status, input.status));
      }

      const invites = await ctx.db.query.gameInvites.findMany({
        where: whereClause,
      });

      const invitesWithUsers = await Promise.all(
        invites.map(async (invite) => {
          const sender = await clerkClient.users.getUser(invite.senderId);

          const receiver = await clerkClient.users.getUser(invite.receiverId);

          if (!sender.username) {
            throw new Error(`Username for id: ${sender.id} not found`);
          }

          if (!receiver.username) {
            throw new Error(`Username for id: ${receiver.id} not found`);
          }

          return {
            gameId: invite.lobbyId,
            receiver: {
              id: invite.receiverId,
              username: receiver.username,
              imageUrl: receiver.imageUrl,
            },
            sender: {
              id: sender.id,
              username: sender.username,
              imageUrl: sender.imageUrl,
            },
          };
        }),
      );

      return invitesWithUsers;
    }),
});
