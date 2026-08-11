/**
 * NFT Munich e.V. membership storage endpoint.
 * Deploy as a Google Apps Script web app and use its /exec URL as GOOGLE_SCRIPT_URL.
 * Files stay private in Drive. The spreadsheet receives links, not file contents.
 */

const DEFAULT_MEMBERSHIP_SHEET_ID = "1VpURRDCv_PRP82A8mOsvFwt7dXd94mPcT1oFTv5ibOs";
const UPLOAD_FOLDER = "NFT Munich e.V. — Private Membership Uploads";
const REGISTRATION_EMAIL = "nftmunich@gmail.com";
const PAYMENT_IBAN = "1234XXXX";
const PAYMENT_ACCOUNT_HOLDER = "NFT Munich e.V.";
const SETTINGS_TAB = "Club Settings";
const APPLICATION_TABS = {
  member: "Club Members",
  player: "Registered Players",
  management: "Management + Players"
};

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    if (payload.action === "uploadFile") return uploadMembershipFile_(payload);
    if (payload.action === "membershipRegistration") return saveMembershipRegistration_(payload);
    if (payload.action === "registrationInterest") return sendRegistrationInterest_(payload);
    if (payload.action === "publicClubSettings") return publicClubSettings_(payload);
    if (payload.action === "adminDashboard") return adminDashboard_(payload);
    if (payload.action === "updateClubSettings") return updateClubSettings_(payload);
    return json_({ status: 400, message: "Unknown action." });
  } catch (error) {
    console.error(error);
    return json_({ status: 500, message: "The registration could not be stored." });
  }
}

function sendRegistrationInterest_(payload) {
  const name = String(payload.name || "").replace(/[\r\n<>]/g, "").trim().slice(0, 150);
  const email = String(payload.email || "").replace(/[\r\n<>]/g, "").trim().slice(0, 254);
  const typeLabels = {
    supporter: "Supporter / Club member",
    player: "Player",
    "management-player": "Management and Player"
  };
  const typePaths = {
    supporter: "member",
    player: "player",
    "management-player": "management"
  };
  const requestedType = String(payload.registrationType || "");
  const registrationType = typeLabels[requestedType];
  const registrationPath = typePaths[requestedType];
  if (!name || !email || email.indexOf("@") < 1 || !registrationType) {
    return json_({ status: 400, message: "Name, email and registration type are required." });
  }

  const registrationLink = "https://www.nftmunich.club/registration?type=" + registrationPath;
  const feeInformation = requestedType === "supporter"
    ? "€10 per year"
    : "€60 total for students/trainees or €110 total for others";

  const applicantBody = [
    "Hallo " + name + ",",
    "",
    "vielen Dank für dein Interesse an NFT Munich e.V.",
    "Gewählte Kategorie: " + registrationType,
    "",
    "Bitte fülle deinen vollständigen Antrag über diesen Link aus:",
    registrationLink,
    "",
    "Beitrag: " + feeInformation,
    "Die genaue Zahlungsinformation wird im Formular angezeigt und dir nach dem vollständigen Absenden nochmals per E-Mail geschickt.",
    "",
    "--- English ---",
    "",
    "Hello " + name + ",",
    "",
    "Thank you for your interest in NFT Munich e.V.",
    "Selected category: " + registrationType,
    "",
    "Please complete your full application using this link:",
    registrationLink,
    "",
    "Fee: " + feeInformation,
    "The exact payment information is shown in the form and will be emailed to you again after submission.",
    "",
    "NFT Munich e.V.",
    "www.nftmunich.club"
  ].join("\n");

  const adminSubject = "New NFT Munich registration request — " + name;
  const adminBody = [
    "A person would like to register with NFT Munich e.V.",
    "",
    "Name: " + name,
    "Email: " + email,
    "Registration type: " + registrationType,
    "Received: " + Utilities.formatDate(new Date(), "Europe/Berlin", "yyyy-MM-dd HH:mm:ss"),
    "",
    "Registration link sent automatically:",
    registrationLink
  ].join("\n");

  MailApp.sendEmail({
    to: email,
    subject: "NFT Munich e.V. – Dein Registrierungslink / Your registration link",
    body: applicantBody,
    name: "NFT Munich e.V.",
    replyTo: REGISTRATION_EMAIL
  });
  try {
    MailApp.sendEmail({ to: REGISTRATION_EMAIL, subject: adminSubject, body: adminBody, replyTo: email });
  } catch (adminEmailError) {
    console.error("Admin registration notification failed", adminEmailError);
  }
  return json_({ status: 200 });
}

