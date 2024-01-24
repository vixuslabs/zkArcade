import { Lobby } from "@/components/client/ui/lobby";

export const dynamic = "force-dynamic";

function LobbyPage({
  params,
}: {
  params: { username: string; lobbyId: string };
  searchParams: { xr?: string };
}) {
  return <Lobby hostUsername={params.username} lobbyId={params.lobbyId} />;
}

export default LobbyPage;
