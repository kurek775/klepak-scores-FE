import { useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";

export default function AuthCallback() {
  const { refresh } = useAuth();
  useEffect(() => {
    refresh().then(() => (window.location.href = "/"));
  }, []);
  return <p>Signing you in…</p>;
}
