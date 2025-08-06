import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Upload from "./pages/upload/Upload";
function App() {
  const loggedIn = false;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={loggedIn ? <Home /> : <Login />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
