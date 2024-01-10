import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";

export default authMiddleware({
  // debug: true,
  publicRoutes: ["/", "/dashboard"],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterAuth(auth, req, evt) {
    if (!auth.userId && !auth.isPublicRoute) {
      redirectToSignIn({ returnBackUrl: "/" });
    }
  },
  ignoredRoutes: ["/((?!api|trpc))(_next.*|.+.[w]+$)"],
  authorizedParties: [
    "http://localhost:3000",
    `https://${process.env.VERCEL_URL!}`,
    `https://${process.env.VERCEL_BRANCH_URL!}`,
    `https://hot-n-cold.vercel.app`,
    `https://funny-unlikely-dolphin.ngrok-free.app`,
    "https://hot-n-cold-git-webxr-multi-vixus-labs.vercel.app",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
