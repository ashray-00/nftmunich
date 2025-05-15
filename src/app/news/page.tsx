"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import styles from "../../styles/NewsViewAll.module.css";

const NewsPage = () => {
    interface NewsItem {
        id: number;
        slug: string;
        title: string;
        description: string;
        date: string;
    }

    const [news, setNews] = useState<NewsItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const router = useRouter(); // Initialize the router

    useEffect(() => {
        window.scrollTo(0, 0);
        // Fetch news with pagination
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/newses?sort[0]=date:desc&pagination[page]=${page}&pagination[pageSize]=10`)
            .then((response) => response.json())
            .then((data) => {
                setNews(data.data || []);
                setTotalPages(data.meta.pagination.pageCount || 1);
            })
            .catch((error) => console.error("Error fetching news:", error));
    }, [page]);

    const handlePageChange = (pageNumber: number) => {
        setPage(pageNumber);
    };

    const handleBack = () => {
        router.push("/#news");
    };

    return (
            <div className={styles.container}>
                <h1 className={styles.title}>News</h1>
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
                            <p className={styles.newsDate}>{item.date}</p>
                        </div>
                    ))}
                </div>
                {/* Pagination */}
                <div className={styles.paginationContainer}>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            className={`${styles.paginationButton} ${page === index + 1 ? styles.activePage : ""
                                }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
                {/* Back Button */}
                <div className={styles.backButtonContainer}>
                    <button
                        onClick={handleBack} // Navigate back to the previous page
                        className={styles.backButton}
                    >
                        Back
                    </button>
                </div>
            </div>
    );
};

export default NewsPage;