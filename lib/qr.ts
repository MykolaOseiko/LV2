import QRCodeStyling, {
    type Options as QROptions,
} from "qr-code-styling";

/* ── Clean B&W QR — no logo overlay for maximum scannability ── */

/* ── Default config ───────────────────────────────────────── */
const BASE_OPTIONS: Partial<QROptions> = {
    type: "svg",
    qrOptions: {
        errorCorrectionLevel: "M",
    },
    dotsOptions: {
        color: "#000000",
        type: "square",
    },
    cornersSquareOptions: {
        color: "#000000",
        type: "square",
    },
    cornersDotOptions: {
        color: "#000000",
        type: "square",
    },
    backgroundOptions: {
        color: "#FFFFFF",
    },
};

/* ── Public API ───────────────────────────────────────────── */

/**
 * Generate a branded QR code (PNG blob) for a certificate verification URL.
 *
 * @param verifyUrl  Full URL, e.g. https://librisventures.com/verify/abc-123
 * @param size       Pixel width/height (default 400 for PDF, use 1200 for print)
 * @returns          PNG Blob ready for download or PDF embedding
 */
export async function generateBrandedQR(
    verifyUrl: string,
    size: number = 400,
): Promise<Blob> {
    const qr = new QRCodeStyling({
        ...BASE_OPTIONS,
        width: size,
        height: size,
        data: verifyUrl,
    } as QROptions);

    const blob = await qr.getRawData("png");
    if (!blob) throw new Error("QR code generation failed");
    return blob as Blob;
}

/**
 * Convenience: trigger a download of the branded QR code.
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
