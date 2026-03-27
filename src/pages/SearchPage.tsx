import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TripCard from "@/components/TripCard";
import { trips } from "@/lib/data";

const locations = ["All", "Siem Reap", "Phnom Penh", "Kampot", "Sihanoukville"];

// TODO: Replace local data with API call:
// const trips = await apiFetch(`${TRIPS_API.LIST}?q=${query}&location=${location}&sort=${sort}`);

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("All");
  const [sort, setSort] = useState("rating");

  const filtered = useMemo(() => {
    let result = trips.filter((t) => {
      const matchesQuery = t.title.toLowerCase().includes(query.toLowerCase()) || t.location.toLowerCase().includes(query.toLowerCase());
      const matchesLocation = location === "All" || t.location === location;
      return matchesQuery && matchesLocation;
    });
    if (sort === "price") result.sort((a, b) => a.price - b.price);
    else if (sort === "rating") result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [query, location, sort]);

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <div className="bg-primary py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-6">
            Find Your Perfect Tour
          </h1>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search destinations or tours..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 bg-card border-0 h-12"
              />
            </div>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-full md:w-48 bg-card border-0 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full md:w-48 bg-card border-0 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="price">Lowest Price</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-10">
        <p className="text-muted-foreground mb-6">{filtered.length} tours found</p>
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <SlidersHorizontal size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">No tours found matching your criteria</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
