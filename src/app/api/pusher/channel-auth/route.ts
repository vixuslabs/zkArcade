import { NextResponse } from "next/server";

import { pusher } from "@/pusher/server";

export async function POST(request: Request) {
  const body = await request.text();

  // Parse the URL-encoded string.
  const params = new URLSearchParams(body);

  console.log(params);

  // You can now get individual parameters using `params.get`
  const socketId = params.get("socket_id");
  console.log(socketId);
  const channelName = params.get("channel_name");
  console.log(channelName);
  const username = params.get("username");
  console.log(username);
  const userId = params.get("userId");
  console.log(userId);
  const imageUrl = params.get("imageUrl");
  console.log(imageUrl);

  if (!socketId) {
    return NextResponse.json("No socketId found", { status: 401 });
  }

  if (!channelName) {
    return NextResponse.json("No channelName found", { status: 401 });
  }

  if (!userId || !username || !imageUrl) {
    return NextResponse.json("No user information found", { status: 401 });
  }

  // this authorizes all users to all channels
  // should fetch to see gameInvites to see if u have one
  // if not, unauthorize
  const authResponse = pusher.authorizeChannel(socketId, channelName, {
    user_id: userId,
    user_info: {
      username: username,
      imageUrl: imageUrl,
    },
  });

  return NextResponse.json(authResponse);
}
