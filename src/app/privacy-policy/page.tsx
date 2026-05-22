"use client";
import React from "react";
import { useRouter } from "next/navigation";
import styles from "../../styles/privacy-policy.module.css";

const PrivacyPolicy = () => {
    const router = useRouter();

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Privacy Policy</h1>
            <p className={styles.text}>
                Last updated: May 2026
            </p>
            <p className={styles.text}>
                NFT Munich (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your personal data and respecting your privacy. This Privacy Policy explains what data we collect, why we collect it, and your rights under the General Data Protection Regulation (GDPR).
            </p>

            <h2 className={styles.subtitle}>1. Who We Are</h2>
            <p className={styles.text}>
                NFT Munich is a non-profit Nepalese football club based in Munich, Germany. You can contact us at <a href="mailto:nftmunich@gmail.com">nftmunich@gmail.com</a>.
            </p>

            <h2 className={styles.subtitle}>2. Data We Collect and Why</h2>

            <h3 className={styles.subtitle} style={{ fontSize: "1rem", marginTop: "16px" }}>a) Player &amp; Member Registration</h3>
            <p className={styles.text}>When you register as a player or member, we collect:</p>
            <ul className={styles.list}>
                <li>Name, email address, phone number</li>
                <li>Date of birth, address (ZIP code)</li>
                <li>Profession, health condition / allergies</li>
                <li>Football-related information (position, fitness level, equipment)</li>
            </ul>
            <p className={styles.text}>
                <strong>Legal basis:</strong> Performance of a contract / legitimate interest. This data is used solely to manage your club membership and participation.
            </p>

            <h3 className={styles.subtitle} style={{ fontSize: "1rem", marginTop: "16px" }}>b) Tournament Registration</h3>
            <p className={styles.text}>When you register for a tournament, we collect name, email, phone number, travel and food preferences, and equipment information. This data is used to organise team logistics and is shared only with club management.</p>

            <h3 className={styles.subtitle} style={{ fontSize: "1rem", marginTop: "16px" }}>c) Login (Magic Link Authentication)</h3>
            <p className={styles.text}>
                If you log in as a player, we process your email address to verify your identity and send you a one-time login link. We store a temporary login token in our database (automatically deleted within 30 minutes) and a session token in your browser&apos;s local storage (expires after 30 days). No passwords are stored.
            </p>

            <h3 className={styles.subtitle} style={{ fontSize: "1rem", marginTop: "16px" }}>d) Analytics (with your consent)</h3>
            <p className={styles.text}>
                If you accept analytics cookies, we use <strong>Google Analytics</strong> to collect anonymised data about how visitors use our website (pages visited, time on site, device type). This data is processed by Google LLC and may be transferred to the United States. Google Analytics uses cookies to distinguish users. You can withdraw your consent at any time by clicking &quot;Manage Cookies&quot; in the footer or clearing your browser&apos;s local storage.
            </p>
            <p className={styles.text}>
                We also use <strong>Vercel Analytics</strong>, which collects anonymised, aggregated usage data without cookies or personal identifiers. No consent is required for this.
            </p>

            <h2 className={styles.subtitle}>3. Cookies and Local Storage</h2>
            <ul className={styles.list}>
                <li><strong>analytics_consent</strong> — stores your cookie preference (accepted / declined). Kept until you clear your browser storage.</li>
                <li><strong>nft_session</strong> — a login session token, valid for 30 days. Deleted automatically on expiry or when you sign out.</li>
                <li><strong>redirectAfterLogin</strong> — temporarily stores the page you were on before logging in. Deleted immediately after login.</li>
                <li><strong>Google Analytics cookies</strong> (_ga, _gid) — only set if you accept analytics. Used to distinguish visitors and measure traffic. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a>.</li>
            </ul>

            <h2 className={styles.subtitle}>4. Where Your Data is Stored</h2>
            <p className={styles.text}>
                Registration data is stored in Google Firebase Firestore (Frankfurt, EU region) and Google Sheets. Login tokens are stored in Firebase Firestore and automatically deleted after 30 minutes. Session tokens are stored only in your browser&apos;s local storage and never on our servers.
            </p>

            <h2 className={styles.subtitle}>5. Data Sharing</h2>
            <p className={styles.text}>
                We do not sell or share your personal data with third parties for commercial purposes. Data is only accessed by NFT Munich club management. Third-party services we use include:
            </p>
            <ul className={styles.list}>
                <li>Google Firebase / Firestore — data storage</li>
                <li>Google Analytics — website analytics (consent-based)</li>
                <li>Vercel — website hosting and anonymised analytics</li>
                <li>Resend — transactional email delivery (login links only)</li>
            </ul>

            <h2 className={styles.subtitle}>6. Your Rights</h2>
            <p className={styles.text}>Under GDPR, you have the right to:</p>
            <ul className={styles.list}>
                <li>Access the personal data we hold about you</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your data (&quot;right to be forgotten&quot;)</li>
                <li>Restrict or object to the processing of your data</li>
                <li>Withdraw consent for analytics at any time</li>
                <li>Data portability</li>
            </ul>
            <p className={styles.text}>
                To exercise any of these rights, contact us at <a href="mailto:nftmunich@gmail.com">nftmunich@gmail.com</a>.
            </p>

            <h2 className={styles.subtitle}>7. Data Retention</h2>
            <p className={styles.text}>
                Registration data is retained for the duration of your active membership and deleted upon request. Login tokens are automatically deleted after 30 minutes. Session tokens expire after 30 days. Analytics data is retained according to your Google Analytics account settings (default: 14 months).
            </p>

            <h2 className={styles.subtitle}>8. Changes to This Policy</h2>
            <p className={styles.text}>
                We may update this Privacy Policy from time to time. The date at the top of this page indicates when it was last revised.
            </p>

            <h2 className={styles.subtitle}>9. Contact</h2>
            <p className={styles.text}>
                If you have any questions about this Privacy Policy, please contact us at <a href="mailto:nftmunich@gmail.com">nftmunich@gmail.com</a>.
            </p>

            <button className={styles.backButton} onClick={() => router.back()}>
                Go Back
            </button>
        </div>
    );
};

export default PrivacyPolicy;