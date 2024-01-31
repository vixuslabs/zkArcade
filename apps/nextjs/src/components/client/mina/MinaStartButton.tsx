"use client";

import React, { useCallback, useEffect } from "react";
// import Link from "next/link";
import { useMinaContext } from "@/components/client/providers/MinaProvider";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import type { PublicKey } from "o1js";
import { useLobbyStore } from "../stores";

import { LoadingSpinner } from "../ui";
import type ZkappWorkerClient from "./zkAppWorkerClient";

function MinaStartButton({
  children,
  setToXR,
  // isPlayerOne,
  // publicKey,
  // privateKey,
}: {
  children: React.ReactNode;
  setToXR: React.Dispatch<React.SetStateAction<boolean>>;
  // isPlayerOne: boolean;
  // publicKey?: string;
  // privateKey?: string;
}) {
  const { initiateMina, initialized } = useMinaContext();
  const { me } = useLobbyStore();
  const [gameReady, setGameReady] = React.useState<boolean>(false);

  const handleLoadContract = useCallback(
    async ({
      zkAppClient,
      zkAppPublicKey,
    }: {
      zkAppClient: ZkappWorkerClient;
      zkAppPublicKey: PublicKey;
    }) => {
      console.log("---- handleLoadContract ----");
      console.log("fetching Account");

      if (!me) {
        console.log("handleLoadContract - me not set in lobbyStore")
        return;
      }

      const fetchedAccount = await zkAppClient.fetchAccount({
        publicKey: zkAppPublicKey,
      });
      console.log("fetchedAccount: ", fetchedAccount);

      console.log("zkAppClient", zkAppClient);
      await zkAppClient.loadContract();

      console.log("Compiling zkApp...");
      await zkAppClient.compileContract();
      console.log("zkApp compiled");

      console.log("init");
      await zkAppClient.initZkappInstance(zkAppPublicKey);
      console.log("inited");

      const hash = me.host ? await zkAppClient.getPlayer1ObjectHash() : await zkAppClient.getPlayer2ObjectHash();

      console.log(`Hash for player ${me.host ? "One: " : "Two"}`, hash);
    },
    [me],
  );

  useEffect(() => {
    void (async () => {

      if (!me) {
        console.log("useEffect - me not set in lobbyStore")
        return;
      }

      const { host, publicKey, privateKey } = me;
      if (publicKey && privateKey && typeof host === "boolean" && !initialized) {
        console.log("THIS SHOULD BE FIRST");
        const mina = await initiateMina({
          isPlayerOne: host,
          publicKey,
          privateKey,
        });

        if (!mina) {
          throw new Error("initiateMina - useEffect: mina is undefined");
        }

        if (!mina.zkAppClient) {
          throw new Error("initiateMina - useEffect: zkAppClient is undefined");
        }

        if (!mina.zkAppPublicKey) {
          throw new Error(
            "initiateMina - useEffect: zkAppPublicKey is undefined",
          );
        }

        await handleLoadContract({ ...mina })
          .then(() => {
            console.log("handleLoadContract resolved");
            setGameReady(true);
            setToXR(true);
            toast({
              title: "Contract successfully loaded",
              description:
                "zkApp successfully initialized. You can now start the game!",
              variant: "default",
              duration: 5000,
            });
          })
          .catch((err) => {
            console.log("handleLoadContract error", err);
            toast({
              title: "Failed to load contract",
              description:
                "Please refresh the page and try again, or play without Mina.",
              variant: "destructive",
              duration: 5000,
            });
          })
          .finally(() => {
            console.log("handleLoadContract finally");
            // setInitialized(true);
          });
        // ideally have a check here to see if the contract is loaded
      } else {
        throw new Error("publicKey or privateKey is undefined");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Button variant={"default"} asChild disabled={!gameReady}>
      {/* change from Link to Webxr Components directly */}
      {initialized && gameReady ? <>{children}</> : <LoadingSpinner />}
    </Button>
  );
}

export default MinaStartButton;
