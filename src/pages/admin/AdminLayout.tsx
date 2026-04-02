import { Outlet, NavLink, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Car, Users, ArrowLeft, LogOut, User } from "lucide-react";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/drivers", icon: Car, label: "Drivers" },
  { to: "/admin/users", icon: Users, label: "Users" },
];

const AdminLayout = () => {
  const { isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAdmin) return <Navigate to="/" replace />;

  const initials = user?.fullName?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Admin Sidebar */}
        <aside className="w-60 border-r border-border bg-card min-h-screen sticky top-0 hidden md:flex md:flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-bold text-lg text-foreground">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">Soksabay Go</p>
          </div>
          <nav className="p-2 space-y-1 flex-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Profile + Logout */}
          <div className="p-2 border-t border-border space-y-1">
            <NavLink to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden">
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" /> : initials}
              </div>
              <span className="truncate">{user?.fullName || "Profile"}</span>
            </NavLink>
            <NavLink to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Site
            </NavLink>
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground w-full">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 flex justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 text-[10px] px-2 py-1 ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[10px] px-2 py-1 ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`
            }
          >
            <User className="h-4 w-4" />
            Profile
          </NavLink>
        </div>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
