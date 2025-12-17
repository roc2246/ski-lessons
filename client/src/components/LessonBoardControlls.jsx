import { Link } from "react-router-dom";
import GeneralBtn from "./buttons/GeneralBtn";
import * as lib from "../utils/auth-library";

export default function LessonBoardControlls() {
  return (
    <section className="lesson-board__controls">
      <GeneralBtn type="secondary" onclick={() => lib.logout()}>
        Logout
      </GeneralBtn>
      <Link to="/instructor" className="lesson-board__link">
        Back
      </Link>
    </section>
  );
}
