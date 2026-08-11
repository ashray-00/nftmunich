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
const APPROVED_PLAYERS_TAB = "Approved Player Emails";
const PENDING_REQUESTS_TAB = "Pending Player Requests";
const APPLICATION_TABS = {
  member: "Club Members",
  player: "Registered Players",
  management: "Management + Players"
};

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    const publicActions = { publicClubSettings: true };
    const expectedSecret = PropertiesService.getScriptProperties().getProperty("WEBSITE_SHARED_SECRET");
    if (!publicActions[payload.action] && (!expectedSecret || payload.sharedSecret !== expectedSecret)) {
      return json_({ status: 403, message: "Forbidden." });
    }
    if (payload.action === "uploadFile") return uploadMembershipFile_(payload);
    if (payload.action === "membershipRegistration") return saveMembershipRegistration_(payload);
    if (payload.action === "registrationInterest") return sendRegistrationInterest_(payload);
    if (payload.action === "syncApprovedPlayers") return syncApprovedPlayers_(payload);
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
  const requiresApproval = requestedType !== "supporter";
  const isApproved = !requiresApproval || isApprovedPlayerEmail_(email);

  if (!isApproved) {
    savePendingPlayerRequest_(name, email, requestedType);
    const pendingBody = [
      "Hi " + name + ",",
      "",
      "We received your " + registrationType + " request.",
      "We will email your registration link after approval.",
      "",
      "Questions? Contact " + REGISTRATION_EMAIL,
      "NFT Munich e.V."
    ].join("\n");
    MailApp.sendEmail({
      to: email,
      subject: "NFT Munich registration request received",
      body: pendingBody,
      name: "NFT Munich e.V.",
      replyTo: REGISTRATION_EMAIL
    });
    MailApp.sendEmail({
      to: REGISTRATION_EMAIL,
      subject: "Player approval needed — " + name,
      body: "Please review and add this person in the admin panel.\n\nName: " + name + "\nEmail: " + email + "\nCategory: " + registrationType,
      replyTo: email
    });
    return json_({ status: 200, result: "pending" });
  }

  const applicantBody = [
    "Hi " + name + ",",
    "",
    "Complete your " + registrationType + " registration here:",
    registrationLink,
    "",
    "Questions? Contact " + REGISTRATION_EMAIL,
    "NFT Munich e.V."
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
    subject: "Your NFT Munich registration link",
    body: applicantBody,
    name: "NFT Munich e.V.",
    replyTo: REGISTRATION_EMAIL
  });
  try {
    MailApp.sendEmail({ to: REGISTRATION_EMAIL, subject: adminSubject, body: adminBody, replyTo: email });
  } catch (adminEmailError) {
    console.error("Admin registration notification failed", adminEmailError);
  }
  return json_({ status: 200, result: "link-sent" });
}

