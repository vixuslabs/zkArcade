"use client";

import React, { useCallback, useEffect } from "react";
import type { Player } from "@/lib/types";
import { useMinaContext } from "@/components/client/providers/MinaProvider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LoadingSpinner } from "../ui";

function InitiateMina({
  player, // setGameReady,
}: {
  player: Player;
}) {
  const { initiateMina, zkappWorkerClient, zkAppPublicKey } = useMinaContext();

  const [gameReady, setGameReady] = React.useState<boolean>(false);

  const handleLoadContract = useCallback(async () => {
    if (zkappWorkerClient) {
      await zkappWorkerClient.loadContract();

      console.log("Compiling zkApp...");
      await zkappWorkerClient.compileContract();
      console.log("zkApp compiled");

      console.log("init");
      await zkappWorkerClient.initZkappInstance(zkAppPublicKey!);
      console.log("inited");
    }
  }, [zkappWorkerClient, zkAppPublicKey]);

  useEffect(() => {
    // setPlayer(player);
    void (async () => {
      await initiateMina(player);

      console.log("starting to load contract");
      await handleLoadContract();
      // ideally have a check here to see if the contract is loaded
      setGameReady(true);
      console.log("handleLoadContract done");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Button variant={"default"} asChild disabled={!gameReady}>
      {gameReady ? <Link href={"/game"}>Start Game</Link> : <LoadingSpinner />}
    </Button>
  );
}

export default React.memo(InitiateMina);
