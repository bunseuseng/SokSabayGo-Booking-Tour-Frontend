import { CalendarDays, Users, Car, DollarSign, TrendingUp, Map } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trips, sampleBookings } from "@/lib/data";

const stats = [
  { label: "Total Bookings", value: "1,247", icon: CalendarDays, change: "+12%" },
  { label: "Active Tours", value: String(trips.length), icon: Map, change: "+2" },
  { label: "Registered Drivers", value: "48", icon: Car, change: "+5" },
  { label: "Total Users", value: "3,892", icon: Users, change: "+8%" },
  { label: "Revenue", value: "$34,520", icon: DollarSign, change: "+18%" },
  { label: "Avg Rating", value: "4.8", icon: TrendingUp, change: "+0.1" },
];

const AdminDashboard = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
            <s.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{s.value}</div>
            <p className="text-xs text-success mt-1">{s.change} from last month</p>
          </CardContent>
        </Card>
      ))}
    </div>

    <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-3 font-medium text-muted-foreground">Trip</th>
            <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Driver</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
            <th className="text-right p-3 font-medium text-muted-foreground">Total</th>
          </tr>
        </thead>
        <tbody>
          {sampleBookings.map((b) => (
            <tr key={b.id} className="border-t border-border">
              <td className="p-3 font-medium">{b.tripTitle}</td>
              <td className="p-3 text-muted-foreground hidden sm:table-cell">{b.driverName}</td>
              <td className="p-3 text-muted-foreground">{b.date}</td>
              <td className="p-3">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                  b.status === "confirmed" ? "bg-success/10 text-success" :
                  b.status === "completed" ? "bg-primary/10 text-primary" :
                  b.status === "pending" ? "bg-accent/20 text-accent-foreground" :
                  "bg-destructive/10 text-destructive"
                }`}>{b.status}</span>
              </td>
              <td className="p-3 text-right font-medium">${b.totalPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminDashboard;
