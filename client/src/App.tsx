import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Login from "./pages/login/Login";
import Upload from "./pages/upload/Upload";
import AdminHome from "./pages/adminHome/AdminHome";
import UserHome from "./pages/userHome/UserHome";
function App() {
  const loggedIn = true;
  const tourId = 1;
  const crewId = 1;
  const isAdmin = false;
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            loggedIn ? (
              isAdmin ? (
                <Navigate to={`/tours/${tourId}`} replace />
              ) : (
                <Navigate to={`/tours/${tourId}/crews/${crewId}`} replace />
              )
            ) : (
              <Login />
            )
          }
        />

        <Route path="/tours/:tourId" element={<AdminHome />} />
        <Route path="/tours/:tourId/crews/:crewId" element={<UserHome />} />
        <Route
          path="/tours/:tourId/crews/:crewId/sport/:sportId"
          element={<Upload />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
