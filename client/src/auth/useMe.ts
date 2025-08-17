// src/auth/useMe.ts
import { useEffect, useState } from "react";

export type Me = {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  isAdmin?: boolean; // (optional) if your BE returns it
};

export function useMe() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${import.meta.env.VITE_BE_ENDPOINT}/me`, {
          credentials: "include",
        });
        console.log(r);
        if (r.ok) {
          const data = (await r.json()) as Me;
          setMe(data);
        } else {
          setMe(null);
        }
      } catch {
        setMe(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { me, loading, isAdmin: !!me?.isAdmin };
}
