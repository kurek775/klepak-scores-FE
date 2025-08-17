// src/auth/Protected.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { JSX } from "react";

export function Protected({ children }: { children: JSX.Element }) {
  const { me, loading } = useAuth();
  if (loading) return <p>Načítám…</p>;
  if (!me) return <Navigate to="/login" replace />;
  return children;
}

export function AdminOnly({ children }: { children: JSX.Element }) {
  const { me, loading, isAdmin } = useAuth();
  if (loading) return <p>Načítám…</p>;
  if (!me) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}
