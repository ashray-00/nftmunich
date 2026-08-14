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
    const publicActions = { publicClubSettings: true, checkApprovedPlayerEmail: true };
    const expectedSecret = PropertiesService.getScriptProperties().getProperty("WEBSITE_SHARED_SECRET");
    if (!publicActions[payload.action] && (!expectedSecret || payload.sharedSecret !== expectedSecret)) {
      return json_({ status: 403, message: "Forbidden." });
    }
    if (payload.action === "uploadFile") return uploadMembershipFile_(payload);
    if (payload.action === "membershipRegistration") return saveMembershipRegistration_(payload);
    if (payload.action === "registrationInterest") return sendRegistrationInterest_(payload);
    if (payload.action === "syncApprovedPlayers") return syncApprovedPlayers_(payload);
    if (payload.action === "checkApprovedPlayerEmail") return checkApprovedPlayerEmail_(payload);
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
    supporter: "Member / Supporter",
    player: "Core Member - Player",
    "management-player": "Core Member - Player + Management"
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

function checkApprovedPlayerEmail_(payload) {
  const email = String(payload.email || "").trim().toLowerCase();
  if (!email || email.indexOf("@") < 1) return json_({ status: 400, approved: false });
  return json_({ status: 200, approved: isApprovedPlayerEmail_(email) });
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
    const isNew = !existing[email];
    if (!isNew) {
      sheet.getRange(existing[email], 1, 1, 3).setValues([[name, email, new Date()]]);
    } else {
      sheet.appendRow([name, email, new Date()]);
      existing[email] = sheet.getLastRow();
    }
    if (payload.sendLinks && isNew) sendCoreRegistrationLink_(email, name);
  });
  return json_({ status: 200, synced: players.length });
}

