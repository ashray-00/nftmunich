import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ConsentSection from "./ConsentSection";
import RequestRegistrationForm from "./RequestRegistrationForm";
import styles from "../styles/RequestRegistrationForm.module.css"; // Import the CSS for styling

const PlayerRegistrationForm = () => {
  const [hasConsented, setHasConsented] = useState(false);
  const [formStatus, setFormStatus] = useState<"success" | "error" | "already-registered" | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleConsent = () => {
    setHasConsented(true);
  };

  const handleSuccess = () => {
    setFormStatus("success");
  };

  const handleAlreadyRegistered = () => {
    setFormStatus("already-registered");
  };

  const handleError = (message: string) => {
    setFormStatus("error");
    setErrorMessage(message);
  };

  const handleBack = () => {
    router.push("/#player-registration"); // Navigate to the #player-registration section
  };

  return (
    <div>
      {formStatus === "success" && (
        <div className={styles["thank-you-message"]}>
          Thank you for your response! We will contact you soon.
        </div>
      )}

      {formStatus === "already-registered" && (
        <div className={styles["thank-you-message"]}>
          Email already registered. We will contact you via email soon.
        </div>
      )}

      {formStatus === "error" && (
        <p className={styles["error-text"]}>
          {errorMessage || "An error occurred. Please try again."}
        </p>
      )}

      {!formStatus && (
        <>
          {!hasConsented ? (
            <ConsentSection onAgree={handleConsent} />
          ) : (
            <RequestRegistrationForm
              onSuccess={handleSuccess}
              onError={(message) => {
                if (message.includes("must be unique")) {
                  handleAlreadyRegistered();
                } else {
                  handleError(message);
                }
              }}
            />
          )}
        </>
      )}

      {/* Back button always visible */}
      <div className={styles["form-navigation"]}>
        <button onClick={handleBack} className={styles["back-button"]}>
          Back
        </button>
      </div>
    </div>
  );
};

export default PlayerRegistrationForm;