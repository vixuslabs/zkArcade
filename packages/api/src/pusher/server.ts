import Pusher from "pusher";

const PUSHER_APP_ID = process.env.PUSHER_APP_ID;
const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY;
const PUSHER_SECRET = process.env.PUSHER_SECRET;

if (!PUSHER_APP_ID) {
  throw new Error("PUSHER_APP_ID is not set");
}

if (!PUSHER_KEY) {
  throw new Error("PUSHER_KEY is not set");
}

if (!PUSHER_SECRET) {
  throw new Error("PUSHER_SECRET is not set");
}

export const pusher = new Pusher({
  appId: PUSHER_APP_ID,
  key: PUSHER_KEY,
  secret: PUSHER_SECRET,
  cluster: "us2",
  useTLS: true,
});
