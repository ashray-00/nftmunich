"use client";

import React, { useEffect } from "react";
import PlayerRegistrationForm from "../../components/PlayerRegistrationForm";
import styles from "../../styles/PlayerRegistrationForm.module.css";

const PlayerRegistrationPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={styles.container}> {/* Use the container class */}
            <h1 className={styles.title}>Player Registration</h1>

            {/* Player Registration Form */}
            <PlayerRegistrationForm />
        </div>
    );
};

export default PlayerRegistrationPage;