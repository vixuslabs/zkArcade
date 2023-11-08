"use client";

import React, { useEffect } from "react";
import type { Player } from "@/lib/types";
import { useMinaContext } from "@/components/client/providers/MinaProvider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LoadingSpinner } from "../ui";

function InitiateMina({
  player, // setGameReady,
}: {
  player: Player;
  // setGameReady: React.Dispatch<React.SetStateAction<boolean>>;
  // gameReady: boolean;
}) {
  const { initiateMina } = useMinaContext();
  const [gameReady, setGameReady] = React.useState<boolean>(false);

  useEffect(() => {
    // setPlayer(player);
    void (async () => {
      await initiateMina(player);
      setGameReady(true);
    })();
  }, []);

  return (
    <Button variant={"default"} asChild disabled={!gameReady}>
      {gameReady ? <Link href={"/game"}>Start Game</Link> : <LoadingSpinner />}
    </Button>
  );
}

export default React.memo(InitiateMina);
