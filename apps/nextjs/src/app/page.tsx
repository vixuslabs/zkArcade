import Link from "next/link";
import {
  ClerkLoaded,
  ClerkLoading,
  currentUser,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";

// export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await currentUser();

  return (
    <section className="flex min-h-screen w-full flex-col items-center justify-center bg-black py-12 text-white md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              zkArcade
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
              your home for all zero knowledge games, built on{" "}
              <a
                href="https://minaprotocol.com/"
                rel="noreferrer"
                target="_blank"
                className="hover:underline hover:underline-offset-2"
              >
                Mina
              </a>
            </p>
          </div>
          <div className="w-full max-w-sm space-y-2">
            <div className="flex justify-center space-x-4">
              {/* <Button type="button">Sign Up</Button>
              <Button type="button">Sign In</Button> */}
              {user ? (
                <Link
                  className="rounded-md bg-secondary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm"
                  href="/dashboard"
                  prefetch
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <ClerkLoading>
                    <div className="rounded-md bg-secondary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm">
                      Sign in
                    </div>
                    <div className="rounded-md bg-secondary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm">
                      Sign up
                    </div>
                  </ClerkLoading>
                  <ClerkLoaded>
                    <SignInButton
                      // @ts-expect-error SignInButton can take className
                      className="rounded-md bg-secondary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm"
                      mode="modal"
                      redirectUrl="/dashboard"
                    />
                    <SignUpButton
                      // @ts-expect-error SignUpButton can take className
                      className="rounded-md bg-secondary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm"
                      mode="modal"
                      redirectUrl="/dashboard"
                    />
                  </ClerkLoaded>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

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
          {user ? (
            <Link
              className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm"
              href="/dashboard"
              prefetch
            >
              Dashboard
            </Link>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </main>
  );
}
