import { env } from "@/env.mjs";
import Pusher from "pusher";

export const pusher = new Pusher({
  appId: env.PUSHER_APP_ID,
  key: env.NEXT_PUBLIC_PUSHER_KEY,
  secret: env.PUSHER_SECRET,
  cluster: "us2",
  // useTLS: true,
});
