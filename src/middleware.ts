import { authMiddleware } from "@clerk/nextjs";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

// const intlMiddleware: (request: NextRequest) => NextResponse<Locales> =
//   createMiddleware({
//     locales: ["en", "el"],

//     defaultLocale: "en",
//   });

export default authMiddleware({
  // beforeAuth: (req) => {
  //   // Execute next-intl middleware before Clerk's auth middleware
  //   return intlMiddleware(req);
  // },
  publicRoutes: [
    "/",
    "/api/trpc/post.hello", // makes it so this api endpoint is public
    "/((?!.+\\.[\\w]+$|_next).*)", // For testing, turning off all auth
    "/(api|trpc)(.*)",
    "/favicon.ico",
  ],
  ignoredRoutes: ["/((?!api|trpc))(_next.*|.+.[w]+$)", "/api/trpc/post.hello"],
  authorizedParties: ["http://localhost:3000"],
});

export const config = {
  // matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
  // publicRoutes: ["/"],
};
