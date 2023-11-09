import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

// const intlMiddleware: (request: NextRequest) => NextResponse<Locales> =
//   createMiddleware({
//     locales: ["en", "el"],

//     defaultLocale: "en",
//   });

export default authMiddleware({
  // debug: true,
  // beforeAuth: (req) => {
  //   // Execute next-intl middleware before Clerk's auth middleware
  //   return intlMiddleware(req);
  // },
  publicRoutes: ["/", "/dashboard"],
  afterAuth(auth, req, evt) {
    // console.log(auth);
    if (!auth.userId && !auth.isPublicRoute) {
      console.log(auth.user);
      console.log(auth.userId);
      console.log("redirecting to sign in");
      redirectToSignIn({ returnBackUrl: "/" });
    }
  },
  ignoredRoutes: [
    "/((?!api|trpc))(_next.*|.+.[w]+$)",
    "/api/trpc/post.hello",
    "/api/trpc/friendships.getUsersFriends",
    "/api/trpc/friendships.deleteFriend",
    "/api/trpc/friendships.deleteAllFriends",
    "/api/trpc/friendships.getAllRequestToUser",
    "/api/trpc/friendships.getAllRequestsFromUser",
    "/api/trpc/friendships.getAllFriendRequests",
    "/api/trpc/friendships.sendFriendRequest",
    "/api/trpc/friendships.getFriendRequest",
    "/api/trpc/friendships.acceptFriendRequest",
    "/api/trpc/friendships.declineFriendRequest",
    "/api/trpc/games.sendGameInvite",
    "/api/trpc/games.acceptGameInvite",
    "/api/trpc/games.getGameInvites",
  ],
  authorizedParties: [
    "http://localhost:3000",
    `https://${process.env.VERCEL_URL!}`,
    `https://hot-n-cold.vercel.app`,
    `https://funny-unlikely-dolphin.ngrok-free.app`,
    "https://hot-n-cold-git-webxr-multi-vixus-labs.vercel.app/",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
