"use client";

import { forwardRef } from "react";
import Image from "next/image";
import hotnColdImage from "@/../public/thumbnails/hotnCold.png";
import sandboxImage from "@/../public/thumbnails/sandbox.png";
import zkBattleshipsImage from "@/../public/thumbnails/zkBattleship.png";
import zkTicTacToeImage from "@/../public/thumbnails/zkTicTacToe.png";
import type { CarouselGameInfo, GameNames } from "@/lib/types";

const chooseImage = (gameName: GameNames) => {
  switch (gameName) {
    case "Hot 'n Cold":
      return hotnColdImage;
    case "Sandbox":
      return sandboxImage;
    case "zkBattleship":
      return zkBattleshipsImage;
    case "zkTicTacToe":
      return zkTicTacToeImage;
    default:
      return hotnColdImage;
  }
};

interface GameIntroductionSectionProps {
  game: CarouselGameInfo;
  inView: boolean;
}

const GameIntroductionSection = forwardRef<
  React.RefCallback<HTMLDivElement>,
  GameIntroductionSectionProps
>(({ game, inView }, ref) => {
  return (
    <div className="grid items-start gap-4 md:gap-10">
      <div
        ref={ref as React.RefCallback<HTMLDivElement>}
        className={`grid gap-4 transition-opacity duration-1000 ${
          inView ? "opacity-100" : "opacity-0"
        }`}
      >
        <Image
          alt="Image 1"
          className="mx-auto h-96 w-auto overflow-hidden rounded-lg border object-cover "
          src={chooseImage(game.name)}
          style={{
            aspectRatio: "600/600",
            objectFit: "cover",
          }}
          placeholder="blur"
          width={600}
          height={600}
        />
        <h1 className="text-center text-2xl font-semibold leading-7">
          {game.name}
        </h1>
        <div className="grid gap-4 text-center text-base leading-7 text-secondary-foreground">
          <p>{game.mainDescription}</p>
        </div>
      </div>
    </div>
  );
});

GameIntroductionSection.displayName = "GameIntroductionSection";

export default GameIntroductionSection;
