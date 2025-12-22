import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Instructor from "./pages/Instructor";
import Register from "./pages/Register";
import AdminHome from "./pages/AdminHome";
import CreateLesson from "./pages/CreateLesson";
import LessonBoard from "./pages/LessonBoard";
import * as lib from "./utils/admin-library";
import "./styles/main.css";

function App() {
  const [token, setToken] = useState(null);
  const [admin, setAdmin] = useState(false); // default to false

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    // Check if user is admin
    if (storedToken) {
      const isAdmin = lib.isAdmin(storedToken); // pass token if needed
      setAdmin(isAdmin);
    }
  }, []); // run once on mount

  return (
    <Routes>
      <Route
        path="/"
        element={token ? <Navigate to="/instructor" replace /> : <Login />}
      />

      <Route
        path="/instructor"
        element={token ? <Instructor /> : <Navigate to="/" replace />}
      />

      <Route
        path="/admin-home"
        element={token && admin ? <AdminHome /> : <Navigate to="/" replace />}
      />

      <Route path="/register" element={<Register />} />
      <Route path="/create-lesson" element={<CreateLesson />} />
      <Route path="/lesson-board" element={<LessonBoard />} />
    </Routes>
  );
}

export default App;
