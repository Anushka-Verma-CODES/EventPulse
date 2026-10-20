import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getMyProfile } from "../lib/authApi";
import type { AuthUser } from "../types/auth";

type AuthContextType = {
  profile: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshProfile() {
  const token = sessionStorage.getItem("eventpulse_access_token");

  if (!token) {
    setProfile(null);
    return;
  }

  try {
    const result = await getMyProfile();
    setProfile(result);
  } catch (error) {
    console.error("Failed to refresh EventPulse profile:", error);

    setProfile(null);
  }
}

  useEffect(() => {
    refreshProfile().finally(() => setIsLoading(false));
  }, []);

  function logout() {
    sessionStorage.removeItem("eventpulse_access_token");
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{
        profile,
        isAuthenticated: profile !== null,
        isLoading,
        refreshProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
