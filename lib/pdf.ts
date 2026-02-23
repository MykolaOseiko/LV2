import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

export interface CertificateData {
    certRef: string;
    hashSha256: string;
    registrationTimestamp: number;
    blockchainStatus: "pending" | "confirmed";
    registrantEmail?: string;
    baseUrl?: string;
}

const LV_GREEN = rgb(10 / 255, 47 / 255, 31 / 255);
const LV_GOLD = rgb(212 / 255, 175 / 255, 55 / 255);
const LV_CREAM = rgb(245 / 255, 245 / 255, 240 / 255);
const LV_GREY = rgb(100 / 255, 100 / 255, 100 / 255);

/**
 * Generate a Certificate of Anteriority PDF entirely client-side.
 * Returns a Uint8Array (the PDF bytes) ready for download.
 */
export async function generateCertificatePDF(
    data: CertificateData
): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const page = doc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    const helvetica = await doc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const courier = await doc.embedFont(StandardFonts.Courier);

    const margin = 60;
    let y = height - margin;

    // --- Header bar ---
    page.drawRectangle({
        x: 0,
        y: height - 100,
        width,
        height: 100,
        color: LV_GREEN,
    });

    page.drawText("LIBRIS VENTURES LLC", {
        x: margin,
        y: height - 45,
        size: 18,
        font: helveticaBold,
        color: LV_CREAM,
    });

    page.drawText("Certificate of Anteriority", {
        x: margin,
        y: height - 70,
        size: 12,
        font: helvetica,
        color: LV_GOLD,
    });

    page.drawText("AuthorHash Protection", {
        x: margin,
        y: height - 85,
        size: 9,
        font: helvetica,
        color: rgb(1, 1, 1),
    });

    // --- Certificate Reference (large) ---
    y = height - 140;
    page.drawText("CERTIFICATE REFERENCE", {
        x: margin,
        y,
        size: 9,
        font: helveticaBold,
        color: LV_GREY,
    });

    y -= 25;
    page.drawText(data.certRef, {
        x: margin,
        y,
        size: 22,
        font: helveticaBold,
        color: LV_GREEN,
    });

    // --- Divider ---
    y -= 20;
    page.drawLine({
        start: { x: margin, y },
        end: { x: width - margin, y },
        thickness: 0.5,
        color: LV_GOLD,
    });

    // --- Certificate body ---
    y -= 30;
    page.drawText("This certificate attests that the digital asset identified by the", {
        x: margin,
        y,
        size: 10,
        font: helvetica,
        color: LV_GREEN,
    });
    y -= 16;
    page.drawText("following SHA-256 cryptographic fingerprint was registered with", {
        x: margin,
        y,
        size: 10,
        font: helvetica,
        color: LV_GREEN,
    });
    y -= 16;
    page.drawText("Libris Ventures LLC at the date and time stated below.", {
        x: margin,
        y,
        size: 10,
        font: helvetica,
        color: LV_GREEN,
    });

    // --- SHA-256 Hash ---
    y -= 35;
    page.drawText("SHA-256 DIGITAL FINGERPRINT", {
        x: margin,
        y,
        size: 9,
        font: helveticaBold,
        color: LV_GREY,
    });

    y -= 20;
    // Hash background box
    page.drawRectangle({
        x: margin - 5,
        y: y - 5,
        width: width - 2 * margin + 10,
        height: 22,
        color: rgb(0.96, 0.96, 0.95),
        borderColor: LV_GOLD,
        borderWidth: 0.5,
    });
    page.drawText(data.hashSha256, {
        x: margin,
        y,
        size: 8,
        font: courier,
        color: LV_GREEN,
    });

    // --- Registration timestamp ---
    y -= 40;
    page.drawText("REGISTRATION TIMESTAMP", {
        x: margin,
        y,
        size: 9,
        font: helveticaBold,
        color: LV_GREY,
    });

    y -= 18;
    const dateStr = new Date(data.registrationTimestamp).toISOString();
    page.drawText(dateStr, {
        x: margin,
        y,
        size: 12,
        font: courier,
        color: LV_GREEN,
    });

    // --- Blockchain status ---
    y -= 35;
    page.drawText("BLOCKCHAIN ANCHORING", {
        x: margin,
        y,
        size: 9,
        font: helveticaBold,
        color: LV_GREY,
    });

    y -= 18;
    const statusText =
        data.blockchainStatus === "confirmed"
            ? "Confirmed — anchored to the Bitcoin blockchain via OpenTimestamps"
            : "Pending — submitted to Bitcoin calendar servers, awaiting block confirmation (~12h)";
    page.drawText(statusText, {
        x: margin,
        y,
        size: 10,
        font: helvetica,
        color: LV_GREEN,
    });

    // --- QR Code ---
    const verifyUrl = `https://librisventures.com/verify?ref=${data.certRef}`;
    try {
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
            width: 120,
            margin: 1,
            color: { dark: "#0A2F1F", light: "#FFFFFF" },
        });
        const qrImageBytes = Uint8Array.from(
            atob(qrDataUrl.split(",")[1]),
            (c) => c.charCodeAt(0)
        );
        const qrImage = await doc.embedPng(qrImageBytes);
        page.drawImage(qrImage, {
            x: width - margin - 100,
            y: y - 130,
            width: 100,
            height: 100,
        });
        page.drawText("Scan to verify", {
            x: width - margin - 90,
            y: y - 145,
            size: 8,
            font: helvetica,
            color: LV_GREY,
        });
    } catch {
        // QR generation failed — non-critical, skip
    }

    // --- Legal notice ---
    y -= 180;
    page.drawLine({
        start: { x: margin, y: y + 10 },
        end: { x: width - margin, y: y + 10 },
        thickness: 0.5,
        color: LV_GOLD,
    });

    const legalLines = [
        "IMPORTANT NOTICE",
        "",
        "This certificate attests to cryptographic proof of existence at the stated date and time.",
        "It does not constitute proof of authorship, ownership, or any legal right.",
        "",
        "The registrant is solely responsible for archiving the original digital asset.",
        "Libris Ventures does not store files. If the original file is lost, altered, or destroyed,",
        "this certificate cannot be used to reproduce it. A single byte change to the file will",
        "produce a different hash and invalidate the proof.",
        "",
        "Verification: https://librisventures.com/verify?ref=" + data.certRef,
    ];

    y -= 5;
    for (const line of legalLines) {
        page.drawText(line, {
            x: margin,
            y,
            size: line === "IMPORTANT NOTICE" ? 8 : 7,
            font: line === "IMPORTANT NOTICE" ? helveticaBold : helvetica,
            color: LV_GREY,
        });
        y -= 11;
    }

    // --- Footer ---
    page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height: 40,
        color: LV_GREEN,
    });

    page.drawText(
        "Libris Ventures LLC  •  Wyoming, USA  •  librisventures.com",
        {
            x: margin,
            y: 15,
            size: 8,
            font: helvetica,
            color: LV_CREAM,
        }
    );

    page.drawText(`© ${new Date().getFullYear()} Libris Ventures LLC`, {
        x: width - margin - 120,
        y: 15,
        size: 8,
        font: helvetica,
        color: LV_GOLD,
    });

    return await doc.save();
}

/**
 * Trigger browser download of the PDF.
 */
export function downloadPDF(pdfBytes: Uint8Array, certRef: string) {
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${certRef}_Certificate_of_Anteriority.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
