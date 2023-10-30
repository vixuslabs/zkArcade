import { clerkClient, currentUser } from "@clerk/nextjs";
import { api } from "@/trpc/server";
import { AddFriend, FriendsList } from "@/components/client/dashboard";

interface FriendInfo {
  username: string;
  firstName: string | null;
  imageUrl: string;
  id?: string;
}

async function Friends() {
  const user = await currentUser();
  const friendsInfo: FriendInfo[] = [];

  if (!user) return null;

  const usersFriends = await api.friendships.getUsersFriends.query();

  for (const friend of usersFriends) {
    const friendClerkInfo = await clerkClient.users.getUser(friend.id);
    friendsInfo.push({
      username: friend.username,
      firstName: friend.firstName,
      imageUrl: friendClerkInfo.imageUrl,
    });
  }

  return (
    <div className="flex w-full flex-col justify-around gap-y-4">
      <FriendsList friends={friendsInfo} />
      <AddFriend />
    </div>
  );
}

export default Friends;
