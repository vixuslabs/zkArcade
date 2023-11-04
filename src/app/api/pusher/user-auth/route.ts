import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/env.mjs";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

const handler = (req: NextRequest) => {
  // do something to check if user in body matches the current user.
  // will leave like this for now

  return NextResponse.json("hello", { status: 200 });
};

export { handler as POST };
