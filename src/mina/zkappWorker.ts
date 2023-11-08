/* eslint-disable */
import { Mina, PublicKey, fetchAccount } from "o1js";

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

import type { HotnCold } from "./HotnCold";
import type { Object3D } from "./structs";

const state = {
  HotnCold: null as null | typeof HotnCold,
  zkapp: null as null | HotnCold,
  transaction: null as null | Transaction,
};

// ---------------------------------------------------------------------------------------

const functions = {
  setActiveInstanceToBerkeley: async () => {
    const Berkeley = Mina.Network(
      "https://proxy.berkeley.minaexplorer.com/graphql",
    );
    console.log("Berkeley Instance Created");
    Mina.setActiveInstance(Berkeley);
  },
  loadContract: async () => {
    // const { HotnCold } = await import("./build/HotnCold.js");
    const { HotnCold } = await import("./HotnCold");
    state.HotnCold = HotnCold;
  },
  compileContract: async () => {
    await state.HotnCold!.compile();
  },
  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },
  initZkappInstance: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    state.zkapp = new state.HotnCold!(publicKey);
  },
  getObjectHash: async () => {
    const currentObjectHash = await state.zkapp!.objectHash.get();
    return JSON.stringify(currentObjectHash.toJSON());
  },
  commitObject: async (args: { object: Object3D }) => {
    const transaction = await Mina.transaction(() => {
      state.zkapp!.commitObject(args.object);
    });
    state.transaction = transaction;
  },
  proveUpdateTransaction: async () => {
    await state.transaction!.prove();
  },
  getTransactionJSON: () => {
    return state.transaction!.toJSON();
  },
};

// ---------------------------------------------------------------------------------------

export type WorkerFunctions = keyof typeof functions;

export type ZkappWorkerRequest = {
  id: number;
  fn: WorkerFunctions;
  args: any;
};

export type ZkappWorkerReponse = {
  id: number;
  data: any;
};

if (typeof window !== "undefined") {
  addEventListener(
    "message",
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async (event: MessageEvent<ZkappWorkerRequest>) => {
      const returnData = await functions[event.data.fn](event.data.args);

      const message: ZkappWorkerReponse = {
        id: event.data.id,
        data: returnData,
      };
      postMessage(message);
    },
  );
}

console.log("Web Worker Successfully Initialized.");
