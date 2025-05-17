'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from '../styles/AboutUs.module.css';

// Define types for rich text content
interface RichTextChild {
    text: string;
    bold?: boolean;
}

interface RichTextListItem extends RichTextChild {
    children?: RichTextChild[];
}

interface RichTextBlock {
    type: 'paragraph' | 'list';
    format?: 'ordered' | 'unordered';
    children: RichTextListItem[]; // Updated to include possible nested children
}

// Define types for sections
interface Section {
    subheader: string;
    content: RichTextBlock[];
    image?: string;
    images?: string[];
}

interface AboutUsData {
    introContent: RichTextBlock[];
    introImage?: string | null;
    sections: Section[];
}

export default function AboutUs() {
    const [aboutUsData, setAboutUsData] = useState<AboutUsData | null>(null);

    useEffect(() => {
        const fetchAboutUsData = async () => {
            try {
                // Check if data is cached in localStorage
                const cachedData = localStorage.getItem('aboutUsData');
                if (cachedData) {
                    setAboutUsData(JSON.parse(cachedData));
                    return;
                }

                // Fetch the basic sections data
                const sectionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about-uses?populate=sections`);
                const sectionsData = await sectionsResponse.json();

                // Fetch the introImage data
                const introImageResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about-uses?populate=introImage`);
                const introImageData = await introImageResponse.json();
                const introImage = introImageData.data[0]?.introImage?.formats?.small?.url
                    ? `${process.env.NEXT_PUBLIC_API_URL}${introImageData.data[0].introImage.formats.small.url}`
                    : introImageData.data[0]?.introImage?.url
                        ? `${process.env.NEXT_PUBLIC_API_URL}${introImageData.data[0].introImage.url}`
                        : null;

                // Fetch the sections.image data

                // Fetch the sections.images data

                // Combine the data
                const sections = sectionsData.data[0].sections.map((section: {
                    subheader: string;
                    content: RichTextBlock[];
                    image?: { formats?: { small?: { url: string }; }; url?: string };
                    images?: { formats?: { small?: { url: string }; }; url?: string }[];
                }) => ({
                    subheader: section.subheader,
                    content: section.content,
                    image: section.image?.formats?.small?.url
                        ? `${process.env.NEXT_PUBLIC_API_URL}${section.image.formats.small.url}`
                        : section.image?.url
                            ? `${process.env.NEXT_PUBLIC_API_URL}${section.image.url}`
                            : null,
                    images: section.images
                        ? section.images.map((img) =>
                            img.formats?.small?.url
                                ? `${process.env.NEXT_PUBLIC_API_URL}${img.formats.small.url}`
                                : `${process.env.NEXT_PUBLIC_API_URL}${img.url}`
                        )
                        : [],
                }));

                // Combine all data
                const formattedData: AboutUsData = {
                    introContent: sectionsData.data[0].introContent,
                    introImage,
                    sections,
                };

                // Cache the data in localStorage
                localStorage.setItem('aboutUsData', JSON.stringify(formattedData));

                setAboutUsData(formattedData);
            } catch (error) {
                console.error('Error fetching About Us data:', error);
            }
        };

        fetchAboutUsData();
    }, []);

    const renderRichText = (content: RichTextBlock[]) => {
        return content.map((block, index) => {
            if (block.type === 'paragraph') {
                return (
                    <p key={index} className={styles.text}>
                        {block.children.map((child, childIndex) => (
                            <span key={childIndex} style={{ fontWeight: child.bold ? 'bold' : 'normal' }}>
                                {child.text}
                            </span>
                        ))}
                    </p>
                );
            }

            if (block.type === 'list') {
                const isOrdered = block.format === 'ordered';
                return isOrdered ? (
                    <ol key={index} className={styles.bulletList}>
                        {block.children.map((listItem, listItemIndex) => (
                            <li key={listItemIndex} className={styles.bulletItem}>
                                {listItem.text || (listItem.children &&
                                    listItem.children.map((child) => child.text).join(''))}
                            </li>
                        ))}
                    </ol>
                ) : (
                    <ul key={index} className={styles.bulletList}>
                        {block.children.map((listItem, listItemIndex) => (
                            <li key={listItemIndex} className={styles.bulletItem}>
                                {listItem.text || (listItem.children &&
                                    listItem.children.map((child) => child.text).join(''))}
                            </li>
                        ))}
                    </ul>
                );
            }

            return null; // Handle other types if needed
        });
    };

    const renderImages = (images: string | string[]) => {
        if (Array.isArray(images)) {
            return images.map((image, idx) => (
                <div key={idx} className={styles.imageWrapper}>
                    <div className={styles.pin}></div> {/* Blue pin */}
                    <Image
                        src={image}
                        alt={`Section Image ${idx + 1}`}
                        width={500}
                        height={375}
                        className={styles.image}
                        loading="lazy" // Lazy loading
                    />
                </div>
            ));
        }
        return (
            <div className={styles.imageWrapper}>
                <div className={styles.pin}></div> {/* Blue pin */}
                <Image
                    src={images}
                    alt="Section Image"
                    width={500}
                    height={375}
                    className={styles.image}
                    loading="lazy" // Lazy loading
                />
            </div>
        );
    };

    if (!aboutUsData) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>About Us</h1> {/* Hardcoded title */}

            {/* Intro Section */}
            <div className={styles.intro}>
                <div className={styles.textContainer}>
                    {renderRichText(aboutUsData.introContent)}
                </div>
                {aboutUsData.introImage && renderImages(aboutUsData.introImage)}
            </div>

            {/* Sections */}
            {aboutUsData.sections.map((section, index) => (
                <div
                    key={index}
                    className={`${styles.section} ${index % 2 === 0 ? styles.left : styles.right}`}
                >
                    <div className={styles.textContainer}>
                        <h2 className={styles.subheader}>{section.subheader}</h2>
                        {renderRichText(section.content)}
                    </div>
                    <div className={styles.imageContainer}>
                        {section.images && section.images.length > 0
                            ? renderImages(section.images)
                            : section.image && renderImages(section.image)}
                    </div>
                </div>
            ))}
        </div>
    );
}