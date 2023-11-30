import { useEffect } from "react";
import { usePusherClient } from "@/pusher/client";
import { useUser } from "@clerk/nextjs";

interface FriendData {
  username: string;
  firstName: string | null;
  imageUrl: string;
  id: string;
  requestId?: number;
  friendId?: string;
  showToast?: boolean;
  gameId?: string;
}

type FriendEvents =
  | `friend-added`
  | `friend-deleted`
  | `friend-request-pending`
  | `friend-request-accepted`
  | `friend-request-declined`
  | `invite-sent`
  | "invite-accepted";

type EventCallback = (data: FriendData) => void;

type EventMap = {
  [key in FriendEvents]?: EventCallback;
};

export const useFriendsChannel = (events: EventMap) => {
  const { pusher, isLoading } = usePusherClient();
  const user = useUser();

  useEffect(() => {
    if (isLoading || !pusher) return;

    const rawId = user.user?.id.split("_")[1];

    const friendsChannel = pusher.subscribe(`user-${rawId}-friends`);

    // Bind additional events passed in
    Object.entries(events).forEach(([eventName, handler]) => {
      friendsChannel.bind(eventName, handler);
    });

    console.log("added events to friend channel", friendsChannel);

    return () => {
      console.log("unsubscribing from friends channel");
      Object.keys(events).forEach((eventName) => {
        friendsChannel.unbind(eventName);
      });
      pusher.unsubscribe(`user-${user.user?.id}-friends`);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user.user?.id, events]);
};
