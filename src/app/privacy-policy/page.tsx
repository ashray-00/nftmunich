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
                We are committed to protecting your personal data and ensuring your privacy. This Privacy Policy explains how we collect, use, and protect your information in compliance with the General Data Protection Regulation (GDPR).
            </p>
            <h2 className={styles.subtitle}>What Data We Collect</h2>
            <p className={styles.text}>
                We collect the following personal data when you register:
            </p>
            <ul className={styles.list}>
                <li>Name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Date of birth</li>
                <li>Profession</li>
                <li>Address</li>
                <li>Preferred position</li>
            </ul>
            <h2 className={styles.subtitle}>Why We Collect Your Data</h2>
            <p className={styles.text}>
                We collect your data to:
            </p>
            <ul className={styles.list}>
                <li>Process your registration.</li>
                <li>Communicate with you regarding your registration.</li>
                <li>Improve our services.</li>
            </ul>
            <h2 className={styles.subtitle}>Your Rights</h2>
            <p className={styles.text}>
                Under GDPR, you have the following rights:
            </p>
            <ul className={styles.list}>
                <li>The right to access your personal data.</li>
                <li>The right to correct inaccurate or incomplete data.</li>
                <li>The right to request the deletion of your data ("right to be forgotten").</li>
                <li>The right to restrict or object to the processing of your data.</li>
                <li>The right to data portability.</li>
            </ul>
            <p className={styles.text}>
                To exercise these rights, please contact us at <a href="mailto:your-email@example.com">your-email@example.com</a>.
            </p>
            <h2 className={styles.subtitle}>Data Retention</h2>
            <p className={styles.text}>
                We will retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy or as required by law.
            </p>
            <h2 className={styles.subtitle}>Contact Us</h2>
            <p className={styles.text}>
                If you have any questions about this Privacy Policy or how we handle your data, please contact us at <a href="mailto:your-email@example.com">your-email@example.com</a>.
            </p>
            <button className={styles.backButton} onClick={() => router.back()}>
                Go Back
            </button>
        </div>
    );
};

export default PrivacyPolicy;