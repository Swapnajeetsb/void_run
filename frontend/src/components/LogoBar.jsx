import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, LogIn } from "lucide-react";

export default function LogoBar({ dark = true }) {
  return (
    <header className={`logo-bar ${dark ? "dark" : ""}`}>
      <Link to="/" className="brand">
        <img src="/assets/aitrc-logo.png" alt="AITRC" />
        <div className="brand-copy">
          <strong>VOID RUN</strong>
          <span>CSE DEPARTMENT COMPETITION</span>
        </div>
      </Link>

      <div className="logo-set">
        <img src="/assets/aces-logo.png" alt="ACES" />
        <img src="/assets/cse-logo.png" alt="CSE" />
        <Link to="/login" className="nav-login"><LogIn size={16}/> Coordinator / Admin</Link>
      </div>
    </header>
  );
}
