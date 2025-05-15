import "./globals.css"; // Import global styles
import Header from "../components/Header"; // Import the Header component

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