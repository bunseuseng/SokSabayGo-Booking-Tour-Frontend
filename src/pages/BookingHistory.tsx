import { Calendar, MapPin, User } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { sampleBookings } from "@/lib/data";

// TODO: Replace mock data with API call:
// const bookings = await apiFetch(BOOKINGS_API.LIST);

const BookingHistory = () => (
  <div className="min-h-screen bg-background py-10">
    <div className="container mx-auto px-4 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">My Bookings</h1>

      {sampleBookings.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No bookings yet</p>
          <p className="text-sm mt-1">Start exploring tours to book your first trip!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sampleBookings.map((b) => (
            <div key={b.id} className="bg-card rounded-xl border border-border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
              <div className="space-y-1">
                <h3 className="font-semibold">{b.tripTitle}</h3>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin size={13} />{b.destination}</span>
                  <span className="flex items-center gap-1"><User size={13} />{b.driverName}</span>
                  <span className="flex items-center gap-1"><Calendar size={13} />{b.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-primary">${b.totalPrice}</span>
                <StatusBadge status={b.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default BookingHistory;
