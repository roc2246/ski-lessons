import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import * as lib from "../utils/auth-library"; // assuming your auth-library has a register() function
import { useNavigate, Link } from "react-router-dom"; // for navigation after register
import Field from "../components/Field";
import SubmitBtn from "../components/buttons/SubmitBtn";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await lib.register(username, password, isAdmin);
      navigate("/"); // go back to login page
    } catch (err) {
      console.error(err);
      alert((err as { message?: string })?.message || "Registration failed");
    }
  };

  return (
    <main className="new-user">
      <form className="new-user__form" onSubmit={handleSubmit}>
        <h2 className="new-user__form-title">Register New User</h2>

        <Field
          type="username"
          value={username}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
        />

        <Field
          type="password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        />

        <Field
          type="checkbox"
          value={isAdmin}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setIsAdmin(e.target.checked)}
        />

        <SubmitBtn type="new-user">Register</SubmitBtn>
      </form>

      <Link to="/" className="new-user__link">
        Back
      </Link>
    </main>
  );
}

export default Register;
