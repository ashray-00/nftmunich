"use client";

import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import styles from "../styles/TournamentRegistration.module.css";
import formFields from "../data/tournament_registration_form.json";

type Tournament = "frankfurt" | "berlin";

interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export const TOURNAMENT_LABELS: Record<Tournament, string> = {
  frankfurt: "Frankfurt Tournament",
  berlin: "Berlin Tournament",
};

export default function TournamentRegistrationForm({
  tournament,
}: {
  tournament: Tournament;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, unknown>>();

  const selectedRole = useWatch({ control, name: "role" }) as string | undefined;
  const isPlayer = selectedRole === "Player";

  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
  const [apiError, setApiError] = useState<string>("");
  const [checklistError, setChecklistError] = useState<string>("");

  const onSubmit = async (data: Record<string, unknown>) => {
    setApiError("");
    setChecklistError("");

    // If Player, require at least one checklist item to be ticked
    if (data.role === "Player") {
      const checklist = data.checklist as Record<string, unknown> | undefined;
      const anyChecked = checklist && Object.values(checklist).some(Boolean);
      if (!anyChecked) {
        setChecklistError("Players must confirm at least one checklist item.");
        return;
      }
    }

    try {
      const res = await fetch("/api/tournament-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournament, ...data }),
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
          Thank you for your submission!
          <p>We look forward to seeing you at the {TOURNAMENT_LABELS[tournament]}.</p>
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

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {(formFields as FormField[]).map((field) => {
          const isChecklistField =
            field.id === "section_checklist" || field.id === "checklist";
          if (isChecklistField && !isPlayer) return null;

          if (field.type === "section-heading") {
            const isChecklistHeading = field.id === "section_checklist";
            return (
              <div key={field.id} className={styles.sectionHeading}>
                {field.label}
                {isChecklistHeading && (
                  <span className={styles.sectionHint}>
                    {" (Required for Players)"}
                  </span>
                )}
              </div>
            );
          }

          if (field.type === "text" || field.type === "email") {
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

          if (field.type === "number") {
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
                  type="number"
                  min={0}
                  placeholder={field.placeholder ?? ""}
                  className={styles.inputField}
                  {...register(field.id, {
                    required: field.required
                      ? `${field.label} is required`
                      : false,
                    min: { value: 0, message: "Value cannot be negative" },
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
                <span className={styles.fieldLabel}>
                  {field.label}
                  {field.required && (
                    <span className={styles.requiredAsterisk}>*</span>
                  )}
                </span>
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

          if (field.type === "checkbox-group" && field.options) {
            return (
              <div key={field.id} className={styles.formField}>
                {field.label && (
                  <span className={styles.fieldLabel}>{field.label}</span>
                )}
                <div className={styles.checkboxGroup}>
                  {field.options.map((option) => (
                    <label key={option} className={styles.checkboxOption}>
                      <input
                        type="checkbox"
                        value={option}
                        {...register(`${field.id}.${option}`)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {checklistError && (
                  <span className={styles.errorText}>{checklistError}</span>
                )}
              </div>
            );
          }

          return null;
        })}

        {submitState === "error" && apiError && (
          <p className={styles.apiError}>{apiError}</p>
        )}

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
      </form>
    </div>
  );
}
