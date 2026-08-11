"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import LoginGate from "./LoginGate";
import styles from "../styles/MembershipRegistration.module.css";

type Language = "de" | "en";
type RouteType = "member" | "player" | "management";
type UploadState = { photo?: string; id?: string; insurance?: string };

const copy = {
  de: {
    eyebrow: "NFT Munich e.V.",
    title: "Registrierung & Mitgliedschaft",
    intro: "Wähle die passende Anmeldung. Du kannst die Sprache jederzeit wechseln.",
    member: "Vereinsmitglied",
    memberText: "Für alle, die NFT Munich e.V. unterstützen und Mitglied werden möchten.",
    memberFee: "10 € pro Jahr",
    player: "Player",
    playerText: "Nur für Spieler mit einer bereits freigegebenen E-Mail-Adresse.",
    playerFee: "50 € für Studierende/Azubis · 100 € für Sonstige · + 10 € Mitgliedsgebühr",
    management: "Management and Player",
    managementText: "Für freigegebene Personen, die spielen und zugleich eine Vereinsaufgabe übernehmen.",
    managementFee: "50 € für Studierende/Azubis · 100 € für Sonstige · + 10 € Mitgliedsgebühr",
    choose: "Auswählen",
    back: "Zurück zur Auswahl",
    personal: "Persönliche Angaben",
    firstName: "Vorname",
    lastName: "Nachname",
    birthDate: "Geburtsdatum",
    street: "Straße und Hausnummer",
    postalCode: "PLZ",
    city: "Ort",
    email: "E-Mail-Adresse",
    phone: "Telefon / WhatsApp",
    status: "Beitragskategorie",
    student: "Student/in oder Auszubildende/r",
    other: "Sonstige/r",
    special: "Besonderer Härtefall – persönliche Prüfung durch den Vorstand erforderlich",
    playerDetails: "Spielerangaben",
    position: "Spielposition",
    emergencyName: "Notfallkontakt – Name",
    emergencyPhone: "Notfallkontakt – Telefonnummer",
    managementDetails: "Managementangaben",
    role: "Aufgabe / Funktion im Verein",
    responsibility: "Kurze Beschreibung der Verantwortung",
    documents: "Dokumente",
    photo: "Aktuelles Foto",
    identity: "Amtlicher Identitätsnachweis",
    insurance: "Versicherungsnachweis",
    uploadHelp: "PDF, JPG oder PNG, maximal 2 MB. Bitte nur die erforderlichen Unterlagen hochladen.",
    payment: "Beitrag & Zahlung",
    paymentText: "Nach dem Absenden erhältst du die endgültige Zahlungsinformation. Bankverbindung: IBAN 1234XXXX. Bitte noch keine Zahlung leisten, falls du einen Härtefall beantragst.",
    declaration: "Erklärungen",
    truth: "Meine Angaben sind vollständig und richtig.",
    statutes: "Ich erkenne die Satzung von NFT Munich e.V. an.",
    privacy: "Ich habe die Datenschutzerklärung gelesen und stimme der Verarbeitung meiner Angaben und hochgeladenen Dokumente für das Aufnahmeverfahren zu.",
    submit: "Antrag verbindlich absenden",
    sending: "Wird gesendet …",
    success: "Vielen Dank. Dein Antrag wurde übermittelt. Wir melden uns per E-Mail.",
    error: "Der Antrag konnte nicht übermittelt werden. Bitte versuche es erneut oder schreibe an nftmunich@gmail.com.",
    loginTitle: "Freigegebene E-Mail erforderlich",
    notManager: "Diese Anmeldung ist nur für freigegebene Management-Mitglieder verfügbar.",
    required: "Pflichtfeld",
  },
  en: {
    eyebrow: "NFT Munich e.V.",
    title: "Registration & Membership",
    intro: "Choose the registration that applies to you. You can change the language at any time.",
    member: "Club member",
    memberText: "For anyone who wants to support and become a member of NFT Munich e.V.",
    memberFee: "€10 per year",
    player: "Player",
    playerText: "Only for players whose email address has already been approved.",
    playerFee: "€50 for students/trainees · €100 for others · + €10 membership fee",
    management: "Management and Player",
    managementText: "For approved people who play and also hold a club responsibility.",
    managementFee: "€50 for students/trainees · €100 for others · + €10 membership fee",
    choose: "Select",
    back: "Back to selection",
    personal: "Personal details",
    firstName: "First name",
    lastName: "Last name",
    birthDate: "Date of birth",
    street: "Street and house number",
    postalCode: "Postal code",
    city: "City",
    email: "Email address",
    phone: "Phone / WhatsApp",
    status: "Fee category",
    student: "Student or trainee (Azubi)",
    other: "Other",
    special: "Special hardship case – individual review by the board required",
    playerDetails: "Player details",
    position: "Playing position",
    emergencyName: "Emergency contact – name",
    emergencyPhone: "Emergency contact – phone number",
    managementDetails: "Management details",
    role: "Club role / function",
    responsibility: "Short description of responsibilities",
    documents: "Documents",
    photo: "Current photo",
    identity: "Official proof of identity",
    insurance: "Proof of insurance",
    uploadHelp: "PDF, JPG or PNG, maximum 2 MB. Upload only the documents requested.",
    payment: "Fee & payment",
    paymentText: "After submitting, you will receive the final payment information. Bank account: IBAN 1234XXXX. Do not pay yet if you request a hardship review.",
    declaration: "Declarations",
    truth: "The information I have provided is complete and correct.",
    statutes: "I accept the statutes (Satzung) of NFT Munich e.V.",
    privacy: "I have read the privacy policy and consent to the processing of my information and uploaded documents for the application procedure.",
    submit: "Submit binding application",
    sending: "Submitting …",
    success: "Thank you. Your application has been submitted. We will contact you by email.",
    error: "The application could not be submitted. Please try again or contact nftmunich@gmail.com.",
    loginTitle: "Approved email required",
    notManager: "This registration is only available to approved management members.",
    required: "Required",
  },
} as const;

