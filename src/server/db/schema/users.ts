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
} from "drizzle-orm/mysql-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mysqlTable = mysqlTableCreator((name) => `hot-n-cold_${name}`);

export const users = mysqlTable(
  "user",
  {
    id: varchar("id", { length: 512 }).primaryKey(),
    username: varchar("username", { length: 256 }).notNull().unique(),
    firstName: varchar("firstName", { length: 256 }),
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
