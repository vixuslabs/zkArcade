"use client";
/* eslint-disable */

import { Mina, PublicKey, fetchAccount, Field } from "o1js";

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

import type{ HotnCold } from "@hot-n-cold/mina/src";
import { Object3D, Box, Room } from "@hot-n-cold/mina/src/structs";

const state = {
  HotnCold: null as null | typeof HotnCold,
  zkapp: null as null | HotnCold,
  transaction: null as null | Transaction,
};

// ---------------------------------------------------------------------------------------

const functions = {
  setActiveInstanceToBerkeley: async (args: {}) => {
    const Berkeley = Mina.Network(
      "https://api.minascan.io/node/berkeley/v1/graphql",
    );
    console.log("Berkeley Instance Created");
    Mina.setActiveInstance(Berkeley);
  },
  loadContract: async (args: {}) => {
    const { HotnCold } = await import("@hot-n-cold/mina/src/HotnCold");
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
  createCommitObjectTransaction: async (args: { object: string}) => {
    const transaction = await Mina.transaction(() => {
      state.zkapp!.commitObject(Object3D.createFromJSON(args.object));
    });
    state.transaction = transaction;
  },
  createValidateRoomTransaction: async (args: {room: string, object: string}) => {
    const room = Room.createFromJSON(args.room);
    const object = Object3D.createFromJSON(args.object);
    const transaction = await Mina.transaction(() => {
      state.zkapp!.validateRoom(room, object);
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