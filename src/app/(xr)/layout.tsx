import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { LobbyProvider, MinaProvider } from "@/components/client/providers";

import { currentUser } from "@clerk/nextjs";
import { Lobby } from "@/components/client/ui/lobby";

export default async function XRLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { username?: string; lobbyId?: string };
}) {
  // const clerkUser = await currentUser();

  // if (!clerkUser) redirect("/");

  const user = await api.users.getCurrentUser.query();

  if (!user) redirect("/");

  console.log("lobbyId", params.lobbyId);

  return (
    <LobbyProvider
      user={{
        username: user.username,
        firstName: user.firstName,
        imageUrl: user.image_url,
        host: params.username === user.username,
        ready: false,
      }}
      lobbyId={params.lobbyId ?? "game"}
    >
      <MinaProvider>
        <div className="flex h-full min-h-screen w-full flex-col items-center justify-center">
          {children}
        </div>
      </MinaProvider>
    </LobbyProvider>
  );
}
