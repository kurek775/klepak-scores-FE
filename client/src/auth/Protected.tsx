// src/auth/Protected.tsx
import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { me, loading } = useAuth();
  if (loading) return <p>Načítám…</p>;
  if (!me) return <Navigate to="/login" replace />;
  return children;
};
export const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { me, loading } = useAuth();
  if (loading) return <p>Načítám…</p>;
  if (!me) return <Navigate to="/login" replace />;
  if (!me.isAdmin) return <Navigate to="/" replace />;
  return children;
};
