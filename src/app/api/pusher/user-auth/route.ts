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
  const username = params.get("username");
  console.log(username);
  const userId = params.get("userId");
  console.log(userId);

  if (!userId) {
    return NextResponse.json("No userId found", { status: 401 });
  }

  if (!username) {
    return NextResponse.json("No username found", { status: 401 });
  }

  if (!socketId) {
    return NextResponse.json("No socketId found", { status: 401 });
  }

  const authResponse = pusher.authenticateUser(socketId, {
    id: userId,
    username: username,
  });

  return NextResponse.json(authResponse);
}
