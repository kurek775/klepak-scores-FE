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
import { Protected, AdminOnly } from "./auth/Protected";

function HomeRouter() {
  const { me, isAdmin } = useAuth();
  if (!me) return <Login />;
  return isAdmin ? (
    <Navigate to="/admin" replace />
  ) : (
    <Navigate to="/tours/1/crews/1" replace />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<HomeRouter />} />

          <Route
            path="/admin"
            element={
              <AdminOnly>
                <AdminHome />
              </AdminOnly>
            }
          />

          <Route
            path="/tours/:tourId"
            element={
              <AdminOnly>
                <AdminPanelTour />
              </AdminOnly>
            }
          />

          <Route
            path="/tours/:tourId/crews/:crewId"
            element={
              <Protected>
                <UserHome />
              </Protected>
            }
          />

          <Route
            path="/tours/:tourId/crews/:crewId/sport/:sportId"
            element={
              <Protected>
                <Upload />
              </Protected>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
