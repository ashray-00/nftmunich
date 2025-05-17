"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../styles/News.module.css";

const News = () => {
    interface NewsItem {
        id: number;
        slug: string;
        title: string;
        description: string;
    }

    const [news, setNews] = useState<NewsItem[]>([]);

    useEffect(() => {
        // Fetch the latest 5 news articles
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/newses?sort[0]=date:desc&pagination[limit]=5`)
            .then((response) => response.json())
            .then((data) => {
                setNews(data.data || []); // Set the news data directly
            })
            .catch((error) => console.error("Error fetching news:", error));
    }, []);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>News</h2>
            <div className={styles.newsGrid}>
                {news.map((item) => (
                    <div key={item.id} className={styles.newsItem}>
                        <h3 className={styles.newsTitle}>
                            <Link href={`/news/${item.slug}`}>
                                {item.title || "Untitled"}
                            </Link>
                        </h3>
                        <p className={styles.newsDescription}>
                            {item.description || "No description available."}
                        </p>
                    </div>
                ))}
            </div>
            <div className={styles.viewAllContainer}>
                <Link href="/news">
                    <div className={styles.viewAllButton}>View All</div>
                </Link>
            </div>
        </div>
    );
};

export default News;