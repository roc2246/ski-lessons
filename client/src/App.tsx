import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Instructor from "./pages/Instructor";
import Register from "./pages/Register";
import AdminHome from "./pages/AdminHome";
import CreateLesson from "./pages/CreateLesson";
import DeleteLesson from "./pages/DeleteLesson";
import UpdateLesson from "./pages/UpdateLesson";
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
    const authToken = token;

    let cancelled = false;

    async function syncAdminState() {
      try {
        const isAdmin = await lib.isAdmin(authToken);
        if (!cancelled) {
          setAdmin(isAdmin);
        }
      } catch (error) {
        console.error("Failed to determine admin status:", error);

        const message = String((error as { message?: string })?.message || "").toLowerCase();
        const isAuthError = message.includes("unauthorized") || message.includes("token");

        if (!cancelled && isAuthError) {
          localStorage.removeItem("token");
          setToken(null);
          setAdmin(false);
        }
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
      <Route
        path="/delete-lesson"
        element={token && admin ? <DeleteLesson /> : <Navigate to="/instructor" replace />}
      />
      <Route
        path="/update-lesson"
        element={token && admin ? <UpdateLesson /> : <Navigate to="/instructor" replace />}
      />
      <Route path="/lesson-board" element={<LessonBoard />} />
    </Routes>
  );
}

export default App;
