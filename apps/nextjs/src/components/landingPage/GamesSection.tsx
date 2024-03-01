"use client";

import React from "react";
import { carouselGamesInfo } from "@/lib/constants";
import { useInView } from "react-intersection-observer";

import GameIntroductionSection from "./GameIntroductionSection";

export default function GamesSection() {
  const { ref: rowOneRef, inView: rowOneInView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  const { ref: rowTwoRef, inView: rowTwoInView } = useInView({
    triggerOnce: true,
    threshold: 0.25,
  });

  return (
    <div className="py-24 sm:py-32">
      <div className="px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight  sm:text-4xl">
            Our Game Collection
          </h2>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-2 items-start gap-6 px-4 py-6 lg:gap-12">
        {carouselGamesInfo.map((game, i) => (
          <GameIntroductionSection
            // @ts-expect-error - Works, just rowOneRef and rowTwoRef are of type node?: Element | null | undefined) => void
            ref={i < 2 ? rowOneRef : rowTwoRef}
            key={i}
            inView={i < 2 ? rowOneInView : rowTwoInView}
            game={game}
          />
        ))}
      </div>
    </div>
  );
}
