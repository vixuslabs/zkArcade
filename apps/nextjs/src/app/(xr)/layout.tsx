// import { redirect } from "next/navigation";
import { MinaProvider } from "@/components/client/providers";

// import { api } from "@/trpc/server";
// import { currentUser } from "@clerk/nextjs";

export default function XRLayout({
  children,
}: {
  children: React.ReactNode;
  // params: { username?: string; lobbyId?: string };
}) {
  // const clerkUser = await currentUser();

  // if (!clerkUser) redirect("/");

  // const user = await api.users.getCurrentUser.query();

  // if (!user) redirect("/");

  return (
    <MinaProvider>
      <div className="flex h-full min-h-screen w-full flex-col items-center justify-center">
        {children}
      </div>
    </MinaProvider>
  );
}
