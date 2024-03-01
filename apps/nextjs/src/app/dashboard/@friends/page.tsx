import { AddFriend, FriendsCard } from "@/components/dashboard";

function Friends() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-y-4 overflow-scroll">
      <FriendsCard />
      <AddFriend />
    </div>
  );
}

export default Friends;
