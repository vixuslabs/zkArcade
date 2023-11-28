import { ActiveTabContent, SidebarNav } from "@/components/client/dashboard";
import { currentUser, clerkClient } from "@clerk/nextjs";

import UserAvatar from "@/components/client/Avatar";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import {
  DashboardTabProvider,
  FriendsChannelProvider,
} from "@/components/client/providers";
import { NotificationButton } from "@/components/client/dashboard";
import Image from "next/image";

interface DashboardLayoutProps {
  primary: React.ReactNode;
  secondary: React.ReactNode;
  home: React.ReactNode;
  friends: React.ReactNode;
  leaderboard: React.ReactNode;
  settings: React.ReactNode;
}

interface FriendInfo {
  username: string;
  firstName: string | null;
  imageUrl: string;
  id: string;
}

type PendingFriendRequest = {
  requestId: number;
  imageUrl: string;
  username: string;
  firstName: string | null;
};

interface Invite {
  sender: FriendInfo;
  gameId: string;
}

export default async function DashboardLayout({
  primary, // top right container content
  secondary, // bottom right container content
  home,
  friends,
  leaderboard,
  settings,
}: DashboardLayoutProps) {
  const friendsInfo: FriendInfo[] = [];
  const pendingFriendRequests: PendingFriendRequest[] = [];
  const filteredInvites: Invite[] = [];

  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  if (!user.username) {
    throw new Error("No username found");
  }

  const usersFriends = await api.friendships.getUsersFriends.query();
  const rawPendingFriendRequests =
    await api.friendships.getAllRequestsToUser.query({ type: "pending" });
  const rawGameInvites = await api.games.getGameInvites.query();

  /**
   * ABSOLUTELY NEED TO REFACTOR DB SCHEMA
   * THIS IS DISGUSTING
   */
  for (const invite of rawGameInvites) {
    const requestClerkInfo = await clerkClient.users.getUser(invite.senderId);
    if (invite.status !== "sent" || invite.senderId === user.id) continue;
    filteredInvites.push({
      gameId: invite.lobbyId,
      sender: {
        username: requestClerkInfo.username!,
        firstName: requestClerkInfo.firstName,
        imageUrl: requestClerkInfo.imageUrl,
        id: invite.senderId,
      },
    });
  }

  for (const request of rawPendingFriendRequests) {
    const requestClerkInfo = await clerkClient.users.getUser(request.senderId);
    pendingFriendRequests.push({
      requestId: request.requestId,
      firstName: requestClerkInfo.firstName,
      imageUrl: requestClerkInfo.imageUrl,
      username: requestClerkInfo.username!,
    });
  }

  for (const friend of usersFriends) {
    const friendClerkInfo = await clerkClient.users.getUser(friend.id);
    friendsInfo.push({
      username: friend.username,
      firstName: friend.firstName,
      imageUrl: friendClerkInfo.imageUrl,
      id: friend.id,
    });
  }

  return (
    <>
      <FriendsChannelProvider
        initFriendsInfo={friendsInfo}
        initFriendRequests={pendingFriendRequests}
        initGameInvites={filteredInvites}
      >
        <DashboardTabProvider>
          {/* Static sidebar for desktop */}
          <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:block md:w-20 md:overflow-y-auto md:bg-gray-900 md:pb-4">
            <div className="flex h-full flex-col items-center justify-between">
              <div className="flex w-full flex-col gap-y-4">
                <div className="flex h-16 shrink-0 items-center justify-center">
                  <Image
                    width={32}
                    height={32}
                    className="h-10 w-auto"
                    src="/hotNcold.png"
                    alt="Your Company"
                  />
                </div>
                <SidebarNav />
              </div>

              <div className="flex flex-shrink flex-col items-center">
                <NotificationButton />
                <UserAvatar imageUrl={user.imageUrl} username={user.username} />
              </div>
            </div>
          </div>
          <main className="lg:pl-20">
            <div className="xl:pl-96">
              <div className="relative h-full px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
                <div className="inset-y-0 flex flex-col gap-y-8">
                  {/* Top Container  */}
                  <div className="container relative flex min-h-[43vh] flex-col rounded-md bg-slate-500 bg-opacity-20 p-2 shadow-lg">
                    <div className="relative m-1 flex h-full flex-grow flex-col items-center rounded-md">
                      {primary}
                    </div>
                  </div>
                  {/* Divider */}
                  <div className="relative mx-[20%]">
                    <div
                      className="absolute inset-0 flex items-center"
                      aria-hidden="true"
                    >
                      <div className="w-full border-t border-gray-300" />
                    </div>
                  </div>
                  {/* Bottom container */}
                  <div className="container relative flex min-h-[43vh] flex-col rounded-md bg-neutral-300 bg-opacity-20 p-2 shadow-lg">
                    {/* hello{" "} */}
                    <div className="relative m-1 flex flex-grow flex-col items-center rounded-md ">
                      {secondary}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <aside className="fixed inset-y-0 left-20 hidden w-96 overflow-y-auto border-r border-gray-200 px-4 py-6 sm:px-6 lg:px-8 xl:block">
            {/* Secondary column (hidden on smaller screens) */}
            <div className="h-full rounded-md bg-neutral-300 bg-opacity-20 p-2 shadow-lg">
              <ActiveTabContent
                home={home}
                friends={friends}
                leaderboard={leaderboard}
                settings={settings}
              />
            </div>
          </aside>
        </DashboardTabProvider>
      </FriendsChannelProvider>
    </>
  );
}
