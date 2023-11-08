import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { LobbyProvider } from "@/components/client/providers";

// import { currentUser } from "@clerk/nextjs";
import { Lobby } from "@/components/client/ui/lobby";

async function LobbyPage({
  params,
}: {
  params: { username: string; lobbyId: string };
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
      lobbyId={params.lobbyId}
    >
      <Lobby />
    </LobbyProvider>
  );
}

export default LobbyPage;
