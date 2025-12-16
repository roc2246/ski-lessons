import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as lib from "../utils/auth-library.js";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/instructor");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await lib.login(username, password); // redirects on success
  };

  return (
    <main className="login">
      <h1 className="login__title">Snow Pro App</h1>

      <form className="login__form" onSubmit={handleSubmit}>
        <h2 className="login__form-title">Please log in</h2>

        <div className="login__field">
          <label htmlFor="username" className="login__label">Username</label>
          <input
            type="text"
            id="username"
            className="login__input"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="login__field">
          <label htmlFor="password" className="login__label">Password</label>
          <input
            type="password"
            id="password"
            className="login__input"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn--primary login__submit">
          Login
        </button>
      </form>

      <Link to="/register" className="login__link">Register</Link>
    </main>
  );
}

export default Login;
