"use client";

import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import styles from "../styles/TournamentRegistration.module.css";
import formFieldsRaw from "../data/tournament_registration_form.json";
import { useAuth } from "../context/AuthContext";
import LoginGate from "./LoginGate";

type Tournament = "berlin";

interface ShowIfCondition {
  field: string;
  values: string[];
}

interface FieldLink {
  text: string;
  url: string;
}

interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  description?: string;
  links?: FieldLink[];
  image?: string;
  showIf?: ShowIfCondition[];
  tournamentOnly?: string;
  uploadLabel?: string;
  maxFiles?: number;
  accept?: string[];
  fileKey?: string;
}

const formFields = formFieldsRaw as FormField[];

export const TOURNAMENT_LABELS: Record<Tournament, string> = {
  berlin: "Berlin Tournament — Nepali Europapokal 2026",
};

const PLAYER_CONFIRMATION_ITEMS = [
  "I have socks or will arrange them.",
  "I have shin guards or will arrange them.",
  "I have bibs or will arrange them.",
  "I have an NFT T-shirt or will arrange it.",
  "I have football shoes for Kunstrasen / artificial turf or will arrange them.",
  "I have football shoes for natural grass or will arrange them.",
  "I will bring my ID / passport / residence permit.",
  "I will bring my health insurance card.",
];

const GENERAL_CONFIRMATION_ITEMS = [
  "I understand that the final cost depends on the number of travelling squad members.",
  "I understand that the team plans to travel together by train and stay in a hotel.",
  "I confirm that the information I provided is correct.",
];

const DOC_CONFIRMATION_ITEMS = [
  "I confirm that the uploaded documents are valid.",
  "I confirm that the required information is clearly visible.",
  "I confirm that I will bring the valid original documents on the tournament day.",
];

