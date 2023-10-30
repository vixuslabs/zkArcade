import Link from "next/link";

import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";

export default function Home() {
  // const hello = await api.post.hello.query({ text: "from tRPC" });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#d34545] to-[#1ecddd] text-white">
      <div className="container flex flex-col items-center justify-center gap-x-12 gap-y-6 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Welcome to Hot <span className="text-[#1ecddd]">&apos;</span>
          <span className="text-[#d34545]">n</span> Cold
        </h1>
        <p className="text-xl">
          Hide and seek with a twist. You hide in{" "}
          <span className="underline underline-offset-2">their</span> room, from{" "}
          <span className="underline underline-offset-2">your</span> room.
        </p>
        <div className="flex items-center justify-between gap-x-12">
          <SignedIn>
            <Link
              className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm"
              href="/dashboard"
              prefetch
            >
              Dashboard
            </Link>
          </SignedIn>

          <SignedOut>
            <ClerkLoading>
              <div className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm">
                Sign in
              </div>
              <div className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm">
                Sign up
              </div>
            </ClerkLoading>
            <ClerkLoaded>
              <SignInButton
                // @ts-expect-error SignInButton can take className
                className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm"
                mode="modal"
                redirectUrl="/dashboard"
              />
              <SignUpButton
                // @ts-expect-error SignUpButton can take className
                className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm"
                mode="modal"
                redirectUrl="/dashboard"
              />
            </ClerkLoaded>
          </SignedOut>
        </div>
      </div>
    </main>
  );
}

// async function CrudShowcase() {
// const latestPost = await api.post.getLatest.query();

//   return (
//     <div className="w-full max-w-xs">
//       {latestPost ? (
//         <p className="truncate">Your most recent post: {latestPost.name}</p>
//       ) : (
//         <p>You have no posts yet.</p>
//       )}

//       <CreatePost />
//     </div>
//   );
// }
