import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Calendar, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, PUBLIC_TRIPS_API } from "@/lib/api";
import type { ApiTrip } from "@/lib/api";

const TripDetail = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState<ApiTrip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(PUBLIC_TRIPS_API.DETAIL(id))
      .then(({ data }) => setTrip(data.data || data))
      .catch(() => setTrip(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!trip) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Trip not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero image */}
      <div className="relative h-[35vh] md:h-[45vh]">
        <img src={trip.images?.[0] || "/placeholder.svg"} alt={trip.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 container mx-auto px-4">
          <div className="flex items-center gap-2 text-card/80 text-sm mb-2">
            <MapPin size={14} /> {trip.origin} → {trip.destination}
            <span className="mx-1">·</span>
            <Calendar size={14} /> {new Date(trip.departureTime).toLocaleDateString()}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-card">{trip.title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-3">About This Trip</h2>
              <p className="text-muted-foreground leading-relaxed">{trip.description || "No description provided."}</p>
            </div>

            {/* Trip images gallery */}
            {trip.images && trip.images.length > 1 && (
              <div>
                <h2 className="text-xl font-bold mb-3">Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {trip.images.map((img, i) => (
                    <img key={i} src={img} alt={`${trip.title} ${i + 1}`} className="w-full h-40 object-cover rounded-xl border border-border" />
                  ))}
                </div>
              </div>
            )}

            {/* Trip details */}
            <div>
              <h2 className="text-xl font-bold mb-3">Trip Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Origin</p>
                  <p className="font-medium">{trip.origin}</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Destination</p>
                  <p className="font-medium">{trip.destination}</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Departure</p>
                  <p className="font-medium">{new Date(trip.departureTime).toLocaleString()}</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Category</p>
                  <p className="font-medium">{trip.categoryName || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar booking card */}
          <div>
            <div className="bg-card rounded-xl border border-border p-6 sticky top-20 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-3xl font-bold text-primary">${trip.pricePerSeat}</span>
                  <span className="text-muted-foreground text-sm"> / seat</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  trip.status === "AVAILABLE" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                }`}>{trip.status}</span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between"><span className="text-muted-foreground">Available Seats</span><span>{trip.availableSeats}/{trip.totalSeats}</span></div>
              </div>

              {/* Driver info */}
              <div className="flex items-center gap-3 mb-6 p-3 bg-muted rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{trip.driverName}</p>
                  <p className="text-xs text-muted-foreground">Driver</p>
                </div>
              </div>

              {trip.status === "AVAILABLE" && trip.availableSeats > 0 ? (
                <Link to={`/booking/${trip.id}`}>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base">
                    Book This Trip
                  </Button>
                </Link>
              ) : (
                <Button disabled className="w-full h-12 text-base">Fully Booked</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;
