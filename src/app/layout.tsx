import "./globals.css"; // Import global styles
import Header from "../components/Header"; // Import the Header component

export const metadata = {
    metadataBase: new URL('https://nftmunich.club'),
    title: "NFT Munich Club - Nepalese Football Club in Munich, Germany | nftmunich.club",
    description:
        "NFT Munich is a Nepalese football club based in Munich, Germany. Join our vibrant community of Nepali football enthusiasts, students, and professionals. Visit nftmunich.club to learn more about our tournaments, achievements, and community integration.",
    keywords: [
        "NFT Munich",
        "Nepalese football club",
        "Munich football",
        "Nepali community Germany",
        "football tournaments Munich",
        "nftmunich.club"
    ],
    openGraph: {
        title: "NFT Munich Club - Nepalese Football Club in Munich, Germany",
        description:
            "NFT Munich is a Nepalese football club in Munich, Germany. Discover our journey, achievements, and how we unite the Nepali community through football. Visit nftmunich.club.",
        url: "https://nftmunich.club",
        type: "website",
        images: [
            {
                url: "/logo.png",
                width: 1200,
                height: 630,
                alt: "NFT Munich Club"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "NFT Munich Club – Nepalese Football Club in Munich, Germany",
        description:
            "NFT Munich is a Nepalese football club in Munich, Germany. Join our community at nftmunich.club.",
        images: ["/logo.png"]
    }
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                {/* Header */}
                <Header />

                {/* Main Content */}
                <main style={{ paddingTop: "80px" }}>{children}</main>
            </body>
        </html>
    );
}