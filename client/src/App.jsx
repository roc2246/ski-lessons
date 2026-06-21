import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Instructor from "./pages/Instructor";
import Register from "./pages/Register";
import AdminHome from "./pages/AdminHome";
import CreateLesson from "./pages/CreateLesson";
import LessonBoard from "./pages/LessonBoard";
import * as lib from "./utils/admin-library";

function App() {
  const initialAuth = lib.getStoredAuthState();
  const [token, setToken] = useState(initialAuth.token);
  const [admin, setAdmin] = useState(initialAuth.admin);

  useEffect(() => {
    if (!token) {
      setAdmin(false);
      return;
    }

    let cancelled = false;

    async function syncAdminState() {
      try {
        const isAdmin = await lib.isAdmin(token);
        if (!cancelled) {
          setAdmin(isAdmin);
        }
      } catch (error) {
        console.error("Failed to determine admin status:", error);
      }
    }

    syncAdminState();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <Routes>
      <Route
        path="/"
        element={token ? <Navigate to="/instructor" replace /> : <Login />}
      />

      <Route
        path="/instructor"
        element={token ? <Instructor admin={admin} /> : <Navigate to="/" replace />}
      />

      <Route
        path="/admin-home"
        element={token && admin ? <AdminHome /> : <Navigate to="/instructor" replace />}
      />

      <Route path="/register" element={<Register />} />
      <Route
        path="/create-lesson"
        element={token && admin ? <CreateLesson /> : <Navigate to="/instructor" replace />}
      />
      <Route path="/lesson-board" element={<LessonBoard />} />
    </Routes>
  );
}

export default App;
