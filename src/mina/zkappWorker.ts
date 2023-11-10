"use client";
/* eslint-disable */

import { Mina, PublicKey, fetchAccount, Field } from "o1js";

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

import type { HotnCold } from "./HotnCold";
import { Object3D, Box } from "./structs";

const state = {
  HotnCold: null as null | typeof HotnCold,
  zkapp: null as null | HotnCold,
  transaction: null as null | Transaction,
};

// ---------------------------------------------------------------------------------------

const functions = {
  setActiveInstanceToBerkeley: async (args: {}) => {
    const Berkeley = Mina.Network(
      "https://proxy.berkeley.minaexplorer.com/graphql",
    );
    console.log("Berkeley Instance Created");
    Mina.setActiveInstance(Berkeley);
  },
  loadContract: async (args: {}) => {
    const { HotnCold } = await import("./HotnCold");
    state.HotnCold = HotnCold;
  },
  compileContract: async (args: {}) => {
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
  getObjectHash: async (args: {}) => {
    const currentObjectHash = await state.zkapp!.objectHash.get();
    return JSON.stringify(currentObjectHash.toJSON());
  },
  createCommitObjectTransaction: async (args: { objectHash: string }) => {
    const transaction = await Mina.transaction(() => {
      state.zkapp!.commitObject(Field(args.objectHash));
    });
    state.transaction = transaction;
  },
  createValidateObjectIsOutsideBoxTransaction: async (args: {
    boxesAndObjects: string;
  }) => {
    const boxesAndObjectsArray = JSON.parse(args.boxesAndObjects);
    const boxesAndObjects: Box[] = [];
    for (const boxAndObject of boxesAndObjectsArray) {
      boxesAndObjects.push(Box.createFromJSON(boxAndObject));
    }
    const transaction = await Mina.transaction(() => {
      for (const boxAndObject of boxesAndObjects) {
        state.zkapp!.validateObjectIsOutsideBox(boxAndObject);
      }
    });
    state.transaction = transaction;
  },
  createProveTransaction: async () => {
    await state.transaction!.prove();
  },
  getTransactionJSON: async (args: {}) => {
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
