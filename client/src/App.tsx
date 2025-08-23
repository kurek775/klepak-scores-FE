// src/App.tsx
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/Login";
import Upload from "./pages/upload/Upload";
import AdminHome from "./pages/adminHome/AdminHome";
import UserHome from "./pages/userHome/UserHome";
import AdminPanelTour from "./pages/adminPanelTour/AdminPanelTour";
import AuthCallback from "./pages/authCallback/AuthCallback";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { ProtectedRoute, AdminRoute } from "./auth/Protected";

function HomeRouter() {
  const { me, loading } = useAuth();

  // wait for auth state to resolve, avoid UI flash
  if (loading) return null;

  // unauthenticated -> show login page
  if (!me) return <Login />;

  // admin -> admin home
  if (me.isAdmin) return <Navigate to="/admin" replace />;

  // regular user -> go to their tour/crew (teamId is our crewId param)
  const tourId = me?.tourId ?? 1;
  const crewId = me?.teamId ?? 1;

  return <Navigate to={`/tours/${tourId}/crews/${crewId}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider must be inside BrowserRouter (it uses useNavigate) */}
      <AuthProvider>
        <Routes>
          {/* callback sets cookie, then we refresh and bounce home */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* explicit login route — HomeRouter will show Login if unauthenticated */}
          <Route path="/login" element={<HomeRouter />} />

          {/* root redirects based on role */}
          <Route path="/" element={<HomeRouter />} />

          {/* admin area */}
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

          {/* user area */}
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
                <Upload />
              </ProtectedRoute>
            }
          />

          {/* catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
