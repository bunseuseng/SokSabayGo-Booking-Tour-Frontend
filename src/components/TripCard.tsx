import { Link } from "react-router-dom";
import { Star, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";
import type { Trip } from "@/lib/data";

const TripCard = ({ trip }: { trip: Trip }) => (
  <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
    <Link
      to={`/trip/${trip.id}`}
      className="group block bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-border"
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={trip.image}
          alt={trip.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-bold shadow">
          ${trip.price}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
          <MapPin size={12} />
          <span>{trip.location}</span>
          <span className="mx-1">·</span>
          <Clock size={12} />
          <span>{trip.duration}</span>
        </div>
        <h3 className="font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
          {trip.title}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-accent text-accent" />
            <span className="text-sm font-semibold">{trip.rating}</span>
            <span className="text-xs text-muted-foreground">({trip.reviewCount})</span>
          </div>
          <span className="text-xs text-muted-foreground">{trip.driver.name}</span>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default TripCard;
