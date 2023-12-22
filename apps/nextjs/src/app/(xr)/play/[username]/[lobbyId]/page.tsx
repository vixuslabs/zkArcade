import { redirect } from "next/navigation";
import { Lobby } from "@/components/client/ui/lobby";
import { api } from "@/trpc/server";
import { currentUser } from "@clerk/nextjs";

async function LobbyPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) redirect("/");

  const user = await api.users.getCurrentUser.query();

  if (!user) redirect("/");

  return <Lobby />;
}

export default LobbyPage;
