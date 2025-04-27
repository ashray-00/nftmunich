import React, { useState } from 'react';
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import historyData from '../data/history.json'; // Import the JSON file directly
import styles from '../styles/Achievements.module.css';
import FacebookPopup from './FacebookPopup';

const Achievements = () => {
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  // Function to open the Facebook post in a popup/modal
  const openFacebookPost = (url: string) => {
    setSelectedPost(url); // Set the selected post URL
  };

  // Function to close the popup/modal
  const closePopup = () => {
    setSelectedPost(null); // Clear the selected post
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
              fontWeight: 'bold',
            }}
            icon={<span>{item.date}</span>} // Display the date inside the circle
          >
            <h3
              className={`${styles.tournamentName} vertical-timeline-element-title`}
              onClick={() => openFacebookPost(item.facebookLink)}
              style={{ cursor: 'pointer', color: '#0056b3'}}
            >
              {item.tournament}
            </h3>
            <p>{item.result}</p>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>

      {/* Render the FacebookPopup component if a post is selected */}
      {selectedPost && <FacebookPopup postUrl={selectedPost} onClose={closePopup} />}
    </div>
  );
};

export default Achievements;