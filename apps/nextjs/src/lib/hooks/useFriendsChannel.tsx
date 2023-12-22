import { useEffect } from "react";
import { useFriendsStore, usePusher } from "@/components/client/stores";
import type { FriendsEventMap } from "@/components/client/stores";
import { useUser } from "@clerk/nextjs";
import { shallow } from "zustand/shallow";

export interface FriendData {
  username: string;
  imageUrl: string;
  id: string;
  requestId?: number;
  friendId?: string;
  showToast?: boolean;
  gameId?: string;
}

export const useFriendsChannel = (events: FriendsEventMap) => {
  const friendsStore = useFriendsStore();
  const {
    pusherInitialized,
    unsubscribeFromChannel,
    subscribeToChannel,
    pusher,
  } = usePusher();

  const activeChannels = usePusher((state) => state.activeChannels, shallow);

  const user = useUser();

  useEffect(() => {
    if (!pusherInitialized || !user.isSignedIn) {
      return;
    }

    console.log("pusher initialized - inside useFriendsChannel");

    const rawId = user.user?.id.split("_")[1];

    const friendsChannel = subscribeToChannel(`user-${rawId}-friends`);
    console.log(friendsChannel);
    if (!friendsChannel) {
      throw new Error(
        `Could not subscribe to friends channel: user-${rawId}-friends`,
      );
    }

    friendsStore.addFriendEvents(events);

    return () => {
      console.log("unsubscribing from friends channel");
      if (pusher) unsubscribeFromChannel(friendsChannel.name);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pusherInitialized, user.isSignedIn, pusher]);
};
