import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Loader2, MapPin, Calendar, User, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api, PUBLIC_TRIPS_API } from "@/lib/api";
import type { ApiTrip } from "@/lib/api";
import { StaggerItem } from "@/components/AnimationUtils";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [loading, setLoading] = useState(true);
  // DebouncedQuery
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  const fetchTrips = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (origin) params.origin = origin;
    if (destination) params.destination = destination;
    if (date) params.date = date;
    api.get(PUBLIC_TRIPS_API.SEARCH, { params })
      .then(({ data }) => setTrips(Array.isArray(data) ? data : data.data || []))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTrips(); }, []);

  const handleSearch = () => fetchTrips();

  const filtered = debouncedQuery
    ? trips.filter((t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.origin.toLowerCase().includes(query.toLowerCase()) ||
      t.destination.toLowerCase().includes(query.toLowerCase())
    )
    : trips;

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <div className="bg-primary py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-6">Find Your Trip</h1>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, origin, destination..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 bg-card border-0 h-12"
              />
            </div>
            <Input placeholder="Origin" value={origin} onChange={(e) => setOrigin(e.target.value)} className="bg-card border-0 h-12 md:w-40" />
            <Input placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} className="bg-card border-0 h-12 md:w-40" />
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-card border-0 h-12 md:w-40" />
            <button onClick={handleSearch} className="bg-accent text-accent-foreground h-12 px-6 rounded-md font-medium hover:brightness-110 transition-all">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : filtered.length > 0 ? (
          <>
            <p className="text-muted-foreground mb-6">{filtered.length} trips found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <StaggerItem key={trip.id}>
                  <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                    <Link to={`/trip/${trip.id}`} className="group block bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-border">
                      <div className="relative overflow-hidden aspect-[4/3]">
                        <img
                          src={trip.images?.[0] || "/placeholder.svg"}
                          alt={trip.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-bold shadow">
                          ${trip.pricePerSeat}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors truncate">
                            {trip.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                // If the star index is less than or equal to rating, fill it yellow
                                // Otherwise, make it transparent/hollow
                                className={`${star <= Math.round(trip.averageRating)
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-muted-foreground/30"
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="ml-1 text-xs font-bold text-foreground">
                            {trip.averageRating > 0 ? trip.averageRating.toFixed(1) : "New"}
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            ({trip.totalReviews || 0})
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
                          <MapPin size={12} className="shrink-0" />
                          <span className="truncate">{trip.origin} → {trip.destination}</span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <span className="text-[11px] font-medium px-2 py-0.5 bg-secondary rounded-full text-secondary-foreground">
                            {trip.availableSeats} seats left
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User size={12} />
                            {trip.driverName}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </StaggerItem>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <SlidersHorizontal size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">No trips found</p>
            <p className="text-sm mt-1">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;