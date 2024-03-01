import { BackButton, Lobby } from "@/components/lobby";

export const dynamic = "force-dynamic";

function LobbyPage({
  params,
}: {
  params: { username: string; lobbyId: string };
  searchParams: { xr?: string };
}) {
  return (
    <>
      <BackButton />
      <Lobby hostUsername={params.username} lobbyId={params.lobbyId} />
    </>
  );
}

export default LobbyPage;
