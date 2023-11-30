import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { gameInvites } from "@hot-n-cold/db/schema/games";
import { users } from "@hot-n-cold/db/schema/users";
import { eq, and, or } from "drizzle-orm";
import { pusher } from "../pusher/server";
import { clerkClient } from "@clerk/nextjs";

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

      console.log("sending to: ", `user-${cutId}-friends`);

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

  getGameInvites: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId;

    const invites = await ctx.db.query.gameInvites.findMany({
      where: and(
        or(
          eq(gameInvites.receiverId, userId),
          eq(gameInvites.senderId, userId),
        ),
        eq(gameInvites.status, "sent"),
      ),
    });

    return invites;
  }),
});
