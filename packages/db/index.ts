import "dotenv/config";

import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import * as friendships from "./schema/friendships";
import * as games from "./schema/games";
import * as users from "./schema/users";

export * from "drizzle-orm";
export const schema = { ...friendships, ...users, ...games };

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
