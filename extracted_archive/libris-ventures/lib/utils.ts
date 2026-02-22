import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format a certificate reference number for display.
 * LV-AH-2026-00042 → LV-AH-2026-00042
 */
export function formatCertRef(ref: string): string {
    return ref.toUpperCase();
}

/**
 * Truncate a SHA-256 hash for display: abcdef...789012
 */
export function truncateHash(hash: string, chars: number = 8): string {
    if (hash.length <= chars * 2) return hash;
    return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

/**
 * Format a timestamp as a human-readable date string.
 */
export function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
    });
}
