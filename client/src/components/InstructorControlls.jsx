import { Link } from "react-router-dom";
import GeneralBtn from "./buttons/GeneralBtn";
import * as lib from "../utils/auth-library";

export default function InstructorControlls() {
  const token = localStorage.getItem("token"); // ✅ always grab fresh token

  return (
    <section className="instructor__controls">
      <h1 className="instructor__title">Logged In</h1>

      <GeneralBtn
        type="secondary"
        onClick={async () => {
          await lib.logout(token); // ✅ uses token from localStorage
          window.location.href = "/"; // ✅ hard reload clears app state
        }}
      >
        Logout
      </GeneralBtn>

      <GeneralBtn type="danger" onClick={() => lib.selfDeleteFrontend()}>
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
