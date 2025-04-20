"use client";
import React from "react";
import aboutUsData from "../data/about-us.json"; // Import content from JSON file
import styles from "../styles/AboutUs.module.css"; // Import styles for the component

const AboutUs = () => {
    const renderContent = (content) => {
        return content.map((item, idx) => {
            if (item.type === "text") {
                return (
                    <p key={idx} className={styles.text}>
                        {item.bold && <strong>{item.bold}</strong>}
                        {item.value && ` ${item.value}`}
                    </p>
                );
            } else if (item.type === "bullet") {
                return (
                    <ul key={idx} className={styles.bulletList}>
                        {item.value.map((bullet, bulletIdx) => (
                            <li key={bulletIdx} className={styles.bulletItem}>
                                {bullet}
                            </li>
                        ))}
                    </ul>
                );
            }
            return null;
        });
    };

    const renderImages = (images) => {
        if (Array.isArray(images)) {
            return images.map((image, idx) => (
                <img
                    key={idx}
                    src={image}
                    alt={`Section Image ${idx + 1}`}
                    className={styles.image}
                />
            ));
        }
        return (
            <img
                src={images}
                alt="Section Image"
                className={styles.image}
            />
        );
    };

    return (
        <div className={styles.container}>
            {/* Render the About Us title in its own container */}
            <div className={styles.section}>
                <div className={styles.textContainer}>
                    <h1 className={styles.title}>{aboutUsData.title}</h1>
                </div>
            </div>

            {/* Render the intro section */}
            <div className={styles.section}>
                <div className={styles.textContainer}>
                    {renderContent(aboutUsData.intro.content)}
                </div>
                <div className={styles.imageContainer}>
                    <div className={styles.pin}></div>
                    {renderImages(aboutUsData.intro.image)}
                </div>
            </div>

            {/* Render the other sections */}
            {aboutUsData.sections.map((section, index) => (
                <div
                    key={index}
                    className={`${styles.section} ${index % 2 === 0 ? styles.left : styles.right
                        }`}
                >
                    <div className={styles.textContainer}>
                        <h2 className={styles.subheader}>{section.subheader}</h2>
                        {renderContent(section.content)}
                    </div>
                    <div className={styles.imageContainer}>
                        <div className={styles.pin}></div>
                        {renderImages(section.images || section.image)}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AboutUs;