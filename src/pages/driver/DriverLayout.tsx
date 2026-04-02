import { Outlet, NavLink, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Map, CalendarDays, Car, Users, Star, ArrowLeft } from "lucide-react";

const navItems = [
  { to: "/driver", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/driver/tours", icon: Map, label: "Tours" },
  { to: "/driver/bookings", icon: CalendarDays, label: "Bookings" },
  { to: "/driver/reviews", icon: Star, label: "Reviews" },
];

const DriverLayout = () => {
  const { isDriver } = useAuth();
  const location = useLocation();

  if (!isDriver) return <Navigate to="/" replace />;
  if (location.pathname === "/driver/dashboard") {
  return <Navigate to="/driver" replace />;
}
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Driver Sidebar */}
        <aside className="w-60 border-r border-border bg-card min-h-screen sticky top-0 hidden md:block">
          <div className="p-4 border-b border-border">
            <h2 className="font-bold text-lg text-foreground">Driver Panel</h2>
            <p className="text-xs text-muted-foreground">Soksabay Go</p>
          </div>
          <nav className="p-2 space-y-1">
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
          <div className="p-2 mt-4">
            <NavLink to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Site
            </NavLink>
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
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
        </div>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DriverLayout;
