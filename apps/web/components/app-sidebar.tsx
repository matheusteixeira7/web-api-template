"use client"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { useSession } from "@/hooks/use-session"
import {
  IconCalendar,
  IconChartBar,
  IconCreditCard,
  IconDashboard,
  IconHelp,
  IconHeartbeat,
  IconSettings,
  IconStethoscope,
  IconUsers,
} from "@tabler/icons-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import * as React from "react"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Agenda",
      url: "/appointments",
      icon: IconCalendar,
    },
    {
      title: "Pacientes",
      url: "/patients",
      icon: IconUsers,
    },
    {
      title: "Profissionais",
      url: "/professionals",
      icon: IconStethoscope,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: IconChartBar,
    },
  ],
  navSecondary: [
    {
      title: "Assinatura",
      url: "/subscription",
      icon: IconCreditCard,
    },
    {
      title: "Configurações",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Suporte",
      url: "/support",
      icon: IconHelp,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useSession()

  const navSecondaryItems = data.navSecondary.filter((item) => {
    if (item.title === "Assinatura") {
      return user?.role === "ADMIN"
    }
    return true
  })

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconHeartbeat className="!size-5" />
                <span className="text-base font-semibold">HealthSync</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={navSecondaryItems} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: user?.name ?? "User",
          email: user?.email ?? "",
          avatar: "",
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}
