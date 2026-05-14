"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/TournamentRegistration.module.css";

type View = "landing" | "choose";

export default function TournamentRegistration() {
  const [view, setView] = useState<View>("landing");
  const router = useRouter();

  if (view === "choose") {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <button
            className={styles.backButton}
            onClick={() => setView("landing")}
          >
            ← Back
          </button>
          <h2 className={styles.title}>Tournament Registration</h2>
          <p className={styles.subtitle}>
            Choose which tournament you want to register for:
          </p>
          <div className={styles.buttonWrapper}>
            <button
              className={styles.tournamentButton}
              onClick={() => router.push("/tournament-registration/frankfurt")}
            >
              Frankfurt Tournament Registration
            </button>
            <button
              className={styles.tournamentButton}
              onClick={() => router.push("/tournament-registration/berlin")}
            >
              Berlin Tournament Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h2 className={styles.title}>Tournament Registration</h2>
        <p className={styles.subtitle}>
          For NFT Munich players to register for upcoming tournaments.
        </p>
        <div className={styles.buttonWrapper}>
          <button
            className={styles.tournamentButton}
            onClick={() => setView("choose")}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
