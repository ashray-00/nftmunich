"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/TournamentRegistration.module.css";

export default function TournamentRegistration() {
  const router = useRouter();

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
            onClick={() => router.push("/tournament-registration/berlin")}
          >
            Berlin Tournament Registration
          </button>
        </div>
      </div>
    </div>
  );
}
