import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Instructor from "./pages/Instructor";
import Register from "./pages/Register";
import AdminHome from "./pages/AdminHome";
import CreateLesson from "./pages/CreateLesson";
import LessonBoard from "./pages/LessonBoard";
import "./styles/main.css";

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

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

      <Route path="/register" element={<Register />} />
      <Route path="/admin-home" element={<AdminHome />} />
      <Route path="/create-lesson" element={<CreateLesson />} />
      <Route path="/lesson-board" element={<LessonBoard />} />
    </Routes>
  );
}

export default App;
