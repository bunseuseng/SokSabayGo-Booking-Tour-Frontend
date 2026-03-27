import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { api, AUTH_API } from "@/lib/api";

export interface User {
  id: string;
  fullName: string;
  email: string;
  contactNumber?: string;
  gender?: string;
  avatarUrl?: string;
  role: ("USER" | "ADMIN" | "DRIVER")[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDriver: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (fullName: string, email: string, contactNumber: string, gender: string, password: string) => Promise<boolean>;
  fetchMe: () => Promise<User | null>;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("soksabay_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem("soksabay_user");
      return null;
    }
  });

  const persistUser = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem("soksabay_user", JSON.stringify(u));
    else localStorage.removeItem("soksabay_user");
  };

  const fetchMe = useCallback(async (): Promise<User | null> => {
    try {
      const res = await api.get(AUTH_API.ME);
      const payload = res.data.data ?? res.data;

      const normalizedRole = (payload.roles || [])
        .map((r: string) => r.replace(/^ROLE_/i, "").toUpperCase())
        .filter((r: string): r is "ADMIN" | "USER" | "DRIVER" => ["ADMIN", "USER", "DRIVER"].includes(r));

      const userData: User = {
        id: String(payload.id || payload.userId),
        fullName: payload.fullName,
        email: payload.email,
        contactNumber: payload.contactNumber,
        gender: payload.gender,
        avatarUrl: payload.avatarUrl,
        role: normalizedRole.length ? normalizedRole : ["USER"],
      };

      persistUser(userData);
      return userData;
    } catch (err) {
      console.error("Fetch me failed", err);
      return null;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await api.post(AUTH_API.LOGIN, { email, password });
      const token = res.data.data.accessToken;
      if (!token) throw new Error("No token returned from login");

      localStorage.setItem("soksabay_token", token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      return await fetchMe();
    } catch (err) {
      console.error("Login failed", err);
      return null;
    }
  }, [fetchMe]);

  const register = useCallback(async (fullName: string, email: string, contactNumber: string, gender: string, password: string) => {
    try {
      await api.post(AUTH_API.REGISTER, { fullName, email, contactNumber, gender, password });
      await fetchMe();
      return true;
    } catch {
      return false;
    }
  }, [fetchMe]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem("soksabay_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("soksabay_token");
    persistUser(null);
  }, []);

  useEffect(() => {
    if (!user) fetchMe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role.includes("ADMIN") ?? false,
        isDriver: user?.role.includes("DRIVER") ?? false,
        login,
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