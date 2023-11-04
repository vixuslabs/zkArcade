import { useState, useEffect } from "react";
import Pusher from "pusher-js";
import { usePusherClient } from "@/pusher/client";
import type { Channel } from "pusher-js";

interface FriendData {
  username: string;
  firstName: string | null;
  imageUrl: string;
  id?: string;
  requestId?: number;
  showToast?: boolean;
}

type FriendEvents =
  | `user:${string}:friend-added`
  | `user:${string}:friend-deleted`
  | `user:${string}:friend-request-pending`
  | `user:${string}:friend-request-accepted`
  | `user:${string}:friend-request-declined`;

type EventCallback = (data: FriendData) => void;

type EventMap = {
  [key in string]: EventCallback;
};

export const useFriendsChannel = (events: EventMap = {}) => {
  //   const [activeFriends, setActiveFriends] =
  //     useState<FriendData[]>(initialFriends);
  const { pusher, isLoading } = usePusherClient();
  // const [init, setInit] = useState(false);
  //   const [channel, setChannel] = useState<Channel | null>(null);

  console.log("in useFriendsChannel: ", pusher, isLoading);

  useEffect(() => {
    if (isLoading || !pusher) return;
    // setInit(true);

    const friendsChannel = pusher.subscribe("friends");

    console.log("rerender pusher hook");

    // Bind additional events passed in
    Object.entries(events).forEach(([eventName, handler]) => {
      friendsChannel.bind(eventName, handler);
    });

    console.log("added events to friend channel", friendsChannel);

    // setChannel(friendsChannel);

    return () => {
      console.log("unsubscribing from friends channel");
      Object.keys(events).forEach((eventName) => {
        friendsChannel.unbind(eventName);
      });
      pusher.unsubscribe("friends");
      //   setChannel(null);
    };
  }, [isLoading]);

  //   return activeFriends;
};
