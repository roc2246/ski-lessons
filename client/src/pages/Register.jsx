import { useState } from "react";
import * as lib from "../utils/auth-library"; // assuming your auth-library has a register() function
import { useNavigate } from "react-router-dom"; // for navigation after register

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

        <div className="new-user__field">
          <label htmlFor="new-username" className="new-user__label">Username</label>
          <input
            type="text"
            name="username"
            id="new-username"
            className="new-user__input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="new-user__field">
          <label htmlFor="new-password" className="new-user__label">Password</label>
          <input
            type="password"
            name="password"
            id="new-password"
            className="new-user__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="new-user__field">
          <label htmlFor="admin" className="new-user__label">Admin</label>
          <input
            type="checkbox"
            name="admin"
            id="admin"
            className="new-user__input"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />
        </div>

        <button type="submit" className="btn btn--primary new-user__submit">
          Register
        </button>
      </form>

      <button
        className="new-user__link"
        onClick={() => navigate("/")} // go back to login
      >
        Back
      </button>
    </main>
  );
}

export default Register;
