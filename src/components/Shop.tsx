"use client";
import React from "react";
import styles from "../styles/shop.module.css"; // Import the Shop styles

const Shop = () => {
    return (
        <div className={`${styles.container} mx-auto px-4`}>
            <h1 className={styles.title}>Shop</h1>
            <div className="text-center mb-6">
                <p className={`${styles.text} mb-4`}>
                    Check out our NFT Munich collection and support the club with your purchase.
                </p>
                <div className={styles.buttonWrapper}>
                    <a
                        href="https://clubs.stanno.com/de/nft-munich/vereinskollektion"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.button}
                    >
                        Visit Shop
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Shop;