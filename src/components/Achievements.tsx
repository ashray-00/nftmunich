import React, { useState } from 'react';
import {
    VerticalTimeline,
    VerticalTimelineElement,
} from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import historyData from '../data/history.json';
import styles from '../styles/Achievements.module.css';
import Image from 'next/image';

type AchievementDetail = {
    Title: string;
    result: string;
    location: string;
    description: { type: string; children: { text: string }[] }[];
    image?: {
        url: string;
        width?: number;
        height?: number;
    };
};

const Achievements = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [detail, setDetail] = useState<AchievementDetail | null>(null);

    const openAchievementDetail = async (key: string) => {
        setLoading(true);
        setModalOpen(true);
        setDetail(null);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/achievements?filters[key_id][$eq]=${key}&populate=image`
            );
            const data = await res.json();
            if (data.data && data.data.length > 0) {
                setDetail(data.data[0]);
            }
        } catch {
            setDetail(null);
        }
        setLoading(false);
    };

    const closeModal = () => {
        setModalOpen(false);
        setDetail(null);
    };

    return (
        <div className={`${styles.container} w-full lg:w-[55%] mx-auto px-4`}>
            <h1 className={styles.title}>Achievements</h1>
            <VerticalTimeline lineColor="#0056b3">
                {historyData.map((item, index) => (
                    <VerticalTimelineElement
                        key={index}
                        className="vertical-timeline-element--work"
                        contentStyle={{
                            background: 'var(--tw-color-bavarian-white)',
                            color: 'var(--tw-color-bavarian-blue)',
                            borderRadius: '10px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        }}
                        contentArrowStyle={{
                            borderRight: '7px solid var(--tw-color-bavarian-white)',
                        }}
                        iconStyle={{
                            background: '#0056b3',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                        }}
                        icon={<span>{item.date}</span>}
                    >
                        <h3
                            className={`${styles.tournamentName} vertical-timeline-element-title`}
                            onClick={() => openAchievementDetail(item.key)}
                            style={{ cursor: 'pointer' }}
                        >
                            {item.tournament}
                        </h3>
                        <p>{item.result}</p>
                    </VerticalTimelineElement>
                ))}
            </VerticalTimeline>

            {/* Modal */}
            {modalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}
                    onClick={closeModal}
                >
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: 10,
                            maxWidth: 600,
                            width: '90%',
                            padding: 24,
                            position: 'relative',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={closeModal}
                            style={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                background: 'transparent',
                                border: 'none',
                                fontSize: 24,
                                cursor: 'pointer',
                            }}
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        {loading && <div>Loading...</div>}
                        {!loading && detail && (
                            <div>
                                <h2 style={{ marginBottom: 8, fontWeight: 'bold' }}>{detail.Title}</h2>
                                <div style={{ marginBottom: 8, color: '#0056b3' }}>
                                    {detail.result} {detail.location && `| ${detail.location}`}
                                </div>
                                {detail.image && detail.image.url && (
                                    <div style={{ marginBottom: 16, borderRadius: 8, overflow: 'hidden' }}>
                                        <Image
                                            src={detail.image.url}
                                            width={detail.image.width || 600}
                                            height={detail.image.height || 400}
                                            alt={detail.Title}
                                            style={{
                                                width: '100%',
                                                height: 'auto',
                                                maxHeight: 300,
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </div>
                                )}
                                {detail.description?.map((block, idx) => (
                                    <p key={idx} style={{ marginBottom: 8 }}>
                                        {block.children.map(child => child.text).join('')}
                                    </p>
                                ))}
                            </div>
                        )}
                        {!loading && !detail && (
                            <div>Could not load achievement details.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Achievements;