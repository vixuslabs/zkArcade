import { redirect } from "next/navigation";
import { Sandbox } from "@/components/client/xr";
import { api } from "@/trpc/server";

export const dynamic = "force-dynamic";

async function SandboxPage() {
  const user = await api.users.getCurrentUser.query();

  if (!user) redirect("/");

  return (
    <div className="flex items-center justify-center">
      <Sandbox username={user.username} />
    </div>
  );
}

export default SandboxPage;
