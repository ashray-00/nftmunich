"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import styles from "../styles/RegistrationInterest.module.css";

export default function RegistrationInterest() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [requestResult, setRequestResult] = useState<"link-sent" | "pending">("link-sent");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/registration-interest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const result = await response.json().catch(() => ({}));
    if (response.ok) {
      setRequestResult(result.result === "pending" ? "pending" : "link-sent");
      setStatus("success");
    } else {
      setStatus("error");
    }
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
          <p className="mt-2">1. Send your request and check your email.</p>
          <p>2. Club members receive the appropriate form link. Player requests are checked against our approved-player list first.</p>
          <p>3. The full form explains the fee and payment process for your selected category. Detailed payment information is also emailed after submission.</p>
        </div>

        {status === "success" ? (
          <div className={styles.success}>
            <h2>Vielen Dank / Thank you</h2>
            {requestResult === "pending" ? (
              <>
                <p>Deine Anfrage wurde erhalten. Deine Spieler-E-Mail muss zuerst freigeschaltet werden. Du erhältst eine E-Mail, sobald du fortfahren kannst.</p>
                <p>Your request was received. Your player email must be approved first. You will receive an email when you can continue.</p>
              </>
            ) : (
              <>
                <p>Der passende Registrierungslink wurde automatisch an deine E-Mail-Adresse gesendet.</p>
                <p>Your registration link has been emailed to you automatically. Please also check your spam folder.</p>
              </>
            )}
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
