"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    try {
      await fetch("/api/auth/request-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: "420px", background: "#fff", borderRadius: "8px", padding: "2rem", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
        <h1 style={{ color: "#1a3a6b", marginBottom: "0.5rem", fontSize: "1.5rem" }}>Sign In</h1>
        <p style={{ color: "#555", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
          Enter your approved NFT Munich email address to receive a login link.
        </p>

        {status === "sent" ? (
          <div style={{ background: "#f0f7f0", border: "1px solid #c3e6cb", borderRadius: "4px", padding: "1rem" }}>
            <strong style={{ color: "#1a3a6b" }}>Check your inbox.</strong>
            <p style={{ color: "#555", marginTop: "0.5rem", fontSize: "0.9rem" }}>
              If your email is registered with NFT Munich, you will receive a login link shortly. The link is valid for 30 minutes.
            </p>
            <p style={{ color: "#555", marginTop: "0.5rem", fontSize: "0.9rem" }}>
              If you do not see the email, please check your <strong>spam or junk folder</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="email" style={{ display: "block", color: "#1a3a6b", fontWeight: "600", marginBottom: "0.4rem" }}>
              Email Address <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={status === "loading"}
              style={{ width: "100%", padding: "0.6rem 0.75rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "1rem", boxSizing: "border-box" }}
            />
            {emailError && <p style={{ color: "red", fontSize: "0.85rem", marginTop: "0.3rem" }}>{emailError}</p>}
            {status === "error" && <p style={{ color: "red", fontSize: "0.85rem", marginTop: "0.3rem" }}>A network error occurred. Please try again.</p>}
            <button
              type="submit"
              disabled={status === "loading"}
              style={{ marginTop: "1rem", width: "100%", padding: "0.75rem", background: "#1a3a6b", color: "#fff", border: "none", borderRadius: "4px", fontSize: "1rem", fontWeight: "600", cursor: status === "loading" ? "not-allowed" : "pointer", opacity: status === "loading" ? 0.7 : 1 }}
            >
              {status === "loading" ? "Sending…" : "Send Login Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
