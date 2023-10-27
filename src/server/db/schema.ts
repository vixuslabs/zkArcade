// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  bigint,
  index,
  int,
  mysqlTableCreator,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mysqlTable = mysqlTableCreator((name) => `hot-n-cold_${name}`);

export const posts = mysqlTable(
  "post",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    name: varchar("name", { length: 256 }),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  }),
);

export const users = mysqlTable(
  "user",
  {
    id: varchar("id", { length: 512 }).primaryKey(),
    username: varchar("username", { length: 256 }).notNull().unique(),
    firstName: varchar("firstName", { length: 256 }),
    email: varchar("email", { length: 256 }).notNull().unique(),
    // createdAt: timestamp("created_at")
    //   .default(sql`CURRENT_TIMESTAMP`)
    //   .notNull(),
    // updatedAt: timestamp("updatedAt")
    //   .default(sql`CURRENT_TIMESTAMP`)
    //   .onUpdateNow(),
  },
  (user) => ({
    usernameIndex: uniqueIndex("username_idx").on(user.username),
  }),
);
// PLANETSCALE DOES NOT ALLOW FOREIGN KEYS
// export const friendships = mysqlTable("friendships", {
//   userId: varchar("userId", { length: 256 })
//     .notNull()
//     .references(() => users.id),
//   friendId: varchar("friendId", { length: 256 })
//     .notNull()
//     .references(() => users.id),
// });
