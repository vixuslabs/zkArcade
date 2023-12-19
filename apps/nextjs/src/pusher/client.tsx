"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { usePusher } from "@/components/client/lobbyStore";
// import { env } from "@/env.mjs";
import { useClerk } from "@clerk/nextjs";
import type Pusher from "pusher-js";

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
  const { initPusher, pusherInitialized, removePusher, pusher } = usePusher();
  const { user } = useClerk();

  useEffect(() => {
    if (!user) {
      console.log("user not set yet");
      return;
    }

    if (pusherInitialized) {
      console.log("pusher already initialized");
      console.log(`pusher`, pusher);
      return;
    }

    initPusher({
      userId: user.id,
      username: user.username ?? "",
      imageUrl: user.imageUrl,
    });

    // const client = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
    //   cluster: "us2",
    //   forceTLS: true,
    //   userAuthentication: {
    //     endpoint: "../api/pusher/user-auth",
    //     transport: "ajax",
    //     params: {
    //       username: user.username,
    //       userId: user.id,
    //     },
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   },
    //   channelAuthorization: {
    //     endpoint: "../api/pusher/channel-auth",
    //     transport: "ajax",
    //     params: {
    //       username: user.username,
    //       userId: user.id,
    //       imageUrl: user.imageUrl,
    //     },
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   },
    // });

    // client.signin();

    setIsLoading(false);

    // setPusherClient(client);
    return () => {
      // client.disconnect();
      console.log("removing pusher");
      console.log(`pusher`, pusher);
      if (pusherInitialized) removePusher();
    };
  }, [pusherInitialized, user?.id]);

  const values = useMemo(() => {
    return {
      pusher,
      isLoading,
      initialized: pusherInitialized,
    };
  }, [pusherInitialized]);

  return (
    <PusherClientContext.Provider value={values}>
      {props.children}
    </PusherClientContext.Provider>
  );
}
