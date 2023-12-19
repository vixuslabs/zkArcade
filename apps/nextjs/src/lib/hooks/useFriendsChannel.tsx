import { useEffect } from "react";
import { useFriendsStore, usePusher } from "@/components/client/lobbyStore";
import type { FriendsEventMap } from "@/components/client/lobbyStore";
import { useUser } from "@clerk/nextjs";

export interface FriendData {
  username: string;
  imageUrl: string;
  id: string;
  requestId?: number;
  friendId?: string;
  showToast?: boolean;
  gameId?: string;
}
// type EventMap = {
//   [key in FriendEvents]: EventCallback;
// };

export const useFriendsChannel = (events: FriendsEventMap) => {
  // const {
  //   pusherInitialized,
  //   addEventsToChannel,
  //   subscribeToChannel,
  //   unsubscribeFromChannel,
  // } = usePusher();
  const { addFriendEvents } = useFriendsStore();
  const { pusherInitialized, unsubscribeFromChannel, subscribeToChannel } =
    usePusher();

  const user = useUser();

  console.log("pusherInitialized", pusherInitialized);
  useEffect(() => {
    console.log(
      "inside useFriendsChannel - pusherInitialized",
      pusherInitialized,
    );
    if (!pusherInitialized) {
      console.log("pusher not initialized yet - inside useFriendsChannel");
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

    addFriendEvents(events);

    // const friendsChannel = pusher.subscribe(`user-${rawId}-friends`);

    // Bind additional events passed in
    // Object.entries(events).forEach(([eventName, handler]) => {
    //   friendsChannel.bind(eventName, handler);
    // });

    console.log("added events to friend channel", friendsChannel);

    return () => {
      console.log("unsubscribing from friends channel");
      unsubscribeFromChannel(friendsChannel.name);
      // Object.keys(events).forEach((eventName) => {
      //   friendsChannel.unbind(eventName);
      // });
      // pusher.unsubscribe(`user-${user.user?.id}-friends`);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pusherInitialized, user.user?.id]);
};
