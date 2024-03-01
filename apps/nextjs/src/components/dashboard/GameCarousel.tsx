"use client";

import React, { Suspense, useMemo } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { gameInfoMap } from "@/lib/constants";
import { useZkArcade } from "@/lib/zkArcadeStore";

import { CarouselImage } from ".";

function GameCarousel() {
  const [api, setApi] = useZkArcade((state) => state.getCarouselApi());
  const setActiveGame = useZkArcade((state) => state.setActiveGame);
  const games = useMemo(() => {
    return Array.from(gameInfoMap.values());
  }, []);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    const selectedItemIndex = api.selectedScrollSnap();

    if (!games[selectedItemIndex]) {
      console.error("No game found at index", selectedItemIndex);
      return;
    }

    setActiveGame(games[selectedItemIndex]!.name);

    api.on("select", () => {
      const selectedItemIndex = api.selectedScrollSnap();

      if (!games) {
        return;
      }

      switch (selectedItemIndex) {
        case 0:
          setActiveGame(games[0]!.name);
          break;
        case 1:
          setActiveGame(games[1]!.name);
          break;
        case 2:
          setActiveGame(games[2]!.name);
          break;
        case 3:
          setActiveGame(games[3]!.name);
          break;
        default:
          setActiveGame(games[0]!.name);
          break;
      }
    });
  }, [api, setActiveGame, games]);

  return (
    <Carousel
      setApi={setApi}
      className="w-full md:max-w-sm"
      opts={{
        loop: true,
      }}
    >
      <CarouselContent>
        {games.map(({ name, imageUrl }) => (
          <CarouselItem key={name} id={name} className="border-none">
            <Card className="border-none bg-transparent">
              <CardContent className="-p-2 flex aspect-square items-center justify-center">
                <Suspense>
                  <CarouselImage
                    height={250}
                    width={250}
                    imageUrl={imageUrl}
                    altText={name}
                  />
                </Suspense>
              </CardContent>
              <CardFooter className="-mt-4 justify-center text-2xl">
                {name}
              </CardFooter>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

export default GameCarousel;
