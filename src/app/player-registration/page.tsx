"use client";

import React from "react";
import PlayerRegistrationForm from "../../components/PlayerRegistrationForm";
import styles from "../../styles/PlayerRegistrationForm.module.css";
import Link from "next/link";

const PlayerRegistrationPage = () => {
    return (
        <div className={styles.container}> {/* Use the container class */}
            {/* Sticky Header with Logo and Title */}
            <div className={styles.header}>
                <Link href="/#home" className={styles.logoLink}>
                    <img
                        src="/logo.png" // Replace with the path to your logo
                        alt="Logo"
                        className={styles.logo}
                    />
                </Link>
                <h1 className={styles.title}>Player Registration</h1>
            </div>

            {/* Player Registration Form */}
            <PlayerRegistrationForm />
        </div>
    );
};

export default PlayerRegistrationPage;