import Link from "next/link";
import {
  Features,
  Footer,
  GamesSection,
  HeroSection,
} from "@/components/landingPage";
import { Button } from "@/components/ui/button";
import ThemedLogo from "@/components/utility/ThemedLogo";
import { ThemeToggle } from "@/components/utility/ToggleTheme";
import { currentUser } from "@clerk/nextjs";

export default async function Page() {
  const user = await currentUser();

  return (
    <>
      {/* Nav Bar */}
      <nav className=" flex items-center justify-between px-8 pt-4 lg:px-24 2xl:px-48">
        <div className="flex items-center">
          <ThemedLogo />
          <h1 className="text-2xl font-extrabold">zkArcade</h1>
        </div>
        <div className="flex space-x-4 align-middle">
          <ThemeToggle />
          <Button variant="default" asChild>
            <Link href={"/dashboard"}>{user ? "Dashboard" : "Sign In"}</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative">
        <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8">
          <div className="px-6 pb-24 pt-10 sm:pb-32 lg:col-span-7 lg:px-0 lg:pb-56 lg:pt-32">
            <HeroSection />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="xl:mt-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 ">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7">
              Play with anyone around the world
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight  sm:text-4xl">
              Your source for mixed reality multiplayer ZK games on the web
            </p>
            <p className="mt-6 text-lg leading-8 ">
              By proving the validatity of player moves with zero knowledge
              proofs, its impossible for cheaters to get away with it
            </p>
          </div>
          <Features />
        </div>
      </div>

      {/* Games Section */}
      <GamesSection />

      {/* Footer */}
      <Footer />
    </>
  );
}
