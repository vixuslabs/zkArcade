import { NotificationButton } from "@/components/client/dashboard";

import { api } from "@/trpc/server";
import { clerkClient } from "@clerk/nextjs";

async function Notifications({
  username,
  id,
}: {
  username: string;
  id: string;
}) {
  const friendRequests = await api.friendships.getAllRequestsToUser.query({
    type: "pending",
  });

  const cleanedFriendRequests = friendRequests.map(async (request) => {
    const { username, firstName, imageUrl } = await clerkClient.users.getUser(
      request.senderId,
    );
    return {
      requestId: request.requestId,
      username,
      firstName,
      imageUrl,
    };
  });

  const finalFriendRequest = await Promise.all(cleanedFriendRequests);

  // const pendingFriendRequests = friendRequests.filter(
  //   (request) => request.status === "pending",
  // );

  // const pendingFriendRequests = friendRequests.filter(
  //   (request) => request.status === "pending",
  // ).map((request) => ({
  //   requestId: request.requestId,
  //   senderId: request.senderId,
  //   receiverId: request.receiverId,
  // }));

  return (
    <>
      <NotificationButton pendingFriendRequests={finalFriendRequest} />
    </>
  );
}

export default Notifications;
