"use client";
import React from "react";
import aboutUsData from "../data/about-us.json"; // Import content from JSON file
import styles from "../styles/AboutUs.module.css"; // Import styles for the component

const AboutUs = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{aboutUsData.title}</h1>
            {aboutUsData.paragraphs.map((paragraph, index) => (
                <p key={index} className={styles.text}>
                    {paragraph}
                </p>
            ))}
        </div>
    );
};

export default AboutUs;