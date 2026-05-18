"use client";

import { useState } from "react";
import styles from "../styles/TournamentRegistration.module.css";

export default function LoginGate() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  const handleSubmit = async () => {
    setEmailError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    try {
      localStorage.setItem("redirectAfterLogin", window.location.href);
      await fetch("/api/auth/request-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Always show success — mirrors the backend's no-enumeration response
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className={styles.infoBox}>
        <p><strong>Check your inbox.</strong></p>
        <p>If your email is registered with NFT Munich, you will receive a login link shortly. The link is valid for 30 minutes.</p>
        <p style={{ marginTop: "0.5rem" }}>If you do not see the email, please check your <strong>spam or junk folder</strong>.</p>
      </div>
    );
  }

  return (
    <div className={styles.formField}>
      <div className={styles.infoBox} style={{ marginBottom: "1rem" }}>
        <p><strong>Player login required.</strong></p>
        <p>To register as a player, you need to log in with your approved NFT Munich email address.</p>
      </div>
      <div>
        <label htmlFor="login-email" className={styles.fieldLabel}>
          Email Address <span className={styles.requiredAsterisk}>*</span>
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className={styles.inputField}
          disabled={status === "loading"}
        />
        {emailError && <span className={styles.errorText}>{emailError}</span>}
        {status === "error" && (
          <span className={styles.errorText}>A network error occurred. Please try again.</span>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          className={styles.submitButton}
          disabled={status === "loading"}
          style={{ marginTop: "0.75rem" }}
        >
          {status === "loading" ? "Sending…" : "Send Login Link"}
        </button>
      </div>
    </div>
  );
}
