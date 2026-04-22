import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, Shield, DollarSign, TrendingUp, MapPin, User, Loader2, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StaggerContainer, StaggerItem, FadeInView } from "@/components/AnimationUtils";
import { api, PUBLIC_TRIPS_API } from "@/lib/api";
import type { ApiTrip } from "@/lib/api";

const features = [
  { icon: Search, title: "Easy Booking", desc: "Find and book tours in seconds." },
  { icon: Shield, title: "Trusted Drivers", desc: "Verified local drivers with great reviews." },
  { icon: DollarSign, title: "Affordable", desc: "Fair pricing with no hidden fees." },
];

const heroSlides = [
  {
    image: "/images/hero-angkor.jpg",
    tag: "Most Popular",
    title: "Angkor Wat at Sunrise",
    subtitle: "Watch ancient temples glow golden with a local guide",
    cta: "Explore Siem Reap Tours",
  },
  {
    image: "/images/hero-beach.jpg",
    tag: "Beach Escape",
    title: "Koh Rong Island Day Trip",
    subtitle: "Crystal clear waters and untouched white sand beaches",
    cta: "Discover Beach Tours",
  },
  {
    image: "/images/hero-phnom-penh.jpg",
    tag: "City Vibes",
    title: "Phnom Penh by TukTuk",
    subtitle: "Markets, palaces, and street food — all in one unforgettable day",
    cta: "See City Tours",
  },
  {
    image: "/images/hero-countryside.jpg",
    tag: "Off the Beaten Path",
    title: "Cambodian Countryside",
    subtitle: "Rice fields, floating villages, and authentic local life",
    cta: "Find Hidden Gems",
  },
];

const SLIDE_INTERVAL = 5000;

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % heroSlides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + heroSlides.length) % heroSlides.length), []);
  const goTo = useCallback((i: number) => setCurrent(i), []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [paused, next]);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: "420px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.65, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background image */}
          <img
            src={heroSlides[current].image}
            alt={heroSlides[current].title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback gradient if image missing
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.10) 100%)",
            }}
          />
          {/* Fallback bg color (shown when image fails) */}
          <div className="absolute inset-0 -z-10 bg-primary" />
        </motion.div>
      </AnimatePresence>

      {/* Slide content */}
      <div className="absolute inset-0 flex flex-col justify-end px-6 pb-10 md:px-12 md:pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          >
            {/* Tag */}
            <span className="inline-block bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full mb-3 shadow">
              {heroSlides[current].tag}
            </span>
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight drop-shadow-md">
              {heroSlides[current].title}
            </h1>
            {/* Subtitle */}
            <p className="text-white/75 text-sm md:text-base mb-5 max-w-md">
              {heroSlides[current].subtitle}
            </p>
            {/* CTA */}
            <Link to="/search">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:brightness-110 shadow-lg gap-2"
              >
                <Search size={16} />
                {heroSlides[current].cta}
              </Button>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center bg-black/30 hover:bg-black/50 text-white transition-colors border border-white/20 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center bg-black/30 hover:bg-black/50 text-white transition-colors border border-white/20 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === current ? "24px" : "8px",
              height: "8px",
              background: i === current ? "var(--accent)" : "rgba(255,255,255,0.45)",
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      {!paused && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <motion.div
            key={current}
            className="h-full bg-accent"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: SLIDE_INTERVAL / 1000, ease: "linear" }}
          />
        </div>
      )}
    </div>
  );
};

const Index = () => {
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(PUBLIC_TRIPS_API.SEARCH)
      .then(({ data }) => setTrips(Array.isArray(data) ? data : data.data || []))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-background">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Quick features */}
      <section className="container mx-auto px-4 py-6">
        <StaggerContainer className="grid grid-cols-3 gap-4">
          {features.map((f) => (
            <StaggerItem key={f.title}>
              <motion.div
                whileHover={{ scale: 1.04, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex flex-col items-center text-center p-4 rounded-xl bg-card border border-border"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-xl mb-2">
                  <f.icon size={20} />
                </div>
                <h3 className="font-semibold text-xs md:text-sm">{f.title}</h3>
                <p className="text-muted-foreground text-[11px] md:text-xs mt-1 hidden sm:block">
                  {f.desc}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* All Tours */}
      <section className="container mx-auto px-4 pb-10">
        <FadeInView>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold">Available Trips</h2>
              <p className="text-muted-foreground text-sm mt-1">Book your next ride</p>
            </div>
            <Link
              to="/search"
              className="text-primary font-medium text-sm hover:underline hidden sm:block"
            >
              View all →
            </Link>
          </div>
        </FadeInView>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : trips.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground">No trips available yet.</p>
        ) : (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {trips.map((trip) => (
              <StaggerItem key={trip.id}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Link
                    to={`/trip/${trip.id}`}
                    className="group block bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-border"
                  >
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
                              className={`${
                                star <= Math.round(trip.averageRating)
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
                        <span className="truncate">
                          {trip.origin} → {trip.destination}
                        </span>
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
          </StaggerContainer>
        )}
      </section>

      {/* CTA */}
      <FadeInView>
        <section className="bg-primary py-10">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <TrendingUp size={24} className="text-accent" />
              <h2 className="text-xl md:text-2xl font-bold text-primary-foreground">
                Ready to explore?
              </h2>
            </div>
            <p className="text-primary-foreground/70 mb-6 max-w-md mx-auto text-sm">
              Join thousands of happy travelers who discovered Cambodia through our local TukTuk
              tours.
            </p>
            <Link to="/search">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:brightness-110 shadow-lg"
              >
                Start Exploring
              </Button>
            </Link>
          </div>
        </section>
      </FadeInView>
    </div>
  );
};

export default Index;