import { cache } from "react";
// import { revalidatePath } from "next/cache";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  ActiveTabContent,
  NotificationButton,
  SidebarNav,
} from "@/components/client/dashboard";
import {
  DashboardTabProvider,
  FriendsChannelProvider,
} from "@/components/client/providers";
import UserAvatar from "@/components/client/ui/Avatar";
import { api } from "@/trpc/server";
import { currentUser, RedirectToSignIn, SignedOut } from "@clerk/nextjs";

interface DashboardLayoutProps {
  primary: React.ReactNode;
  secondary: React.ReactNode;
  home: React.ReactNode;
  friends: React.ReactNode;
  leaderboard: React.ReactNode;
  settings: React.ReactNode;
}

export const revalidate = 300;
export const dynamic = "force-dynamic";

// async function proxyImage(imageUrl: string) {
//   "use server";
//   console.log("imageUrl", imageUrl);
//   const res = await fetch(imageUrl);
//   console.log(res);
//   // const blob = await res.blob();
//   // const response = await fetch(imageUrl);

//   // if (!response.ok) {
//   //   return Response.json({ error: "Image not found", status: 500 });
//   // }

//   const arrayBuffer = await res.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);
//   // const blobUrl = URL.createObjectURL(blob);
//   return buffer;
// }

export default async function DashboardLayout({
  primary, // top right container content
  secondary, // bottom right container content
  home,
  friends,
  leaderboard,
  settings,
}: DashboardLayoutProps) {
  // revalidatePath("/dashboard", "layout");
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/");
  }

  const fetchDashboardData = cache(async () => {
    const usersFriends = await api.friendships.getUsersFriends.query();

    // const img = await proxyImage(me.image_url);

    const cleanedUserFriends = usersFriends.map((friend) => {
      // console.log("friend", friend);
      // const img = await proxyImage(friend.imageUrl ?? "");

      // console.log("img", img);

      return {
        username: friend.username,
        // imageUrl: img,
        imageUrl: friend.imageUrl
          ? `/api/imageProxy?url=${encodeURIComponent(friend.imageUrl)}`
          : "",
        id: friend.id,
      };
    });

    // const finalUserFriends = await Promise.all(cleanedUserFriends);

    const pendingFriendRequests = await api.friendships.getFriendRequests.query(
      {
        role: "receiver",
        status: "pending",
      },
    );
    const pendingGameInvites = await api.games.getGameInvites.query({
      role: "receiver",
      status: "pending",
    });

    return {
      usersFriends: cleanedUserFriends,
      // usersFriends: finalUserFriends,
      pendingFriendRequests,
      pendingGameInvites,
    };
  });

  const fetchUserData = cache(async () => {
    const me = await api.users.getCurrentUser.query();

    if (!me) {
      redirect("/");
    }

    if (me.image_url === null) {
      throw new Error("No image url found");
    }

    // const img = await proxyImage(me.image_url);

    return {
      id: me.id,
      username: me.username,
      // imageUrl: img,
      imageUrl: `/api/imageProxy?url=${encodeURIComponent(me.image_url)}`,
    };
  });

  const friendsData = await fetchDashboardData();

  const user = await fetchUserData();

  return (
    <>
      <FriendsChannelProvider
        // initFriendsInfo={friendsData.usersFriends}
        initFriendsInfo={friendsData.usersFriends}
        initFriendRequests={friendsData.pendingFriendRequests}
        initGameInvites={friendsData.pendingGameInvites}
      >
        <DashboardTabProvider>
          <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:block md:w-20 md:overflow-y-auto md:bg-gray-900 md:pb-4">
            <div className="flex h-full flex-col items-center justify-between">
              <div className="flex w-full flex-col gap-y-4">
                <div className="flex h-16 shrink-0 items-center justify-center">
                  <Image
                    width={32}
                    height={32}
                    priority
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
          <main className="md:pl-20">
            <div className="lg:pl-96">
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
                    <div className="relative m-1 flex flex-grow flex-col items-center rounded-md ">
                      {secondary}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <aside className="fixed inset-y-0 left-20 hidden w-96 overflow-y-auto border-r border-gray-200 px-4 py-6 sm:px-6 lg:block lg:px-8">
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
      <SignedOut>
        <RedirectToSignIn redirectUrl={"/"} />
      </SignedOut>
    </>
  );
}
