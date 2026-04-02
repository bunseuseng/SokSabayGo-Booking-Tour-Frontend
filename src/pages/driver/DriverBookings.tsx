import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { api, DRIVER_BOOKINGS_API } from "@/lib/api";
import type { ApiBooking } from "@/lib/api";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const DriverBookings = () => {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    api.get(DRIVER_BOOKINGS_API.REQUESTS)
      .then(({ data }) => setBookings(Array.isArray(data) ? data : data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleRespond = async (id: number, accept: boolean) => {
    try {
      await api.patch(`${DRIVER_BOOKINGS_API.RESPOND(id)}?accept=${accept}`);
      toast({ title: accept ? "Booking accepted ✅" : "Booking rejected" });
      fetchBookings();
    } catch {
      toast({ title: "Action failed", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Booking Requests</h1>
      {bookings.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No booking requests.</p>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Passenger</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Trip</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Seats</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Total</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-border">
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{b.passengerName}</p>
                      <p className="text-xs text-muted-foreground">{b.passengerPhone}</p>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{b.trip.title}</td>
                  <td className="p-3">{b.seatsBooked}</td>
                  <td className="p-3 font-medium">${b.totalPrice}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      b.status === "CONFIRMED" ? "bg-success/10 text-success" : b.status === "REJECTED" ? "bg-destructive/10 text-destructive" : "bg-accent/20 text-accent-foreground"
                    }`}>{b.status}</span>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    {b.status === "PENDING" && (
                      <>
                        <Button size="sm" variant="ghost" className="text-success" onClick={() => handleRespond(b.id, true)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleRespond(b.id, false)}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
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

export default DriverBookings;
