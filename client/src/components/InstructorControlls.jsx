import { useNavigate, Link } from "react-router-dom";
import GeneralBtn from "./buttons/GeneralBtn";
import * as lib from "../utils/auth-library";

export default function InstructorControlls() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  return (
    <section className="instructor__controls">
      <h1 className="instructor__title">Logged In</h1>
      <GeneralBtn
        type="secondary"
        onClick={() => {
          lib.logout(token);
          navigate("/");
        }}
      >
        Logout
      </GeneralBtn>

      <GeneralBtn type="danger" onClick={() => lib.deleteAccount(navigate)}>
        Delete
      </GeneralBtn>

      <Link to="/lesson-board" className="instructor__link">
        Lesson Board
      </Link>
      <Link to="/admin-home" className="instructor__link">
        Admin
      </Link>
    </section>
  );
}
