import { AddFriend, FriendsList } from "@/components/client/dashboard";

function Friends() {
  return (
    <div className="flex w-full flex-col justify-around gap-y-4">
      <FriendsList />
      <AddFriend />
    </div>
  );
}

export default Friends;
