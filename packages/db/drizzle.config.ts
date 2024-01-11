import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config({
  path: "../../.env.development",
});

const uri = process.env.DATABASE_URL;
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
