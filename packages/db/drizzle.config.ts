import type { Config } from "drizzle-kit";

const uri = process.env.DATABASE_URL;

if (!uri) {
  throw new Error("Missing database uri");
}

export default {
  schema: "./schema/*.ts",
  driver: "mysql2",
  dbCredentials: {
    uri: uri,
  },
  tablesFilter: ["zkarcade_*"],
} satisfies Config;
