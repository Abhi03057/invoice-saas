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
    setLoading(true); setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials.");
    } finally { setLoading(false); }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-brand">
          <span style={{ fontSize:28, color:"var(--accent)" }}>⬡</span>
          <h1 style={{ fontSize:20, fontWeight:800 }}>InvoiceIQ</h1>
        </div>
        <p style={{ fontSize:12, color:"var(--text-muted)", marginBottom:28, fontFamily:"var(--font-mono)" }}>Sign in to your workspace</p>
        {error && <div style={{ fontSize:13, color:"var(--status-red)", marginBottom:16, padding:"10px 14px", background:"rgba(239,68,68,.08)", borderRadius:6, border:"1px solid rgba(239,68,68,.2)" }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div className="field"><label className="field-label">Email</label><input className="field-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" required /></div>
          <div className="field"><label className="field-label">Password</label><input className="field-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required /></div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop:4, justifyContent:"center", padding:"11px 0" }}>
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>
      </div>
    </div>
  );
}