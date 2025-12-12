import { AppHeader } from "@/components/app/AppHeader";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col">
      <AppHeader />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
