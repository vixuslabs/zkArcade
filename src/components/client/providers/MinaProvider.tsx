"use client";

import React, {
  useState,
  useContext,
  createContext,
  useMemo,
  useEffect,
} from "react";

import type { Player } from "@/lib/types";
import type ZkappWorkerClient from "@/mina/zkappWorkerClient";

interface MinaState {
  ZkappWorkerClient: ZkappWorkerClient | null;
  initialized: boolean;
  player: Player;
  pubKey: string;
  privKey: string;
  zkAppPublicKey?: string;
  zkAppPrivateKey?: string;
}

interface MinaContextValues {
  mina?: MinaState;
  setMina?: React.Dispatch<React.SetStateAction<MinaState | null>>;
}

const MinaContext = createContext<MinaContextValues>({});

export const useMinaContext = () => {
  const context = useContext(MinaContext);

  if (!context) {
    throw new Error("useMinaContext must be used within a MinaProvider");
  }

  return context;
};

function MinaProvider({
  children,
  player,
}: {
  children: React.ReactNode;
  player: Player;
}) {
  const [mina, setMina] = useState<MinaState | null>(null);

  useEffect(() => {
    async function timeout(seconds: number): Promise<void> {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, seconds * 1000);
      });
    }
    void (async () => {
      if (mina) return;
      const { PrivateKey, PublicKey } = await import("o1js");
      const ZkappWorkerClient = (await import("@/mina/zkappWorkerClient"))
        .default;

      console.log(PrivateKey, PublicKey, ZkappWorkerClient);

      const zkappWorkerClient = new ZkappWorkerClient();
      await timeout(5);

      /* eslint-disable */
      const globalMina = (window as any).mina; // we actually wont have this in the meta browser
      /* eslint-enable */
      await zkappWorkerClient.setActiveInstanceToBerkeley();

      const pubKey = player.publicKey;
      const privKey = player.privateKey;

      if (!pubKey || !privKey) {
        throw new Error("No keys");
      }

      setMina({
        ZkappWorkerClient: zkappWorkerClient,
        initialized: true,
        player: player,
        pubKey: pubKey,
        privKey: privKey,
      });
    })();
  }, []);

  const value = useMemo(() => {
    console.log("mina", mina);
    if (mina && setMina)
      return {
        mina: mina,
        setMina: setMina,
      };
    else return {};
  }, [mina]);

  return <MinaContext.Provider value={value}>{children}</MinaContext.Provider>;
}

export default MinaProvider;
