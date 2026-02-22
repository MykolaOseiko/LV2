import type { Metadata } from "next";
import { Playfair_Display, Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair-display",
    display: "swap",
});

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const robotoMono = Roboto_Mono({
    subsets: ["latin"],
    variable: "--font-roboto-mono",
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "Libris Ventures — AuthorHash Cryptographic Proof of Existence",
        template: "%s | Libris Ventures",
    },
    description:
        "Immutable proof your work existed — before anyone else can claim it. SHA-256 fingerprint anchored to the Bitcoin blockchain via OpenTimestamps.",
    keywords: [
        "AuthorHash",
        "proof of existence",
        "copyright protection",
        "blockchain",
        "OpenTimestamps",
        "SHA-256",
        "authorship",
    ],
    openGraph: {
        title: "Libris Ventures — AuthorHash",
        description:
            "Cryptographic proof of existence for your creative work. Anchored to the Bitcoin blockchain.",
        url: "https://libris.ventures",
        siteName: "Libris Ventures",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            className={`${playfair.variable} ${inter.variable} ${robotoMono.variable}`}
        >
            <body className="font-sans bg-background text-foreground min-h-screen flex flex-col">
                {children}
            </body>
        </html>
    );
}
