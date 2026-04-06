import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Calendar,
  User,
  Loader2,
  Star,
  Utensils,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
  Truck,
  Clock,
  Tag,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { api, PUBLIC_TRIPS_API } from "@/lib/api";
import type { ApiTrip } from "@/lib/api";

/* ─────────────────────────────────────────
   STAR RATING DISPLAY
───────────────────────────────────────── */
const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={size}
        className={s <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30 fill-muted-foreground/10"}
      />
    ))}
  </div>
);

/* ─────────────────────────────────────────
   ANIMATED PHOTO GALLERY
───────────────────────────────────────── */
const PhotoGallery = ({ images }: { images: string[] }) => {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = useCallback(
    (next: number) => {
      setDirection(next > active ? 1 : -1);
      setActive(next);
    },
    [active]
  );

  const prev = () => go((active - 1 + images.length) % images.length);
  const next = () => go((active + 1) % images.length);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "60%" : "-60%", opacity: 0, scale: 0.96 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-60%" : "60%", opacity: 0, scale: 0.96 }),
  };

  return (
    <div className="space-y-3">
      {/* Main image with slide animation */}
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-muted group">
        <AnimatePresence custom={direction} mode="popLayout">
          <motion.img
            key={active}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            src={images[active]}
            alt={`Photo ${active + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background shadow-lg"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background shadow-lg"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Counter badge */}
        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
          {active + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {images.map((img, i) => (
            <motion.button
              key={i}
              onClick={() => go(i)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                i === active ? "border-primary opacity-100" : "border-transparent opacity-50 hover:opacity-80"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   ITINERARY ACCORDION ITEM
───────────────────────────────────────── */
const ItineraryItem = ({
  item,
  index,
}: {
  item: ApiTrip["itinerary"][number];
  index: number;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="border border-border rounded-2xl overflow-hidden bg-card"
    >
      {/* Header — always visible, click to expand */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Step number badge */}
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="font-semibold text-card-foreground">{item.name}</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />
        </motion.div>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {item.imageUrl && (
                <motion.img
                  initial={{ scale: 0.97, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.05 }}
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-xl"
                />
              )}
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ─────────────────────────────────────────
   INFO CARD (small stat tiles)
───────────────────────────────────────── */
const InfoTile = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3">
    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
      <Icon size={15} className="text-primary" />
    </div>
    <div>
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="font-semibold text-card-foreground text-sm mt-0.5">{value}</p>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   SECTION WRAPPER
───────────────────────────────────────── */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.4 }}
    className="space-y-4"
  >
    <h2 className="text-lg font-bold text-foreground">{title}</h2>
    {children}
  </motion.div>
);

/* ─────────────────────────────────────────
   VEHICLE IMAGE GALLERY (smaller grid)
───────────────────────────────────────── */
const VehicleGallery = ({ images }: { images: string[] }) => {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
        {images.map((img, i) => (
          <motion.button
            key={i}
            onClick={() => setLightbox(img)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            className="relative aspect-[4/3] rounded-xl overflow-hidden group"
          >
            <img src={img} alt={`Vehicle ${i + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                View
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={lightbox}
              className="max-w-2xl w-full rounded-2xl object-contain max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
const TripDetail = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState<ApiTrip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api
      .get(PUBLIC_TRIPS_API.DETAIL(id))
      .then(({ data }) => setTrip(data.data || data))
      .catch(() => setTrip(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading trip details...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <p className="text-lg font-medium">Trip not found</p>
        <Link to="/search">
          <Button variant="outline" size="sm">
            <ArrowLeft size={14} className="mr-2" /> Back to search
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ──────────────────────────────── */}
      <div className="relative h-[55vh] min-h-[360px]">
        {/* Hero image with parallax feel */}
        <motion.img
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          src={trip.images?.[0] || "/placeholder.svg"}
          alt={trip.title}
          className="w-full h-full object-cover"
        />
        {/* Multi-stop gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {/* Back button */}
        <Link
          to="/search"
          className="absolute top-5 left-5 flex items-center gap-1.5 text-white/90 hover:text-white text-sm font-medium bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </Link>

        {/* Hero content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8"
        >
          {/* Category badge */}
          <span className="inline-flex items-center gap-1.5 bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <Tag size={11} />
            {trip.categoryName}
          </span>

          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2">
            {trip.title}
          </h1>

          <div className="flex items-center gap-2 text-white/80 text-sm mb-4">
            <MapPin size={14} />
            <span>{trip.origin} → {trip.destination}</span>
          </div>

          {/* Star rating + review count in hero */}
          <div className="flex items-center gap-3">
            <StarRating rating={trip.averageRating} size={18} />
            <span className="text-white font-semibold">{trip.averageRating?.toFixed(1)}</span>
            <span className="text-white/60 text-sm">({trip.totalReviews} reviews)</span>
          </div>
        </motion.div>
      </div>

      {/* ── BODY ──────────────────────────────── */}
      <div className="container mx-auto px-4 py-10 grid lg:grid-cols-3 gap-10">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-10">

          {/* Quick facts grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            <InfoTile icon={Calendar} label="Departure" value={new Date(trip.departureTime).toLocaleDateString()} />
            <InfoTile icon={Users} label="Seats left" value={`${trip.availableSeats} / ${trip.totalSeats}`} />
            <InfoTile icon={Truck} label="Transport" value={trip.transportationType} />
            <InfoTile icon={Clock} label="Status" value={trip.status} />
          </motion.div>

          {/* About */}
          <Section title="About this trip">
            <p className="text-muted-foreground leading-relaxed">{trip.description}</p>
            {trip.scheduleDescription && (
              <div className="bg-muted/50 border border-border rounded-xl p-4 mt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Schedule</p>
                <p className="text-sm text-foreground">{trip.scheduleDescription}</p>
              </div>
            )}
          </Section>

          {/* Photos gallery */}
          {trip.images?.length > 0 && (
            <Section title="Photos">
              <PhotoGallery images={trip.images} />
            </Section>
          )}

          {/* Vehicle */}
          <Section title="Vehicle">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <InfoTile icon={Truck} label="Type" value={trip.transportationType} />
              <InfoTile icon={Users} label="Capacity" value={String(trip.vehicleCapacity)} />
              {trip.isWholeVehicleBooking && (
                <div className="col-span-2 bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Whole vehicle booking available</p>
                    <p className="text-xs text-muted-foreground">${trip.wholeVehiclePrice} for the entire vehicle</p>
                  </div>
                </div>
              )}
            </div>
            {trip.vehicleImageUrls?.length > 0 && (
              <VehicleGallery images={trip.vehicleImageUrls} />
            )}
          </Section>

          {/* Included services */}
          {(trip.hasTourGuide || trip.mealsIncluded) && (
            <Section title="What's included">
              <div className="grid sm:grid-cols-2 gap-4">
                {trip.hasTourGuide && (
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="bg-card border border-border rounded-2xl p-5 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🧭</span>
                      <p className="font-bold text-card-foreground">Tour Guide</p>
                    </div>
                    {trip.tourGuideDescription && (
                      <p className="text-sm text-muted-foreground">{trip.tourGuideDescription}</p>
                    )}
                    {trip.tourGuideImageUrl && (
                      <img
                        src={trip.tourGuideImageUrl}
                        alt="Tour guide"
                        className="w-full h-36 object-cover rounded-xl"
                      />
                    )}
                  </motion.div>
                )}
                {trip.mealsIncluded && (
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="bg-card border border-border rounded-2xl p-5 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🍽️</span>
                      <p className="font-bold text-card-foreground">Meals Included</p>
                    </div>
                    {trip.diningDetails && (
                      <p className="text-sm text-muted-foreground">{trip.diningDetails}</p>
                    )}
                  </motion.div>
                )}
              </div>
            </Section>
          )}

          {/* Itinerary — accordion */}
          {trip.itinerary?.length > 0 && (
            <Section title="Itinerary">
              <div className="space-y-2">
                {trip.itinerary.map((item, i) => (
                  <ItineraryItem key={item.id} item={item} index={i} />
                ))}
              </div>
            </Section>
          )}

          {/* Reviews summary */}
          <Section title="Reviews">
            <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-foreground">{trip.averageRating?.toFixed(1)}</p>
                <StarRating rating={trip.averageRating} size={14} />
                <p className="text-xs text-muted-foreground mt-1">{trip.totalReviews} reviews</p>
              </div>
              <div className="h-16 w-px bg-border" />
              <p className="text-sm text-muted-foreground flex-1">
                This trip has been reviewed by {trip.totalReviews} traveler{trip.totalReviews !== 1 ? "s" : ""}. 
                Book your seat to leave a review after your trip.
              </p>
            </div>
          </Section>

        </div>

        {/* RIGHT SIDEBAR — booking card */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="sticky top-20 bg-card border border-border rounded-2xl p-6 space-y-5 shadow-lg"
          >
            {/* Price */}
            <div>
              <p className="text-3xl font-bold text-foreground">
                ${trip.pricePerSeat}
                <span className="text-sm font-normal text-muted-foreground"> / seat</span>
              </p>
              {trip.isWholeVehicleBooking && (
                <p className="text-xs text-muted-foreground mt-1">
                  or ${trip.wholeVehiclePrice} for whole vehicle
                </p>
              )}
            </div>

            {/* Star rating */}
            <div className="flex items-center gap-2">
              <StarRating rating={trip.averageRating} size={14} />
              <span className="text-sm font-medium">{trip.averageRating?.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({trip.totalReviews})</span>
            </div>

            <div className="h-px bg-border" />

            {/* Seats info */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Available seats</span>
              <span className="font-semibold text-foreground">{trip.availableSeats} / {trip.totalSeats}</span>
            </div>

            {/* Seat availability bar */}
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(trip.availableSeats / trip.totalSeats) * 100}%` }}
                transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                className="h-full bg-primary rounded-full"
              />
            </div>

            {/* Driver */}
            <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
              {trip.driverAvatarUrl ? (
                <img
                  src={trip.driverAvatarUrl}
                  alt={trip.driverName}
                  className="w-9 h-9 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={16} className="text-primary" />
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Your driver</p>
                <p className="text-sm font-semibold text-foreground">{trip.driverName}</p>
              </div>
            </div>

            {/* Departure */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar size={14} />
              <span>{new Date(trip.departureTime).toLocaleString()}</span>
            </div>

            {/* Book button */}
            {trip.availableSeats > 0 ? (
              <Link to={`/booking/${trip.id}`} className="block">
                <Button className="w-full h-12 text-base font-semibold">
                  Book Now
                </Button>
              </Link>
            ) : (
              <Button disabled className="w-full h-12 text-base">
                Fully Booked
              </Button>
            )}

            <p className="text-center text-xs text-muted-foreground">No payment charged until confirmed</p>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default TripDetail;