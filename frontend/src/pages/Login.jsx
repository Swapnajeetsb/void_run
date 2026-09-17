import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, LockKeyhole, LogIn, Shield } from "lucide-react";
import LogoBar from "../components/LogoBar";
import { api } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("voidrun_token", data.token);
      localStorage.setItem("voidrun_user", JSON.stringify(data.user));
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="site dark-page auth-page">
      <LogoBar />
      <div className="auth-wrap">
        <motion.form className="auth-card" onSubmit={submit} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }}>
          <div className="auth-icon"><Shield/></div>
          <div className="eyebrow">SECURE ACCESS</div>
          <h1>Coordinator / Admin</h1>
          <p>Only authorized event staff can log in here.</p>
          {error && <div className="error-box">{error}</div>}
          <label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="staff@example.com"/></label>
          <label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••"/></label>
          <button className="btn btn-primary full" disabled={loading}><LogIn/> {loading ? "Signing in..." : "Sign In"}</button>
          <Link to="/" className="back-link centered"><ArrowLeft size={16}/> Back to public site</Link>
        </motion.form>
      </div>
    </div>
  );
}
