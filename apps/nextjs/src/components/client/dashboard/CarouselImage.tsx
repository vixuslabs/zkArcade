import React from "react";
import Image from "next/image";

function CarouselImage({
  imageUrl,
  altText,
  height = 200,
  width = 200,
}: {
  imageUrl: string;
  altText: string;
  height?: number;
  width?: number;
}) {
  return (
    <Image
      priority
      width={width}
      height={height}
      src={imageUrl}
      alt={altText}
    />
  );
}

export default CarouselImage;
