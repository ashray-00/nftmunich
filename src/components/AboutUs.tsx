"use client";
import React from "react";
import aboutUsDataRaw from "../data/about-us.json"; // Import content from JSON file

// Explicitly cast or validate the JSON data to match the expected types
const aboutUsData = aboutUsDataRaw as {
    title: string;
    intro: { content: ContentItem[]; image: string | string[] };
    sections: { subheader: string; content: ContentItem[]; images?: string[]; image?: string }[];
};
import styles from "../styles/AboutUs.module.css"; // Import styles for the component

// Define the type for content items
type ContentItem = {
    type: "text" | "bullet"; // Explicitly define the allowed values for `type`
    value?: string | string[]; // Text or array of bullet points
    bold?: string; // Optional bold text
};

const AboutUs = () => {
    const renderContent = (content: ContentItem[]) => {
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
                        {(item.value as string[]).map((bullet, bulletIdx) => (
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

    const renderImages = (images: string | string[]) => {
        if (Array.isArray(images)) {
            return images.map((image, idx) => (
                <div key={idx} className={styles.imageWrapper}>
                    <div className={styles.pin}></div> {/* Pin for every image */}
                    <img
                        src={image}
                        alt={`Section Image ${idx + 1}`}
                        className={styles.image}
                    />
                </div>
            ));
        }
        return (
            <div className={styles.imageWrapper}>
                <div className={styles.pin}></div> {/* Pin for the single image */}
                <img
                    src={images}
                    alt="Section Image"
                    className={styles.image}
                />
            </div>
        );
    };

    return (
        <div className={styles.container}>
            {/* Render the About Us title */}
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
                        {renderImages(section.images || section.image || "")}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AboutUs;