"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import LoginGate from "./LoginGate";
import styles from "../styles/MembershipRegistration.module.css";

type Language = "de" | "en";
type RouteType = "member" | "player" | "management";
type FeeCategory = "student" | "other" | "hardship";
type UploadState = { photo?: string; id?: string; insurance?: string };

type ClubSettings = { clubName: string; accountHolder: string; iban: string; memberFee: string; playerStudentFee: string; playerOtherFee: string };
const DEFAULT_CLUB_SETTINGS: ClubSettings = { clubName: "NFT Munich e.V.", accountHolder: "NFT Munich e.V.", iban: "1234XXXX", memberFee: "10", playerStudentFee: "50", playerOtherFee: "100" };

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
    playerFee: "60 € gesamt – Studierende/Azubis (50 € + 10 € Mitgliedsgebühr) · 110 € gesamt – Sonstige (100 € + 10 € Mitgliedsgebühr)",
    management: "Management and Player",
    managementText: "Für freigegebene Personen, die spielen und zugleich eine Vereinsaufgabe übernehmen.",
    managementFee: "60 € gesamt – Studierende/Azubis (50 € + 10 € Mitgliedsgebühr) · 110 € gesamt – Sonstige (100 € + 10 € Mitgliedsgebühr)",
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
    transferNow: "Bitte überweise nach dem Absenden den unten angegebenen Betrag.",
    chooseFeeFirst: "Wähle oben deinen Spielerbeitrag aus. Danach erscheint hier der genaue Gesamtbetrag.",
    hardshipPayment: "Bitte noch nichts überweisen. Der Vorstand prüft deinen Härtefall und informiert dich persönlich.",
    total: "Zu zahlender Gesamtbetrag",
    accountHolder: "Kontoinhaber",
    paymentReference: "Verwendungszweck",
    paymentReferenceValue: "Mitgliedschaft – Vorname Nachname",
    feeChoice: "Welcher Spielerbeitrag gilt für dich?",
    studentTotal: "Studierende / Azubis – 60 € gesamt",
    otherTotal: "Sonstige – 110 € gesamt",
    declaration: "Erklärungen",
    truth: "Meine Angaben sind vollständig und richtig.",
    statutes: "Ich erkenne die Satzung von NFT Munich e.V. an.",
    privacy: "Ich habe die Datenschutzerklärung gelesen und stimme der Verarbeitung meiner Angaben und hochgeladenen Dokumente für das Aufnahmeverfahren zu.",
    submit: "Antrag verbindlich absenden",
    sending: "Wird gesendet …",
    successTitle: "Vielen Dank für deine Anmeldung",
    successEmail: "Eine Bestätigung mit diesen Zahlungsangaben wurde an deine E-Mail-Adresse gesendet.",
    emailWarning: "Dein Antrag wurde gespeichert, aber die Bestätigungs-E-Mail konnte nicht gesendet werden. Bitte speichere die Zahlungsangaben auf dieser Seite.",
    error: "Der Antrag konnte nicht übermittelt werden. Bitte versuche es erneut oder schreibe an nftmunich@gmail.com.",
    uploadError: "Das Dokument konnte nicht hochgeladen werden. Bitte prüfe Dateityp und Dateigröße und versuche es erneut.",
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
    playerFee: "€60 total – students/trainees (€50 + €10 membership fee) · €110 total – others (€100 + €10 membership fee)",
    management: "Management and Player",
    managementText: "For approved people who play and also hold a club responsibility.",
    managementFee: "€60 total – students/trainees (€50 + €10 membership fee) · €110 total – others (€100 + €10 membership fee)",
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
    transferNow: "Please transfer the amount shown below after submitting.",
    chooseFeeFirst: "Select your player fee above. Your exact total will then appear here.",
    hardshipPayment: "Please do not transfer anything yet. The board will review your hardship request and contact you personally.",
    total: "Total amount to pay",
    accountHolder: "Account holder",
    paymentReference: "Payment reference",
    paymentReferenceValue: "Membership – First name Last name",
    feeChoice: "Which player fee applies to you?",
    studentTotal: "Students / trainees – €60 total",
    otherTotal: "Others – €110 total",
    declaration: "Declarations",
    truth: "The information I have provided is complete and correct.",
    statutes: "I accept the statutes (Satzung) of NFT Munich e.V.",
    privacy: "I have read the privacy policy and consent to the processing of my information and uploaded documents for the application procedure.",
    submit: "Submit binding application",
    sending: "Submitting …",
    successTitle: "Thank you for your registration",
    successEmail: "A confirmation containing these payment details has been sent to your email address.",
    emailWarning: "Your application was saved, but the confirmation email could not be sent. Please save the payment details shown on this page.",
    error: "The application could not be submitted. Please try again or contact nftmunich@gmail.com.",
    uploadError: "The document could not be uploaded. Check the file type and size, then try again.",
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
  const [feeCategory, setFeeCategory] = useState<FeeCategory | null>(null);
  const [applicationId, setApplicationId] = useState("");
  const [confirmationSent, setConfirmationSent] = useState(true);
  const [clubSettings, setClubSettings] = useState<ClubSettings>(DEFAULT_CLUB_SETTINGS);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadFailed, setUploadFailed] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const { user, loading } = useAuth();
  const t = copy[language];

  useEffect(() => {
    const requestedType = new URLSearchParams(window.location.search).get("type");
    const typeMap: Record<string, RouteType> = {
      member: "member",
      player: "player",
      management: "management",
    };
    const route = requestedType ? typeMap[requestedType] : undefined;
    if (route) {
      setSelected(route);
      setFeeCategory(route === "member" ? "other" : null);
    }
  }, []);

  useEffect(() => {
    fetch("/api/club-settings")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (data?.settings) setClubSettings({ ...DEFAULT_CLUB_SETTINGS, ...data.settings }); })
      .catch(() => undefined);
  }, []);

  const memberFee = Number(clubSettings.memberFee) || 0;
  const studentTotal = memberFee + (Number(clubSettings.playerStudentFee) || 0);
  const otherTotal = memberFee + (Number(clubSettings.playerOtherFee) || 0);
  const feeLines = (route: RouteType) => route === "member"
    ? [language === "de" ? `${memberFee} € pro Jahr` : `€${memberFee} per year`]
    : language === "de"
      ? [`${studentTotal} € gesamt – Studierende/Azubis`, `${otherTotal} € gesamt – Sonstige`]
      : [`€${studentTotal} total – students/trainees`, `€${otherTotal} total – others`];
  const fee = selected ? feeLines(selected).join(" · ") : "";
  const amount = selected === "member" ? memberFee : feeCategory === "student" ? studentTotal : feeCategory === "other" ? otherTotal : null;
  const categoryLabel = selected ? t[selected] : "";

  async function uploadDocument(file: File, fieldType: keyof UploadState, fullName: string, email: string) {
    setUploading(fieldType);
    setUploadFailed(false);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("fieldType", fieldType);
      body.append("fileIndex", "0");
      body.append("fullName", fullName || "applicant");
      body.append("email", email || "");
      body.append("registrationType", selected || "member");
      const response = await fetch("/api/upload-documents", { method: "POST", body });
      const result = await response.json();
      if (!response.ok || !result.fileUrl) throw new Error(result.message || "Upload failed");
      setUploads((current) => ({ ...current, [fieldType]: result.fileUrl }));
    } catch {
      setUploadFailed(true);
    } finally {
      setUploading(null);
    }
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
      body: JSON.stringify({ ...payload, ...uploads, feeCategory: selected === "member" ? "standard" : feeCategory, registrationType: selected, language }),
    });
    const result = await response.json().catch(() => ({}));
    if (response.ok) {
      setApplicationId(result.applicationId || "");
      setConfirmationSent(result.emailSent !== false);
    }
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
              <div style={{ display: "grid", gap: ".55rem", margin: "auto 0 1.5rem", fontWeight: 800 }}>
                {feeLines(route).map((line) => (
                  <span key={line} style={{ display: "block", paddingBottom: ".55rem", borderBottom: "1px solid currentColor" }}>
                    {line}
                  </span>
                ))}
              </div>
              <button onClick={() => { setSelected(route); setFeeCategory(route === "member" ? "other" : null); }} type="button">{t.choose}</button>
            </article>
          ))}
        </section>
      )}

      {selected && (
        <section className={styles.formShell}>
          <button className={styles.back} type="button" onClick={() => { setSelected(null); setFeeCategory(null); setApplicationId(""); setConfirmationSent(true); setStatus("idle"); }}>← {t.back}</button>
          <div className={styles.formHeading}>
            <div><span>01</span><h2>{t[selected]}</h2></div>
            <p>{fee}</p>
          </div>

          {status === "success" ? <div className={styles.success}><h3>{t.successTitle}</h3><p>{categoryLabel}{applicationId ? ` · ${applicationId}` : ""}</p><PaymentSummary t={t} amount={amount} hardship={feeCategory === "hardship"} settings={clubSettings} /><p>{confirmationSent ? t.successEmail : t.emailWarning}</p></div> : (
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
                    {protectedRoute && <label className={styles.selectLabel}>{t.feeChoice}<select name="feeCategory" required value={feeCategory || ""} onChange={(event) => setFeeCategory(event.target.value as FeeCategory)}><option value="" disabled>—</option><option value="student">{language === "de" ? `Studierende / Azubis – ${studentTotal} € gesamt` : `Students / trainees – €${studentTotal} total`}</option><option value="other">{language === "de" ? `Sonstige – ${otherTotal} € gesamt` : `Others – €${otherTotal} total`}</option><option value="hardship">{t.special}</option></select></label>}
                  </fieldset>

                  {protectedRoute && <fieldset><legend><span>02</span>{t.playerDetails}</legend><div className={styles.grid}><Field label={t.position} name="position" /><Field label={t.emergencyName} name="emergencyName" /><Field label={t.emergencyPhone} name="emergencyPhone" type="tel" /></div></fieldset>}
                  {selected === "management" && <fieldset><legend><span>03</span>{t.managementDetails}</legend><div className={styles.grid}><Field label={t.role} name="managementRole" /><Field label={t.responsibility} name="responsibility" wide /></div></fieldset>}

                  <fieldset>
                    <legend><span>{selected === "member" ? "02" : selected === "player" ? "03" : "04"}</span>{t.documents}</legend>
                    <p className={styles.help}>{t.uploadHelp}</p>
                    <div className={styles.uploadGrid}>
                      <Upload label={t.photo} name="photo" busy={uploading === "photo"} done={Boolean(uploads.photo)} onFile={(file, form) => uploadDocument(file, "photo", `${form.get("firstName") || ""} ${form.get("lastName") || ""}`, String(form.get("email") || user?.email || ""))} />
                      <Upload label={t.identity} name="id" busy={uploading === "id"} done={Boolean(uploads.id)} onFile={(file, form) => uploadDocument(file, "id", `${form.get("firstName") || ""} ${form.get("lastName") || ""}`, String(form.get("email") || user?.email || ""))} />
                      {protectedRoute && <Upload label={t.insurance} name="insurance" busy={uploading === "insurance"} done={Boolean(uploads.insurance)} onFile={(file, form) => uploadDocument(file, "insurance", `${form.get("firstName") || ""} ${form.get("lastName") || ""}`, String(form.get("email") || user?.email || ""))} />}
                    </div>
                    {uploadFailed && <p className={styles.error}>{t.uploadError}</p>}
                  </fieldset>

                  <fieldset><legend><span>{selected === "member" ? "03" : selected === "player" ? "04" : "05"}</span>{t.payment}</legend><PaymentSummary t={t} amount={amount} hardship={feeCategory === "hardship"} settings={clubSettings} /></fieldset>
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

function PaymentSummary({ t, amount, hardship, settings }: { t: (typeof copy)[Language]; amount: number | null; hardship: boolean; settings: ClubSettings }) {
  return <div className={styles.payment} aria-live="polite">
    <p>{hardship ? t.hardshipPayment : amount === null ? t.chooseFeeFirst : t.transferNow}</p>
    {!hardship && amount !== null && <>
      <strong>{t.total}: {amount} €</strong>
      <dl style={{ display: "grid", gap: ".7rem", margin: "1rem 0 0" }}>
        <BankDetail label={t.accountHolder} value={settings.accountHolder} />
        <BankDetail label="IBAN" value={settings.iban} />
        <BankDetail label={t.paymentReference} value={t.paymentReferenceValue} />
      </dl>
    </>}
  </div>;
}

function BankDetail({ label, value }: { label: string; value: string }) {
  return <div style={{ display: "grid", gridTemplateColumns: "minmax(120px, .55fr) 1fr", gap: "1rem", borderTop: "1px solid #d4d0c5", paddingTop: ".7rem" }}><dt style={{ fontWeight: 700, color: "#5e665f" }}>{label}</dt><dd style={{ margin: 0, fontWeight: 850, overflowWrap: "anywhere" }}>{value}</dd></div>;
}
