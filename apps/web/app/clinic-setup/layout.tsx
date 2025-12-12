import { LogoutButton } from "@/components/logout-button";

export default function ClinicSetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center h-14">
          <div className="ml-auto pr-4"><LogoutButton /></div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
