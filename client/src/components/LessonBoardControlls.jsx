import { Link, useNavigate } from "react-router-dom";
import GeneralBtn from "./buttons/GeneralBtn";
import * as lib from "../utils/auth-library";

export default function LessonBoardControlls() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  return (
    <section className="lesson-board__controls">
      <GeneralBtn
        type="secondary"
        onClick={async () => {
          await lib.logout(token);
          navigate("/"); // redirects to login page
        }}
      >
        Logout
      </GeneralBtn>

      <Link to="/instructor" className="lesson-board__link">
        Back
      </Link>
    </section>
  );
}
