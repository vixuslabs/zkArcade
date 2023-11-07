import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

// const intlMiddleware: (request: NextRequest) => NextResponse<Locales> =
//   createMiddleware({
//     locales: ["en", "el"],

//     defaultLocale: "en",
//   });

export default authMiddleware({
  debug: true,
  // beforeAuth: (req) => {
  //   // Execute next-intl middleware before Clerk's auth middleware
  //   return intlMiddleware(req);
  // },
  publicRoutes: ["/"],
  afterAuth(auth, req, evt) {
    // console.log(auth);
    if (!auth.userId && !auth.isPublicRoute) {
      console.log("redirecting to sign in");
      redirectToSignIn({ returnBackUrl: "/" });
    }
  },
  // ignoredRoutes: ["/((?!api|trpc))(_next.*|.+.[w]+$)", "/api/trpc/post.hello"],
  authorizedParties: [
    "http://localhost:3000",
    `https://${process.env.VERCEL_URL!}`,
    `https://hot-n-cold.vercel.app`,
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