function sendCoreRegistrationLink_(email, name) {
  const body = [
    "Hi " + (name || ""),
    "",
    "You are approved to register as a Core Member of NFT Munich e.V.",
    "Complete your registration here:",
    "https://www.nftmunich.club/registration?type=player",
    "",
    "Questions? Contact " + REGISTRATION_EMAIL,
    "NFT Munich e.V."
  ].join("\n");
  MailApp.sendEmail({
    to: email,
    subject: "Your NFT Munich Core Member registration link",
    body: body,
    name: "NFT Munich e.V.",
    replyTo: REGISTRATION_EMAIL
  });
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
  if (["image/jpeg", "image/png"].indexOf(payload.mimeType) === -1 || String(payload.base64).length > 3000000) {
    return json_({ status: 400, message: "Invalid image type or size." });
  }
  if (payload.registrationType !== "member" && !isApprovedPlayerEmail_(payload.email)) {
    return json_({ status: 403, message: "This Core Member email is not approved." });
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
  const safeFilename = safeFileName_(payload.filename);
  const existingFiles = folder.getFilesByName(safeFilename);
  if (existingFiles.hasNext()) {
    return json_({ status: 200, fileUrl: existingFiles.next().getUrl(), reused: true });
  }
  const folderFiles = folder.getFiles();
  let fileCount = 0;
  while (folderFiles.hasNext() && fileCount <= 10) { folderFiles.next(); fileCount += 1; }
  if (fileCount > 10) return json_({ status: 429, message: "Upload limit reached for this application." });
  const bytes = Utilities.base64Decode(payload.base64);
  const blob = Utilities.newBlob(bytes, payload.mimeType, safeFilename);
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
  if (data.registrationType !== "member" && !isApprovedPlayerEmail_(data.email)) {
    return json_({ status: 403, message: "This Core Member email is not approved." });
  }
  const spreadsheet = SpreadsheetApp.openById(payload.spreadsheetId || DEFAULT_MEMBERSHIP_SHEET_ID);
  const settings = readClubSettings_(spreadsheet);
  const hardship = data.feeCategory === "hardship";
  data.membershipFee = hardship ? "" : Number(settings.supporterFee) || 15;
  data.playerFee = data.registrationType === "member" || hardship
    ? ""
    : data.feeCategory === "student" ? Number(settings.playerStudentFee) || 0 : Number(settings.playerOtherFee) || 0;
  data.totalFee = hardship ? "" : Number(data.membershipFee) + Number(data.playerFee || 0);
  const tabName = APPLICATION_TABS[data.registrationType];
  if (!tabName) return json_({ status: 400, message: "Unknown registration type." });
  const sheet = getOrCreateApplicationSheet_(spreadsheet, tabName);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  let applicationId;
  const now = Utilities.formatDate(new Date(), "Europe/Berlin", "yyyy-MM-dd HH:mm:ss");
  data.submittedAt = now;
  try {
    applicationId = createApplicationId_(spreadsheet);
    const photoFile = driveFileFromUrl_(data.photo);
    const applicantFolder = firstParentFolder_(photoFile);
    applicantFolder.setName(safeFolderName_(applicationId + "_" + data.firstName + "_" + data.lastName));
    const fileBase = safeFileName_(applicationId + "_" + data.firstName + "_" + data.lastName);
    photoFile.setName(fileBase + "_Photo." + fileExtension_(photoFile));
    const documentsPdf = createDocumentsPdf_(data, applicationId);
    const applicationPdf = createApplicationPdf_(data, applicationId, documentsPdf);
    const accepted = "✓ Accepted — " + now;
    const row = [
      applicationId, now, data.registrationType, data.language,
      data.firstName, data.lastName, data.birthDate, data.street, data.postalCode,
      data.city, data.email, data.phone, data.feeCategory, data.membershipFee,
      data.playerFee, data.position, data.emergencyName, data.emergencyPhone,
      data.managementRole, data.responsibility, safeSpreadsheetValue_(data.photo),
      safeSpreadsheetValue_(documentsPdf), safeSpreadsheetValue_(documentsPdf),
      accepted, accepted, accepted, "Pending", "New", ""
      , safeSpreadsheetValue_(applicationPdf)
    ];
    sheet.appendRow(row.map(safeSpreadsheetValue_));
    sheet.getRange(1, 30).setValue("Application PDF");
  } finally {
    lock.releaseLock();
  }
  let emailSent = true;
  try {
    sendApplicantConfirmation_(data, applicationId, settings);
  } catch (emailError) {
    emailSent = false;
    console.error("Applicant confirmation email failed", emailError);
  }
  return json_({ status: 200, applicationId: applicationId, totalFee: data.totalFee, emailSent: emailSent });
}

function createDocumentsPdf_(data, applicationId) {
  const items = [
    ["ID - front", data.idFront],
    ["ID - back", data.idBack]
  ];
  if (data.registrationType !== "member") {
    items.push(["Insurance - front", data.insuranceFront]);
    items.push(["Insurance - back", data.insuranceBack]);
  }
  const sourceFiles = items.map(function(item) { return driveFileFromUrl_(item[1]); });
  const folder = firstParentFolder_(sourceFiles[0]);
  const doc = DocumentApp.create(applicationId + " Documents");
  const body = doc.getBody();
  body.setMarginTop(42).setMarginBottom(42).setMarginLeft(42).setMarginRight(42);
  const fullName = data.firstName + " " + data.lastName;
  items.forEach(function(item, index) {
    if (index > 0) body.appendPageBreak();
    const heading = body.appendParagraph("NFT MUNICH E.V.  |  APPLICANT DOCUMENT");
    heading.setBold(true).setFontSize(10).setForegroundColor("#164c35");
    body.appendHorizontalRule();
    body.appendParagraph(item[0]).setHeading(DocumentApp.ParagraphHeading.HEADING1);
    const meta = body.appendTable([
      ["Full name", fullName],
      ["Application number", applicationId]
    ]);
    styleFormTable_(meta);
    body.appendParagraph("");
    const image = body.appendImage(sourceFiles[index].getBlob());
    const width = image.getWidth();
    const height = image.getHeight();
    const scale = Math.min(500 / width, 610 / height, 1);
    image.setWidth(Math.round(width * scale)).setHeight(Math.round(height * scale));
    body.appendParagraph("Document: " + item[0] + "  |  " + fullName).setFontSize(9).setForegroundColor("#666666");
  });
  doc.saveAndClose();
  const tempFile = DriveApp.getFileById(doc.getId());
  const fileBase = safeFileName_(applicationId + "_" + data.firstName + "_" + data.lastName);
  const pdf = folder.createFile(tempFile.getAs(MimeType.PDF).setName(fileBase + "_ID_Insurance.pdf"));
  pdf.setDescription("Private combined ID and insurance document for " + applicationId);
  tempFile.setTrashed(true);
  sourceFiles.forEach(function(file) { file.setTrashed(true); });
  return pdf.getUrl();
}

function createApplicationPdf_(data, applicationId, documentsPdf) {
  const photoFile = driveFileFromUrl_(data.photo);
  const folder = firstParentFolder_(photoFile);
  const doc = DocumentApp.create(applicationId + " Application");
  const body = doc.getBody();
  body.setMarginTop(42).setMarginBottom(42).setMarginLeft(42).setMarginRight(42);
  const title = body.appendParagraph("NFT MUNICH E.V.");
  title.setBold(true).setFontSize(11).setForegroundColor("#164c35");
  body.appendParagraph("MEMBERSHIP APPLICATION").setHeading(DocumentApp.ParagraphHeading.TITLE);
  body.appendParagraph("Titurelstrasse 8, 81925 Munich  |  nftmunich@gmail.com  |  www.nftmunich.club")
    .setFontSize(8).setForegroundColor("#666666");
  body.appendHorizontalRule();

  appendFormSection_(body, "Application", [
    ["Application number", applicationId], ["Submitted", data.submittedAt],
    ["Category", registrationLabel_(data.registrationType)], ["Language", String(data.language || "").toUpperCase()]
  ]);
  appendFormSection_(body, "Personal details", [
    ["Full name", data.firstName + " " + data.lastName], ["Date of birth", data.birthDate],
    ["Address", data.street + ", " + data.postalCode + " " + data.city],
    ["Email", data.email], ["Phone / WhatsApp", data.phone]
  ]);
  if (data.registrationType !== "member") appendFormSection_(body, "Player and management details", [
    ["Role", data.registrationType === "management" ? "Player + Management" : "Player"],
    ["Position", data.position], ["Emergency contact", data.emergencyName],
    ["Emergency phone", data.emergencyPhone], ["Management role", data.managementRole],
    ["Responsibility", data.responsibility]
  ]);
  appendFormSection_(body, "Fee", [
    ["Fee category", data.feeCategory], ["Joining fee", data.membershipFee],
    ["Player fee", data.playerFee], ["Total amount", data.totalFee === "" ? "Board review" : data.totalFee + " EUR"]
  ]);
  body.appendParagraph("Declarations and consent").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  const accepted = "✓ Accepted — " + data.submittedAt;
  const consentTable = body.appendTable([
    ["Declaration / confirmation", accepted],
    ["NFT Munich e.V. statutes", accepted],
    ["Privacy policy and data processing", accepted]
  ]);
  styleFormTable_(consentTable);
  body.appendParagraph("");
  body.appendParagraph("This document was generated from the applicant's submitted online form. The recorded date and time document the active acceptance of all mandatory declarations.")
    .setFontSize(8).setForegroundColor("#666666");
  doc.saveAndClose();
  const tempFile = DriveApp.getFileById(doc.getId());
  const fileBase = safeFileName_(applicationId + "_" + data.firstName + "_" + data.lastName);
  const pdf = folder.createFile(tempFile.getAs(MimeType.PDF).setName(fileBase + "_Application.pdf"));
  pdf.setDescription("Private membership application summary for " + applicationId);
  tempFile.setTrashed(true);
  return pdf.getUrl();
}

function driveFileFromUrl_(url) {
  const match = String(url || "").match(/[-\w]{25,}/);
  if (!match) throw new Error("Invalid private Drive file URL.");
  const file = DriveApp.getFileById(match[0]);
  const applicantParents = file.getParents();
  if (!applicantParents.hasNext()) throw new Error("Upload folder not found.");
  const categoryParents = applicantParents.next().getParents();
  if (!categoryParents.hasNext()) throw new Error("Upload category not found.");
  const rootParents = categoryParents.next().getParents();
  if (!rootParents.hasNext() || rootParents.next().getName() !== UPLOAD_FOLDER) {
    throw new Error("The file is outside the private upload folder.");
  }
  return file;
}

function firstParentFolder_(file) {
  const parents = file.getParents();
  if (!parents.hasNext()) throw new Error("Applicant folder not found.");
  return parents.next();
}

function appendFormSection_(body, title, rows) {
  body.appendParagraph(title).setHeading(DocumentApp.ParagraphHeading.HEADING2);
  const filtered = rows.filter(function(row) { return row[1] !== "" && row[1] != null; });
  if (filtered.length) styleFormTable_(body.appendTable(filtered));
}

function styleFormTable_(table) {
  table.setBorderColor("#d7ddd9").setBorderWidth(1);
  for (let rowIndex = 0; rowIndex < table.getNumRows(); rowIndex += 1) {
    const row = table.getRow(rowIndex);
    row.getCell(0).setBackgroundColor("#f1f5f2").setWidth(145);
    row.getCell(0).editAsText().setBold(true).setFontSize(9).setForegroundColor("#164c35");
    row.getCell(1).editAsText().setFontSize(9).setForegroundColor("#111111");
  }
  return table;
}

function registrationLabel_(type) {
  if (type === "management") return "Core Member - Player + Management";
  if (type === "player") return "Core Member - Player";
  return "Member";
}

function fileExtension_(file) {
  const nameMatch = String(file.getName() || "").match(/\.([a-z0-9]{2,5})$/i);
  if (nameMatch) return nameMatch[1].toLowerCase();
  return file.getMimeType() === MimeType.PNG ? "png" : "jpg";
}

function createApplicationId_(spreadsheet) {
  let highest = 0;
  Object.keys(APPLICATION_TABS).forEach(function(key) {
    const sheet = spreadsheet.getSheetByName(APPLICATION_TABS[key]);
    if (!sheet || sheet.getLastRow() < 2) return;
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().forEach(function(row) {
      const match = String(row[0] || "").match(/^NFT-(\d{4})$/);
      if (match) highest = Math.max(highest, Number(match[1]));
    });
  });
  return "NFT-" + String(highest + 1).padStart(4, "0");
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
    member: "Member / Supporter",
    player: "Core Member - Player",
    management: "Core Member - Player + Management"
  };
  const category = labels[data.registrationType] || data.registrationType;
  const hardship = data.feeCategory === "hardship";
  const total = hardship ? "" : Number(data.totalFee || 0);
  const reference = [paymentReferencePart_(data.firstName), paymentReferencePart_(data.lastName)]
    .filter(String)
    .join("-");
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
    "Thank you for registering as " + category + ". Your registration was received successfully.",
    "Application ID: " + applicationId,
    "",
    paymentEn.join("\n"),
    "",
    "Questions? Contact " + REGISTRATION_EMAIL,
    settings.clubName
  ].join("\n");

  const htmlPayment = hardship
    ? "<p><strong>Amount:</strong> No payment now. The board will contact you.</p>"
    : [
        "<p><strong>Amount: €" + total + "</strong></p>",
        "<p>Account holder: " + escapeHtml_(settings.accountHolder) + "<br>",
        "<strong>IBAN: " + escapeHtml_(settings.iban) + "</strong><br>",
        "Payment reference: <strong>" + escapeHtml_(reference) + "</strong></p>"
      ].join("");
  const htmlBody = [
    "<p>Hi " + escapeHtml_(data.firstName) + ",</p>",
    "<p>Thank you for registering. Your registration was received successfully.</p>",
    "<p><strong>Category: " + escapeHtml_(category) + "</strong><br>",
    "Application ID: <strong>" + escapeHtml_(applicationId) + "</strong></p>",
    htmlPayment,
    "<p>Questions? Contact <a href=\"mailto:" + REGISTRATION_EMAIL + "\">" + REGISTRATION_EMAIL + "</a><br>",
    escapeHtml_(settings.clubName) + "</p>"
  ].join("");

  MailApp.sendEmail({
    to: data.email,
    subject: "NFT Munich registration received",
    body: body,
    htmlBody: htmlBody,
    name: "NFT Munich e.V.",
    replyTo: REGISTRATION_EMAIL
  });
}

function escapeHtml_(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function paymentReferencePart_(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
}

function defaultClubSettings_() {
  return {
    clubName: "NFT Munich e.V.",
    address: "Titurelstrasse 8, 81925 Munich",
    email: "nftmunich@gmail.com",
    website: "www.nftmunich.club",
    accountHolder: PAYMENT_ACCOUNT_HOLDER,
    iban: PAYMENT_IBAN,
    supporterFee: "15",
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
