import { Suspense } from "react";
import Image from "next/image";
import {
  ActiveTabContent,
  NotificationButton,
  SidebarNav,
} from "@/components/client/dashboard";
import FriendsWS from "@/components/client/dashboard/FriendsWS";
import { DashboardTabProvider } from "@/components/client/providers";
import { AvatarSkeleton } from "@/components/client/skeletons";
import { UserAvatar } from "@/components/client/ui";
import { RedirectToSignIn, SignedOut } from "@clerk/nextjs";

interface DashboardLayoutProps {
  primary: React.ReactNode;
  secondary: React.ReactNode;
  friends: React.ReactNode;
  settings: React.ReactNode;
}

// export const revalidate = 300;
// export const dynamic = "force-dynamic";

export default function DashboardLayout({
  primary, // top right container content
  secondary, // bottom right container content
  friends,
  settings,
}: DashboardLayoutProps) {
  return (
    <>
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
              <Suspense fallback={<AvatarSkeleton />}>
                <UserAvatar />
              </Suspense>
            </div>
          </div>
        </div>
        <main className="md:pl-20">
          <div className="lg:pl-96">
            <div className="relative h-full px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
              <div className="inset-y-0 flex flex-col gap-y-8">
                {/* Top Container  */}
                <div className="container relative flex min-h-[43vh] flex-col rounded-md bg-neutral-300 bg-opacity-10 p-2 shadow-lg">
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
                <div className="container relative flex min-h-[43vh] flex-col rounded-md bg-neutral-300 bg-opacity-10 p-2 shadow-lg">
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
          <div className="h-full overflow-scroll rounded-md p-2 shadow-lg">
            <ActiveTabContent friends={friends} settings={settings} />
          </div>
        </aside>
      </DashboardTabProvider>
      <FriendsWS />
      <SignedOut>
        <RedirectToSignIn redirectUrl={"/"} />
      </SignedOut>
    </>
  );
}
