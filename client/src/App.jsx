import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Instructor from "./pages/Instructor";
import Register from "./pages/Register";
import AdminHome from "./pages/AdminHome";
import CreateLesson from "./pages/CreateLesson";
import LessonBoard from "./pages/LessonBoard";
import * as lib from "./utils/admin-library";
import * as authLib from "./utils/auth-library";

function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function syncAdminState() {
      if (!token) {
        setAdmin(false);
        return;
      }

      try {
        const isAdmin = await lib.isAdmin(token);
        if (isMounted) {
          setAdmin(Boolean(isAdmin));
        }
      } catch {
        if (isMounted) {
          setAdmin(false);
        }
      }
    }

    syncAdminState();

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function handleLogout() {
    await authLib.logout();
    setAdmin(false);
    navigate("/", { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div className="app-shell__container">
          <Link to={token ? "/instructor" : "/"} className="app-shell__brand">
            Snow Pro App
          </Link>

          <nav className="app-shell__nav" aria-label="Primary navigation">
            {!token && (
              <>
                <Link to="/">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}

            {token && (
              <>
                <Link to="/instructor">Instructor</Link>
                <Link to="/lesson-board">Lesson Board</Link>
                {admin && <Link to="/admin-home">Admin</Link>}
                <button
                  type="button"
                  className="btn btn--secondary app-shell__logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <div className="app-shell__content">
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
          <Route
            path="/create-lesson"
            element={token && admin ? <CreateLesson /> : <Navigate to="/" replace />}
          />
          <Route
            path="/lesson-board"
            element={token ? <LessonBoard /> : <Navigate to="/" replace />}
          />
        </Routes>
      </div>

      <footer className="app-shell__footer">
        <div className="app-shell__container">
          <p>Snow Pro Scheduling Platform</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
