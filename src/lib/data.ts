import destAngkor from "@/assets/dest-angkor.jpg";
import destPhnompenh from "@/assets/dest-phnompenh.jpg";
import destKampot from "@/assets/dest-kampot.jpg";
import destSihanoukville from "@/assets/dest-sihanoukville.jpg";

export interface Trip {
  id: string;
  title: string;
  location: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  driver: Driver;
  duration: string;
  highlights: string[];
}

export interface Driver {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  trips: number;
  phone: string;
}

export interface Booking {
  id: string;
  tripId: string;
  tripTitle: string;
  destination: string;
  driverName: string;
  date: string;
  passengers: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

const drivers: Driver[] = [
  { id: "d1", name: "Sokha Meas", avatar: "", rating: 4.9, trips: 342, phone: "+855 12 345 678" },
  { id: "d2", name: "Vanna Chan", avatar: "", rating: 4.8, trips: 215, phone: "+855 12 456 789" },
  { id: "d3", name: "Dara Kim", avatar: "", rating: 4.7, trips: 178, phone: "+855 12 567 890" },
  { id: "d4", name: "Piseth Hor", avatar: "", rating: 4.9, trips: 401, phone: "+855 12 678 901" },
];

export const trips: Trip[] = [
  {
    id: "t1",
    title: "Angkor Wat Sunrise Tour",
    location: "Siem Reap",
    description: "Experience the magical sunrise over the iconic Angkor Wat temple. This full-day tour includes visits to Angkor Thom, Bayon Temple, and Ta Prohm. Your experienced driver will guide you through centuries of Khmer history.",
    price: 25,
    rating: 4.9,
    reviewCount: 128,
    image: destAngkor,
    driver: drivers[0],
    duration: "8 hours",
    highlights: ["Sunrise at Angkor Wat", "Bayon Temple faces", "Ta Prohm jungle temple", "Local lunch included"],
  },
  {
    id: "t2",
    title: "Phnom Penh City Tour",
    location: "Phnom Penh",
    description: "Explore the vibrant capital of Cambodia. Visit the Royal Palace, Silver Pagoda, National Museum, and the bustling Central Market. End the day with a riverside sunset cruise.",
    price: 18,
    rating: 4.8,
    reviewCount: 96,
    image: destPhnompenh,
    driver: drivers[1],
    duration: "6 hours",
    highlights: ["Royal Palace", "Silver Pagoda", "Central Market", "Riverside sunset"],
  },
  {
    id: "t3",
    title: "Kampot Pepper Farm",
    location: "Kampot",
    description: "Discover the world-famous Kampot pepper plantations. Learn about organic farming practices, taste fresh pepper varieties, and enjoy the stunning countryside views of Kampot province.",
    price: 30,
    rating: 4.7,
    reviewCount: 64,
    image: destKampot,
    driver: drivers[2],
    duration: "5 hours",
    highlights: ["Pepper tasting", "Farm tour", "Countryside views", "Local snacks"],
  },
  {
    id: "t4",
    title: "Sihanoukville Beach Day",
    location: "Sihanoukville",
    description: "Relax on the pristine beaches of Sihanoukville. Visit Otres Beach, enjoy fresh seafood, and take a boat trip to nearby islands with crystal-clear waters.",
    price: 35,
    rating: 4.9,
    reviewCount: 152,
    image: destSihanoukville,
    driver: drivers[3],
    duration: "Full day",
    highlights: ["Otres Beach", "Island hopping", "Fresh seafood", "Snorkeling"],
  },
];

export const sampleBookings: Booking[] = [
  { id: "b1", tripId: "t1", tripTitle: "Angkor Wat Sunrise Tour", destination: "Siem Reap", driverName: "Sokha Meas", date: "2026-03-20", passengers: 2, totalPrice: 50, status: "confirmed" },
  { id: "b2", tripId: "t2", tripTitle: "Phnom Penh City Tour", destination: "Phnom Penh", driverName: "Vanna Chan", date: "2026-03-10", passengers: 3, totalPrice: 54, status: "completed" },
  { id: "b3", tripId: "t4", tripTitle: "Sihanoukville Beach Day", destination: "Sihanoukville", driverName: "Piseth Hor", date: "2026-03-25", passengers: 1, totalPrice: 35, status: "pending" },
];

export const sampleReviews: Review[] = [
  { id: "r1", userName: "Sarah T.", rating: 5, comment: "Absolutely incredible experience! Sokha was an amazing driver and guide. The sunrise was breathtaking.", date: "2026-03-01" },
  { id: "r2", userName: "Mark L.", rating: 5, comment: "Best tour in Cambodia! Our driver knew all the best spots and the history was fascinating.", date: "2026-02-28" },
  { id: "r3", userName: "Emma W.", rating: 4, comment: "Great tour overall. The temples were stunning. Would recommend starting even earlier for fewer crowds.", date: "2026-02-25" },
];
