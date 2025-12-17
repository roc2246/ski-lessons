import { Link } from "react-router-dom";
import Logout from "../buttons/Logout";

export default function LessonBoardControlls() {
  return (
    <section className="lesson-board__controls">
      <Logout />
      <Link to="/instructor" className="lesson-board__link">
        Back
      </Link>
    </section>
  );
}
