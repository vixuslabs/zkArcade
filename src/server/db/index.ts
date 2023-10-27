import { Client } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import { env } from "@/env.mjs";
// import * as schema from "./schema";
import * as friendships from "./schema/friendships";
import * as users from "./schema/users";

export const db = drizzle(
  new Client({
    url: env.DATABASE_URL,
  }).connection(),
  { schema: { ...friendships, ...users } },
);
