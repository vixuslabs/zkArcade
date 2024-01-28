import { forwardRef, Fragment } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHotnCold } from "@/lib/stores";

import { HotnColdGame } from "../../xr";

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
            <span className="font-bold">Do not move in real life.</span>
          </p>
          <Badge className="max-w-fit text-black hover:cursor-default">
            Seeking
          </Badge>
          <p className="text-sm">
            Both of your now need to find the object hidden in your room. You
            will be in passthrough mode, so you can see your room and the
            digital object in it. <span className="font-bold">Be quick</span>,
            your opponent is also seeking the object you hid in their room!
          </p>
          <Badge className="max-w-fit text-black hover:cursor-default">
            Ending
          </Badge>
          <p className="text-sm">
            First to find the object in their room wins! Refresh the page to
            play again.
          </p>
        </CardContent>
      </Card>
      <HotnColdGame gameEventsInitialized={gameEventsInitialized} />
    </>
  );
});

HotnColdPreGame.displayName = "HotnColdPreGame";

export default HotnColdPreGame;
