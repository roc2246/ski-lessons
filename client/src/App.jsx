import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Instructor from "./pages/Instructor";
import Register from "./pages/Register";
import AdminHome from "./pages/AdminHome";
import CreateLesson from "./pages/CreateLesson";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      {/* Default route is login */}
      <Route
        path="/"
        element={token ? <Navigate to="/instructor" /> : <Login />}
      />

      <Route path="/instructor" element={<Instructor />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin-home" element={<AdminHome />} />
      <Route path="/create-lesson" element={<CreateLesson />} />
    </Routes>
  );
}

export default App;
