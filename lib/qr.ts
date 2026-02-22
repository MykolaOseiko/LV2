import QRCodeStyling, {
    type Options as QROptions,
} from "qr-code-styling";

/* ── B&W palette for maximum scannability ──────────────── */

/**
 * Inline SVG of the LV shield logo — black contour only.
 */
const LV_SHIELD_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" width="120" height="140">
  <path d="M60 5 L110 30 L110 80 Q110 120 60 135 Q10 120 10 80 L10 30 Z"
        fill="#FFFFFF" stroke="#000000" stroke-width="4"/>
  <text x="60" y="85" text-anchor="middle" font-family="Georgia,serif"
        font-size="42" font-weight="bold" fill="#000000">LV</text>
</svg>
`)}`;

/* ── Default config ───────────────────────────────────────── */
const BASE_OPTIONS: Partial<QROptions> = {
    type: "svg",
    qrOptions: {
        errorCorrectionLevel: "H", // 30% — room for logo overlay
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
    image: LV_SHIELD_SVG,
    imageOptions: {
        crossOrigin: "anonymous",
        margin: 4,
        imageSize: 0.25,
        hideBackgroundDots: true,
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
