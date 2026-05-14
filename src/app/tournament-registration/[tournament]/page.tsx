"use client";

import React, { useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import TournamentRegistrationForm, {
  TOURNAMENT_LABELS,
} from "../../../components/TournamentRegistrationForm";
import styles from "../../../styles/TournamentRegistration.module.css";

const VALID_TOURNAMENTS = ["frankfurt", "berlin"] as const;
type Tournament = (typeof VALID_TOURNAMENTS)[number];

export default function TournamentRegistrationPage() {
  const params = useParams();
  const tournament = params.tournament as string;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!VALID_TOURNAMENTS.includes(tournament as Tournament)) {
    notFound();
  }

  return (
    <div className={styles.wrapper} style={{ paddingTop: "40px", paddingBottom: "40px" }}>
      <h1 className={styles.title}>
        {TOURNAMENT_LABELS[tournament as Tournament]} Registration
      </h1>
      <TournamentRegistrationForm tournament={tournament as Tournament} />
    </div>
  );
}
