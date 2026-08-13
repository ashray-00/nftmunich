"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import LoginGate from "./LoginGate";
import styles from "../styles/MembershipRegistration.module.css";

type Language = "de" | "en";
type RouteType = "member" | "player" | "management";
type FeeCategory = "student" | "other" | "hardship";
type UploadState = { photo?: string; idFront?: string; idBack?: string; insuranceFront?: string; insuranceBack?: string };
type UploadProgress = Partial<Record<keyof UploadState, "uploading" | "done" | "error">>;

type ClubSettings = { clubName: string; accountHolder: string; iban: string; supporterFee: string; memberFee: string; playerStudentFee: string; playerOtherFee: string };
const DEFAULT_CLUB_SETTINGS: ClubSettings = { clubName: "NFT Munich e.V.", accountHolder: "NFT Munich e.V.", iban: "1234XXXX", supporterFee: "15", memberFee: "10", playerStudentFee: "50", playerOtherFee: "100" };

const copy = {
  de: {
    eyebrow: "NFT Munich e.V.",
    title: "Registrierung & Mitgliedschaft",
    intro: "Wähle die passende Anmeldung. Du kannst die Sprache jederzeit wechseln.",
    member: "Member",
    memberText: "Für alle, die das Team unterstützen möchten. Du erhältst Einladungen zu Vereinsevents, Mannschaftsspielen und gemeinsamen Reisen.",
    core: "Core Member",
    coreText: "Nur für registrierte Spieler und Mitglieder des Managements. Falls du im letzten Jahr nicht registriert warst, kontaktiere bitte NFT Munich.",
    memberFee: "10 € pro Jahr",
    player: "Core Member – Player",
    playerText: "Nur für Spieler mit einer bereits freigegebenen E-Mail-Adresse.",
    playerFee: "60 € gesamt – Studierende/Azubis (50 € + 10 € Mitgliedsgebühr) · 110 € gesamt – Sonstige (100 € + 10 € Mitgliedsgebühr)",
    management: "Core Member – Player + Management",
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
    uploadHelp: "JPG oder PNG, maximal 2 MB je Seite. Vorder- und Rückseiten werden sicher zu einer PDF zusammengeführt.",
    payment: "Beitrag & Zahlung",
    transferNow: "Bitte überweise nach dem Absenden den unten angegebenen Betrag.",
    chooseFeeFirst: "Wähle oben deinen Spielerbeitrag aus. Danach erscheint hier der genaue Gesamtbetrag.",
    hardshipPayment: "Bitte noch nichts überweisen. Der Vorstand prüft deinen Härtefall und informiert dich persönlich.",
    total: "Zu zahlender Gesamtbetrag",
    accountHolder: "Kontoinhaber",
    paymentReference: "Verwendungszweck",
    paymentReferenceValue: "NFT-Nummer-Vorname-Nachname",
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
    member: "Member",
    memberText: "For everyone who wants to support the team. You will receive invitations to club events, team matches and trips.",
    memberFee: "€10 per year",
    core: "Core Member",
    coreText: "Only for registered players and management members. If you were not registered last year, please contact NFT Munich.",
    player: "Core Member – Player",
    playerText: "Only for players whose email address has already been approved.",
    playerFee: "€60 total – students/trainees (€50 + €10 membership fee) · €110 total – others (€100 + €10 membership fee)",
    management: "Core Member – Player + Management",
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
    uploadHelp: "JPG or PNG, maximum 2 MB per side. Front and back sides are securely combined into one PDF.",
    payment: "Fee & payment",
    transferNow: "Please transfer the amount shown below after submitting.",
    chooseFeeFirst: "Select your player fee above. Your exact total will then appear here.",
    hardshipPayment: "Please do not transfer anything yet. The board will review your hardship request and contact you personally.",
    total: "Total amount to pay",
    accountHolder: "Account holder",
    paymentReference: "Payment reference",
    paymentReferenceValue: "NFT-number-First-name-Last-name",
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

export default function MembershipRegistration() {
  const [language, setLanguage] = useState<Language>("de");
  const [selected, setSelected] = useState<RouteType | null>(null);
  const [showCoreOptions, setShowCoreOptions] = useState(false);
  const [uploads, setUploads] = useState<UploadState>({});
  const [feeCategory, setFeeCategory] = useState<FeeCategory | null>(null);
  const [applicationId, setApplicationId] = useState("");
  const [confirmationSent, setConfirmationSent] = useState(true);
  const [clubSettings, setClubSettings] = useState<ClubSettings>(DEFAULT_CLUB_SETTINGS);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [submissionError, setSubmissionError] = useState("");
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
      setShowCoreOptions(false);
      setFeeCategory(route === "member" ? "other" : null);
    }
  }, []);

  useEffect(() => {
    fetch("/api/club-settings")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (data?.settings) setClubSettings({ ...DEFAULT_CLUB_SETTINGS, ...data.settings }); })
      .catch(() => undefined);
  }, []);

  const supporterFee = Number(clubSettings.supporterFee) || 15;
  const memberFee = Number(clubSettings.memberFee) || 0;
  const studentTotal = memberFee + (Number(clubSettings.playerStudentFee) || 0);
  const otherTotal = memberFee + (Number(clubSettings.playerOtherFee) || 0);
  const amount = selected === "member" ? supporterFee : feeCategory === "student" ? studentTotal : feeCategory === "other" ? otherTotal : null;
  const categoryLabel = selected ? t[selected] : "";

  async function uploadDocument(file: File, fieldType: keyof UploadState, fullName: string, email: string) {
    setUploadProgress((current) => ({ ...current, [fieldType]: "uploading" }));
    setUploads((current) => {
      const next = { ...current };
      delete next[fieldType];
      return next;
    });
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const body = new FormData();
        body.append("file", file);
        body.append("fieldType", fieldType);
        body.append("fileIndex", "0");
        body.append("fullName", fullName || "applicant");
        body.append("email", email || "");
        body.append("registrationType", selected || "member");
        const response = await fetch("/api/upload-documents", { method: "POST", body });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.fileUrl) throw new Error(result.message || "Upload failed");
        setUploads((current) => ({ ...current, [fieldType]: result.fileUrl }));
        setUploadProgress((current) => ({ ...current, [fieldType]: "done" }));
        return true;
      } catch {
        if (attempt === 0) await new Promise((resolve) => window.setTimeout(resolve, 800));
      }
    }
    setUploadProgress((current) => ({ ...current, [fieldType]: "error" }));
    return false;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setStatus("sending");
    setSubmissionError("");
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
    } else {
      const messages: Record<string, { de: string; en: string }> = {
        "Invalid registration category.": { de: "Bitte wähle deine Registrierungskategorie erneut aus.", en: "Please select your registration category again." },
        "All personal details and a valid email address are required.": { de: "Bitte prüfe alle persönlichen Angaben und deine E-Mail-Adresse.", en: "Please check all personal details and your email address." },
        "All player details are required.": { de: "Bitte fülle alle Spielerangaben aus.", en: "Please complete all player details." },
        "All management details are required.": { de: "Bitte fülle alle Managementangaben aus.", en: "Please complete all management details." },
        "All declarations must be accepted.": { de: "Bitte bestätige alle drei Erklärungen.", en: "Please accept all three declarations." },
        "Required documents have not been uploaded.": { de: "Mindestens ein Dokument wurde nicht vollständig hochgeladen. Bitte lade die Dokumente erneut hoch.", en: "At least one document was not fully uploaded. Please upload the documents again." },
      };
      const serverMessage = String(result.message || "");
      setSubmissionError(messages[serverMessage]?.[language] || t.error);
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

      {!selected && !showCoreOptions && (
        <section className={`${styles.cards} ${styles.twoCards}`} aria-label={t.title}>
          <article className={styles.card}>
            <div className={styles.cardNumber}>01</div>
            <h2>{t.member}</h2><p>{t.memberText}</p>
            <button onClick={() => { setSelected("member"); setFeeCategory("other"); }} type="button">{t.choose}</button>
          </article>
          <article className={styles.card}>
            <div className={styles.cardNumber}>02</div>
            <h2>{t.core}</h2><p>{t.coreText}</p>
            <button onClick={() => setShowCoreOptions(true)} type="button">{t.choose}</button>
          </article>
        </section>
      )}

      {!selected && showCoreOptions && (
        <section className={styles.formShell}>
          <button className={styles.back} type="button" onClick={() => setShowCoreOptions(false)}>← {t.back}</button>
          <div className={styles.formHeading}><div style={{ display: "grid", gap: ".35rem" }}><small style={{ textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 800, opacity: .78 }}>{language === "de" ? "Core Member auswählen" : "Choose Core Member type"}</small><h2>{t.core}</h2></div></div>
          <div className={`${styles.cards} ${styles.twoCards}`} style={{ marginTop: "1rem" }}>
            <article className={styles.card}><h2>{language === "de" ? "Player" : "Player"}</h2><p>{language === "de" ? "Für freigegebene Spieler." : "For approved players."}</p><button type="button" onClick={() => { setSelected("player"); setFeeCategory(null); setShowCoreOptions(false); }}>{t.choose}</button></article>
            <article className={styles.card}><h2>Player + Management</h2><p>{language === "de" ? "Für Spieler mit zusätzlicher Vereinsaufgabe." : "For players with an additional club responsibility."}</p><button type="button" onClick={() => { setSelected("management"); setFeeCategory(null); setShowCoreOptions(false); }}>{t.choose}</button></article>
          </div>
        </section>
      )}

      {selected && (
        <section className={styles.formShell}>
          <button className={styles.back} type="button" onClick={() => { const wasCore = selected !== "member"; setSelected(null); setShowCoreOptions(wasCore); setFeeCategory(null); setApplicationId(""); setConfirmationSent(true); setStatus("idle"); }}>← {t.back}</button>
          <div className={styles.formHeading}>
            <div style={{ display: "grid", gap: ".35rem" }}>
              <small style={{ textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 800, opacity: .78 }}>{language === "de" ? "Du registrierst dich als" : "You are registering as"}</small>
              <h2>{t[selected]}</h2>
            </div>
            <div style={{ display: "grid", gap: ".55rem", minWidth: "min(100%, 320px)" }} aria-label={language === "de" ? "Beiträge" : "Fees"}>
              {selected === "member" ? (
                <strong>{language === "de" ? `${supporterFee} € einmalige Aufnahmegebühr` : `€${supporterFee} one-time admission fee`}</strong>
              ) : (
                <>
                  <div style={{ display: "flex", gap: ".55rem", alignItems: "baseline", borderBottom: "1px solid #ffffff66", padding: ".4rem 0" }}><strong style={{ whiteSpace: "nowrap" }}>{clubSettings.playerStudentFee} €</strong><small>{language === "de" ? "für Studierende / Azubis" : "for students / trainees"}</small></div>
                  <div style={{ display: "flex", gap: ".55rem", alignItems: "baseline", borderBottom: "1px solid #ffffff66", padding: ".4rem 0" }}><strong style={{ whiteSpace: "nowrap" }}>{clubSettings.playerOtherFee} €</strong><small>{language === "de" ? "für Sonstige" : "for others"}</small></div>
                  <div style={{ display: "flex", gap: ".55rem", alignItems: "baseline", padding: ".4rem 0" }}><strong style={{ whiteSpace: "nowrap" }}>+ {memberFee} €</strong><small>{language === "de" ? "Mitgliedsgebühr" : "membership fee"}</small></div>
                </>
              )}
            </div>
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
                      <Field label={t.birthDate} name="birthDate" placeholder={language === "de" ? "TT.MM.JJJJ" : "DD.MM.YYYY"} />
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
                      <Upload label={t.photo} name="photo" status={uploadProgress.photo} done={Boolean(uploads.photo)} language={language} onFile={(file, form) => uploadDocument(file, "photo", `${form.get("firstName") || ""} ${form.get("lastName") || ""}`, String(form.get("email") || user?.email || ""))} />
                      <Upload label={`${t.identity} – ${language === "de" ? "Vorderseite" : "front"}`} name="idFront" status={uploadProgress.idFront} done={Boolean(uploads.idFront)} language={language} onFile={(file, form) => uploadDocument(file, "idFront", `${form.get("firstName") || ""} ${form.get("lastName") || ""}`, String(form.get("email") || user?.email || ""))} />
                      <Upload label={`${t.identity} – ${language === "de" ? "Rückseite" : "back"}`} name="idBack" status={uploadProgress.idBack} done={Boolean(uploads.idBack)} language={language} onFile={(file, form) => uploadDocument(file, "idBack", `${form.get("firstName") || ""} ${form.get("lastName") || ""}`, String(form.get("email") || user?.email || ""))} />
                      {protectedRoute && <Upload label={`${t.insurance} – ${language === "de" ? "Vorderseite" : "front"}`} name="insuranceFront" status={uploadProgress.insuranceFront} done={Boolean(uploads.insuranceFront)} language={language} onFile={(file, form) => uploadDocument(file, "insuranceFront", `${form.get("firstName") || ""} ${form.get("lastName") || ""}`, String(form.get("email") || user?.email || ""))} />}
                      {protectedRoute && <Upload label={`${t.insurance} – ${language === "de" ? "Rückseite" : "back"}`} name="insuranceBack" status={uploadProgress.insuranceBack} done={Boolean(uploads.insuranceBack)} language={language} onFile={(file, form) => uploadDocument(file, "insuranceBack", `${form.get("firstName") || ""} ${form.get("lastName") || ""}`, String(form.get("email") || user?.email || ""))} />}
                    </div>
                    {Object.values(uploadProgress).includes("error") && <p className={styles.error} role="alert">{language === "de" ? "Der Upload konnte nicht bestätigt werden. Bitte wähle die betreffende Datei erneut aus." : "The upload could not be confirmed. Please select that file again."}</p>}
                  </fieldset>

                  <fieldset><legend><span>{selected === "member" ? "03" : selected === "player" ? "04" : "05"}</span>{t.payment}</legend><PaymentSummary t={t} amount={amount} hardship={feeCategory === "hardship"} settings={clubSettings} /></fieldset>
                  <fieldset><legend><span>{selected === "member" ? "04" : selected === "player" ? "05" : "06"}</span>{t.declaration}</legend><div className={styles.checks}><Check name="truth" label={t.truth} /><Check name="statutes" label={<>{t.statutes} <Link href="/satzung.pdf" target="_blank" rel="noopener noreferrer">Satzung ↗</Link></>} /><Check name="privacy" label={<>{t.privacy} <Link href="/privacy-policy" target="_blank">Privacy ↗</Link></>} /></div></fieldset>
                  {status === "error" && <p className={styles.error} role="alert">{submissionError || t.error}</p>}
                  <button className={styles.submit} disabled={status === "sending" || Object.values(uploadProgress).includes("uploading")}>{status === "sending" ? t.sending : t.submit}</button>
                </form>
              )}
            </>
          )}
        </section>
      )}
    </main>
  );
}

