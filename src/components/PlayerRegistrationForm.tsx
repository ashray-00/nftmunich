"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import RegistrationForm from "./RegistrationForm";
import styles from "../styles/PlayerRegistrationForm.module.css";

const PlayerRegistrationPage = () => {
  const [hasConsented, setHasConsented] = useState(false);
  const [hasDisagreed, setHasDisagreed] = useState(false);
  const router = useRouter();

  const handleAgree = () => {
    setHasConsented(true);
    setHasDisagreed(false); // Reset disagreement message
  };

  const handleDisagree = () => {
    setHasDisagreed(true);
  };

  const handleBack = () => {
    router.push("/#player-registration");
  };

  return (
    <div className="min-h-screen bg-bavarian-white text-bavarian-blue p-8">
      {/* Consent Section */}
      {!hasConsented ? (
        <div className="mt-8 text-center">
          <p className="mb-4">
            I agree to the collection and processing of my personal data in
            accordance with the{" "}
            <a href="/privacy-policy" className="text-blue-600 underline">
              Privacy Policy
            </a>.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleAgree}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              Agree
            </button>
            <button
              onClick={handleDisagree}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Disagree
            </button>
          </div>
          {hasDisagreed && (
            <p className="mt-4 text-red-600">
              You need to agree to the consent to proceed with registration.
            </p>
          )}
        </div>
      ) : (
        <RegistrationForm />
      )}

      {/* Back Button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleBack}
          className="bg-bavarian-blue text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default PlayerRegistrationPage;