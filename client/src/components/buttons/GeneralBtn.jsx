import { useNavigate, Link } from "react-router-dom";

export default function GeneralBtn({type, onclick, children}) {
  const navigate = useNavigate();

  return (
    <button
      className={`btn btn--${type} instructor__btn`}
      onClick={() => {
        onclick
        type==="secondary" && navigate("/");
      }}
    >
      {children}
    </button>
  );
}
