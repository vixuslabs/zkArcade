import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z
      .string()
      .url()
      .refine(
        (str) => !str.includes("YOUR_MYSQL_URL_HERE"),
        "You forgot to change the default URL",
      ),
    CLERK_SECRET_KEY: z
      .string()
      .refine(
        (str) => !str.includes("YOUR_CLERK_SECRET_KEY_HERE"),
        "You forgot to change the default key",
      ),
    WEBHOOK_SECRET: z
      .string()
      .refine(
        (str) => !str.includes("YOUR_WEBHOOK_SECRET_HERE"),
        "You forgot to change the default key",
      ),
    PUSHER_APP_ID: z.string(),
    PUSHER_SECRET: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
      .string()
      .refine(
        (str) => !str.includes("YOUR_WEBHOOK_SECRET_HERE"),
        "You forgot to change the default key",
      ),
    NEXT_PUBLIC_PUSHER_KEY: z.string(),
    NEXT_PUBLIC_PRIV_KEY1: z.string(),
    NEXT_PUBLIC_PRIV_KEY2: z.string(),
    NEXT_PUBLIC_PUB_KEY1: z.string(),
    NEXT_PUBLIC_PUB_KEY2: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    PUSHER_APP_ID: process.env.PUSHER_APP_ID,
    PUSHER_SECRET: process.env.PUSHER_SECRET,
    NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY,
    NEXT_PUBLIC_PRIV_KEY1: process.env.NEXT_PUBLIC_PRIV_KEY1,
    NEXT_PUBLIC_PRIV_KEY2: process.env.NEXT_PUBLIC_PRIV_KEY2,
    NEXT_PUBLIC_PUB_KEY1: process.env.NEXT_PUBLIC_PUB_KEY1,
    NEXT_PUBLIC_PUB_KEY2: process.env.NEXT_PUBLIC_PUB_KEY2,

    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
