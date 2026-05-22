"use client";

import { useEffect, useState } from "react";

type ConsentValue = "accepted" | "declined" | null;

export function useConsent() {
    const [consent, setConsent] = useState<ConsentValue>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("analytics_consent") as ConsentValue;
        setConsent(stored);
        setLoaded(true);
    }, []);

    const accept = () => {
        localStorage.setItem("analytics_consent", "accepted");
        setConsent("accepted");
    };

    const decline = () => {
        localStorage.setItem("analytics_consent", "declined");
        setConsent("declined");
    };

    const reset = () => {
        localStorage.removeItem("analytics_consent");
        setConsent(null);
    };

    return {
        consent,
        loaded,
        showBanner: loaded && consent === null,
        analyticsEnabled: consent === "accepted",
        accept,
        decline,
        reset,
    };
}
