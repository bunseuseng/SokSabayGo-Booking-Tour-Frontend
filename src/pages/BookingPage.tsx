import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trips } from "@/lib/data";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuardDialog from "@/components/AuthGuardDialog";

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const trip = trips.find((t) => t.id === id);

  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [pickup, setPickup] = useState("");
  const [notes, setNotes] = useState("");
  const [showAuth, setShowAuth] = useState(!isAuthenticated);

  if (!trip) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Trip not found</div>;
  }

  const total = trip.price * passengers;

  const handleConfirm = async () => {
    if (!isAuthenticated) { setShowAuth(true); return; }
    if (!date || !pickup) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    // TODO: await apiFetch(BOOKINGS_API.CREATE, { method: "POST", body: JSON.stringify({ tripId: trip.id, date, passengers, pickup, notes }) });
    toast({ title: "Booking Confirmed! 🎉", description: `Your ${trip.title} is booked for ${date}.` });
    navigate("/bookings");
  };

  return (
    <div className="min-h-screen bg-background py-10">
      <AuthGuardDialog open={showAuth} onOpenChange={setShowAuth} message="Please sign in or create an account to book this trip." />
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">Confirm Your Booking</h1>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-5">
            <div>
              <Label className="mb-2 block">Date *</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12" />
            </div>
            <div>
              <Label className="mb-2 block">Number of Passengers *</Label>
              <Input type="number" min={1} max={6} value={passengers} onChange={(e) => setPassengers(Math.max(1, parseInt(e.target.value) || 1))} className="h-12" />
            </div>
            <div>
              <Label className="mb-2 block">Pickup Location *</Label>
              <Input placeholder="Hotel name or address" value={pickup} onChange={(e) => setPickup(e.target.value)} className="h-12" />
            </div>
            <div>
              <Label className="mb-2 block">Notes for Driver</Label>
              <Textarea placeholder="Any special requests..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-20">
              <h3 className="font-bold mb-4">Booking Summary</h3>
              <img src={trip.image} alt={trip.title} className="w-full h-32 object-cover rounded-lg mb-4" />
              <p className="font-semibold text-sm mb-1">{trip.title}</p>
              <p className="text-xs text-muted-foreground mb-4">{trip.location} · {trip.driver.name}</p>
              <div className="space-y-2 text-sm border-t border-border pt-4">
                <div className="flex justify-between"><span className="text-muted-foreground">Price per person</span><span>${trip.price}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Passengers</span><span>{passengers}</span></div>
                <div className="flex justify-between font-bold text-lg border-t border-border pt-3 mt-3"><span>Total</span><span className="text-primary">${total}</span></div>
              </div>
              <Button onClick={handleConfirm} className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base">
                Confirm Booking
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
