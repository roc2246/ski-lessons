import * as lib from "../../utils/auth-library";
import { useNavigate, Link } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  return (
    <button
      className="btn btn--secondary instructor__btn"
      onClick={() => {
        lib.logout();
        navigate("/");
      }}
    >
      Logout
    </button>
  );
}
