"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useInView } from "@react-spring/three";

export default function HeroSection() {
  const [ref, inView] = useInView({
    once: true,
  });

  return (
    <div
      ref={ref}
      className={cn(
        `mx-auto max-w-2xl transition-opacity duration-700 lg:mx-0`,
        inView ? "opacity-100" : "opacity-0",
      )}
    >
      <div className="px-8 py-20 text-left">
        <h1 className="mt-24 text-4xl font-bold tracking-tight text-primary sm:mt-10 sm:text-6xl">
          Compete with the confidence every game is fair
        </h1>
        <p className="mt-6 text-lg leading-8">
          A collection of mixed reality multiplayer games, built on{" "}
          <a
            href="https://minaprotocol.com/"
            rel="noreferrer"
            target="_blank"
            className="underline underline-offset-2"
          >
            Mina
          </a>{" "}
          to help make cheating a thing of the past.
        </p>
        <div className="mt-10 flex items-center gap-x-6 sm:justify-center md:justify-start">
          <Button>Get Started</Button>

          <Button asChild variant="secondary">
            <Link href="/sandbox">Try Sandbox Mode</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
