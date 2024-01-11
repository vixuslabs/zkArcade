import "dotenv/config";

import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import * as friendships from "./schema/friendships";
import * as games from "./schema/games";
import * as users from "./schema/users";

export * from "drizzle-orm";
export const schema = { ...friendships, ...users, ...games };

// const env =
//   process.env.NODE_ENV !== "production" ? "development" : "production";

// const host =
//   env === "production" ? process.env.DB_MAIN_HOST : process.env.DB_DEV_HOST;
// const username =
//   env === "production"
//     ? process.env.DB_MAIN_USERNAME
//     : process.env.DB_DEV_USERNAME;
// const password =
//   env === "production" ? process.env.DB_MAIN_PW : process.env.DB_DEV_PW;

const host = process.env.DB_HOST;
const username = process.env.DB_USERNAME;
const password = process.env.DB_PW;

if (!host || !username || !password) {
  throw new Error("Missing database credentials");
}

const connection = connect({
  host,
  username,
  password,
});

export const db = drizzle(connection, { schema });
