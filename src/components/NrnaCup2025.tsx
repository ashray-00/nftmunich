import React from "react";
import styles from "../styles/shop.module.css"; // Reuse shop styles for consistency

const NrnaCup2025 = () => (
    <div className={`${styles.container} w-full lg:w-[55%] mx-auto px-4`}>
        <h1 className={styles.title}>NRNA Cup 2025</h1>
        <div className="text-center mb-6">
            <p className={`${styles.text} mb-4`}>
                Visit the official website to get the latest updates, fixtures, and information about the tournament. Join us and be part of the excitement!
            </p>
            <div className={styles.buttonWrapper}>
                <a
                    href="https://nrna.nftmunich.club"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.button}
                >
                    Visit NRNA Cup 2025 Website
                </a>
            </div>
        </div>
    </div>
);

export default NrnaCup2025;