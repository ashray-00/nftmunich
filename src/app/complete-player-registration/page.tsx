"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConsentSection from "../../components/ConsentSection";
import RegistrationForm from "../../components/RegistrationForm";
import styles from "../../styles/CompletePlayerRegistrationPage.module.css"; // Unique CSS for this page
import Head from "next/head";

const CompletePlayerRegistrationPage = () => {
    const [isValidToken, setIsValidToken] = useState(false);
    const [loading, setLoading] = useState(true);
    const [hasConsented, setHasConsented] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        const validateToken = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get("token");

            if (!token) {
                setError("Invalid or missing token.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/player-registrations?filters[uniqueToken][$eq]=${token}`
                );
                const result = await response.json();

                if (response.ok && result.data.length > 0) {
                    setIsValidToken(true);
                } else {
                    setError("Invalid or expired token.");
                }
            } catch (err) {
                setError("An error occurred while validating the token. " + err);
            } finally {
                setLoading(false);
            }
        };

        validateToken();
    }, []);

    // Handle browser back button to redirect to /home
    useEffect(() => {
        const handlePopState = () => {
            history.pushState(null, "", window.location.href); // Push the current URL to prevent going back
        };

        // Push the current state to the history stack
        history.pushState(null, "", window.location.href);

        // Add event listener for the popstate event
        window.addEventListener("popstate", handlePopState);

        return () => {
            // Cleanup the event listener
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    const handleConsent = () => {
        setHasConsented(true);
    };

    const handleBack = () => {
        router.push("/#player-registration"); // Navigate back to the player registration section
    };

    if (loading) {
        return <p className={styles.loading}>Validating token...</p>;
    }

    if (error) {
        return <p className={styles["error-message"]}>{error}</p>;
    }

    if (!isValidToken) {
        return <p className={styles["error-message"]}>Invalid or expired token.</p>;
    }

    return (
        <>
            <Head>
                <meta name="robots" content="noindex, nofollow" />
                <title>Complete Player Registration</title>
            </Head>
            <div className={styles.container}>
                <h1 className={styles.title}>Player Registration</h1>
                {!hasConsented ? (
                    <ConsentSection onAgree={handleConsent} />
                ) : (
                    <RegistrationForm />
                )}
                <div className={styles["form-navigation"]}>
                    <button onClick={handleBack} className={styles["back-button"]}>
                        Back
                    </button>
                </div>
            </div>
        </>
    );
};

export default CompletePlayerRegistrationPage;