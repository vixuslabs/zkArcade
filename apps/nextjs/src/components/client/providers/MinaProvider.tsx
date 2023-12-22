"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { PrivateKey, PublicKey } from "o1js";

import type ZkappWorkerClient from "../mina/zkAppWorkerClient";

interface MinaState {
  zkappWorkerClient: ZkappWorkerClient | null;
  initialized: boolean;
  pubKey: string;
  privKey: string;
  zkAppPublicKey?: PublicKey;
  zkAppPrivateKey?: PrivateKey;
}

interface MinaContextValues {
  mina: MinaState | null;
  setMina: React.Dispatch<React.SetStateAction<MinaState | null>> | null;
  initiateMina: ({
    publicKey,
    privateKey,
  }: {
    publicKey: string;
    privateKey: string;
  }) => Promise<void>;
  zkappWorkerClient: ZkappWorkerClient | null;
  zkAppPublicKey?: PublicKey;
  // setPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
}

const MinaContext = createContext<MinaContextValues>({
  mina: null,
  setMina: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  initiateMina: async () => {},
  zkappWorkerClient: null,
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

  const handleInitiateMina = useCallback(
    async ({
      publicKey,
      privateKey,
    }: {
      publicKey: string;
      privateKey: string;
    }) => {
      if (mina) {
        return;
      }
      if (!publicKey || !privateKey) {
        throw new Error("Both public and private keys must be provided");
      }
      const { PublicKey } = await import("o1js");
      console.log("pre zkappWorkerClient");
      const ZkappWorkerClient = (await import("../mina/zkAppWorkerClient"))
        .default;

      console.log("post zkappWorkerClient");

      console.log("pre new zkappWorkerClient");
      const zkappWorkerClient = new ZkappWorkerClient();
      await timeout(10);
      console.log("post new zkappWorkerClient");

      console.log("pre setActiveInstanceToBerkeley");
      await zkappWorkerClient.setActiveInstanceToBerkeley();
      console.log("post setActiveInstanceToBerkeley");

      const zkappPublicKey = PublicKey.fromBase58(
        "B62qkYHTNVjroM1PyPkASFvd8e8ByCfQJAxExhvYtYY8DYSyWGpJzFD", // deploy005
      );

      setMina({
        zkappWorkerClient: zkappWorkerClient,
        zkAppPublicKey: zkappPublicKey,
        initialized: true,
        pubKey: publicKey,
        privKey: privateKey,
      });
    },
    [mina, timeout],
  );

  // useEffect(() => {
  //   async function timeout(seconds: number): Promise<void> {
  //     return new Promise<void>((resolve) => {
  //       setTimeout(() => {
  //         resolve();
  //       }, seconds * 1000);
  //     });
  //   }
  //   void (async () => {
  //     if (mina) return;
  //     const { PrivateKey, PublicKey } = await import("o1js");
  //     const ZkappWorkerClient = (await import("@/mina/zkappWorkerClient"))
  //       .default;

  //     console.log(PrivateKey, PublicKey, ZkappWorkerClient);

  //     const zkappWorkerClient = new ZkappWorkerClient();
  //     await timeout(5);

  //     /* eslint-disable */
  //     const globalMina = (window as any).mina; // we actually wont have this in the meta browser
  //     /* eslint-enable */
  //     await zkappWorkerClient.setActiveInstanceToBerkeley();

  //     const pubKey = player.publicKey;
  //     const privKey = player.privateKey;

  //     if (!pubKey || !privKey) {
  //       throw new Error("No keys");
  //     }

  //     setMina({
  //       ZkappWorkerClient: zkappWorkerClient,
  //       initialized: true,
  //       player: player,
  //       pubKey: pubKey,
  //       privKey: privKey,
  //     });
  //   })();
  // }, []);

  const value = useMemo(() => {
    console.log("mina", mina);
    if (mina && setMina)
      return {
        mina: mina,
        setMina: setMina,
        initiateMina: handleInitiateMina,
        zkappWorkerClient: mina.zkappWorkerClient,
        zkAppPublicKey: mina.zkAppPublicKey,
      };
    else
      return {
        mina: null,
        setMina: null,
        initiateMina: handleInitiateMina,
        zkappWorkerClient: null,
      };
  }, [mina, handleInitiateMina]);

  return <MinaContext.Provider value={value}>{children}</MinaContext.Provider>;
}

export default MinaProvider;
