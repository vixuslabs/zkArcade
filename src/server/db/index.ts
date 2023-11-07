import { Client } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import { env } from "@/env.mjs";
import * as friendships from "./schema/friendships";
import * as users from "./schema/users";
import * as games from "./schema/games";

export const db = drizzle(
  new Client({
    url: env.DATABASE_URL,
  }).connection(),
  { schema: { ...friendships, ...users, ...games } },
);
