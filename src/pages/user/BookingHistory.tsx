import { useState, useEffect } from "react";
import { Calendar, MapPin, User, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, BOOKINGS_API } from "@/lib/api";
import type { ApiBooking } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const statusStyle: Record<string, string> = {
  PENDING: "bg-accent/20 text-accent-foreground",
  CONFIRMED: "bg-success/10 text-success",
  REJECTED: "bg-destructive/10 text-destructive",
};

const BookingHistory = () => {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(BOOKINGS_API.MY)
      .then(({ data }) => setBookings(Array.isArray(data) ? data : data.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No bookings yet</p>
            <p className="text-sm mt-1">Start exploring trips to book your first ride!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className="bg-card rounded-xl border border-border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                <div className="space-y-1">
                  <h3 className="font-semibold">{b.trip.title}</h3>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin size={13} />{b.trip.destination}</span>
                    <span className="flex items-center gap-1"><User size={13} />{b.trip.driverName}</span>
                    <span className="flex items-center gap-1"><Calendar size={13} />{new Date(b.trip.departureTime).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{b.seatsBooked} seat(s) booked</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-primary">${b.totalPrice}</span>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[b.status] || "bg-muted text-muted-foreground"}`}>
                    {b.status}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("/chat", { state: { driverId: b.trip.driverId, driverName: b.trip.driverName } })}
                  >
                    <MessageCircle size={16} className="mr-1" />
                    Chat
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
