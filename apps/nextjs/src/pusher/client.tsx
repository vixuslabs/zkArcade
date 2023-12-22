"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { usePusher } from "@/components/client/stores";
// import { env } from "@/env.mjs";
import { useUser } from "@clerk/nextjs";
import type Pusher from "pusher-js";
import { shallow } from "zustand/shallow";

interface PusherContextValues {
  pusher: Pusher | null;
  isLoading: boolean;
  initialized: boolean;
}

const PusherClientContext = React.createContext<PusherContextValues>({
  pusher: null,
  isLoading: true,
  initialized: false,
});

/**
 *  NEED TO FIX - SINCE WHEN A USER LOGS IN, THE PUSHER IS BEING CREATED TOO LATE
 * @returns
 */
export const usePusherClient = () => {
  const context = useContext(PusherClientContext);

  // if (!context) {
  //   throw new Error(
  //     "usePusherClient must be used within a PusherClientContextProvider",
  //   );
  // }

  return context;
};

export function PusherClientProvider(props: { children: React.ReactNode }) {
  // const [pusherClient, setPusherClient] = useState<Pusher>(null!);
  const [isLoading, setIsLoading] = useState(true);
  const { initPusher, removePusher, pusher } = usePusher();
  const pusherInitialized = usePusher(
    (state) => state.pusherInitialized,
    shallow,
  );
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (!isSignedIn || pusherInitialized) {
      return;
    }

    initPusher({
      userId: user.id,
      username: user.username ?? "",
      imageUrl: user.imageUrl,
    });

    setIsLoading(false);

    return () => {
      if (pusherInitialized) removePusher();
    };
  }, [
    pusherInitialized,
    user?.id,
    user?.username,
    user?.imageUrl,
    initPusher,
    removePusher,
    isSignedIn,
  ]);

  const values = useMemo(() => {
    return {
      pusher,
      isLoading,
      initialized: pusherInitialized,
    };
  }, [pusherInitialized, pusher, isLoading]);

  return (
    <PusherClientContext.Provider value={values}>
      {props.children}
    </PusherClientContext.Provider>
  );
}
