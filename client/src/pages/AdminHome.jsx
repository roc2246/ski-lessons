import { useEffect} from "react";
import { useNavigate, Link } from "react-router-dom";
import * as adminLib from "../utils/admin-library.js";
// import "../styles/main.css";

function AdminHome() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    async function checkAdmin() {
      try {
        const isAdmin = await adminLib.isAdmin(token);
        if (!isAdmin) {
          alert("You must have admin privileges to access this page");
          navigate("/instructor");
        }
      } catch (err) {
        console.error("Admin check failed:", err);
        alert("Unable to verify admin status. Please login again.");
        navigate("/");
      }
    }

    checkAdmin();
  }, [navigate]);

  return (
    <main className="admin">
      <h1 className="admin__header">ADMIN HOME</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Link to="/create-lesson" className="admin__link">
          Create Lesson
        </Link>
        <Link to="/instructor" className="admin__link">
          Back
        </Link>
      </div>
      {status && <div>{status}</div>}
    </main>
  );
}

export default AdminHome;