function Field({ label, name, type = "text", wide, defaultValue, readOnly, placeholder }: { label: string; name: string; type?: string; wide?: boolean; defaultValue?: string; readOnly?: boolean; placeholder?: string }) {
  return <label className={wide ? styles.wide : ""}>{label}<input name={name} type={type} required defaultValue={defaultValue} readOnly={readOnly} placeholder={placeholder} /></label>;
}

function Upload({ label, name, status, done, language, onFile }: { label: string; name: string; status?: "uploading" | "done" | "error"; done: boolean; language: Language; onFile: (file: File, form: FormData) => Promise<boolean> }) {
  const busy = status === "uploading";
  const message = busy
    ? (language === "de" ? "Wird hochgeladen …" : "Uploading …")
    : done
      ? (language === "de" ? "✓ Erfolgreich hochgeladen" : "✓ Uploaded successfully")
      : status === "error"
        ? (language === "de" ? "Erneut auswählen" : "Select again")
        : "JPG / PNG";
  return <label className={styles.upload}>{label}<input name={`${name}File`} type="file" accept=".jpg,.jpeg,.png" required={!done} disabled={busy} onChange={async (event) => { const input = event.currentTarget; const file = input.files?.[0]; if (!file) return; const form = new FormData(input.form || undefined); const successful = await onFile(file, form); if (!successful) input.value = ""; }} /><span aria-live="polite">{message}</span></label>;
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
