import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as lib from "../utils/auth-library.js";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/instructor");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await lib.login(username, password); // returns token on success
      if (data?.token) {
        localStorage.setItem("token", data.token);
        navigate("/instructor"); // SPA navigation
      }
    } catch (err) {
      console.error("Login failed", err);
      alert("Login failed. Check your credentials.");
    }
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
