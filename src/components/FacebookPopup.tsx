import React, { useEffect, useState } from 'react';

// Extend the Window interface to include the FB property
declare global {
    interface Window {
        FB?: {
            XFBML: {
                parse: () => void;
            };
        };
    }
}
import styles from '../styles/FacebookPopup.module.css';

interface FacebookPopupProps {
    postUrl: string;
    onClose: () => void;
}

const FacebookPopup: React.FC<FacebookPopupProps> = ({ postUrl, onClose }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check if the screen width is less than 768px (mobile breakpoint)
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Initial check
        checkScreenSize();

        // Add event listener to handle screen resizing
        window.addEventListener('resize', checkScreenSize);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    useEffect(() => {
        if (!window.FB) {
            const script = document.createElement('script');
            script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v16.0';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                if (window.FB) {
                    window.FB.XFBML.parse();
                }
            };
            document.body.appendChild(script);
        } else {
            window.FB.XFBML.parse();
        }
    }, []);

    return (
        <div className={styles.popupOverlay} onClick={onClose}>
            <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                {isMobile ? (
                    <div
                        className="fb-post"
                        data-href={postUrl}
                        data-width="100%"
                    ></div>
                ) : (
                    <div
                        className="fb-post"
                        data-href={postUrl}
                        data-width="500px"
                        data-height="500px"
                    ></div>
                )}
            </div>
        </div>
    );
};

export default FacebookPopup;