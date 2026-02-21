import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#F5F5F0", // Antique White
                foreground: "#333333", // Slate Grey
                primary: {
                    DEFAULT: "#0A2F1F", // Deep Forest Green
                    foreground: "#F5F5F0",
                },
                accent: {
                    DEFAULT: "#D4AF37", // Metallic Gold
                    foreground: "#0A2F1F",
                },
                muted: {
                    DEFAULT: "#E5E5E0",
                    foreground: "#666666"
                }
            },
            fontFamily: {
                serif: ["var(--font-playfair-display)", "serif"],
                sans: ["var(--font-inter)", "sans-serif"],
                mono: ["var(--font-roboto-mono)", "monospace"],
            },
        },
    },
    plugins: [],
};
export default config;
