import { redirect } from "next/navigation";
import { Lobby } from "@/components/client/ui/lobby";
import { api } from "@/trpc/server";

export const dynamic = "force-dynamic";

async function LobbyPage({
  params,
}: {
  params: { username: string; lobbyId: string };
  searchParams: { xr?: string };
}) {
  const user = await api.users.getUser.query({
    username: params.username,
  });

  if (!user) redirect("/");

  return <Lobby hostUsername={params.username} lobbyId={params.lobbyId} />;
}

export default LobbyPage;
