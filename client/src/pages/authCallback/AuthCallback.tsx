// pages/AuthCallback.tsx
import { useEffect } from "react";
export default function AuthCallback() {
  useEffect(() => {
    window.location.replace("/");
  }, []);
  return <p>Probíhá přihlášení…</p>;
}
