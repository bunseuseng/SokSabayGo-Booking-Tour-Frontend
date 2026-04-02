import { useState, useEffect } from "react";
import { Map, CalendarDays, DollarSign, Loader2 } from "lucide-react";
import { api, DRIVER_TRIPS_API, DRIVER_BOOKINGS_API } from "@/lib/api";
import type { ApiTrip, ApiBooking } from "@/lib/api";

const DriverDashboard = () => {
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(DRIVER_TRIPS_API.MY).then(({ data }) => setTrips(Array.isArray(data) ? data : data.data || [])),
      api.get(DRIVER_BOOKINGS_API.REQUESTS).then(({ data }) => setBookings(Array.isArray(data) ? data : data.data || [])),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  const totalRevenue = bookings.filter((b) => b.status === "CONFIRMED").reduce((s, b) => s + b.totalPrice, 0);

  const stats = [
    { label: "My Trips", value: trips.length, icon: Map, color: "text-primary" },
    { label: "Pending Requests", value: bookings.filter((b) => b.status === "PENDING").length, icon: CalendarDays, color: "text-accent" },
    { label: "Revenue", value: `$${totalRevenue}`, icon: DollarSign, color: "text-success" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Driver Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-muted ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent booking requests */}
      <h2 className="text-lg font-semibold mb-3">Recent Booking Requests</h2>
      {bookings.length === 0 ? (
        <p className="text-muted-foreground text-sm">No booking requests yet.</p>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Passenger</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Trip</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Seats</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 5).map((b) => (
                <tr key={b.id} className="border-t border-border">
                  <td className="p-3 font-medium">{b.passengerName}</td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{b.trip.title}</td>
                  <td className="p-3">{b.seatsBooked}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      b.status === "CONFIRMED" ? "bg-success/10 text-success" : b.status === "REJECTED" ? "bg-destructive/10 text-destructive" : "bg-accent/20 text-accent-foreground"
                    }`}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
