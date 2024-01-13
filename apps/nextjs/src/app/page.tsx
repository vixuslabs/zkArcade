import { Suspense } from "react";
import { unstable_noStore } from "next/cache";
import Link from "next/link";
import { HomeAuth } from "@/components/client/HomeAuth";
import { currentUser } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default async function Home() {
  unstable_noStore();
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
              your home for XR zero knowledge games, built on{" "}
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
                  <Suspense>
                    <HomeAuth />
                  </Suspense>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
