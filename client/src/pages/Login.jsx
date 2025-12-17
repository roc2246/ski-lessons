import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Field from "../components/Field.jsx";
import LoginBtn from "../components/buttons/LoginBtn.jsx";
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

        <Field type="username" value={username} onchange={(e) => setUsername(e.target.value)} />
        <Field type="password" value={password} onchange={(e) => setPassword(e.target.value)} />

        <LoginBtn />
      </form>

      <Link to="/register" className="login__link">
        Register
      </Link>
    </main>
  );
}

export default Login;
