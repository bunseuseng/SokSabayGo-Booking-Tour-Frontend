import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";

const Footer = () => (
  <footer className="bg-foreground text-background">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Soksabay Go</h3>
          <p className="text-background/60 text-sm leading-relaxed">
            Your trusted TukTuk tour platform in Cambodia. Explore temples, cities, and beaches with local drivers.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Explore</h4>
          <div className="flex flex-col gap-2 text-sm text-background/60">
            <Link to="/search" className="hover:text-background transition">All Tours</Link>
            <Link to="/bookings" className="hover:text-background transition">My Bookings</Link>
            <Link to="/driver-request" className="hover:text-background transition">Become a Driver</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <div className="flex flex-col gap-2 text-sm text-background/60">
            <span>About Us</span>
            {/* CHANGED: This is now a clickable Link for Google Verification */}
            <Link to="/privacy" className="hover:text-background transition">Privacy Policy</Link>
            <span>Terms of Service</span>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Contact</h4>
          <div className="flex flex-col gap-3 text-sm text-background/60">
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>Phnom Penh, Cambodia</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} />
              <span>+855 12 345 678</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} />
              <span>hello@soksabaygo.com</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-background/10 text-center text-sm text-background/40">
          <p>© 2026 Soksabay Go. All rights reserved.</p>
          {/* Keep this link here as well just to be safe for the Google Bot */}
          <Link to="/privacy" className="hover:text-background/80 underline mt-1 inline-block">Privacy Policy</Link>
      </div>
    </div>
  </footer>
);

export default Footer;