import { sql } from "drizzle-orm";
import {
  mysqlTableCreator,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const mysqlTable = mysqlTableCreator((name) => `zkarcade_${name}`);

export const users = mysqlTable(
  "user",
  {
    id: varchar("id", { length: 512 }).primaryKey(),
    username: varchar("username", { length: 256 }).notNull().unique(),
    email: varchar("email", { length: 256 }).notNull().unique(),
    imageUrl: varchar("imageUrl", { length: 512 }),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .onUpdateNow(),
  },
  (user) => ({
    usernameIndex: uniqueIndex("username_idx").on(user.username),
    idIndex: uniqueIndex("id_idx").on(user.id),
  }),
);
