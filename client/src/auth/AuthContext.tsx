import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../api/authService";

type Me = {
  email: string;
  tourId?: number;
  crewId?: number;
  name?: string;
  picture?: string;
  sub: string;
  isAdmin: boolean;
};
type AuthCtx = {
  me: Me | null;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  me: null,
  loading: true,
  login: () => {},
  logout: async () => {},
  refresh: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    setLoading(true);
    try {
      const res = await getMe();
      setMe(res?.sub ? res : null);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = () => {
    window.location.href = `${import.meta.env.VITE_AUTH_ENDPOINT}/login`;
  };

  const logout = async () => {
    await fetch(`${import.meta.env.VITE_AUTH_ENDPOINT}/logout`, {
      method: "POST",
      credentials: "include",
    });
    await fetchMe();
  };

  return (
    <Ctx.Provider value={{ me, loading, login, logout, refresh: fetchMe }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
