import { Link } from "react-router-dom";

function AdminHome() {
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
    </main>
  );
}

export default AdminHome;
