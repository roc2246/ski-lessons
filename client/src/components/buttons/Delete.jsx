import * as lib from "../../utils/auth-library";
import { useNavigate} from "react-router-dom";
export default function Delete() {
  const navigate = useNavigate();

  return (
    <button
      className="btn btn--danger instructor__btn"
      onClick={() => lib.deleteAccount(navigate)}
    >
      Delete Account
    </button>
  );
}
