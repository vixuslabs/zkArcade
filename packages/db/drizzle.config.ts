import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config({
  path: "../../.env",
});

const env =
  process.env.NODE_ENV === "production" ? "production" : "development";
// const env = "development";

const uri =
  env === "production"
    ? process.env.MAIN_DATABASE_URL
    : process.env.DEV_DATABASE_URL;

// const uri = process.env.MAIN_DATABASE_URL;
// const uri = process.env.DEV_DATABASE_URL;

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
