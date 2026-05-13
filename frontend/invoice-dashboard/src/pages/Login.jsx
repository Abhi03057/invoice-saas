import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../components/Layout.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-brand">
          <div className="logo-mark" style={{ width: 36, height: 36, fontSize: 20 }}>B</div>
          <span style={{ fontSize: 22, fontWeight: 600, color: "var(--navy)", fontFamily: "var(--font-serif)" }}>
            BillSync
          </span>
        </div>
        <p className="login-tagline">"Your invoices, processed."</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: error ? 16 : 0 }}
        >
          <div className="field">
            <label className="field-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              className="field-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="field-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ marginTop: 8, padding: "12px 0", width: "100%", justifyContent: "center" }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="card-fine-print" style={{ marginTop: 24 }}>
          Secure authentication · BillSync v1.0
        </div>
      </div>
    </div>
  );
}