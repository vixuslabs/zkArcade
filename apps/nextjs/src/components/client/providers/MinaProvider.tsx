"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { HOTNCOLD_ADDRESS } from "@/lib/constants";
import type { PrivateKey, PublicKey } from "o1js";

import type ZkappWorkerClient from "../mina/zkAppWorkerClient";

interface MinaState {
  zkappWorkerClient: ZkappWorkerClient | null;
  initialized: boolean;
  pubKey: string;
  privKey: string;
  isPlayerOne: boolean;
  zkAppPublicKey?: PublicKey;
  zkAppPrivateKey?: PrivateKey;
}

interface InitiateMinaReturn {
  zkAppClient: ZkappWorkerClient;
  zkAppPublicKey: PublicKey;
}

interface MinaContextValues {
  mina: MinaState | null;
  setMina: React.Dispatch<React.SetStateAction<MinaState | null>> | null;
  initiateMina: ({
    isPlayerOne,
    publicKey,
    privateKey,
  }: {
    isPlayerOne: boolean;
    publicKey: string;
    privateKey: string;
  }) => Promise<InitiateMinaReturn | null>;
  zkappWorkerClient: ZkappWorkerClient | null;
  zkAppPublicKey: PublicKey | null;
  initialized: boolean;
  // setPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
}

const MinaContext = createContext<MinaContextValues>({
  mina: null,
  setMina: null,
  initiateMina: async () => await Promise.resolve(null),
  zkappWorkerClient: null,
  zkAppPublicKey: null,
  initialized: false,
});

export const useMinaContext = () => {
  const context = useContext(MinaContext);

  if (!context) {
    throw new Error("useMinaContext must be used within a MinaProvider");
  }

  return context;
};

function MinaProvider({
  children, // player,
}: {
  children: React.ReactNode;
  // player?: Player;
}) {
  const [mina, setMina] = useState<MinaState | null>(null);

  const timeout = useCallback(async function timeout(
    seconds: number,
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, seconds * 1000);
    });
  }, []);

  const initiateMina = useCallback(
    async ({
      isPlayerOne,
      publicKey,
      privateKey,
    }: {
      isPlayerOne: boolean;
      publicKey: string;
      privateKey: string;
    }): Promise<InitiateMinaReturn | null> => {
      if (mina) {
        return null;
      }
      if (!publicKey || !privateKey) {
        throw new Error("Both public and private keys must be provided");
      }

      console.log("publicKey and privateKey are provided, initiating Mina...");

      try {
        const { PublicKey } = await import("o1js");
        const ZkappWorkerClient = (
          await import("@/components/client/mina/zkAppWorkerClient")
        ).default;

        console.log("Successfully imported ZkappWorkerClient");

        const zkappWorkerClient = new ZkappWorkerClient();
        await timeout(10);

        await zkappWorkerClient.setActiveInstanceToBerkeley();

        const zkAppPublicKey = PublicKey.fromBase58(
          HOTNCOLD_ADDRESS, // deploy009
        );

        console.log("zkappWorkerClient - instance set to Berkeley");

        setMina({
          zkappWorkerClient: zkappWorkerClient,
          zkAppPublicKey,
          initialized: true,
          isPlayerOne,
          pubKey: publicKey,
          privKey: privateKey,
        });

        return { zkAppClient: zkappWorkerClient, zkAppPublicKey };
      } catch (err) {
        console.log("err", err);
        return Promise.reject(null);
      }
    },
    [mina, timeout],
  );

  const value = useMemo(() => {
    if (mina && setMina)
      return {
        mina: mina,
        setMina: setMina,
        initiateMina,
        zkappWorkerClient: mina.zkappWorkerClient,
        zkAppPublicKey: mina.zkAppPublicKey ?? null,
        initialized: mina.initialized,
      };
    else
      return {
        mina: null,
        setMina: null,
        initiateMina,
        zkappWorkerClient: null,
        zkAppPublicKey: null,
        initialized: false,
      };
  }, [mina, initiateMina, setMina]);

  return <MinaContext.Provider value={value}>{children}</MinaContext.Provider>;
}

export default React.memo(MinaProvider);
