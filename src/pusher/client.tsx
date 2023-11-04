"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";

import { env } from "@/env.mjs";
import Pusher from "pusher-js";
import { useClerk } from "@clerk/nextjs";

interface PusherContextValues {
  pusher: Pusher | null;
  isLoading: boolean;
}

const PusherClientContext = React.createContext<PusherContextValues>({
  pusher: null,
  isLoading: true,
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
  const [pusherClient, setPusherClient] = useState<Pusher>(null!);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useClerk();

  useEffect(() => {
    if (!user) {
      return;
    }

    console.log("init pusher");

    const client = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: "us2",
      userAuthentication: {
        endpoint: "api/pusher/user-auth",
        transport: "ajax",
        params: {
          username: user.username,
          userId: user.id,
        },
        // headers: {
        //   "Content-Type": "application/json",
        // },
      },
    });

    console.log("sign in to pusher");

    client.signin();

    setIsLoading(false);

    setPusherClient(client);
    return () => {
      client.disconnect();
    };
  }, [user]);

  const values = useMemo(() => {
    return {
      pusher: pusherClient,
      isLoading,
    };
  }, [isLoading, pusherClient]);

  return (
    <PusherClientContext.Provider value={values}>
      {props.children}
    </PusherClientContext.Provider>
  );
}