function uploadMembershipFile_(payload) {
  if (!payload.base64 || !payload.filename || !payload.mimeType) {
    return json_({ status: 400, message: "Missing file information." });
  }

  const folders = DriveApp.getFoldersByName(UPLOAD_FOLDER);
  const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(UPLOAD_FOLDER);
  const bytes = Utilities.base64Decode(payload.base64);
  const blob = Utilities.newBlob(bytes, payload.mimeType, safeFileName_(payload.filename));
  const file = folder.createFile(blob);
  file.setDescription("Private NFT Munich membership application document");

  return json_({ status: 200, fileUrl: file.getUrl() });
}

function saveMembershipRegistration_(payload) {
  const data = payload.registration || {};
  const spreadsheet = SpreadsheetApp.openById(payload.spreadsheetId || DEFAULT_MEMBERSHIP_SHEET_ID);
  const tabName = APPLICATION_TABS[data.registrationType];
  if (!tabName) return json_({ status: 400, message: "Unknown registration type." });
  const sheet = spreadsheet.getSheetByName(tabName);
  if (!sheet) return json_({ status: 500, message: tabName + " tab was not found." });

  const applicationId = "NFT-" + Utilities.formatDate(new Date(), "Europe/Berlin", "yyyyMMdd-HHmmss") + "-" + Math.floor(1000 + Math.random() * 9000);
  const now = Utilities.formatDate(new Date(), "Europe/Berlin", "yyyy-MM-dd HH:mm:ss");
  const row = [
    applicationId, now, data.registrationType, data.language,
    data.firstName, data.lastName, data.birthDate, data.street, data.postalCode,
    data.city, data.email, data.phone, data.feeCategory, data.membershipFee,
    data.playerFee, data.position, data.emergencyName, data.emergencyPhone,
    data.managementRole, data.responsibility, safeSpreadsheetValue_(data.photo),
    safeSpreadsheetValue_(data.id), safeSpreadsheetValue_(data.insurance),
    data.truth, data.statutes, data.privacy, "Pending", "New", ""
  ];

  sheet.appendRow(row.map(safeSpreadsheetValue_));
  let emailSent = true;
  try {
    sendApplicantConfirmation_(data, applicationId, readClubSettings_(spreadsheet));
  } catch (emailError) {
    emailSent = false;
    console.error("Applicant confirmation email failed", emailError);
  }
  return json_({ status: 200, applicationId: applicationId, emailSent: emailSent });
}

function sendApplicantConfirmation_(data, applicationId, settings) {
  const labels = {
    member: "Vereinsmitglied / Club member",
    player: "Player",
    management: "Management and Player"
  };
  const category = labels[data.registrationType] || data.registrationType;
  const hardship = data.feeCategory === "hardship";
  const total = hardship ? "" : Number(data.totalFee || 0);
  const reference = "Mitgliedschaft " + applicationId + " " + data.firstName + " " + data.lastName;
  const paymentDe = hardship
    ? ["Bitte überweise noch nichts. Der Vorstand prüft deinen Härtefall und meldet sich persönlich bei dir."]
    : [
        "Bitte überweise " + total + " € auf das folgende Vereinskonto:",
        "Kontoinhaber: " + settings.accountHolder,
        "IBAN: " + settings.iban,
        "Verwendungszweck: " + reference
      ];
  const paymentEn = hardship
    ? ["Please do not transfer anything yet. The board will review your hardship request and contact you personally."]
    : [
        "Please transfer €" + total + " to the following club account:",
        "Account holder: " + settings.accountHolder,
        "IBAN: " + settings.iban,
        "Payment reference: " + reference
      ];
  const body = [
    "Hallo " + data.firstName + ",",
    "",
    "vielen Dank für deine Anmeldung als " + category + ".",
    "Antragsnummer: " + applicationId,
    "",
    paymentDe.join("\n"),
    "",
    "--- English ---",
    "",
    "Hello " + data.firstName + ",",
    "",
    "Thank you for registering as " + category + ".",
    "Application ID: " + applicationId,
    "",
    paymentEn.join("\n"),
    "",
    settings.clubName,
    settings.website
  ].join("\n");

  MailApp.sendEmail({
    to: data.email,
    subject: "NFT Munich e.V. – Anmeldung bestätigt / Registration confirmed",
    body: body,
    name: "NFT Munich e.V.",
    replyTo: REGISTRATION_EMAIL
  });
}

