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
          Möchtest du Mitglied werden oder als Spieler teilnehmen? Wähle deine Kategorie und du erhältst den passenden Registrierungslink automatisch per E-Mail.
        </p>
        <p className={styles.english}>
          Choose your category and we will automatically email you the appropriate registration link.
        </p>

        <div className="my-7 rounded-xl border border-blue-900/10 bg-blue-50/80 p-5 text-sm leading-6 text-slate-700">
          <strong className="block text-base text-bavarian-blue">What happens next?</strong>
          <p className="mt-2">1. Submit this request and check your email for your personal registration link.</p>
          <p>2. Complete the full form. Your payment details will be shown there and emailed to you after submission.</p>
          <p className="mt-3 border-t border-blue-900/10 pt-3 font-semibold text-bavarian-blue">Club member: €10 · Player / Management + Player: €60 for students or trainees, €110 for others.</p>
        </div>

        {status === "success" ? (
          <div className={styles.success}>
            <h2>Vielen Dank / Thank you</h2>
            <p>Der passende Registrierungslink wurde automatisch an deine E-Mail-Adresse gesendet.</p>
            <p>Your registration link has been emailed to you automatically. Please also check your spam folder.</p>
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
