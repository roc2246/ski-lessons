import { Link } from "react-router-dom";
import Logout from "../buttons/Logout";
import Delete from "../buttons/Delete";

export default function InstructorControlls() {
  return (
    <section className="instructor__controls">
      <h1 className="instructor__title">Logged In</h1>
      <Logout />
      <Delete />

      <Link to="/lesson-board" className="instructor__link">
        Lesson Board
      </Link>
      <Link to="/admin-home" className="instructor__link">
        Admin
      </Link>
    </section>
  );
}
