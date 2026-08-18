"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import styles from "../styles/MembershipRegistration.module.css";

type Language = "de" | "en";
type RouteType = "member" | "player";
type FeeCategory = "student" | "other" | "hardship";
type UploadState = { photo?: string; idFront?: string; idBack?: string; insuranceFront?: string; insuranceBack?: string };
type UploadProgress = Partial<Record<keyof UploadState, "uploading" | "done" | "error">>;
type UploadErrors = Partial<Record<keyof UploadState, string>>;

type ClubSettings = { clubName: string; accountHolder: string; iban: string; supporterFee: string; memberFee: string; playerStudentFee: string; playerOtherFee: string };
const DEFAULT_CLUB_SETTINGS: ClubSettings = { clubName: "NFT Munich e.V.", accountHolder: "NFT Munich e.V.", iban: "1234XXXX", supporterFee: "5", memberFee: "10", playerStudentFee: "50", playerOtherFee: "100" };

const copy = {
  de: {
    eyebrow: "NFT Munich e.V.",
    title: "Registrierung & Mitgliedschaft",
    intro: "Wähle die passende Anmeldung. Du kannst die Sprache jederzeit wechseln.",
    member: "Member",
    memberText: "Für alle, die das Team unterstützen möchten. Du erhältst Einladungen zu Vereinsevents, Mannschaftsspielen und gemeinsamen Reisen.",
    core: "Core Member",
    coreText: "Nur für registrierte Spieler und Mitglieder des Managements.",
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
    profession: "Beruf / Studien- oder Arbeitsbereich",
    professionHelp: "Bitte gib deinen Studiengang, Ausbildungsberuf oder Arbeitsbereich an.",
    estimatedStay: "Voraussichtliche Aufenthaltsdauer in München",
    managementInterest: "Hast du auch Interesse an einer Aufgabe im Management?",
    yes: "Ja",
    no: "Nein",
    optionalMessage: "Möchtest du uns noch etwas mitteilen? (optional)",
    documents: "Dokumente",
    photo: "Aktuelles Foto",
    identity: "Amtlicher Identitätsnachweis",
    insurance: "Versicherungsnachweis",
    uploadHelp: "JPG, JPEG, PNG, PDF oder iPhone-Foto (HEIC), maximal 12 MB. Große Bilder werden automatisch optimiert.",
    playerFeeNote: "Der Jahresbeitrag für Spieler unterstützt die grundlegende Fußballausstattung und den Spielbetrieb, darunter Bälle, Leibchen, medizinisches Material, Freundschaftsspiele und neue Trikots für die Herren- und Damenmannschaft. Ein Teil fließt außerdem in einen Notfallfonds für den Fall, dass Studierende nach einer Verletzung im Training oder Spiel ein bis zwei Monate nicht arbeiten können.",
    payment: "Beitrag & Zahlung",
    transferNow: "Du erhältst die Bankverbindung und Zahlungsinformationen per E-Mail, nachdem du das Formular abgeschickt hast.",
    chooseFeeFirst: "Wähle oben deinen Spielerbeitrag aus. Danach erscheint hier der genaue Gesamtbetrag.",
    hardshipPayment: "Bitte noch nichts überweisen. Der Vorstand prüft deinen Härtefall und informiert dich persönlich.",
    total: "Zu zahlender Gesamtbetrag",
    accountHolder: "Kontoinhaber",
    paymentReference: "Verwendungszweck",
    paymentReferenceValue: "Vorname-Nachname",
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
    emailWarning: "Dein Antrag wurde gespeichert, aber die Bestätigungs-E-Mail konnte nicht gesendet werden. Bitte kontaktiere NFT Munich.",
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
    coreText: "Only for registered players and management members.",
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
    profession: "Profession / field of study or work",
    professionHelp: "Specify your field of study, vocational training or work.",
    estimatedStay: "Estimated stay in Munich",
    managementInterest: "Are you also interested in a management role?",
    yes: "Yes",
    no: "No",
    optionalMessage: "Is there anything else you would like to tell us? (optional)",
    documents: "Documents",
    photo: "Current photo",
    identity: "Official proof of identity",
    insurance: "Proof of insurance",
    uploadHelp: "JPG, JPEG, PNG, PDF or iPhone photo (HEIC), maximum 12 MB. Large images are optimized automatically.",
    playerFeeNote: "The annual player fee supports essential football equipment and activities, including balls, bibs, medical supplies, friendly matches and new kits for the men's and women's teams. Part of it will also fund short-term emergency support in case a student cannot work for one to two months after an injury during NFT Munich training or a match.",
    payment: "Fee & payment",
    transferNow: "You will receive the bank and payment details by email after submitting the form.",
    chooseFeeFirst: "Select your player fee above. Your exact total will then appear here.",
    hardshipPayment: "Please do not transfer anything yet. The board will review your hardship request and contact you personally.",
    total: "Total amount to pay",
    accountHolder: "Account holder",
    paymentReference: "Payment reference",
    paymentReferenceValue: "First-name-Last-name",
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
    emailWarning: "Your application was saved, but the confirmation email could not be sent. Please contact NFT Munich.",
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
  const [uploads, setUploads] = useState<UploadState>({});
  const [feeCategory, setFeeCategory] = useState<FeeCategory | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(true);
  const [clubSettings, setClubSettings] = useState<ClubSettings>(DEFAULT_CLUB_SETTINGS);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [uploadErrors, setUploadErrors] = useState<UploadErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [submissionError, setSubmissionError] = useState("");
  const [coreAccess, setCoreAccess] = useState<"idle" | "checking" | "approved" | "denied">("idle");
  const [verifiedCoreEmail, setVerifiedCoreEmail] = useState("");
  const [coreEmailInput, setCoreEmailInput] = useState("");
  const t = copy[language];

  async function checkCoreEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = coreEmailInput.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setCoreAccess("denied");
      return;
    }
    setCoreAccess("checking");
    try {
      const response = await fetch("/api/auth/check-core-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        setCoreAccess("denied");
        return;
      }
      setVerifiedCoreEmail(email);
      setCoreAccess("approved");
    } catch {
      setCoreAccess("denied");
    }
  }

  useEffect(() => {
    const requestedType = new URLSearchParams(window.location.search).get("type");
    const typeMap: Record<string, RouteType> = {
      member: "member",
      player: "player",
      management: "player",
    };
    const route = requestedType ? typeMap[requestedType] : undefined;
    if (route) {
      setSelected(route);
      // Legacy management links now open the single Core Member form.
      setFeeCategory(route === "member" ? "other" : null);
    }
  }, []);

  useEffect(() => {
    fetch("/api/club-settings")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (data?.settings) setClubSettings({ ...DEFAULT_CLUB_SETTINGS, ...data.settings }); })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const protectedSelection = selected === "player";
    if (!protectedSelection) {
      setCoreAccess("idle");
      return;
    }
    setCoreAccess(verifiedCoreEmail ? "approved" : "idle");
  }, [selected, verifiedCoreEmail]);

  const joiningFee = Number(clubSettings.supporterFee) || 5;
  const annualFee = Number(clubSettings.memberFee) || 10;
  const memberTotal = joiningFee + annualFee;
  const studentTotal = memberTotal + (Number(clubSettings.playerStudentFee) || 0);
  const otherTotal = memberTotal + (Number(clubSettings.playerOtherFee) || 0);
  const amount = selected === "member" ? memberTotal : feeCategory === "student" ? studentTotal : feeCategory === "other" ? otherTotal : null;
  const categoryLabel = selected ? t[selected] : "";

  async function uploadDocument(file: File, fieldType: keyof UploadState, fullName: string, email: string) {
    const fail = (message: string) => {
      setUploadProgress((current) => ({ ...current, [fieldType]: "error" }));
      setUploadErrors((current) => ({ ...current, [fieldType]: message }));
      return false;
    };
    if (!fullName.trim() || !email.trim()) {
      return fail(language === "de" ? "Bitte fülle zuerst Vorname, Nachname und E-Mail-Adresse aus." : "Complete your first name, last name and email address before uploading.");
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return fail(language === "de" ? "Bitte gib zuerst eine gültige E-Mail-Adresse ein." : "Enter a valid email address before uploading.");
    }
    if (file.size <= 0 || file.size > 12 * 1024 * 1024) {
      return fail(language === "de" ? "Die Datei muss kleiner als 12 MB sein." : "The file must be smaller than 12 MB.");
    }
    let uploadFile: File;
    try {
      uploadFile = await prepareFileForUpload(file);
    } catch (error) {
      const onePagePdf = error instanceof Error && error.message === "PDF_ONE_PAGE_REQUIRED";
      return fail(onePagePdf
        ? (language === "de" ? "Bitte lade pro Feld eine einseitige PDF hoch." : "Upload a one-page PDF in each field.")
        : (language === "de" ? "Diese Datei konnte nicht gelesen werden. Bitte wähle ein JPG, JPEG, PNG oder PDF." : "This file could not be read. Select a JPG, JPEG, PNG or PDF."));
    }
    try {
      await ensureUploadSessionReady();
    } catch {
      return fail(language === "de" ? "Die sichere Upload-Sitzung konnte nicht gestartet werden. Bitte lade die Seite neu und versuche es erneut." : "The secure upload session could not be started. Reload the page and try again.");
    }
    setUploadProgress((current) => ({ ...current, [fieldType]: "uploading" }));
    setUploadErrors((current) => ({ ...current, [fieldType]: undefined }));
    setUploads((current) => {
      const next = { ...current };
      delete next[fieldType];
      return next;
    });
    let finalMessage = language === "de" ? "Der Upload ist fehlgeschlagen. Bitte versuche es erneut." : "The upload failed. Please try again.";
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 45000);
      try {
        const body = new FormData();
        body.append("file", uploadFile);
        body.append("fieldType", fieldType);
        body.append("fileIndex", "0");
        body.append("fullName", fullName || "applicant");
        body.append("email", email || "");
        body.append("registrationType", selected || "member");
        const response = await fetch("/api/upload-documents", { method: "POST", body, signal: controller.signal });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.fileRef) throw new Error(result.message || "Upload failed");
        setUploads((current) => ({ ...current, [fieldType]: result.fileRef }));
        setUploadProgress((current) => ({ ...current, [fieldType]: "done" }));
        setUploadErrors((current) => ({ ...current, [fieldType]: undefined }));
        window.clearTimeout(timeout);
        return true;
      } catch (error) {
        window.clearTimeout(timeout);
        const message = error instanceof Error ? error.message : "";
        if (message && message !== "Upload failed") finalMessage = message;
        if (attempt < 2) await new Promise((resolve) => window.setTimeout(resolve, 800 * (attempt + 1)));
      }
    }
    return fail(finalMessage);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || status === "sending") return;
    const requiredUploads = selected === "member"
      ? [uploads.photo, uploads.idFront, uploads.idBack]
      : [uploads.photo, uploads.idFront, uploads.idBack, uploads.insuranceFront, uploads.insuranceBack];
    if (Object.values(uploadProgress).includes("uploading") || requiredUploads.some((value) => !value)) {
      setSubmissionError(language === "de" ? "Bitte warte, bis alle erforderlichen Dateien erfolgreich hochgeladen wurden." : "Wait until all required files have uploaded successfully.");
      setStatus("error");
      return;
    }
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

  const protectedRoute = selected === "player";
  const requiredUploadsComplete = selected === "member"
    ? Boolean(uploads.photo && uploads.idFront && uploads.idBack)
    : Boolean(uploads.photo && uploads.idFront && uploads.idBack && uploads.insuranceFront && uploads.insuranceBack);

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
        <section className={`${styles.cards} ${styles.twoCards}`} aria-label={t.title}>
          <article className={`${styles.card} ${styles.coreCard}`}>
            <div className={styles.cardNumber}>01</div>
            <h2>{t.core}</h2>
            <p>{t.coreText}<br /><br />{language === "de" ? "Falls du im letzten Jahr nicht registriert warst, kontaktiere bitte NFT Munich." : "If you were not registered last year, please contact NFT Munich."}</p>
            <button onClick={() => { setSelected("player"); setFeeCategory(null); }} type="button">{t.choose}</button>
          </article>
          <article className={`${styles.card} ${styles.memberCard}`}>
            <div className={styles.cardNumber}>02</div>
            <h2>{t.member}</h2>
            <p>{t.memberText}</p>
            <button onClick={() => { setSelected("member"); setFeeCategory("other"); }} type="button">{t.choose}</button>
          </article>
        </section>
      )}

      {selected && (
        <section className={styles.formShell}>
          <button className={styles.back} type="button" onClick={() => { setSelected(null); setFeeCategory(null); setVerifiedCoreEmail(""); setCoreAccess("idle"); setUploads({}); setUploadProgress({}); setConfirmationSent(true); setStatus("idle"); }}>← {t.back}</button>
          <div className={styles.formHeading}>
            <div style={{ display: "grid", gap: ".35rem" }}>
              <small style={{ textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 800, opacity: .78 }}>{language === "de" ? "Du registrierst dich als" : "You are registering as"}</small>
              <h2>{selected === "member" ? t.member : t.core}</h2>
              <p className={styles.memberFormText}>{selected === "member" ? t.memberText : (language === "de" ? "Für registrierte Spieler und Mitglieder des Managements. Wähle unten die passende Beitragskategorie." : "For registered players and management members. Select the applicable fee category below.")}</p>
            </div>
            {(!protectedRoute || coreAccess === "approved") && <div className={styles.feePanel} aria-label={language === "de" ? "Beiträge" : "Fees"}>
              {selected === "member" ? (
                <>
                  <div className={styles.feeRow}><strong>{language === "de" ? `${joiningFee} € Aufnahmegebühr (einmalig)` : `€${joiningFee} joining fee (one-time)`}</strong></div>
                  <div className={styles.feeRow}><strong>{language === "de" ? `${annualFee} € Jahresgebühr e.V. für 2026` : `€${annualFee} e.V. annual fee for 2026`}</strong></div>
                </>
              ) : (
                <>
                  <div className={styles.feeRow}><strong>{language === "de" ? `${joiningFee} € Aufnahmegebühr (einmalig)` : `€${joiningFee} joining fee (one-time)`}</strong></div>
                  <div className={styles.feeRow}><strong>{language === "de" ? `${annualFee} € Jahresgebühr e.V. für 2026` : `€${annualFee} e.V. annual fee for 2026`}</strong></div>
                  <div className={styles.feeGroupLabel}>{language === "de" ? "Jahresbeitrag Spieler" : "Annual player fee"}</div>
                  <div className={styles.feeRow}><strong>{language === "de" ? `${clubSettings.playerStudentFee} € für Studierende/Azubis` : `€${clubSettings.playerStudentFee} for students/trainees`}</strong></div>
                  <div className={styles.feeRow}><strong>{language === "de" ? `${clubSettings.playerOtherFee} € für Sonstige` : `€${clubSettings.playerOtherFee} for others`}</strong></div>
                </>
              )}
            </div>}
          </div>
          {selected === "player" && coreAccess === "approved" && <p className={styles.playerFeeNote}>{t.playerFeeNote}</p>}

          {status === "success" ? <div className={styles.success}><h3>{t.successTitle}</h3><p>{categoryLabel}</p><PaymentSummary t={t} amount={amount} hardship={feeCategory === "hardship"} />{!confirmationSent && <p>{t.emailWarning}</p>}</div> : (
            <>
              {protectedRoute && coreAccess !== "approved" && <form onSubmit={checkCoreEmail} className={styles.accessForm}><h3>{t.loginTitle}</h3><p>{language === "de" ? "Gib die E-Mail-Adresse ein, mit der du bei NFT Munich registriert bist." : "Enter the email address registered with NFT Munich."}</p><label>{t.email}<input type="email" required value={coreEmailInput} onChange={(event) => { setCoreEmailInput(event.target.value); if (coreAccess === "denied") setCoreAccess("idle"); }} /></label><button type="submit" className={styles.accessButton} disabled={coreAccess === "checking"}>{coreAccess === "checking" ? (language === "de" ? "Wird geprüft …" : "Checking…") : (language === "de" ? "E-Mail prüfen" : "Check email")}</button></form>}
              {protectedRoute && coreAccess === "denied" && <div className={styles.notice}>
                <p>{language === "de" ? "Deine E-Mail-Adresse ist nicht registriert. Bitte kontaktiere NFT Munich unter nftmunich@gmail.com." : "Your email address is not registered. Please contact NFT Munich at nftmunich@gmail.com."}</p>
              </div>}
              {(!protectedRoute || (coreAccess === "approved" && Boolean(verifiedCoreEmail))) && (
                <form onSubmit={submit} className={styles.form}>
                  <fieldset>
                    <legend><span>01</span>{t.personal}</legend>
                    <div className={styles.grid}>
                      <Field label={t.firstName} name="firstName" />
                      <Field label={t.lastName} name="lastName" />
                      <Field label={t.birthDate} name="birthDate" placeholder={language === "de" ? "TT.MM.JJJJ" : "DD.MM.YYYY"} />
                      <Field label={t.email} name="email" type="email" defaultValue={protectedRoute ? verifiedCoreEmail : ""} readOnly={protectedRoute && Boolean(verifiedCoreEmail)} />
                      <Field label={t.street} name="street" wide />
                      <Field label={t.postalCode} name="postalCode" />
                      <Field label={t.city} name="city" />
                      <Field label={t.phone} name="phone" type="tel" wide />
                    </div>
                    {protectedRoute && <label className={styles.selectLabel}>{t.feeChoice}<select name="feeCategory" required value={feeCategory || ""} onChange={(event) => setFeeCategory(event.target.value as FeeCategory)}><option value="" disabled>—</option><option value="student">{language === "de" ? `Studierende / Azubis – ${studentTotal} € gesamt` : `Students / trainees – €${studentTotal} total`}</option><option value="other">{language === "de" ? `Sonstige – ${otherTotal} € gesamt` : `Others – €${otherTotal} total`}</option><option value="hardship">{t.special}</option></select></label>}
                  </fieldset>

                  {protectedRoute && <fieldset><legend><span>02</span>{t.playerDetails}</legend><div className={styles.grid}><Field label={t.position} name="position" /><Field label={t.profession} name="profession" wide placeholder={t.professionHelp} /><label className={styles.wide}>{t.estimatedStay}<select name="estimatedStay" required defaultValue=""><option value="" disabled>—</option><option value="Less than 1 year">{language === "de" ? "Weniger als 1 Jahr" : "Less than 1 year"}</option><option value="More than 1 year">{language === "de" ? "Mehr als 1 Jahr" : "More than 1 year"}</option><option value="Less than 5 years">{language === "de" ? "Weniger als 5 Jahre" : "Less than 5 years"}</option><option value="More than 5 years">{language === "de" ? "Mehr als 5 Jahre" : "More than 5 years"}</option></select></label><Field label={t.emergencyName} name="emergencyName" /><Field label={t.emergencyPhone} name="emergencyPhone" type="tel" /></div><label className={styles.selectLabel}>{t.managementInterest}<select name="managementInterest" required defaultValue=""><option value="" disabled>—</option><option value="yes">{t.yes}</option><option value="no">{t.no}</option></select></label></fieldset>}

                  <fieldset>
                    <legend><span>{selected === "member" ? "02" : selected === "player" ? "03" : "04"}</span>{t.documents}</legend>
                    <p className={styles.help}>{t.uploadHelp}</p>
                    <div className={styles.uploadGrid}>
                      <div className={`${styles.documentGroup} ${styles.photoGroup}`}><strong>{t.photo}</strong><Upload label={language === "de" ? "Foto auswählen" : "Select photo"} name="photo" status={uploadProgress.photo} errorMessage={uploadErrors.photo} done={Boolean(uploads.photo)} language={language} onFile={(file, form) => uploadDocument(file, "photo", `${form.get("firstName") || ""} ${form.get("lastName") || ""}`, String(form.get("email") || verifiedCoreEmail || ""))} /></div>
                      <div className={`${styles.documentGroup} ${styles.identityGroup}`}><strong>{t.identity}</strong><div className={styles.uploadPairGrid}>
                        <Upload label={language === "de" ? "Vorderseite" : "Front side"} name="idFront" status={uploadProgress.idFront} errorMessage={uploadErrors.idFront} done={Boolean(uploads.idFront)} language={language} onFile={(file, form) => uploadDocument(file, "idFront", `${form.get("firstName") || ""} ${form.get("lastName") || ""}`, String(form.get("email") || verifiedCoreEmail || ""))} />
                        <Upload label={language === "de" ? "Rückseite" : "Back side"} name="idBack" status={uploadProgress.idBack} errorMessage={uploadErrors.idBack} done={Boolean(uploads.idBack)} language={language} onFile={(file, form) => uploadDocument(file, "idBack", `${form.get("firstName") || ""} ${form.get("lastName") || ""}`, String(form.get("email") || verifiedCoreEmail || ""))} />
                      </div></div>
                      {protectedRoute && <div className={`${styles.documentGroup} ${styles.insuranceGroup}`}><strong>{t.insurance}</strong><div className={styles.uploadPairGrid}>
                        <Upload label={language === "de" ? "Vorderseite" : "Front side"} name="insuranceFront" status={uploadProgress.insuranceFront} errorMessage={uploadErrors.insuranceFront} done={Boolean(uploads.insuranceFront)} language={language} onFile={(file, form) => uploadDocument(file, "insuranceFront", `${form.get("firstName") || ""} ${form.get("lastName") || ""}`, String(form.get("email") || verifiedCoreEmail || ""))} />
                        <Upload label={language === "de" ? "Rückseite" : "Back side"} name="insuranceBack" status={uploadProgress.insuranceBack} errorMessage={uploadErrors.insuranceBack} done={Boolean(uploads.insuranceBack)} language={language} onFile={(file, form) => uploadDocument(file, "insuranceBack", `${form.get("firstName") || ""} ${form.get("lastName") || ""}`, String(form.get("email") || verifiedCoreEmail || ""))} />
                      </div></div>}
                    </div>
                    {Object.values(uploadProgress).includes("error") && <p className={styles.error} role="alert">{language === "de" ? "Der Upload konnte nicht bestätigt werden. Bitte wähle die betreffende Datei erneut aus." : "The upload could not be confirmed. Please select that file again."}</p>}
                  </fieldset>

                  <fieldset><legend><span>{selected === "member" ? "03" : "04"}</span>{t.payment}</legend><PaymentSummary t={t} amount={amount} hardship={feeCategory === "hardship"} /></fieldset>
                  <fieldset><legend><span>{selected === "member" ? "04" : "05"}</span>{language === "de" ? "Zusätzliche Mitteilung" : "Additional message"}</legend><label className={styles.selectLabel}>{t.optionalMessage}<textarea className={styles.textarea} name="optionalMessage" maxLength={1500} rows={5} /></label></fieldset>
                  <fieldset><legend><span>{selected === "member" ? "05" : "06"}</span>{t.declaration}</legend><div className={styles.checks}><Check name="truth" label={t.truth} /><Check name="statutes" label={<>{t.statutes} <Link href="/satzung.pdf" target="_blank" rel="noopener noreferrer">Satzung ↗</Link></>} /><Check name="privacy" label={<>{t.privacy} <Link href="/privacy-policy" target="_blank">Privacy ↗</Link></>} /></div></fieldset>
                  {status === "error" && <p className={styles.error} role="alert">{submissionError || t.error}</p>}
                  <button className={styles.submit} disabled={status === "sending" || Object.values(uploadProgress).includes("uploading") || !requiredUploadsComplete}>{status === "sending" ? t.sending : t.submit}</button>
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

async function prepareFileForUpload(file: File): Promise<File> {
  const lowerName = file.name.toLowerCase();
  const supportedName = /\.(jpe?g|png|pdf|heic|heif)$/.test(lowerName);
  const supportedType = ["image/jpeg", "image/png", "application/pdf", "image/heic", "image/heif", ""].includes(file.type.toLowerCase());
  if (!supportedName && !supportedType) throw new Error("Unsupported image type");
  if (file.type === "application/pdf" || lowerName.endsWith(".pdf")) {
    return pdfPageToJpeg(file);
  }
  if (["image/jpeg", "image/png"].includes(file.type) && file.size <= 2 * 1024 * 1024) return file;

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, 2200 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) { bitmap.close(); throw new Error("Image conversion unavailable"); }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let quality = 0.86;
  let blob: Blob | null = null;
  do {
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    quality -= 0.1;
  } while (blob && blob.size > 1.9 * 1024 * 1024 && quality >= 0.46);
  if (!blob || blob.size > 2 * 1024 * 1024) throw new Error("Image could not be reduced");
  const baseName = file.name.replace(/\.[^.]+$/, "") || "iphone-photo";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg", lastModified: file.lastModified });
}

function Upload({ label, name, status, errorMessage, done, language, onFile }: { label: string; name: string; status?: "uploading" | "done" | "error"; errorMessage?: string; done: boolean; language: Language; onFile: (file: File, form: FormData) => Promise<boolean> }) {
  const busy = status === "uploading";
  const message = busy
    ? (language === "de" ? "Wird hochgeladen …" : "Uploading …")
    : done
      ? (language === "de" ? "✓ Erfolgreich hochgeladen" : "✓ Uploaded successfully")
      : status === "error"
        ? (errorMessage || (language === "de" ? "Erneut auswählen" : "Select again"))
        : "JPG / PNG / PDF";
  return <label className={styles.upload}>{label}<input name={`${name}File`} type="file" accept="image/jpeg,image/png,image/heic,image/heif,application/pdf,.jpg,.jpeg,.png,.pdf,.heic,.heif" required={!done} disabled={busy} onChange={async (event) => { const input = event.currentTarget; const file = input.files?.[0]; if (!file) return; const form = new FormData(input.form || undefined); const successful = await onFile(file, form); if (!successful) input.value = ""; }} /><span aria-live="polite" role={status === "error" ? "alert" : undefined}>{message}</span></label>;
}

async function pdfPageToJpeg(file: File): Promise<File> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
  const pdfDocument = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  if (pdfDocument.numPages !== 1) {
    await pdfDocument.destroy();
    throw new Error("PDF_ONE_PAGE_REQUIRED");
  }
  const page = await pdfDocument.getPage(1);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = Math.min(2.5, 2200 / Math.max(baseViewport.width, baseViewport.height));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) { await pdfDocument.destroy(); throw new Error("PDF_RENDER_UNAVAILABLE"); }
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport }).promise;
  page.cleanup();
  await pdfDocument.destroy();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
  if (!blob || blob.size > 2 * 1024 * 1024) throw new Error("PDF_RENDER_TOO_LARGE");
  const baseName = file.name.replace(/\.pdf$/i, "") || "document";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg", lastModified: file.lastModified });
}

function Check({ name, label }: { name: string; label: React.ReactNode }) {
  return <label><input type="checkbox" name={name} value="accepted" required /><span>{label}</span></label>;
}

let uploadSessionRequest: Promise<void> | null = null;
function ensureUploadSessionReady() {
  if (!uploadSessionRequest) {
    uploadSessionRequest = fetch("/api/upload-session", { method: "POST", credentials: "same-origin" })
      .then((response) => { if (!response.ok) throw new Error("Upload session unavailable"); })
      .catch((error) => { uploadSessionRequest = null; throw error; });
  }
  return uploadSessionRequest;
}

function PaymentSummary({ t, amount, hardship }: { t: (typeof copy)[Language]; amount: number | null; hardship: boolean }) {
  return <div className={styles.payment} aria-live="polite">
    {hardship ? <p>{t.hardshipPayment}</p> : amount === null ? <p>{t.chooseFeeFirst}</p> : <>
      <strong>{t.total}: {amount}€</strong>
      <p>{t.transferNow}</p>
    </>}
  </div>;
}
