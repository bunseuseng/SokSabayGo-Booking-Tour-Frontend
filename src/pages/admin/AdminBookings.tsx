import { sampleBookings } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const AdminBookings = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">Manage Bookings</h1>
    {/* TODO: apiFetch(BOOKINGS_API.LIST) to load real bookings */}
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-3 font-medium text-muted-foreground">Trip</th>
            <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Driver</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
            <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
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
              <td className="p-3 text-right space-x-1">
                <Button size="sm" variant="outline" onClick={() => toast({ title: `Booking ${b.id} updated` })}>Confirm</Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => toast({ title: `Booking ${b.id} cancelled` })}>Cancel</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminBookings;
