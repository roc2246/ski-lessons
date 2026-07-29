import { Link, useNavigate } from "react-router-dom";
import GeneralBtn from "./buttons/GeneralBtn";
import * as lib from "../utils/auth-library";

export default function LessonBoardControlls() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await lib.logout(); // don't need to pass token; library can read from localStorage
    localStorage.removeItem("token"); // ensure token is cleared
    navigate("/", { replace: true }); // navigate to login
    window.location.reload(); // optional, force reload so App re-checks token
  };

  return (
    <section className="lesson-board__controls">
      <GeneralBtn type="secondary" onClick={handleLogout}>
        Logout
      </GeneralBtn>

      <Link to="/instructor" className="lesson-board__link">
        Back
      </Link>
    </section>
  );
}
