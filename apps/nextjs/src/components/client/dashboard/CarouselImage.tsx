import React from "react";
import Image from "next/image";
import hotnColdImage from "@/../public/thumbnails/hotnCold.png";
import sandboxImage from "@/../public/thumbnails/sandbox.png";
import zkBattleshipsImage from "@/../public/thumbnails/zkBattleship.png";
import zkTicTacToeImage from "@/../public/thumbnails/zkTicTacToe.png";
import type { GameNames } from "@/lib/types";

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

function CarouselImage({
  imageUrl: _,
  altText,
  height = 200,
  width = 200,
}: {
  imageUrl: string;
  altText: GameNames;
  height?: number;
  width?: number;
}) {
  return (
    <Image
      priority={altText === "Hot 'n Cold" ? true : false}
      width={width}
      height={height}
      src={chooseImage(altText)}
      alt={altText}
      placeholder="blur"
    />
  );
}

export default CarouselImage;
