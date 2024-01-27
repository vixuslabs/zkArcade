import React from "react";
import Image from "next/image";
import type { GameNames } from "@/lib/types";

function CarouselImage({
  imageUrl,
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
      src={imageUrl}
      alt={altText}
      placeholder="blur"
    />
  );
}

export default CarouselImage;
