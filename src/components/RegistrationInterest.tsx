"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import styles from "../styles/RegistrationInterest.module.css";

export default function RegistrationInterest() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/registration-interest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    setStatus(response.ok ? "success" : "error");
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <Link href="/" className={styles.back}>← NFT Munich</Link>
        <p className={styles.eyebrow}>NFT Munich e.V.</p>
        <h1>Registration</h1>
        <p className={styles.intro}>
          Möchtest du Mitglied werden oder als Spieler teilnehmen? Sende uns deinen Namen und deine E-Mail-Adresse. Wir prüfen deine Anfrage und schicken dir anschließend den passenden Registrierungslink.
        </p>
        <p className={styles.english}>
          Would you like to join the club or register as a player? Send us your name and email address. We will review your request and email you the appropriate registration link.
        </p>

        {status === "success" ? (
          <div className={styles.success}>
            <h2>Vielen Dank / Thank you</h2>
            <p>Wir haben deine Anfrage erhalten und melden uns per E-Mail.</p>
          </div>
        ) : (
          <form onSubmit={submit} className={styles.form}>
            <label>Name<input name="name" required maxLength={150} autoComplete="name" /></label>
            <label>E-Mail / Email<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
            <label>
              Gewünschte Registrierung / Registration type
              <select name="registrationType" required defaultValue="">
                <option value="" disabled>Bitte auswählen / Please select</option>
                <option value="supporter">Supporter / Club member</option>
                <option value="player">Player</option>
                <option value="management-player">Management and Player</option>
              </select>
            </label>
            <label className={styles.honeypot} aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
            {status === "error" && <p className={styles.error}>Die Anfrage konnte nicht gesendet werden. Bitte schreibe an nftmunich@gmail.com.</p>}
            <button disabled={status === "sending"}>{status === "sending" ? "Wird gesendet …" : "Anfrage senden / Send request"}</button>
          </form>
        )}
      </section>
    </main>
  );
}
