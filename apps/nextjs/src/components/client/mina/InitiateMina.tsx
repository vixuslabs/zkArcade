"use client";

import React, { useCallback, useEffect } from "react";
import Link from "next/link";
import { useMinaContext } from "@/components/client/providers/MinaProvider";
import { Button } from "@/components/ui/button";

import { LoadingSpinner } from "../ui";

function InitiateMina({
  publicKey,
  privateKey,
}: {
  publicKey?: string;
  privateKey?: string;
}) {
  console.log("InitiateMina publicKey", publicKey);
  console.log("InitiateMina privateKey", privateKey);

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
    void (async () => {
      if (publicKey && privateKey) {
        await initiateMina({ publicKey, privateKey });

        console.log("starting to load contract");
        await handleLoadContract();
        // ideally have a check here to see if the contract is loaded
        setGameReady(true);
        console.log("handleLoadContract done");
      } else {
        throw new Error("publicKey or privateKey is undefined");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, privateKey]);

  return (
    <Button variant={"default"} asChild disabled={!gameReady}>
      {/* change from Link to Webxr Components directly */}
      {gameReady ? <Link href={"/game"}>Start Game</Link> : <LoadingSpinner />}
    </Button>
  );
}

export default InitiateMina;
