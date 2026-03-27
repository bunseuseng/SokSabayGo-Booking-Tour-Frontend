import { Home, Search, CalendarDays, Car, LogIn, UserPlus, Bell, MessageCircle, LayoutDashboard, LogOut, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Search Tours", url: "/search", icon: Search },
  { title: "My Bookings", url: "/bookings", icon: CalendarDays },
  { title: "Messages", url: "/chat", icon: MessageCircle },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Become a Driver", url: "/driver-request", icon: Car },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Soksabay Go" className="h-8 w-8 rounded-md shrink-0" />
          {!collapsed && (
            <span className="text-lg font-bold text-sidebar-foreground tracking-tight">Soksabay Go</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end className="hover:bg-sidebar-accent/50 relative" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={currentPath.startsWith("/admin")}>
                    <NavLink to="/admin" className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {!collapsed && <span>Admin Panel</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isAuthenticated ? (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/profile")}>
                      <NavLink to="/profile" end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <User className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{user?.fullName || "My Profile"}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <button onClick={logout} className="hover:bg-sidebar-accent/50 w-full flex items-center">
                        <LogOut className="mr-2 h-4 w-4" />
                        {!collapsed && <span>Logout</span>}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              ) : (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/login")}>
                      <NavLink to="/login" end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <LogIn className="mr-2 h-4 w-4" />
                        {!collapsed && <span>Login</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/register")}>
                      <NavLink to="/register" end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <UserPlus className="mr-2 h-4 w-4" />
                        {!collapsed && <span>Register</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
