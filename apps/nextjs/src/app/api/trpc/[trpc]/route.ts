import type { NextRequest } from "next/server";
import { env } from "@/env.mjs";
import { auth } from "@clerk/nextjs";
// import { getAuth } from "@clerk/nextjs/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter, createTRPCContext } from "@zkarcade/api";

const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
    // auth: getAuth(req), // this works
    auth: auth(), // as does this
  });
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
