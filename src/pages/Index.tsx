import { Link } from "react-router-dom";
import { Search, Shield, DollarSign, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import TripCard from "@/components/TripCard";
import { trips } from "@/lib/data";
import { StaggerContainer, StaggerItem, FadeInView } from "@/components/AnimationUtils";

const features = [
  { icon: Search, title: "Easy Booking", desc: "Find and book tours in seconds." },
  { icon: Shield, title: "Trusted Drivers", desc: "Verified local drivers with great reviews." },
  { icon: DollarSign, title: "Affordable", desc: "Fair pricing with no hidden fees." },
];

const Index = () => (
  <div className="bg-background">
    {/* Welcome banner */}
    <section className="bg-primary px-6 py-8">
      <div className="container mx-auto">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2"
        >
          Explore Cambodia with Local TukTuk Tours
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-primary-foreground/70 text-sm md:text-base mb-4"
        >
          Discover temples, beaches, and hidden gems with trusted local drivers
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <Link to="/search">
            <Button size="lg" className="bg-accent text-accent-foreground hover:brightness-110 shadow-lg">
              <Search size={18} className="mr-2" />
              Search Tours
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>

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
              <p className="text-muted-foreground text-[11px] md:text-xs mt-1 hidden sm:block">{f.desc}</p>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>

    {/* All Tours / Products */}
    <section className="container mx-auto px-4 pb-10">
      <FadeInView>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Popular Tours</h2>
            <p className="text-muted-foreground text-sm mt-1">Top-rated tours loved by travelers</p>
          </div>
          <Link to="/search" className="text-primary font-medium text-sm hover:underline hidden sm:block">
            View all →
          </Link>
        </div>
      </FadeInView>
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {trips.map((trip) => (
          <StaggerItem key={trip.id}>
            <TripCard trip={trip} />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>

    {/* CTA */}
    <FadeInView>
      <section className="bg-primary py-10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <TrendingUp size={24} className="text-accent" />
            <h2 className="text-xl md:text-2xl font-bold text-primary-foreground">Ready to explore?</h2>
          </div>
          <p className="text-primary-foreground/70 mb-6 max-w-md mx-auto text-sm">
            Join thousands of happy travelers who discovered Cambodia through our local TukTuk tours.
          </p>
          <Link to="/search">
            <Button size="lg" className="bg-accent text-accent-foreground hover:brightness-110 shadow-lg">
              Start Exploring
            </Button>
          </Link>
        </div>
      </section>
    </FadeInView>
  </div>
);

export default Index;