function approvedPlayersSheet_() {
  const spreadsheet = SpreadsheetApp.openById(DEFAULT_MEMBERSHIP_SHEET_ID);
  let sheet = spreadsheet.getSheetByName(APPROVED_PLAYERS_TAB);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(APPROVED_PLAYERS_TAB);
    sheet.appendRow(["Name", "Email", "Approved / synced at"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function isApprovedPlayerEmail_(email) {
  const normalized = String(email || "").trim().toLowerCase();
  const sheet = approvedPlayersSheet_();
  if (sheet.getLastRow() < 2) return false;
  return sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues().some(function(row) {
    return String(row[0] || "").trim().toLowerCase() === normalized;
  });
}

function syncApprovedPlayers_(payload) {
  const players = Array.isArray(payload.players) ? payload.players : [];
  const sheet = approvedPlayersSheet_();
  const existing = {};
  if (sheet.getLastRow() >= 2) {
    sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues().forEach(function(row, index) {
      existing[String(row[0] || "").trim().toLowerCase()] = index + 2;
    });
  }
  players.forEach(function(player) {
    const email = String(player && player.email || "").trim().toLowerCase();
    const name = String(player && player.name || "").trim();
    if (!email || email.indexOf("@") < 1) return;
    if (existing[email]) {
      sheet.getRange(existing[email], 1, 1, 3).setValues([[name, email, new Date()]]);
    } else {
      sheet.appendRow([name, email, new Date()]);
      existing[email] = sheet.getLastRow();
    }
    sendApprovedRegistrationLink_(email, name);
  });
  return json_({ status: 200, synced: players.length });
}

function pendingRequestsSheet_() {
  const spreadsheet = SpreadsheetApp.openById(DEFAULT_MEMBERSHIP_SHEET_ID);
  let sheet = spreadsheet.getSheetByName(PENDING_REQUESTS_TAB);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(PENDING_REQUESTS_TAB);
    sheet.appendRow(["Name", "Email", "Registration type", "Requested at", "Status"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function savePendingPlayerRequest_(name, email, requestedType) {
  const sheet = pendingRequestsSheet_();
  const normalized = String(email).trim().toLowerCase();
  if (sheet.getLastRow() >= 2) {
    const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
    for (let index = 0; index < rows.length; index++) {
      if (String(rows[index][1] || "").trim().toLowerCase() === normalized && rows[index][4] !== "Approved") {
        sheet.getRange(index + 2, 1, 1, 5).setValues([[name, normalized, requestedType, new Date(), "Pending"]]);
        return;
      }
    }
  }
  sheet.appendRow([name, normalized, requestedType, new Date(), "Pending"]);
}

function sendApprovedRegistrationLink_(email, fallbackName) {
  const sheet = pendingRequestsSheet_();
  if (sheet.getLastRow() < 2) return;
  const normalized = String(email).trim().toLowerCase();
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
  rows.forEach(function(row, index) {
    if (String(row[1] || "").trim().toLowerCase() !== normalized || row[4] === "Approved") return;
    const path = row[2] === "management-player" ? "management" : "player";
    const label = path === "management" ? "Management and Player" : "Player";
    const body = [
      "Hi " + (row[0] || fallbackName || "") + ",",
      "",
      "Your " + label + " registration is approved.",
      "Complete the form here:",
      "https://www.nftmunich.club/registration?type=" + path,
      "",
      "Questions? Contact " + REGISTRATION_EMAIL,
      "NFT Munich e.V."
    ].join("\n");
    MailApp.sendEmail({
      to: normalized,
      subject: "Your NFT Munich registration is approved",
      body: body,
      name: "NFT Munich e.V.",
      replyTo: REGISTRATION_EMAIL
    });
    sheet.getRange(index + 2, 5).setValue("Approved");
  });
}

function uploadMembershipFile_(payload) {
  if (!payload.base64 || !payload.filename || !payload.mimeType) {
    return json_({ status: 400, message: "Missing file information." });
  }

  const folders = DriveApp.getFoldersByName(UPLOAD_FOLDER);
  const rootFolder = folders.hasNext() ? folders.next() : DriveApp.createFolder(UPLOAD_FOLDER);
  const categoryNames = {
    member: "01_Club_Members",
    player: "02_Players",
    management: "03_Management_and_Players"
  };
  const categoryName = categoryNames[payload.registrationType] || "00_Unsorted";
  const categoryFolder = getOrCreateChildFolder_(rootFolder, categoryName);
  const applicantName = safeFolderName_((payload.fullName || "Applicant") + "_" + (payload.email || "no-email"));
  const folder = getOrCreateChildFolder_(categoryFolder, applicantName);
  const bytes = Utilities.base64Decode(payload.base64);
  const blob = Utilities.newBlob(bytes, payload.mimeType, safeFileName_(payload.filename));
  const file = folder.createFile(blob);
  file.setDescription("Private NFT Munich membership application document. Category: " + categoryName);

  return json_({ status: 200, fileUrl: file.getUrl() });
}

function getOrCreateChildFolder_(parent, name) {
  const children = parent.getFoldersByName(name);
  return children.hasNext() ? children.next() : parent.createFolder(name);
}

function safeFolderName_(value) {
  return String(value || "Applicant")
    .replace(/[\\/:*?"<>|#%{}\[\]]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) || "Applicant";
}

function saveMembershipRegistration_(payload) {
  const data = payload.registration || {};
  const spreadsheet = SpreadsheetApp.openById(payload.spreadsheetId || DEFAULT_MEMBERSHIP_SHEET_ID);
  const tabName = APPLICATION_TABS[data.registrationType];
  if (!tabName) return json_({ status: 400, message: "Unknown registration type." });
  const sheet = getOrCreateApplicationSheet_(spreadsheet, tabName);

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

function getOrCreateApplicationSheet_(spreadsheet, tabName) {
  let sheet = spreadsheet.getSheetByName(tabName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(tabName);
    sheet.appendRow([
      "Application ID", "Submitted at", "Registration type", "Language",
      "First name", "Last name", "Birth date", "Street", "Postal code",
      "City", "Email", "Phone", "Fee category", "Membership fee",
      "Player fee", "Position", "Emergency contact", "Emergency phone",
      "Management role", "Responsibility", "Photo", "ID document",
      "Insurance", "Truth accepted", "Statutes accepted", "Privacy accepted",
      "Application status", "Review status", "Notes"
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 29).setFontWeight("bold").setBackground("#0b5dbb").setFontColor("#ffffff");
    sheet.autoResizeColumns(1, 29);
  }
  return sheet;
}

function sendApplicantConfirmation_(data, applicationId, settings) {
  const labels = {
    member: "Club member",
    player: "Player",
    management: "Management and Player"
  };
  const category = labels[data.registrationType] || data.registrationType;
  const hardship = data.feeCategory === "hardship";
  const total = hardship ? "" : Number(data.totalFee || 0);
  const reference = "Mitgliedschaft " + applicationId + " " + data.firstName + " " + data.lastName;
  const paymentEn = hardship
    ? ["Please do not transfer anything yet. The board will review your hardship request and contact you personally."]
    : [
        "Please transfer €" + total + " to the following club account:",
        "Account holder: " + settings.accountHolder,
        "IBAN: " + settings.iban,
        "Payment reference: " + reference
      ];
  const body = [
    "Hi " + data.firstName + ",",
    "",
    "Your " + category + " registration was received.",
    "Application ID: " + applicationId,
    "",
    paymentEn.join("\n"),
    "",
    "Questions? Contact " + REGISTRATION_EMAIL,
    settings.clubName
  ].join("\n");

  MailApp.sendEmail({
    to: data.email,
    subject: "NFT Munich registration received",
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
