import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { api, AUTH_API, KEYS } from "@/lib/api";

export interface User {
  id: number;
  fullName: string;
  email: string;
  contactNumber?: string;
  gender?: string;
  profileImage?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
  ratingCount?: number;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDriver: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (fullName: string, email: string, contactNumber: string, gender: string, password: string) => Promise<boolean>;
  fetchMe: (token?: string) => Promise<void>;
  loginWithGoogle: () => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem(KEYS.USER);
      return null;
    }
  });

  const persistUser = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(KEYS.USER, JSON.stringify(u));
    else localStorage.removeItem(KEYS.USER);
  };

  const fetchMe = useCallback(async (token?: string) => {
    try {
      // const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await api.get(AUTH_API.ME);
      // const res = await api.get(AUTH_API.ME, config);
      persistUser(res.data);
    } catch (err) {
      persistUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      // 🔥 Clear old tokens FIRST (fix for your bug)
      localStorage.removeItem(KEYS.ACCESS);
      sessionStorage.removeItem(KEYS.ACCESS);

      const res = await api.post(AUTH_API.LOGIN, { email, password });

      const accessToken = res.data.data.accessToken;

      // Save new token
      localStorage.setItem(KEYS.ACCESS, accessToken);
      sessionStorage.setItem(KEYS.ACCESS, accessToken);

      // ⚠️ Also apply earlier fix: don't pass token
      await fetchMe();

      return true;
    } catch (err) {
      console.error("Login failed", err);
      return false;
    }
  }, [fetchMe]);

  console.log("TOKEN USED:", localStorage.getItem(KEYS.ACCESS));
  const loginWithGoogle = useCallback(() => {
    localStorage.setItem(KEYS.HINT, "true");
    localStorage.removeItem(KEYS.ACCESS);
    localStorage.removeItem(KEYS.REFRESH);
    window.location.href = AUTH_API.GOOGLE_OAUTH;
  }, []);

  const register = useCallback(async (
    fullName: string,
    email: string,
    contactNumber: string,
    gender: string,
    password: string
  ) => {
    try {
      // Convert gender to uppercase as backend might expect enum values
      const genderValue = gender.toUpperCase();
      const res = await api.post(AUTH_API.REGISTER, {
        fullName,
        email,
        contactNumber,
        gender: genderValue,
        password,
      });
      const accessToken = res.data.accessToken;
      if (accessToken) {
        localStorage.setItem(KEYS.ACCESS, accessToken);
        sessionStorage.setItem(KEYS.ACCESS, accessToken);
      }
      // await fetchMe(accessToken);
      await fetchMe();
      return true;
    } catch (err: any) {
      console.error("Register failed", err);
      // Log the response for debugging
      if (err.response) {
        console.error("Server response:", err.response.data);
      }
      return false;
    }
  }, [fetchMe]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem(KEYS.USER, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/api/v1/auth/logout");
    } catch { }
    localStorage.removeItem(KEYS.ACCESS);
    localStorage.removeItem(KEYS.REFRESH);
    localStorage.removeItem(KEYS.HINT);
    sessionStorage.removeItem(KEYS.ACCESS);
    sessionStorage.removeItem(KEYS.REFRESH);
    persistUser(null);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("accessToken");
      if (urlToken) {
        localStorage.setItem(KEYS.ACCESS, urlToken);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const token = localStorage.getItem(KEYS.ACCESS);
      const hasHint = localStorage.getItem(KEYS.HINT) === "true";

      if (token || hasHint) {
        await fetchMe(token || undefined);
      } else {
        setLoading(false);
      }
    };
    initAuth();
  }, [fetchMe]);

  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      try {
        const res = await api.get(AUTH_API.WS_TOKEN);
        const newToken = res.data.data.accessToken;
        if (newToken) {
          localStorage.setItem(KEYS.ACCESS, newToken);
          sessionStorage.setItem(KEYS.ACCESS, newToken);
        }
      } catch (err) {
        console.error("Token refresh failed", err);
      }
    }, 45 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.roles?.includes("ROLE_ADMIN") ?? false,
        isDriver: user?.roles?.includes("ROLE_DRIVER") ?? false,
        loading,
        login,
        loginWithGoogle,
        register,
        fetchMe,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}