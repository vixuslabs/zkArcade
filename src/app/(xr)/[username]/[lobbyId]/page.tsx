import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { LobbyProvider } from "@/components/client/providers";

import { Lobby } from "@/components/client/ui/lobby";

async function LobbyPage({
  params,
}: {
  params: { username: string; lobbyId: string };
}) {
  const user = await api.users.getCurrentUser.query();

  if (!user) redirect("/");

  return (
    <LobbyProvider
      user={{
        username: user.username,
        firstName: user.firstName,
        imageUrl: user.image_url,
        host: params.username === user.username,
        ready: false,
      }}
      lobbyId={params.lobbyId}
    >
      <Lobby />
    </LobbyProvider>
  );
}

export default LobbyPage;
