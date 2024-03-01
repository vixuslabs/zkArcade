import { NextResponse } from "next/server";
import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/arcade",
    "/sign-in",
    "/sign-up",
    "/test",
    "/sandbox",
    "/zkb",
  ],
  apiRoutes: ["/api/(.*)"],
  afterAuth(auth, req) {
    if (auth.isApiRoute) {
      return NextResponse.next();
    }

    if (!auth.userId && !auth.isPublicRoute) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    if (auth.userId && !auth.isPublicRoute) {
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  authorizedParties: [
    "http://localhost:3000",
    "https://localhost:3000",
    `https://${process.env.VERCEL_URL!}`,
    `https://${process.env.VERCEL_BRANCH_URL!}`,
    "https://correct-uniformly-pelican.ngrok-free.app",
    "https://comic-muskrat-47.clerk.accounts.dev",
    "https://zkarcade.vixuslabs.com",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
