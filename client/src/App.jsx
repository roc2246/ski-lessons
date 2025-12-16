import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Instructor from "./pages/Instructor";
import Register from "./pages/Register";

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
    </Routes>
  );
}

export default App;
