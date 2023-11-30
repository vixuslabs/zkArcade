import { sql } from "drizzle-orm";
import {
  bigint,
  index,
  mysqlTableCreator,
  timestamp,
  uniqueIndex,
  varchar,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

export const mysqlTable = mysqlTableCreator((name) => `hot-n-cold_${name}`);

export const games = mysqlTable(
  "game",
  {
    id: varchar("id", { length: 512 }).primaryKey(),
    name: varchar("name", { length: 256 }).notNull().unique(),
    status: mysqlEnum("status", ["waiting", "playing", "finished"]).notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .onUpdateNow(),
  },
  (game) => ({
    nameIndex: uniqueIndex("name_idx").on(game.name),
  }),
);

export const gameInvites = mysqlTable(
  "gameInvite",
  {
    inviteId: bigint("inviteId", { mode: "number" })
      .primaryKey()
      .autoincrement(),
    lobbyId: varchar("lobbyId", { length: 256 }).notNull().unique(),
    senderId: varchar("senderId", { length: 256 }).notNull(),
    receiverId: varchar("receiverId", { length: 256 }).notNull(),
    status: mysqlEnum("status", ["sent", "accepted", "declined", "cancelled"])
      .notNull()
      .default("sent"),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .onUpdateNow(),
  },
  (invite) => ({
    inviteIndex: index("invite_idx").on(invite.inviteId),
    lobbyIndex: uniqueIndex("lobby_idx").on(invite.lobbyId),
    receiverIndex: index("receiver_idx").on(invite.receiverId),
    statusIndex: index("status_idx").on(invite.status),
  }),
);
