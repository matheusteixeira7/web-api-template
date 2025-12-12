import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SetupGuard } from "@/components/setup-guard";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SetupGuard>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col p-4 md:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </SetupGuard>
  );
}
