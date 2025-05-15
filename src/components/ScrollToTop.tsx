"use client";

import { useEffect } from "react";

const ScrollToTop = () => {
    useEffect(() => {
        // Scroll to the top of the page when the component is mounted
        window.scrollTo(0, 0);
    }, []);

    return null; // This component doesn't render anything
};

export default ScrollToTop;