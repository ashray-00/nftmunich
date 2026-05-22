"use client";

import Script from "next/script";
import { useConsent } from "../hooks/useConsent";

export default function ConditionalGA() {
    const { analyticsEnabled } = useConsent();

    if (!analyticsEnabled) return null;

    return (
        <>
            <Script
                src="https://www.googletagmanager.com/gtag/js?id=G-3PSKLP4HFV"
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-3PSKLP4HFV');`}
            </Script>
        </>
    );
}
