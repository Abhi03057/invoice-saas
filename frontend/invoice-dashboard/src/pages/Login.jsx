import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {

      const res = await api.post("/auth/login", {
        email,
        password
      });

      // save token
      localStorage.setItem("token", res.data.token);

      // redirect to dashboard
      navigate("/dashboard");

    } catch (error) {

      console.error(error);
      alert("Invalid credentials");

    }
  };

  return (

    <div style={{ padding: "40px" }}>

      <h2>Invoice SaaS Login</h2>

      <form onSubmit={handleLogin}>

        <div>
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <br />

        <div>
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <br />

        <button type="submit">
          Login
        </button>

      </form>

    </div>

  );

}

export default Login;