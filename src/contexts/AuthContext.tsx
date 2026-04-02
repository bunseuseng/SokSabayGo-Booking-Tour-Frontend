import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { api, AUTH_API } from "@/lib/api";

export interface User {
  id: string;
  fullName: string;
  email: string;
  contactNumber?: string;
  gender?: string;
  avatarUrl?: string;
  profileImage?: string;
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
  fetchMe: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);

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

const fetchMe = useCallback(async () => {
  try {
    const res = await api.get(AUTH_API.ME);
    // console.log("fetchMe response:", res.data);
    persistUser(res.data);
  } catch (err) {
    // console.error("fetchMe error:", err);
    persistUser(null);
  } finally {
    setLoading(false);
  }
}, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await api.post(AUTH_API.LOGIN, { email, password });
      const accessToken = res.data.data.accessToken;
      localStorage.setItem("token", accessToken);
      sessionStorage.setItem("token", accessToken);

      await fetchMe();
      return true;
    } catch (err) {
      console.error("Login failed", err);
      return false;
    }
  }, [fetchMe]);

  const register = useCallback(async (
    fullName: string,
    email: string,
    contactNumber: string,
    gender: string,
    password: string
  ) => {
    try {
      await api.post(AUTH_API.REGISTER, {
        fullName,
        email,
        contactNumber,
        gender,
        password,
      });
      await fetchMe();
      return true;
    } catch (err) {
      console.error("Register failed", err);
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

  const logout = useCallback(async () => {
    try {
      await api.post("/api/v1/auth/logout");
    } catch {}
    localStorage.removeItem("token");
    persistUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.roles?.includes("ROLE_ADMIN") ?? false,
        isDriver: user?.roles?.includes("ROLE_DRIVER") ?? false,
        loading,
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