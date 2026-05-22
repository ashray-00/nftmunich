"use client";

import Link from "next/link";
import { useConsent } from "../hooks/useConsent";
import styles from "../styles/CookieBanner.module.css";

export default function CookieBanner() {
    const { showBanner, consent, loaded, accept, decline, reset } = useConsent();

    if (!loaded) return null;

    return (
        <>
            {showBanner && (
                <div className={styles.banner} role="dialog" aria-label="Cookie consent">
                    <div className={styles.header}>
                        <span className={styles.icon}>🍪</span>
                        <p className={styles.title}>We use cookies</p>
                    </div>
                    <p className={styles.body}>
                        We use Google Analytics to understand how visitors interact with our site.
                        This helps us improve our content and services. No data is sold or shared with
                        third parties. You can read more in our{" "}
                        <Link href="/privacy-policy">Privacy Policy</Link>.
                    </p>
                    <div className={styles.buttons}>
                        <button className={styles.acceptButton} onClick={accept}>
                            Accept Analytics
                        </button>
                        <button className={styles.declineButton} onClick={decline}>
                            Decline
                        </button>
                    </div>
                </div>
            )}
            {consent !== null && (
                <button className={styles.manageLink} onClick={reset}>
                    Manage Cookies
                </button>
            )}
        </>
    );
}
