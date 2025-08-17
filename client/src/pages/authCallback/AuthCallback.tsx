// pages/AuthCallback.tsx
import { useEffect } from "react";
export default function AuthCallback() {
  useEffect(() => {
    window.location.replace("/"); // nebo kam potřebuješ
  }, []);
  return <p>Probíhá přihlášení…</p>;
}
