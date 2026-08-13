"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import styles from "../styles/RegistrationInterest.module.css";

export default function RegistrationInterest() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [requestResult, setRequestResult] = useState<"link-sent" | "pending">("link-sent");
  const [category, setCategory] = useState<"" | "supporter" | "core">("");

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
        <p className={styles.intro}>Wähle Member / Supporter oder Core Member.</p>
        <p className={styles.english}>Choose Member / Supporter or Core Member.</p>

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
              Kategorie / Category
              <select required value={category} onChange={(event) => setCategory(event.target.value as "" | "supporter" | "core")}>
                <option value="" disabled>Bitte auswählen / Please select</option>
                <option value="supporter">Member / Supporter</option>
                <option value="core">Core Member</option>
              </select>
            </label>
            {category === "supporter" && <input type="hidden" name="registrationType" value="supporter" />}
            {category === "core" && <label>Core Member type<select name="registrationType" required defaultValue=""><option value="" disabled>Please select</option><option value="player">Player</option><option value="management-player">Player + Management</option></select></label>}
            <label className={styles.honeypot} aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
            {status === "error" && <p className={styles.error}>Die Anfrage konnte nicht gesendet werden. Bitte schreibe an nftmunich@gmail.com.</p>}
            <button disabled={status === "sending"}>{status === "sending" ? "Wird gesendet …" : "Anfrage senden / Send request"}</button>
          </form>
        )}
      </section>
    </main>
  );
}
