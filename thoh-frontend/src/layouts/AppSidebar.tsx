import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../components/ui/sidebar";
import thoh from "../assets/thoh.svg";

import { NavLink } from "react-router-dom";
import { Home, Users, BarChart3, Drill } from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    url: "/admin",
  },
  {
    title: "People",
    icon: Users,
    url: "/users",
  },
  {
    title: "Economic Flow",
    icon: BarChart3,
    url: "/flow",
  },
  {
    title: "Raw Materials",
    icon: Drill,
    url: "/equipment",
  },
];

export function AppSidebar() {
  const { open } = useSidebar();
  
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border h-16">
        <div className="flex items-center gap-2 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <img src={thoh} alt="THOH Logo" className="size-4" />
          </div>
          {open &&
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-semibold">THOH</span>
              <span className="text-xs text-sidebar-foreground/70">Control Center</span>
            </div>
            }
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-2 w-full ${
                          isActive ? "border-e-slate-950" : ""
                        }`
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
