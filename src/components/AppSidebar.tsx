import { Home, Search, CalendarDays, Car, LogIn, UserPlus, Bell, MessageCircle, LayoutDashboard, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useChat } from "@/contexts/ChatContext";
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
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  chatBadge?: boolean;
};

const guestItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Search Tours", url: "/search", icon: Search },
];

const userItemsWithoutBadge = [
  { title: "Home", url: "/", icon: Home },
  { title: "Search Tours", url: "/search", icon: Search },
  { title: "My Bookings", url: "/bookings", icon: CalendarDays },
  { title: "Messages", url: "/chat", icon: MessageCircle, chatBadge: true },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Become a Driver", url: "/driver-request", icon: Car },
];

const driverItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Driver Panel", url: "/driver", icon: LayoutDashboard },
  { title: "Messages", url: "/chat", icon: MessageCircle, chatBadge: true },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const adminItems = [
  { title: "Admin Panel", url: "/admin", icon: LayoutDashboard },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, isAuthenticated, isAdmin, isDriver, loading, logout } = useAuth();
  const { unreadCount: notificationCount } = useNotifications();
  const { unreadCount: chatCount } = useChat();
  const totalUnread = notificationCount + chatCount;

  const isActive = (path: string) => currentPath === path;

  // Wait for auth check to finish before rendering
  if (loading) {
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
        <SidebarContent />
      </Sidebar>
    );
  }

  // Determine menu items based on role
  let navItems: NavItem[] = guestItems;
  if (isAuthenticated) {
    if (isAdmin) navItems = adminItems;
    else if (isDriver) navItems = driverItems.map(item => 
      item.chatBadge ? { ...item, badge: chatCount > 0 ? chatCount : 0 } : item
    );
    else navItems = userItemsWithoutBadge.map(item => 
      item.title === "Notifications" ? { ...item, badge: notificationCount > 0 ? notificationCount : 0 } : 
      item.chatBadge ? { ...item, badge: chatCount > 0 ? chatCount : 0 } : item
    );
  }

  const roleLabel = isAdmin ? "Admin" : isDriver ? "Driver" : "User";

  const initials = user?.fullName
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

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
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url) || (item.url !== "/" && currentPath.startsWith(item.url))}>
                    <NavLink to={item.url} end={item.url === "/"} className="hover:bg-sidebar-accent/50 relative" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                      {item.badge && item.badge > 0 && (
                        <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          {isAuthenticated && user ? (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/profile")}>
                  <NavLink to="/profile" end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                    <div className="mr-2 h-6 w-6 rounded-full shrink-0 overflow-hidden flex items-center justify-center bg-primary/10 text-primary text-[10px] font-bold">
                      {user.avatarUrl || user.profileImage ? (
                        <img src={user.avatarUrl ?? user.profileImage} alt="" className="h-full w-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    {!collapsed && (
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate">{user.fullName}</span>
                        <span className="text-[10px] text-muted-foreground truncate">{roleLabel}</span>
                      </div>
                    )}
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
      </SidebarFooter>
    </Sidebar>
  );
}