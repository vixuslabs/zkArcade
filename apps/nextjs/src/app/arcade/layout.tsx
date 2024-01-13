export default function ArcadeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="fixed left-0 top-0 h-full w-full">{children}</div>;
}
