import axios from "axios";

const BASE_URL = "https://service-provider-latest-2.onrender.com";

/** Axios instance with credentials (HTTP-only JWT cookies) */
export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("soksabay_token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  r => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("soksabay_token");
      localStorage.removeItem("soksabay_user");
    }
    return Promise.reject(error);
  }
);

// ─── Auth Endpoints ───────────────────────────────────────────
export const AUTH_API = {
  LOGIN: "/api/v1/auth-service/authenticate",
  REGISTER: "/api/v1/auth-service/register",
  ME: "/api/v1/users/me",
  UPDATE_ME: "/api/v1/users/me",
  GOOGLE_OAUTH: "http://localhost:8080/oauth2/authorization/google",
};

// ─── Media Upload ─────────────────────────────────────────────
export const MEDIA_API = {
  UPLOAD: "/api/v1/media/upload",
};

// ─── File upload helper ───────────────────────────────────────
export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post(MEDIA_API.UPLOAD, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.secure_url;
};
// ─── Driver Application Endpoints ─────────────────────────────
export const DRIVER_API = {
  APPLY: "/api/v1/driver-applications/apply",
};

// ─── Admin Driver Endpoints ───────────────────────────────────
export const ADMIN_DRIVER_API = {
  LIST: "/api/v1/driver-applications",
  APPROVE: (id: string | number) => `/api/v1/driver-applications/${id}/approve`,
  REJECT: (id: string | number) => `/api/v1/driver-applications/${id}/reject`,
};

// ─── Trip Endpoints (Driver Module) ───────────────────────────
export const DRIVER_TRIPS_API = {
  CREATE: "/api/v1/driver/trips",
  MY: "/api/v1/driver/trips/my",
  DETAIL: (id: string | number) => `/api/v1/driver/trips/${id}`,
  UPDATE: (id: string | number) => `/api/v1/driver/trips/${id}`,
  DELETE: (id: string | number) => `/api/v1/driver/trips/${id}`,
};

// ─── Booking Endpoints ────────────────────────────────────────
export const BOOKINGS_API = {
  CREATE: "/api/v1/bookings",
  LIST: "/api/v1/bookings",
  CANCEL: (id: string) => `/api/v1/bookings/${id}/cancel`,
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
  WS: (token: string) => `wss://ws.soksabaygo.com/chat?token=${token}`,
};
