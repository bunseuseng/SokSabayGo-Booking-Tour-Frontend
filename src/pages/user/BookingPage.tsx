import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuardDialog from "@/components/AuthGuardDialog";
import { api, PUBLIC_TRIPS_API, BOOKINGS_API } from "@/lib/api";
import type { ApiTrip } from "@/lib/api";
import { Loader2 } from "lucide-react";

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [trip, setTrip] = useState<ApiTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [seatsBooked, setSeatsBooked] = useState(1);
  const [showAuth, setShowAuth] = useState(!isAuthenticated);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(PUBLIC_TRIPS_API.DETAIL(id))
      .then(({ data }) => setTrip(data.data || data))
      .catch(() => setTrip(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  if (!trip) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Trip not found</div>;

  const total = trip.pricePerSeat * seatsBooked;

  const handleConfirm = async () => {
    if (!isAuthenticated) { setShowAuth(true); return; }
    if (seatsBooked < 1) {
      toast({ title: "Please select at least 1 seat", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await api.post(BOOKINGS_API.CREATE, { tripId: trip.id, seatsBooked });
      toast({ title: "Booking Confirmed! 🎉", description: `Your booking for ${trip.title} has been submitted.` });
      navigate("/bookings");
    } catch (err: any) {
      toast({ title: err?.response?.data?.message || "Booking failed", variant: "destructive" });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background py-10">
      <AuthGuardDialog open={showAuth} onOpenChange={setShowAuth} message="Please sign in or create an account to book this trip." />
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">Confirm Your Booking</h1>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-5">
            <div>
              <Label className="mb-2 block">Number of Seats *</Label>
              <Input
                type="number"
                min={1}
                max={trip.availableSeats}
                value={seatsBooked}
                onChange={(e) => setSeatsBooked(Math.max(1, Math.min(trip.availableSeats, parseInt(e.target.value) || 1)))}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground mt-1">{trip.availableSeats} seats available</p>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-20">
              <h3 className="font-bold mb-4">Booking Summary</h3>
              {trip.images?.[0] && (
                <img src={trip.images[0]} alt={trip.title} className="w-full h-32 object-cover rounded-lg mb-4" />
              )}
              <p className="font-semibold text-sm mb-1">{trip.title}</p>
              <p className="text-xs text-muted-foreground mb-4">{trip.origin} → {trip.destination} · {trip.driverName}</p>
              <div className="space-y-2 text-sm border-t border-border pt-4">
                <div className="flex justify-between"><span className="text-muted-foreground">Price per seat</span><span>${trip.pricePerSeat}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Seats</span><span>{seatsBooked}</span></div>
                <div className="flex justify-between font-bold text-lg border-t border-border pt-3 mt-3"><span>Total</span><span className="text-primary">${total}</span></div>
              </div>
              <Button onClick={handleConfirm} disabled={submitting} className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base">
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : "Confirm Booking"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