export default function TournamentRegistrationForm({
  tournament,
}: {
  tournament: Tournament;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, unknown>>();

  const watchedValues = useWatch({ control }) as Record<string, unknown>;

  const { user, loading: authLoading } = useAuth();
  const selectedRole = watchedValues["role"] as string | undefined;

  const isDev = process.env.NODE_ENV === "development";

  function fillAsPlayer() {
    reset({
      role: "Player",
      name: "Max Mustermann",
      email: "max@example.com",
      phone: "+49 170 1234567",
      position: "Goalkeeper",
      position_note: "",
      availability: "Yes",
      availability_note: "",
      fitness: "8",
      physical_prep: "Running 3x per week and gym sessions.",
      jersey_size: "L",
      socks: "Yes",
      shin_guards: "Yes",
      bibs: "Yes",
      beanie_bag: "Yes, I have one",
      nft_tshirt: "No, I need one",
      nft_tshirt_size: "L",
      shoes_kunstrasen: "Yes",
      shoes_natural: "Yes",
      goalkeeper_set: "Yes, I have jersey, trousers, and gloves",
      health_insurance: "Yes",
      health_card: "Yes",
      residence_permit: "Yes",
      residence_permit_bring: "Yes",
      travel_availability: "I will travel and return with the team.",
      travel_saturday_reason: "",
      travel_other_explanation: "",
      hotel_need: "Yes",
      food_pref: "Non-veg",
      meal_boxes: "2",
      food_allergy: "",
      player_confirmation: {
        item_0: true,
        item_1: true,
        item_2: true,
        item_3: true,
        item_4: true,
        item_5: true,
        item_6: true,
        item_7: true,
      },
      doc_confirmation: {
        item_0: true,
        item_1: true,
        item_2: true,
      },
      player_notes: "",
      general_confirmation: {
        item_0: true,
        item_1: true,
        item_2: true,
      },
      special_info: "",
      comments: "Looking forward to it!",
    });
  }

  function fillAsSupporter() {
    reset({
      role: "Supporter / Guest",
      name: "Julia Beispiel",
      email: "julia@example.com",
      phone: "+49 160 9876543",
      travel_day: "I can travel on Friday and stay until the end of the tournament.",
      saturday_reason: "",
      travel_other_plan: "",
      return_day: "I will return on Sunday night after the tournament.",
      return_other_plan: "",
      food_pref: "Veg",
      meal_boxes: "1",
      food_allergy: "Lactose intolerant",
      general_confirmation: {
        item_0: true,
        item_1: true,
        item_2: true,
      },
      special_info: "",
      comments: "",
    });
  }

  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [apiError, setApiError] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");
  const [fileStates, setFileStates] = useState<Record<string, File[]>>({});
  const [fileUploadErrors, setFileUploadErrors] = useState<Record<string, string>>({});

  function isVisible(field: FormField): boolean {
    if (field.tournamentOnly && field.tournamentOnly !== tournament) return false;
    if (!field.showIf) return true;
    return field.showIf.every((cond) => {
      const val = watchedValues[cond.field] as string | undefined;
      return val != null && cond.values.includes(val);
    });
  }

  function handleFileChange(
    fieldId: string,
    files: FileList | null,
    maxFiles: number
  ) {
    if (!files) return;
    const ACCEPTED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
    const MAX_SIZE = 2 * 1024 * 1024;
    const existing = fileStates[fieldId] || [];
    const toAdd: File[] = [];
    let error = "";
    Array.from(files).forEach((file) => {
      if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
        error = "Only PDF, JPG, and PNG files are accepted.";
        return;
      }
      if (file.size > MAX_SIZE) {
        error = `"${file.name}" exceeds the 2 MB size limit.`;
        return;
      }
      toAdd.push(file);
    });
    const combined = [...existing, ...toAdd].slice(0, maxFiles);
    setFileStates((prev) => ({ ...prev, [fieldId]: combined }));
    if (error) {
      setFileUploadErrors((prev) => ({ ...prev, [fieldId]: error }));
    } else {
      setFileUploadErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
    const input = document.getElementById(
      `file-input-${fieldId}`
    ) as HTMLInputElement | null;
    if (input) input.value = "";
  }

  function removeFile(fieldId: string, index: number) {
    setFileStates((prev) => {
      const updated = [...(prev[fieldId] || [])];
      updated.splice(index, 1);
      return { ...prev, [fieldId]: updated };
    });
  }

  const onSubmit = async (data: Record<string, unknown>) => {
    setApiError("");
    setValidationError("");

    const generalConf = data.general_confirmation as
      | Record<string, unknown>
      | undefined;
    const allGeneralConfirmed = GENERAL_CONFIRMATION_ITEMS.every((_, i) =>
      Boolean(generalConf?.[`item_${i}`])
    );
    if (!allGeneralConfirmed) {
      setValidationError(
        "Please confirm all items in the General Confirmation section before submitting."
      );
      return;
    }

    if (data.role === "Player") {
      const playerConf = data.player_confirmation as
        | Record<string, unknown>
        | undefined;
      const allPlayerConfirmed = PLAYER_CONFIRMATION_ITEMS.every((_, i) =>
        Boolean(playerConf?.[`item_${i}`])
      );
      if (!allPlayerConfirmed) {
        setValidationError(
          "Players must confirm all items in the Player Confirmation section before submitting."
        );
        return;
      }

      const docConf = data.doc_confirmation as Record<string, unknown> | undefined;
      const allDocConfirmed = DOC_CONFIRMATION_ITEMS.every((_, i) =>
        Boolean(docConf?.[`item_${i}`])
      );
      if (!allDocConfirmed) {
        setValidationError(
          "Please confirm all items in the document confirmation section before submitting."
        );
        return;
      }

      const requiredUploads = formFields.filter(
        (f) => f.type === "file-upload" && f.required && isVisible(f)
      );
      for (const f of requiredUploads) {
        if (!fileStates[f.id] || fileStates[f.id].length === 0) {
          setValidationError(
            `Please upload at least one file for: ${f.uploadLabel || f.label}`
          );
          return;
        }
      }
    }

    // Serialize checkbox groups to readable strings before sending to the API
    const serializedData = { ...data };
    formFields.forEach((field) => {
      if (field.type === "checkbox-group" && field.options) {
        const group = data[field.id] as Record<string, unknown> | undefined;
        serializedData[field.id] = field.options
          .filter((_, i) => Boolean(group?.[`item_${i}`]))
          .join(", ");
      }
    });

    try {
      // Upload files one at a time, then submit the main form
      const fileUrls: Record<string, string[]> = {};
      const fileUploadFields = formFields.filter(
        (f) => f.type === "file-upload" && isVisible(f)
      );

      for (const field of fileUploadFields) {
        const files = fileStates[field.id] || [];
        if (files.length === 0) continue;
        const urls: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const fd = new FormData();
          fd.append("file", files[i]);
          fd.append("fieldType", field.fileKey || field.id);
          fd.append("fileIndex", files.length > 1 ? String(i + 1) : "0");
          fd.append("fullName", String(data.name || ""));
          const uploadRes = await fetch("/api/upload-documents", {
            method: "POST",
            body: fd,
          });
          if (!uploadRes.ok) {
            const json = await uploadRes.json().catch(() => ({}));
            throw new Error(json.message || "File upload failed. Please try again.");
          }
          const uploadJson = await uploadRes.json();
          urls.push(uploadJson.fileUrl || "");
        }
        fileUrls[field.id] = urls;
      }

      const res = await fetch("/api/tournament-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournament,
          ...serializedData,
          health_insurance_file_urls: (fileUrls["health_insurance_upload"] || []).join(", "),
          id_file_urls: (fileUrls["residence_permit_upload"] || []).join(", "),
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Submission failed. Please try again.");
      }
      setSubmitState("success");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "An error occurred.");
      setSubmitState("error");
    }
  };

  const handleBack = () => router.push("/#tournament-registration");

  if (submitState === "success") {
    return (
      <div className={styles.container}>
        <button className={styles.backButton} onClick={handleBack}>
          ← Back to tournament selection
        </button>
        <div className={styles.successMessage}>
          <p>Thank you for your registration.</p>
          <p>Your information has been submitted successfully.</p>
          <p>
            The management team will review the details and contact you if
            anything else is needed.
          </p>
          <p>
            Please also leave a final tick / check in the Facebook post after
            completing your registration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={handleBack}>
        ← Back to tournament selection
      </button>
      <div className={styles.formTournamentLabel}>
        Registering for: {TOURNAMENT_LABELS[tournament]}
      </div>

      {isDev && (
        <div className={styles.devToolbar}>
          <span className={styles.devLabel}>DEV</span>
          <button
            type="button"
            className={styles.devButton}
            onClick={fillAsPlayer}
          >
            Fill as Player (Goalkeeper)
          </button>
          <button
            type="button"
            className={styles.devButton}
            onClick={fillAsSupporter}
          >
            Fill as Supporter
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {formFields.map((field) => {
          if (field.id !== "role" && !selectedRole) {
            return null;
          }
          if (field.id !== "role" && selectedRole === "Player" && !authLoading && !user) {
            return null;
          }
          if (!isVisible(field)) return null;

          if (field.type === "section-heading") {
            return (
              <div key={field.id} className={styles.sectionHeading}>
                {field.label}
              </div>
            );
          }

          if (field.type === "info") {
            return (
              <div key={field.id} className={styles.infoBox}>
                {field.label.split("\n").map((line, i) =>
                  line.trim() === "" ? (
                    <br key={i} />
                  ) : (
                    <p key={i}>{line}</p>
                  )
                )}
                {field.links && field.links.length > 0 && (
                  <div className={styles.infoBoxLinks}>
                    {field.links.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.infoBoxLink}
                      >
                        {link.text}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          if (
            field.type === "text" ||
            field.type === "email" ||
            field.type === "number"
          ) {
            return (
              <div key={field.id} className={styles.formField}>
                <label htmlFor={field.id} className={styles.fieldLabel}>
                  {field.label}
                  {field.required && (
                    <span className={styles.requiredAsterisk}>*</span>
                  )}
                </label>
                <input
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder ?? ""}
                  className={styles.inputField}
                  {...register(field.id, {
                    required: field.required
                      ? `${field.label} is required`
                      : false,
                    ...(field.type === "email" && {
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email address",
                      },
                    }),
                  })}
                />
                {errors[field.id] && (
                  <span className={styles.errorText}>
                    {errors[field.id]?.message as string}
                  </span>
                )}
              </div>
            );
          }

          if (field.type === "long-text") {
            return (
              <div key={field.id} className={styles.formField}>
                <label htmlFor={field.id} className={styles.fieldLabel}>
                  {field.label}
                  {field.required && (
                    <span className={styles.requiredAsterisk}>*</span>
                  )}
                </label>
                <textarea
                  id={field.id}
                  placeholder={field.placeholder ?? ""}
                  className={styles.textareaField}
                  {...register(field.id, {
                    required: field.required
                      ? `${field.label} is required`
                      : false,
                  })}
                />
                {errors[field.id] && (
                  <span className={styles.errorText}>
                    {errors[field.id]?.message as string}
                  </span>
                )}
              </div>
            );
          }

          if (field.type === "radio" && field.options) {
            return (
              <div key={field.id} className={styles.formField}>
                {field.image && (
                  <div className={styles.fieldImageWrapper}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={field.image}
                      alt={field.label}
                      className={styles.fieldImage}
                    />
                  </div>
                )}
                <span className={styles.fieldLabel}>
                  {field.label}
                  {field.required && (
                    <span className={styles.requiredAsterisk}>*</span>
                  )}
                </span>
                {field.description && (
                  <p className={styles.fieldDescription}>{field.description}</p>
                )}
                {field.links && field.links.length > 0 && (
                  <div className={styles.fieldLinks}>
                    {field.links.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.fieldLink}
                      >
                        {link.text}
                      </a>
                    ))}
                  </div>
                )}
                <div className={styles.radioGroup}>
                  {field.options.map((option) => (
                    <label key={option} className={styles.radioOption}>
                      <input
                        type="radio"
                        value={option}
                        {...register(field.id, {
                          required: field.required
                            ? `Please select an option for "${field.label}"`
                            : false,
                        })}
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {errors[field.id] && (
                  <span className={styles.errorText}>
                    {errors[field.id]?.message as string}
                  </span>
                )}
              </div>
            );
          }

          if (field.type === "fitness-rating") {
            return (
              <div key={field.id} className={styles.formField}>
                <span className={styles.fieldLabel}>{field.label}</span>
                <div className={styles.fitnessGroup}>
                  {Array.from({ length: 10 }, (_, i) => String(i + 1)).map(
                    (val) => (
                      <label key={val} className={styles.fitnessOption}>
                        <input
                          type="radio"
                          value={val}
                          {...register(field.id)}
                        />
                        <span className={styles.fitnessLabel}>{val}</span>
                      </label>
                    )
                  )}
                </div>
              </div>
            );
          }

          if (field.type === "checkbox-group" && field.options) {
            return (
              <div key={field.id} className={styles.formField}>
                {field.label && (
                  <span className={styles.fieldLabel}>{field.label}</span>
                )}
                <div className={styles.checkboxGroup}>
                  {field.options.map((option, i) => (
                    <label key={i} className={styles.checkboxOption}>
                      <input
                        type="checkbox"
                        {...register(`${field.id}.item_${i}`)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            );
          }

          if (field.type === "file-upload") {
            const currentFiles = fileStates[field.id] || [];
            const maxFiles = field.maxFiles ?? 1;
            return (
              <div key={field.id} className={styles.formField}>
                <span className={styles.fieldLabel}>
                  {field.label}
                  {field.required && (
                    <span className={styles.requiredAsterisk}>*</span>
                  )}
                </span>
                {field.uploadLabel && (
                  <p className={styles.fileUploadLabel}>{field.uploadLabel}</p>
                )}
                <p className={styles.uploadHint}>
                  Accepted: PDF, JPG, PNG — Max 2 MB per file
                  {maxFiles > 1 ? ` — Up to ${maxFiles} files` : ""}
                </p>
                <input
                  type="file"
                  id={`file-input-${field.id}`}
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple={maxFiles > 1}
                  style={{ display: "none" }}
                  onChange={(e) =>
                    handleFileChange(field.id, e.target.files, maxFiles)
                  }
                />
                {currentFiles.length < maxFiles && (
                  <button
                    type="button"
                    className={styles.fileChooseButton}
                    onClick={() =>
                      (
                        document.getElementById(
                          `file-input-${field.id}`
                        ) as HTMLInputElement | null
                      )?.click()
                    }
                  >
                    {currentFiles.length === 0 ? "Choose File(s)" : "Add Another File"}
                  </button>
                )}
                {currentFiles.length > 0 && (
                  <ul className={styles.fileList}>
                    {currentFiles.map((f, i) => (
                      <li key={i} className={styles.fileItem}>
                        <span className={styles.fileName}>{f.name}</span>
                        <button
                          type="button"
                          className={styles.fileRemoveBtn}
                          onClick={() => removeFile(field.id, i)}
                          aria-label="Remove file"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {fileUploadErrors[field.id] && (
                  <span className={styles.errorText}>
                    {fileUploadErrors[field.id]}
                  </span>
                )}
              </div>
            );
          }

          return null;
        })}

        {selectedRole === "Player" && authLoading && (
          <p style={{ color: "#1a3a6b", margin: "1rem 0" }}>Checking login status…</p>
        )}
        {selectedRole === "Player" && !authLoading && !user && (
          <LoginGate />
        )}

        {validationError && (
          <p className={styles.apiError}>{validationError}</p>
        )}
        {submitState === "error" && apiError && (
          <p className={styles.apiError}>{apiError}</p>
        )}

        {selectedRole && !(selectedRole === "Player" && !authLoading && !user) && (
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className={styles.spinner} />
                Submitting...
              </>
            ) : (
              "Submit Registration"
            )}
          </button>
        )}
      </form>
    </div>
  );
}
