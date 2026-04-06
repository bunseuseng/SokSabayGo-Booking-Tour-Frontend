import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { api, DRIVER_TRIPS_API, MEDIA_API, CATEGORIES_API } from "@/lib/api";
import type { ApiTrip } from "@/lib/api";
import { Plus, Loader2, Trash2, Upload, X, MapPin, Calendar, Edit2, Car, Utensils, Info, Map as MapIcon, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const emptyForm = {
  title: "",
  description: "",
  origin: "",
  destination: "",
  pricePerSeat: "",
  totalSeats: "",
  departureTime: "",
  categoryId: "",
  transportationType: "",
  vehicleCapacity: "",
  isWholeVehicleBooking: false,
  wholeVehiclePrice: "",
  scheduleDescription: "",
  hasTourGuide: false,
  tourGuideDescription: "",
  mealsIncluded: false,
  diningDetails: "",
  availabilitySchedule: "",
};

const DriverTours = () => {
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  
  // Media States
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [vehicleImageUrls, setVehicleImageUrls] = useState<string[]>([]);
  const [tourGuideImageUrl, setTourGuideImageUrl] = useState("");
  const [itinerary, setItinerary] = useState<{name: string, description: string, imageUrl: string}[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tripsRes, catsRes] = await Promise.all([
        api.get(DRIVER_TRIPS_API.MY),
        api.get(CATEGORIES_API.LIST_ALL)
      ]);
      setTrips(Array.isArray(tripsRes.data) ? tripsRes.data : tripsRes.data.data || []);
      setCategories(Array.isArray(catsRes.data) ? catsRes.data : catsRes.data.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Shared Upload Logic
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'trip' | 'vehicle' | 'guide' | 'itin', index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingTarget(type + (index ?? ''));
    
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post(MEDIA_API.UPLOAD, fd);
      const url = data.secure_url;
      if (type === 'trip') setImageUrls(p => [...p, url]);
      if (type === 'vehicle') setVehicleImageUrls(p => [...p, url]);
      if (type === 'guide') setTourGuideImageUrl(url);
      if (type === 'itin' && index !== undefined) {
        const newItin = [...itinerary];
        newItin[index].imageUrl = url;
        setItinerary(newItin);
      }
    } catch { toast({ title: "Upload failed", variant: "destructive" }); }
    setUploadingTarget(null);
  };

  const handleEdit = (trip: ApiTrip) => {
  setEditingId(trip.id);
  setForm({
    title: trip.title || "",
    description: trip.description || "",
    origin: trip.origin || "",
    destination: trip.destination || "",
    // Use optional chaining ?. and fallback to empty string
    pricePerSeat: trip.pricePerSeat?.toString() || "",
    totalSeats: trip.totalSeats?.toString() || "",
    // Safety check for date
    departureTime: trip.departureTime 
      ? new Date(trip.departureTime).toISOString().slice(0, 16) 
      : "",
    categoryId: trip.categoryId?.toString() || "",
    transportationType: trip.transportationType || "",
    vehicleCapacity: trip.vehicleCapacity?.toString() || "",
    isWholeVehicleBooking: !!trip.isWholeVehicleBooking,
    wholeVehiclePrice: trip.wholeVehiclePrice?.toString() || "",
    scheduleDescription: trip.scheduleDescription || "",
    hasTourGuide: !!trip.hasTourGuide,
    tourGuideDescription: trip.tourGuideDescription || "",
    mealsIncluded: !!trip.mealsIncluded,
    diningDetails: trip.diningDetails || "",
    availabilitySchedule: trip.availabilitySchedule || "",
  });
  
  // Ensure arrays always have a fallback to avoid .map errors
  setImageUrls(trip.images || []);
  setVehicleImageUrls(trip.vehicleImageUrls || []);
  setTourGuideImageUrl(trip.tourGuideImageUrl || "");
  setItinerary(trip.itinerary || []);
  
  setOpen(true);
};

  const handleSubmit = async () => {
    setSubmitting(true);
    const payload = {
      ...form,
      pricePerSeat: parseFloat(form.pricePerSeat),
      totalSeats: parseInt(form.totalSeats),
      categoryId: parseInt(form.categoryId),
      vehicleCapacity: parseInt(form.vehicleCapacity || "0"),
      wholeVehiclePrice: parseFloat(form.wholeVehiclePrice || "0"),
      imageUrls,
      vehicleImageUrls,
      tourGuideImageUrl,
      itinerary
    };

    try {
      if (editingId) await api.put(DRIVER_TRIPS_API.UPDATE(editingId), payload);
      else await api.post(DRIVER_TRIPS_API.CREATE, payload);
      setOpen(false);
      fetchData();
      toast({ title: "Trip saved successfully!" });
    } catch (err: any) {
      toast({ title: "Failed to save trip", variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Driving Tours</h1>
        <Dialog open={open} onOpenChange={(v) => { if(!v) { setEditingId(null); setForm(emptyForm); setImageUrls([]); setItinerary([]); } setOpen(v); }}>
          <DialogTrigger asChild><Button size="lg"><Plus className="mr-2" /> New Trip</Button></DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? "Edit Trip" : "Create New Trip"}</DialogTitle></DialogHeader>
            
            <div className="space-y-8 py-4">
              {/* BASIC INFO */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2"><Info className="h-5 w-5 text-primary"/> General Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>Trip Title *</Label>
                    <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Luxury Private Tour to Angkor Wat"/>
                  </div>
                  <div>
                    <Label>Trip Description *</Label>
                    <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Write a detailed description of your trip..."/>
                  </div>
                  <div>
                    <Label>Origin *</Label>
                    <Input value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} placeholder="Phnom Penh"/>
                  </div>
                  <div>
                    <Label>Destination *</Label>
                    <Input value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} placeholder="Siem Reap"/>
                  </div>
                  <div>
                    <Label>Category *</Label>
                    <select className="w-full h-10 border rounded-md px-3 bg-background" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Departure Time *</Label>
                    <Input type="datetime-local" value={form.departureTime} onChange={e => setForm({...form, departureTime: e.target.value})}/>
                  </div>
                </div>
                
                <Label>Trip Images</Label>
                <div className="flex flex-wrap gap-2">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="relative w-24 h-24 border rounded-md overflow-hidden group">
                      <img src={url} className="object-cover w-full h-full" alt=""/>
                      <button onClick={() => setImageUrls(p => p.filter((_, j) => j !== i))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3"/></button>
                    </div>
                  ))}
                  <label className="w-24 h-24 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-muted">
                    {uploadingTarget === 'trip' ? <Loader2 className="animate-spin" /> : <Upload className="h-5 w-5" />}
                    <input type="file" className="hidden" onChange={e => handleUpload(e, 'trip')}/>
                  </label>
                </div>
              </section>

              {/* TRANSPORTATION */}
              <section className="space-y-4 bg-muted/20 p-4 rounded-xl border">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Car className="h-5 w-5 text-primary"/> Vehicle & Pricing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Vehicle Type</Label>
                    <Input value={form.transportationType} onChange={e => setForm({...form, transportationType: e.target.value})} placeholder="Lexus RX300 / Mini Van"/>
                  </div>
                  <div>
                    <Label>Capacity (People)</Label>
                    <Input type="number" value={form.vehicleCapacity} onChange={e => setForm({...form, vehicleCapacity: e.target.value})}/>
                  </div>
                  <div>
                    <Label>Price Per Seat ($) *</Label>
                    <Input type="number" value={form.pricePerSeat} onChange={e => setForm({...form, pricePerSeat: e.target.value})}/>
                  </div>
                  <div>
                    <Label>Total Seats *</Label>
                    <Input type="number" value={form.totalSeats} onChange={e => setForm({...form, totalSeats: e.target.value})}/>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 py-2">
                  <Checkbox id="isWhole" checked={form.isWholeVehicleBooking} onCheckedChange={v => setForm({...form, isWholeVehicleBooking: !!v})}/>
                  <Label htmlFor="isWhole">Offer whole vehicle booking price?</Label>
                </div>

                {form.isWholeVehicleBooking && (
                   <div>
                    <Label>Whole Vehicle Price ($)</Label>
                    <Input type="number" value={form.wholeVehiclePrice} onChange={e => setForm({...form, wholeVehiclePrice: e.target.value})}/>
                   </div>
                )}
              </section>

              {/* ITINERARY */}
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold flex items-center gap-2"><MapIcon className="h-5 w-5 text-primary"/> Itinerary</h3>
                  <Button type="button" variant="outline" onClick={() => setItinerary([...itinerary, {name: "", description: "", imageUrl: ""}])}>+ Add Stop</Button>
                </div>
                <div className="space-y-4">
                  {itinerary.map((item, idx) => (
                    <div key={idx} className="p-4 border rounded-lg bg-card space-y-3 relative">
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500" onClick={() => setItinerary(itinerary.filter((_, i) => i !== idx))}><X className="h-4 w-4"/></Button>
                      <Input placeholder="Stop Name (e.g. Bayon Temple)" value={item.name} onChange={e => { const n = [...itinerary]; n[idx].name = e.target.value; setItinerary(n); }}/>
                      <Textarea placeholder="Description of this stop..." value={item.description} onChange={e => { const n = [...itinerary]; n[idx].description = e.target.value; setItinerary(n); }}/>
                      
                      <div className="flex items-center gap-4">
                        {item.imageUrl && <img src={item.imageUrl} className="w-16 h-16 rounded object-cover" alt=""/>}
                        <label className="text-xs bg-muted p-2 rounded cursor-pointer border hover:bg-border transition-colors">
                          {uploadingTarget === `itin${idx}` ? "Uploading..." : "Upload Stop Image"}
                          <input type="file" className="hidden" onChange={e => handleUpload(e, 'itin', idx)}/>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <Button onClick={handleSubmit} disabled={submitting} className="w-full h-14 text-lg">
                {submitting ? <Loader2 className="animate-spin mr-2"/> : null}
                {editingId ? "Update Trip" : "Publish Trip"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* TRIP LIST DISPLAY */}
      {trips.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl">
          <MapIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
          <p className="mt-4 text-muted-foreground">You haven't posted any trips yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div key={trip.id} className="group bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img src={trip.images?.[0] || "/api/placeholder/400/320"} alt={trip.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold shadow-sm">{trip.status}</span>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-xl line-clamp-1 mb-2">{trip.title}</h3>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {trip.origin} → {trip.destination}</div>
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {new Date(trip.departureTime).toLocaleString()}</div>
                  <div className="flex items-center gap-2"><Car className="h-4 w-4" /> {trip.transportationType} • {trip.availableSeats}/{trip.totalSeats} seats left</div>
                </div>

                <div className="mt-auto pt-4 border-t flex justify-between items-center">
                  <div className="text-primary font-black text-lg">${trip.pricePerSeat}<span className="text-xs font-normal text-muted-foreground">/seat</span></div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(trip)}><Edit2 className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => {
                       if(confirm("Delete this trip?")) api.delete(DRIVER_TRIPS_API.DELETE(trip.id)).then(() => fetchData())
                    }}><Trash2 className="h-4 w-4"/></Button>
                  </div>
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