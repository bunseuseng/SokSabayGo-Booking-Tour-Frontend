import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { api, DRIVER_BOOKINGS_API } from "@/lib/api";
import type { ApiBooking } from "@/lib/api";
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";

const DriverBookings = () => {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBookings, setNewBookings] = useState<number[]>([]);
  const { refreshNotifications } = useNotifications();

  const fetchBookings = () => {
    api.get(DRIVER_BOOKINGS_API.REQUESTS)
      .then(({ data }) => {
        const newBookingsList = Array.isArray(data) ? data : data.data || [];
        
        // Check for new pending bookings that weren't there before
        if (bookings.length > 0) {
          const currentIds = new Set(bookings.map(b => b.id));
          const newPending = newBookingsList.filter(b => b.status === "PENDING" && !currentIds.has(b.id));
          if (newPending.length > 0) {
            setNewBookings(newPending.map(b => b.id));
            toast({ 
              title: `New booking request${newPending.length > 1 ? "s" : ""}!`, 
              description: `${newPending.length} new pending booking${newPending.length > 1 ? "s" : ""}` 
            });
          }
        }
        
        setBookings(newBookingsList);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    fetchBookings(); 
    
    // Poll for new booking requests every 10 seconds
    const interval = setInterval(fetchBookings, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRespond = async (id: number, accept: boolean) => {
    try {
      await api.patch(`${DRIVER_BOOKINGS_API.RESPOND(id)}?accept=${accept}`);
      toast({ title: accept ? "Booking accepted ✅" : "Booking rejected" });
      // Remove from new bookings highlight
      setNewBookings(prev => prev.filter(bId => bId !== id));
      fetchBookings();
      // Refresh notifications so user gets notified
      refreshNotifications();
    } catch {
      toast({ title: "Action failed", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Booking Requests</h1>
        <Button variant="outline" size="sm" onClick={fetchBookings}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
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
                <tr key={b.id} className={`border-t border-border transition-colors ${newBookings.includes(b.id) ? "bg-green-50 animate-pulse" : ""}`}>
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
