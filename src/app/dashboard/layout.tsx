import { ActiveTabContent, SidebarNav } from "@/components/client/dashboard";
import { Notifications } from "@/components/server";
import { DashboardTabProvider } from "@/components/client/providers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { currentUser } from "@clerk/nextjs";

import UserAvatar from "@/components/client/Avatar";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";

interface DashboardLayoutProps {
  primary: React.ReactNode;
  secondary: React.ReactNode;
  home: React.ReactNode;
  friends: React.ReactNode;
  leaderboard: React.ReactNode;
  settings: React.ReactNode;
}

export default async function DashboardLayout({
  primary, // top right container content
  secondary, // bottom right container content
  home,
  friends,
  leaderboard,
  settings,
}: DashboardLayoutProps) {
  const user = await currentUser();

  if (!user) {
    redirect("/");
    return null;
  }

  if (!user.username) {
    throw new Error("No username found");
  }

  // const dbUser = await api.users.getUser.query({ username: user.username });

  // console.log(dbUser);

  return (
    <>
      <DashboardTabProvider>
        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-20 lg:overflow-y-auto lg:bg-gray-900 lg:pb-4">
          <div className="flex h-full flex-col items-center justify-between">
            <div className="flex w-full flex-col gap-y-4">
              <div className="flex h-16 shrink-0 items-center justify-center">
                <img
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                  src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                  alt="Your Company"
                />
              </div>
              <SidebarNav />
            </div>

            <div className="flex flex-shrink flex-col items-center">
              <Notifications username={user.username} id={user.id} />
              <UserAvatar imageUrl={user.imageUrl} username={user.username} />
            </div>
          </div>
        </div>
        <main className="lg:pl-20">
          <div className="xl:pl-96">
            <div className="relative h-full px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
              <div className="inset-y-0 flex flex-col gap-y-8">
                {/* Top Container  */}
                <div className="container relative flex min-h-[43vh] flex-col rounded-md bg-slate-500 p-2 shadow-lg">
                  <div className="relative m-1 flex h-full flex-grow flex-col items-center rounded-md bg-white">
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
                <div className="container relative flex min-h-[43vh] flex-col rounded-md bg-neutral-300 p-2 shadow-lg">
                  {/* hello{" "} */}
                  <div className="relative m-1 flex flex-grow flex-col items-center rounded-md bg-white bg-gradient-to-t from-neutral-300 to-[#ffffff]">
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
    </>
  );
}
