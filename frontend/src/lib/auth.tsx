// Client-side auth context. Reads/writes to localStorage.
// TODO: replace mock login with real backend session/user endpoint.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role, User } from "@/mocks/data";
import { authService } from "@/services";

const STORAGE_KEY = "cen.currentUserId";
const VIEW_KEY = "cen.coordViewMode";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  setUserById: (id: string) => Promise<void>;
  refetchUser: () => Promise<void>;
  // Coordinator view toggle: "coordinator" or "resident"
  viewMode: "coordinator" | "resident";
  setViewMode: (m: "coordinator" | "resident") => void;
  // Effective role used to render UI (coordinator can toggle to resident view)
  effectiveRole: Role;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewModeState] = useState<"coordinator" | "resident">("coordinator");

  const refetchUser = async () => {
    const id = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (id) {
      try {
        const u = await authService.getUserById(id);
        if (u) setUser(u);
      } catch (e) {
        console.warn("[Auth] Failed to refetch user permissions", e);
      }
    }
  };

  useEffect(() => {
    const id = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const vm = typeof window !== "undefined" ? localStorage.getItem(VIEW_KEY) : null;
    if (vm === "resident" || vm === "coordinator") setViewModeState(vm);
    if (id) {
      authService.getUserById(id).then((u) => {
        setUser(u);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  // Sync user profile on window focus or visibility change to ensure instant permission updates
  useEffect(() => {
    const onFocus = () => {
      if (user?.id) refetchUser();
    };
    window.addEventListener("focus", onFocus);
    const interval = setInterval(() => {
      if (user?.id) refetchUser();
    }, 5000); // 5s silent refresh
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [user?.id]);

  const login: AuthCtx["login"] = async (email, password) => {
    const u = await authService.login(email, password);
    if (u) {
      setUser(u);
      setViewModeState("coordinator");
      localStorage.removeItem(VIEW_KEY);
      localStorage.setItem(STORAGE_KEY, u.id);
    }
    return u;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VIEW_KEY);
    authService.logout();
  };

  const setUserById: AuthCtx["setUserById"] = async (id) => {
    const u = await authService.getUserById(id);
    if (u) {
      setUser(u);
      localStorage.setItem(STORAGE_KEY, id);
    }
  };

  const setViewMode = (m: "coordinator" | "resident") => {
    setViewModeState(m);
    localStorage.setItem(VIEW_KEY, m);
  };

  const effectiveRole: Role =
    user?.isCoordinator && viewMode === "resident" ? "resident" : (user?.role ?? "resident");

  return (
    <Ctx.Provider value={{ user, loading, login, logout, setUserById, refetchUser, viewMode, setViewMode, effectiveRole }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
}
