"use client";

import { useState } from "react";
import styles from "../styles/TournamentRegistration.module.css";

type LoginGateProps = {
  coreMember?: boolean;
  language?: "de" | "en";
};

export default function LoginGate({ coreMember = false, language = "en" }: LoginGateProps) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  const handleSubmit = async () => {
    setEmailError("");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError(language === "de" ? "Bitte gib eine gültige E-Mail-Adresse ein." : "Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    try {
      localStorage.setItem("redirectAfterLogin", window.location.href);
      const response = await fetch("/api/auth/request-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: coreMember ? "core-member" : undefined }),
      });
      if (response.status === 403 && coreMember) {
        setStatus("error");
        setEmailError(language === "de"
          ? "Diese E-Mail-Adresse ist nicht registriert. Bitte kontaktiere NFT Munich unter nftmunich@gmail.com."
          : "This email address is not registered. Please contact NFT Munich at nftmunich@gmail.com.");
        return;
      }
      if (!response.ok) throw new Error("Login link request failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className={styles.infoBox}>
        <p><strong>{language === "de" ? "Prüfe dein E-Mail-Postfach." : "Check your inbox."}</strong></p>
        <p>{coreMember
          ? (language === "de" ? "Dein Zugangslink zum Core-Member-Formular wurde per E-Mail gesendet. Er ist 30 Minuten gültig." : "Your access link to the Core Member form has been sent by email. It is valid for 30 minutes.")
          : "If your email is registered with NFT Munich, you will receive a login link shortly. The link is valid for 30 minutes."}</p>
        <p style={{ marginTop: "0.5rem" }}>{language === "de" ? "Prüfe bitte auch deinen Spam-Ordner." : "Please also check your spam or junk folder."}</p>
      </div>
    );
  }

  return (
    <div className={styles.formField}>
      <div className={styles.infoBox} style={{ marginBottom: "1rem" }}>
        <p><strong>{coreMember ? (language === "de" ? "Registrierte E-Mail-Adresse erforderlich" : "Registered email address required") : "Player login required."}</strong></p>
        <p>{coreMember
          ? (language === "de" ? "Gib die E-Mail-Adresse ein, mit der du bereits bei NFT Munich registriert bist." : "Enter the email address you previously used to register with NFT Munich.")
          : "To register as a player, you need to log in with your approved NFT Munich email address."}</p>
      </div>
      <div>
        <label htmlFor="login-email" className={styles.fieldLabel}>
          {language === "de" ? "E-Mail-Adresse" : "Email address"} <span className={styles.requiredAsterisk}>*</span>
        </label>
        <input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="your@email.com" className={styles.inputField} disabled={status === "loading"} />
        {emailError && <span className={styles.errorText}>{emailError}</span>}
        {status === "error" && !emailError && <span className={styles.errorText}>{language === "de" ? "Ein Netzwerkfehler ist aufgetreten. Bitte versuche es erneut." : "A network error occurred. Please try again."}</span>}
        <button type="button" onClick={handleSubmit} className={styles.submitButton} disabled={status === "loading"} style={{ marginTop: "0.75rem" }}>
          {status === "loading" ? (language === "de" ? "Wird gesendet…" : "Sending…") : coreMember ? (language === "de" ? "Zugangslink senden" : "Send access link") : "Send Login Link"}
        </button>
      </div>
    </div>
  );
}
