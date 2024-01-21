import { MinaProvider } from "@/components/client/providers";

export default function XRLayout({ children }: { children: React.ReactNode }) {
  return (
    <MinaProvider>
      <div className="flex h-full min-h-screen w-full flex-col items-center justify-center">
        {children}
      </div>
    </MinaProvider>
  );
}
