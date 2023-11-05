import { sql, relations } from "drizzle-orm";
import {
  bigint,
  index,
  int,
  mysqlTableCreator,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  primaryKey,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { users } from "./users";

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
    senderIndex: index("sender_idx").on(invite.senderId),
    receiverIndex: index("receiver_idx").on(invite.receiverId),
    statusIndex: index("status_idx").on(invite.status),
  }),
);
