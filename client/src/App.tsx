// src/App.tsx
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/Login";
import Upload from "./pages/results/Results";
import AdminHome from "./pages/adminHome/AdminHome";
import UserHome from "./pages/userHome/UserHome";
import AdminPanelTour from "./pages/adminPanelTour/AdminPanelTour";
import AuthCallback from "./pages/authCallback/AuthCallback";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { ProtectedRoute, AdminRoute } from "./auth/Protected";
import Results from "./pages/results/Results";
import { useTranslation } from "react-i18next";

function HomeRouter() {
  const { me, loading } = useAuth();
  if (loading) return null;
  if (!me) return <Login />;
  if (me.isAdmin) return <Navigate to="/admin" replace />;

  const tourId = me?.tourId;
  const crewId = me?.crewId;
  if (tourId && crewId) {
    return <Navigate to={`/tours/${tourId}/crews/${crewId}`} replace />;
  } else {
    return <Navigate to={`/pending`} replace />;
  }
}
function PendingUserHome() {
  const { t } = useTranslation();
  const { me, loading } = useAuth();
  if (loading) return null;
  if (!me) return <Login />;
  return (
    <div>
      <h2>{t("pendingUserHome")}</h2>
      <h3>{me.name}</h3>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route path="/login" element={<HomeRouter />} />
          <Route path="/" element={<HomeRouter />} />
          <Route
            path="/pending"
            element={
              <ProtectedRoute>
                <PendingUserHome />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminHome />
              </AdminRoute>
            }
          />

          <Route
            path="/tours/:tourId"
            element={
              <AdminRoute>
                <AdminPanelTour />
              </AdminRoute>
            }
          />

          <Route
            path="/tours/:tourId/crews/:crewId"
            element={
              <ProtectedRoute>
                <UserHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tours/:tourId/crews/:crewId/sport/:sportId"
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
