"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { usePusher } from "@/lib/stores";
import { useUser } from "@clerk/nextjs";
import type Pusher from "pusher-js";
import { useShallow } from "zustand/react/shallow";

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
  const [isLoading, setIsLoading] = useState(true);
  const { initPusher, removePusher, pusher } = usePusher();
  const pusherInitialized = usePusher(
    useShallow((state) => state.pusherInitialized),
  );
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (!isSignedIn || pusherInitialized) {
      return;
    }

    console.log("initializing pusher");

    initPusher({
      userId: user.id,
      username: user.username ?? "",
      imageUrl: `/api/imageProxy?url=${encodeURIComponent(user.imageUrl)}`,
    });

    setIsLoading(false);

    return () => {
      console.log("removing pusher");
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
