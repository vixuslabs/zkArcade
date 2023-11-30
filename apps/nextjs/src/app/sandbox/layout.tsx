export default function XRLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-screen w-full flex-col items-center justify-center">
      {children}
    </div>
  );
}
