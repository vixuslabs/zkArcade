import { NextResponse } from "next/server";
import { pusher } from "@/pusher/server";

export async function POST(request: Request) {
  const body = await request.text();

  const params = new URLSearchParams(body);

  const socketId = params.get("socket_id");
  const username = params.get("username");
  const userId = params.get("userId");

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
