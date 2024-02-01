import { forwardRef, Fragment } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHotnCold } from "@/lib/stores";
import { HotnColdGame } from "@/components/client/xr";
import { GameBugsTooltip } from "./";

const HotnColdPreGame = forwardRef<HTMLDivElement>((_, ref) => {
  const { gameEventsInitialized } = useHotnCold();

  return (
    <>
      <Card
        ref={ref}
        className="grid max-h-[65vh] w-full max-w-md gap-10 overflow-scroll rounded-lg border-none bg-gray-800 p-10 text-white shadow-lg"
      >
        <CardHeader className="items-center gap-4 space-y-0 p-0">
          <div className="grid gap-1 text-center">
            <CardTitle className="text-lg">
              How Hot &apos;n Cold Works
            </CardTitle>
            <CardDescription className="text-xs">
              Hide an object in your opponent&apos;s room as they hide one in
              yours. First to find the object wins!
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-0">
          <Badge className="max-w-fit text-black hover:cursor-default">
            Overview
          </Badge>
          <p className="text-sm">
            Once you and your opponent are in the game, each of you will be
            placed in each other&apos;s &quot;room.&quot; Their walls, ceiling,
            and will be visible, as well the furniture they specified during
            Meta&apos;s Space Setup.
          </p>
          <Badge className="max-w-fit text-black hover:cursor-default">
            Hiding
          </Badge>
          <p className="text-sm">
            You will be given an object to hide in your opponent&apos;s room.{" "}
            <span className="font-bold underline underline-offset-4">
              Do not move in real life.
            </span>{" "}
            You the thumbstick to change the length of the pointer. Click{" "}
            <span className="font-bold text-md underline underline-offset-2">
              X
            </span>{" "}
            and{" "}
            <span className="font-bold text-md underline underline-offset-2">
              Y
            </span>{" "}
            at the same time, while hold the object, to set the ball&apos;s
            hiding position.
          </p>
          <Badge className="max-w-fit text-black hover:cursor-default">
            Seeking
          </Badge>
          <p className="text-sm">
            Both of your now need to find the object hidden in your room. You
            will be in passthrough mode, so you can see your room and the
            digital object in it.{" "}
            <span className="font-bold underline underline-offset-4">
              Be the first to find the ball
            </span>
            , your opponent is also trying to find the ball you hid in their
            room!
          </p>
          <Badge className="max-w-fit text-black hover:cursor-default">
            Ending
          </Badge>
          <p className="text-sm">
            First to find the object in their room wins! Refresh the page to
            play again.
          </p>
        </CardContent>
        <div className="grid text-center justify-center">
          <CardFooter className="flex flex-col justify-center gap-y-2">
            <p>Good luck, be safe, and have fun!</p>
            <GameBugsTooltip />
          </CardFooter>
        </div>
      </Card>
      <HotnColdGame gameEventsInitialized={gameEventsInitialized} />
    </>
  );
});

HotnColdPreGame.displayName = "HotnColdPreGame";

export default HotnColdPreGame;
