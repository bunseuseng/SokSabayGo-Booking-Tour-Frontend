import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Search" },
  { to: "/bookings", label: "Bookings" },
  { to: "/driver-request", label: "Become a Driver" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-primary shadow-lg">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Soksabay Go" className="h-9 w-9 rounded-md" />
          <span className="text-lg font-bold text-primary-foreground tracking-tight">
            Soksabay Go
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === l.to
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/login"
            className="ml-2 px-4 py-2 rounded-lg text-sm font-semibold bg-accent text-accent-foreground hover:brightness-110 transition"
          >
            Login
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-primary-foreground p-2"
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-primary border-t border-primary-foreground/10 pb-4 animate-fade-in">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block px-6 py-3 text-sm font-medium ${
                location.pathname === l.to
                  ? "text-primary-foreground bg-primary-foreground/10"
                  : "text-primary-foreground/70"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="block mx-6 mt-2 text-center px-4 py-2 rounded-lg text-sm font-semibold bg-accent text-accent-foreground"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