const routes = ["member", "player", "management"] as const;

export default function MembershipRegistration() {
  const [language, setLanguage] = useState<Language>("de");
  const [selected, setSelected] = useState<RouteType | null>(null);
  const [uploads, setUploads] = useState<UploadState>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const { user, loading } = useAuth();
  const t = copy[language];

  const fee = useMemo(() => selected ? t[`${selected}Fee` as keyof typeof t] : "", [selected, t]);

  async function uploadDocument(file: File, fieldType: keyof UploadState, fullName: string) {
    setUploading(fieldType);
    const body = new FormData();
    body.append("file", file);
    body.append("fieldType", fieldType);
    body.append("fileIndex", "0");
    body.append("fullName", fullName || "applicant");
    const response = await fetch("/api/upload-documents", { method: "POST", body });
    const result = await response.json();
    if (!response.ok || !result.fileUrl) throw new Error(result.message || "Upload failed");
    setUploads((current) => ({ ...current, [fieldType]: result.fileUrl }));
    setUploading(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch("/api/membership-registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, ...uploads, registrationType: selected, language }),
    });
    setStatus(response.ok ? "success" : "error");
    if (response.ok) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const protectedRoute = selected === "player" || selected === "management";
  const managementAllowed = user?.role === "admin" || user?.role === "super_admin";

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
        </div>
        <div className={styles.language} role="group" aria-label="Language">
          <button className={language === "de" ? styles.active : ""} onClick={() => setLanguage("de")} type="button">DE</button>
          <button className={language === "en" ? styles.active : ""} onClick={() => setLanguage("en")} type="button">EN</button>
        </div>
      </section>

      {!selected && (
        <section className={styles.cards} aria-label={t.title}>
          {routes.map((route) => (
            <article className={styles.card} key={route}>
              <div className={styles.cardNumber}>0{routes.indexOf(route) + 1}</div>
              <h2>{t[route]}</h2>
              <p>{t[`${route}Text` as keyof typeof t]}</p>
              <strong>{t[`${route}Fee` as keyof typeof t]}</strong>
              <button onClick={() => setSelected(route)} type="button">{t.choose}</button>
            </article>
          ))}
        </section>
      )}

      {selected && (
        <section className={styles.formShell}>
          <button className={styles.back} type="button" onClick={() => { setSelected(null); setStatus("idle"); }}>← {t.back}</button>
          <div className={styles.formHeading}>
            <div><span>01</span><h2>{t[selected]}</h2></div>
            <p>{fee}</p>
          </div>

          {status === "success" ? <div className={styles.success}>{t.success}</div> : (
            <>
              {protectedRoute && !loading && !user && <div><h3>{t.loginTitle}</h3><LoginGate /></div>}
              {selected === "management" && user && !managementAllowed && <div className={styles.notice}>{t.notManager}</div>}
              {(!protectedRoute || (user && (selected !== "management" || managementAllowed))) && (
                <form onSubmit={submit} className={styles.form}>
                  <fieldset>
                    <legend><span>01</span>{t.personal}</legend>
                    <div className={styles.grid}>
                      <Field label={t.firstName} name="firstName" />
                      <Field label={t.lastName} name="lastName" />
                      <Field label={t.birthDate} name="birthDate" type="date" />
                      <Field label={t.email} name="email" type="email" defaultValue={user?.email} readOnly={Boolean(user)} />
                      <Field label={t.street} name="street" wide />
                      <Field label={t.postalCode} name="postalCode" />
                      <Field label={t.city} name="city" />
                      <Field label={t.phone} name="phone" type="tel" wide />
                    </div>
                    <label className={styles.selectLabel}>{t.status}<select name="feeCategory" required defaultValue=""><option value="" disabled>—</option><option value="student">{t.student}</option><option value="other">{t.other}</option><option value="hardship">{t.special}</option></select></label>
                  </fieldset>

                  {protectedRoute && <fieldset><legend><span>02</span>{t.playerDetails}</legend><div className={styles.grid}><Field label={t.position} name="position" /><Field label={t.emergencyName} name="emergencyName" /><Field label={t.emergencyPhone} name="emergencyPhone" type="tel" /></div></fieldset>}
                  {selected === "management" && <fieldset><legend><span>03</span>{t.managementDetails}</legend><div className={styles.grid}><Field label={t.role} name="managementRole" /><Field label={t.responsibility} name="responsibility" wide /></div></fieldset>}

                  <fieldset>
                    <legend><span>{selected === "member" ? "02" : selected === "player" ? "03" : "04"}</span>{t.documents}</legend>
                    <p className={styles.help}>{t.uploadHelp}</p>
                    <div className={styles.uploadGrid}>
                      <Upload label={t.photo} name="photo" busy={uploading === "photo"} done={Boolean(uploads.photo)} onFile={(file, form) => uploadDocument(file, "photo", `${form.get("firstName") || ""} ${form.get("lastName") || ""}`)} />
                      <Upload label={t.identity} name="id" busy={uploading === "id"} done={Boolean(uploads.id)} onFile={(file, form) => uploadDocument(file, "id", `${form.get("firstName") || ""} ${form.get("lastName") || ""}`)} />
                      {protectedRoute && <Upload label={t.insurance} name="insurance" busy={uploading === "insurance"} done={Boolean(uploads.insurance)} onFile={(file, form) => uploadDocument(file, "insurance", `${form.get("firstName") || ""} ${form.get("lastName") || ""}`)} />}
                    </div>
                  </fieldset>

                  <fieldset><legend><span>{selected === "member" ? "03" : selected === "player" ? "04" : "05"}</span>{t.payment}</legend><div className={styles.payment}><strong>{fee}</strong><p>{t.paymentText}</p></div></fieldset>
                  <fieldset><legend><span>{selected === "member" ? "04" : selected === "player" ? "05" : "06"}</span>{t.declaration}</legend><div className={styles.checks}><Check name="truth" label={t.truth} /><Check name="statutes" label={<>{t.statutes} <Link href="/satzung.pdf" target="_blank">Satzung ↗</Link></>} /><Check name="privacy" label={<>{t.privacy} <Link href="/privacy-policy" target="_blank">Privacy ↗</Link></>} /></div></fieldset>
                  {status === "error" && <p className={styles.error}>{t.error}</p>}
                  <button className={styles.submit} disabled={status === "sending" || Boolean(uploading)}>{status === "sending" ? t.sending : t.submit}</button>
                </form>
              )}
            </>
          )}
        </section>
      )}
    </main>
  );
}

function Field({ label, name, type = "text", wide, defaultValue, readOnly }: { label: string; name: string; type?: string; wide?: boolean; defaultValue?: string; readOnly?: boolean }) {
  return <label className={wide ? styles.wide : ""}>{label}<input name={name} type={type} required defaultValue={defaultValue} readOnly={readOnly} /></label>;
}

function Upload({ label, name, busy, done, onFile }: { label: string; name: string; busy: boolean; done: boolean; onFile: (file: File, form: FormData) => Promise<void> }) {
  return <label className={styles.upload}>{label}<input name={`${name}File`} type="file" accept=".pdf,.jpg,.jpeg,.png" required={!done} disabled={busy} onChange={async (event) => { const file = event.target.files?.[0]; if (file) await onFile(file, new FormData(event.currentTarget.form || undefined)); }} /><span>{busy ? "Uploading …" : done ? "✓ Uploaded" : "PDF / JPG / PNG"}</span></label>;
}

function Check({ name, label }: { name: string; label: React.ReactNode }) {
  return <label><input type="checkbox" name={name} value="accepted" required /><span>{label}</span></label>;
}
