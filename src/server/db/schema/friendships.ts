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

export const friendships = mysqlTable(
  "friendships",
  {
    userId: varchar("userId", { length: 256 }).notNull(),
    friendId: varchar("friendId", { length: 256 }).notNull(),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (t) => ({
    // uniqueIndex: uniqueIndex("unique_idx").on(t.userId, t.friendId),
    pk: primaryKey(t.userId, t.friendId),
  }),
);

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  user: one(users, {
    relationName: "userFriendships",
    fields: [friendships.userId],
    references: [users.id],
  }),
  friend: one(users, {
    relationName: "friendFriendships",
    fields: [friendships.friendId],
    references: [users.id],
  }),
}));

export const friendRequests = mysqlTable(
  "friendRequest",
  {
    requestId: bigint("requestId", { mode: "number" })
      .primaryKey()
      .autoincrement(),
    senderId: varchar("senderId", { length: 256 }).notNull(),
    receiverId: varchar("receiverId", { length: 256 }).notNull(),
    status: mysqlEnum("status", ["pending", "accepted", "declined"])
      .notNull()
      .default("pending"),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .onUpdateNow(),
  },
  (t) => ({
    requestIndex: uniqueIndex("request_idx").on(t.requestId),
    senderIndex: index("sender_idx").on(t.senderId),
    receiverIndex: index("receiver_idx").on(t.receiverId),
    // statusIndex: index("status_idx").on(t.status),
  }),
);

export const friendRequestRelations = relations(friendRequests, ({ one }) => ({
  sender: one(users, {
    relationName: "sentRequests",
    fields: [friendRequests.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    relationName: "receivedRequests",
    fields: [friendRequests.receiverId],
    references: [users.id],
  }),
}));