function defaultClubSettings_() {
  return {
    clubName: "NFT Munich e.V.",
    address: "Titurelstrasse 8, 81925 Munich",
    email: "nftmunich@gmail.com",
    website: "www.nftmunich.club",
    accountHolder: PAYMENT_ACCOUNT_HOLDER,
    iban: PAYMENT_IBAN,
    memberFee: "10",
    playerStudentFee: "50",
    playerOtherFee: "100"
  };
}

function getSettingsSheet_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(SETTINGS_TAB);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SETTINGS_TAB);
    sheet.appendRow(["Key", "Value"]);
    const defaults = defaultClubSettings_();
    Object.keys(defaults).forEach(function(key) { sheet.appendRow([key, defaults[key]]); });
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function readClubSettings_(spreadsheet) {
  const settings = defaultClubSettings_();
  const sheet = getSettingsSheet_(spreadsheet);
  if (sheet.getLastRow() < 2) return settings;
  sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues().forEach(function(row) {
    const key = String(row[0] || "");
    if (Object.prototype.hasOwnProperty.call(settings, key)) settings[key] = String(row[1] || "");
  });
  return settings;
}

function publicClubSettings_(payload) {
  const spreadsheet = SpreadsheetApp.openById(payload.spreadsheetId || DEFAULT_MEMBERSHIP_SHEET_ID);
  return json_({ status: 200, settings: readClubSettings_(spreadsheet) });
}

function adminDashboard_(payload) {
  const spreadsheet = SpreadsheetApp.openById(payload.spreadsheetId || DEFAULT_MEMBERSHIP_SHEET_ID);
  const counts = {
    members: applicationCount_(spreadsheet, APPLICATION_TABS.member),
    players: applicationCount_(spreadsheet, APPLICATION_TABS.player),
    management: applicationCount_(spreadsheet, APPLICATION_TABS.management)
  };
  counts.total = counts.members + counts.players + counts.management;
  return json_({ status: 200, settings: readClubSettings_(spreadsheet), counts: counts });
}

function applicationCount_(spreadsheet, tabName) {
  const sheet = spreadsheet.getSheetByName(tabName);
  return sheet ? Math.max(0, sheet.getLastRow() - 1) : 0;
}

function updateClubSettings_(payload) {
  const spreadsheet = SpreadsheetApp.openById(payload.spreadsheetId || DEFAULT_MEMBERSHIP_SHEET_ID);
  const current = readClubSettings_(spreadsheet);
  const incoming = payload.settings || {};
  Object.keys(current).forEach(function(key) {
    if (incoming[key] != null) current[key] = String(incoming[key]).replace(/[<>\r\n]/g, " ").trim().slice(0, 300);
  });
  if (!current.clubName || !current.email || !current.accountHolder || !current.iban) {
    return json_({ status: 400, message: "Club name, email, account holder and IBAN are required." });
  }
  const sheet = getSettingsSheet_(spreadsheet);
  if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).clearContent();
  const rows = Object.keys(current).map(function(key) { return [key, safeSpreadsheetValue_(current[key])]; });
  sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  return json_({ status: 200, settings: current });
}

function safeSpreadsheetValue_(value) {
  if (typeof value === "number" || typeof value === "boolean") return value;
  const text = String(value == null ? "" : value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function safeFileName_(value) {
  return String(value).replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 140);
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
