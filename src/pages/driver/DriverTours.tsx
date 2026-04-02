import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { api, DRIVER_TRIPS_API, MEDIA_API } from "@/lib/api";
import type { ApiTrip } from "@/lib/api";
import { Plus, Loader2, Trash2, Upload, X, MapPin, Calendar, Map as MapIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const emptyForm = {
  title: "",
  description: "",
  origin: "",
  destination: "",
  pricePerSeat: "",
  totalSeats: "",
  departureTime: "",
  categoryId: "1",
};

const DriverTours = () => {
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchTrips = () => {
    api.get(DRIVER_TRIPS_API.MY)
      .then(({ data }) => setTrips(Array.isArray(data) ? data : data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTrips(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post(MEDIA_API.UPLOAD, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setImageUrls((prev) => [...prev, data.secure_url]);
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploading(false);
  };

  const handleCreate = async () => {
    if (!form.title || !form.origin || !form.destination || !form.pricePerSeat || !form.totalSeats || !form.departureTime) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await api.post(DRIVER_TRIPS_API.CREATE, {
        title: form.title,
        description: form.description,
        origin: form.origin,
        destination: form.destination,
        pricePerSeat: parseFloat(form.pricePerSeat),
        totalSeats: parseInt(form.totalSeats),
        departureTime: form.departureTime,
        categoryId: parseInt(form.categoryId),
        imageUrls,
      });
      toast({ title: "Trip created! 🚗" });
      setForm(emptyForm);
      setImageUrls([]);
      setOpen(false);
      fetchTrips();
    } catch (err: any) {
      toast({ title: err?.response?.data?.message || "Failed to create trip", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(DRIVER_TRIPS_API.DELETE(id));
      toast({ title: "Trip deleted" });
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      toast({ title: err?.response?.data?.message || "Failed to delete", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Trips</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" /> Create Trip
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Trip</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="mb-1 block">Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="PP to Siem Reap Luxury" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1 block">Origin *</Label>
                  <Input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} placeholder="Phnom Penh" />
                </div>
                <div>
                  <Label className="mb-1 block">Destination *</Label>
                  <Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Siem Reap" />
                </div>
              </div>
              <div>
                <Label className="mb-1 block">Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Clean SUV, free water..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1 block">Price per Seat ($) *</Label>
                  <Input type="number" value={form.pricePerSeat} onChange={(e) => setForm({ ...form, pricePerSeat: e.target.value })} placeholder="15" />
                </div>
                <div>
                  <Label className="mb-1 block">Total Seats *</Label>
                  <Input type="number" value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: e.target.value })} placeholder="4" />
                </div>
              </div>
              <div>
                <Label className="mb-1 block">Departure Time *</Label>
                <Input type="datetime-local" value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} />
              </div>
              <div>
                <Label className="mb-1 block">Category ID</Label>
                <Input type="number" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} placeholder="1" />
              </div>
              {/* Images */}
              <div>
                <Label className="mb-1 block">Images</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setImageUrls((p) => p.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-muted-foreground border border-dashed border-border rounded-lg px-4 py-2 hover:bg-muted transition-colors">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? "Uploading..." : "Add Image"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
              <Button onClick={handleCreate} disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</> : "Create Trip"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MapIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No trips yet. Create your first trip!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-card rounded-xl border border-border overflow-hidden">
              {trip.images?.[0] && (
                <img src={trip.images[0]} alt={trip.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold truncate">{trip.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    trip.status === "AVAILABLE" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  }`}>{trip.status}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{trip.origin} → {trip.destination}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(trip.departureTime).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">${trip.pricePerSeat}/seat</span>
                  <span className="text-sm text-muted-foreground">{trip.availableSeats}/{trip.totalSeats} seats</span>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(trip.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverTours;
