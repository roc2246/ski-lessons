import { useState } from "react";
import * as lib from "../utils/auth-library"; // assuming your auth-library has a register() function
import { useNavigate, Link } from "react-router-dom"; // for navigation after register
import Field from "../components/Field";
import Back from "../components/buttons/Back";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await lib.register(username, password, isAdmin);
      alert(`${username} registered successfully!`);
      navigate("/"); // go back to login page
    } catch (err) {
      console.error(err);
      alert(err.message || "Registration failed");
    }
  };

  return (
    <main className="new-user">
      <form className="new-user__form" onSubmit={handleSubmit}>
        <h2 className="new-user__form-title">Register New User</h2>

        <Field
          type="username"
          value={username}
          onchange={(e) => setUsername(e.target.value)}
        />

        <Field
          type="password"
          value={password}
          onchange={(e) => setPassword(e.target.value)}
        />

        <Field
          type="checkbox"
          value={""}
          onchange={(e) => setIsAdmin(e.target.checked)}
        />

        <button type="submit" className="btn btn--primary new-user__submit">
          Register
        </button>
      </form>

      <Link to="/" className="new-user__link">
        Back
      </Link>
    </main>
  );
}

export default Register;
