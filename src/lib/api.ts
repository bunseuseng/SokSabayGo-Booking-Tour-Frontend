import axios from "axios";

// URL server backend (déployé sur Render)
// const BASE_URL = "https://service-provider-latest-2.onrender.com";

// URL locale pour développement
const BASE_URL = "http://localhost:8080";

/** Axios instance with credentials (HTTP-only JWT cookies) */
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});


// Automatically attach token from localStorage to Authorization header if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(KEYS.ACCESS);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.withCredentials = false;
  } else {
    config.withCredentials = true;
    delete config.headers.Authorization;
  }

  return config;
});

//

// ─── Auth Endpoints ───────────────────────────────────────────
export const AUTH_API = {
  LOGIN: "/api/v1/auth-service/authenticate",
  REGISTER: "/api/v1/auth-service/register",
  ME: "/api/v1/users/me",
  UPDATE_ME: "/api/v1/users/me",
  GOOGLE_OAUTH: "http://localhost:8080/oauth2/authorization/google",
  WS_TOKEN: "/api/v1/auth-service/ws-token",
};

export const KEYS = {
  ACCESS: "token",
  USER: "soksabay_user",
  REFRESH: "refresh_token",
  HINT: "oauth2_hint",
};

// ─── Media Upload ─────────────────────────────────────────────
export const MEDIA_API = {
  UPLOAD: "/api/v1/media/upload",
};

// ─── Driver Application Endpoints ─────────────────────────────
export const DRIVER_API = {
  APPLY: "/api/v1/driver-applications/apply",
  MY: "/api/v1/driver-applications/my",
  REAPPLY: (id: string | number) => `/api/v1/driver-applications/${id}/reapply`,
};

// ─── Admin Driver Endpoints ───────────────────────────────────
export const ADMIN_DRIVER_API = {
  LIST: "/api/v1/driver-applications",
  APPROVE: (id: string | number) => `/api/v1/driver-applications/${id}/approve`,
  REJECT: (id: string | number) => `/api/v1/driver-applications/${id}/reject`,
};

// ─── Public Trip Endpoints ────────────────────────────────────
export const PUBLIC_TRIPS_API = {
  SEARCH: "/api/v1/public/trips/search",
  DETAIL: (id: string | number) => `/api/v1/public/trips/${id}`,
};

// ─── Trip Endpoints (Driver Module) ───────────────────────────
export const DRIVER_TRIPS_API = {
  CREATE: "/api/v1/driver/trips",
  MY: "/api/v1/driver/trips/my",
  DETAIL: (id: string | number) => `/api/v1/driver/trips/${id}`,
  UPDATE: (id: string | number) => `/api/v1/driver/trips/${id}`,
  DELETE: (id: string | number) => `/api/v1/driver/trips/${id}`,
};

// ─── Driver Booking Endpoints ─────────────────────────────────
export const DRIVER_BOOKINGS_API = {
  REQUESTS: "/api/v1/driver/bookings/requests",
  RESPOND: (id: string | number) => `/api/v1/driver/bookings/${id}/respond`,
};

// ─── Booking Endpoints (User) ─────────────────────────────────
export const BOOKINGS_API = {
  CREATE: "/api/v1/bookings",
  MY: "/api/v1/bookings/my",
};

// ─── Notification Endpoints ───────────────────────────────────
export const NOTIFICATIONS_API = {
  LIST: "/api/v1/notifications",
  MARK_READ: (id: string | number) => `/api/v1/notifications/${id}/read`,
};

// ─── Chat / WebSocket Endpoints ───────────────────────────────
export const CHAT_API = {
  CONVERSATIONS: "/api/v1/chat/conversations",
  MESSAGES: (id: string) => `/api/v1/chat/conversations/${id}/messages`,
  SEND_MESSAGE: (id: string) => `/api/v1/chat/conversations/${id}/messages`,
  WS: (token: string) => `wss://ws.soksabaygo/chat?token=${token}`,
};

// ─── Review Endpoints ─────────────────────────
export const REVIEWS_API = {
  SUBMIT: "/api/v1/reviews",
  FOR_TRIP: "/api/v1/reviews/trip",
  FOR_DRIVER: (driverId: string | number) => `/api/v1/reviews/driver/${driverId}`,
};

// ─── Shared Types ─────────────────────────────────────────────
export interface ApiTrip {
  id: number;
  title: string;
  description: string;
  origin: string;
  destination: string;
  pricePerSeat: number;
  totalSeats: number;
  availableSeats: number;
  departureTime: string;
  status: string;
  images: string[];
  driverName: string;
  categoryName: string;
}

export interface ApiBooking {
  id: number;
  seatsBooked: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  trip: {
    id: number;
    title: string;
    destination: string;
    departureTime: string;
    driverName: string;
  };
  passengerName: string;
  passengerPhone: string;
}
