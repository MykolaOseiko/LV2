import QRCode from "qrcode";

/* ── Public API ───────────────────────────────────────────── */

/**
 * Generate a clean B&W QR code (PNG blob) for a certificate verification URL.
 * Uses the same `qrcode` library as the PDF generator for consistent results.
 */
export async function generateBrandedQR(
    verifyUrl: string,
    size: number = 400,
): Promise<Blob> {
    const dataUrl = await QRCode.toDataURL(verifyUrl, {
        width: size,
        margin: 2,
        color: { dark: "#000000", light: "#FFFFFF" },
        errorCorrectionLevel: "M",
    });

    // Convert data URL to Blob
    const res = await fetch(dataUrl);
    return res.blob();
}

/**
 * Convenience: trigger a download of the QR code.
 */
export async function downloadBrandedQR(
    verifyUrl: string,
    filename: string = "authorhash-qr",
    size: number = 1200,
): Promise<void> {
    const blob = await generateBrandedQR(verifyUrl, size);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
