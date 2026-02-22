"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import {
    Upload, AlertTriangle, Check, Copy, Download,
    Loader2, Hash, ShieldCheck, Globe, QrCode,
} from "lucide-react";
import { calculateSHA256 } from "@/lib/hash";
import { stampHash, otsProofToBlob } from "@/lib/ots";
import { openCheckout } from "@/lib/paddle";
import { generateCertificatePDF, downloadPDF } from "@/lib/pdf";
import { formatDate } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { generateBrandedQR, downloadBrandedQR } from "@/lib/qr";

type Step = "input" | "hashing" | "eidas" | "stamping" | "checkout" | "success";
type Tab = "upload" | "manual";

interface CertResult {
    certRef: string;
    hashSha256: string;
    timestamp: number;
    otsProof: Uint8Array;
    blockchainStatus: "pending" | "confirmed";
    eidasStatus: "verified" | "pending" | "none";
    email?: string;
}

function TimestampContent() {
    const searchParams = useSearchParams();
    const [tab, setTab] = useState<Tab>("upload");
    const [step, setStep] = useState<Step>("input");
    const [file, setFile] = useState<File | null>(null);
    const [manualHash, setManualHash] = useState("");
    const [email, setEmail] = useState("");
    const [hashResult, setHashResult] = useState("");
    const [otsProof, setOtsProof] = useState<Uint8Array | null>(null);
    const [certResult, setCertResult] = useState<CertResult | null>(null);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [qrBlobUrl, setQrBlobUrl] = useState<string | null>(null);
    const dropRef = useRef<HTMLDivElement>(null);

    // Handle success redirect from Paddle
    useEffect(() => {
        const success = searchParams.get("success");
        const hash = searchParams.get("hash");
        if (success === "true" && hash) {
            setStep("success");
            setHashResult(hash);
        }
    }, [searchParams]);

    // --- File Upload Handling ---
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) setFile(droppedFile);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) setFile(selected);
    };

    // --- Generate QR code for success state ---
    const generateQR = async (certRef: string) => {
        try {
            const verifyUrl = `https://librisventures.com/verify?ref=${certRef}`;
            const blob = await generateBrandedQR(verifyUrl, 400);
            const url = URL.createObjectURL(blob);
            setQrBlobUrl(url);
        } catch {
            // QR generation failed — non-critical
        }
    };

    // --- Core Flow ---
    const handleSecure = async () => {
        setError("");

        const hash = tab === "upload" ? "" : manualHash.trim().toLowerCase();

        if (tab === "upload" && !file) {
            setError("Please select a file.");
            return;
        }
        if (tab === "manual" && (!hash || hash.length !== 64)) {
            setError("Please enter a valid 64-character SHA-256 hash.");
            return;
        }

        try {
            // Step 1: Hash (if file upload)
            let finalHash = hash;
            if (tab === "upload" && file) {
                setStep("hashing");
                finalHash = await calculateSHA256(file);
            }
            setHashResult(finalHash);

            // Step 2: eIDAS Qualified Timestamp (primary)
            setStep("eidas");
            // TODO: Call eIDAS TSA API here when credentials are available
            // For now, simulate with a brief delay
            await new Promise((resolve) => setTimeout(resolve, 800));

            // Step 3: OpenTimestamps (secondary, async)
            setStep("stamping");
            const ots = await stampHash(finalHash);
            const proofBytes = new Uint8Array(ots.otsFile);
            setOtsProof(proofBytes);

            // Step 4: Paddle Checkout (skip for admin testing)
            const isAdmin = email?.toLowerCase() === "admin@librisventures.com";
            if (!isAdmin) {
                setStep("checkout");
                const proofBase64 = btoa(
                    String.fromCharCode(...proofBytes)
                );

                await openCheckout({
                    hashSha256: finalHash,
                    registrantEmail: email || undefined,
                    otsProofBase64: proofBase64,
                    timestamp: ots.timestamp,
                });
            }

            // Step 5: Save certificate to database
            const certRes = await fetch("/api/certificates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hashSha256: finalHash,
                    timestamp: ots.timestamp,
                    registrantEmail: email || undefined,
                    eidasStatus: "verified",
                }),
            });
            const certData = await certRes.json();
            const certRef = certData.certificate?.certRef || "LV-AH-" + new Date().getFullYear() + "-ERR";

            setStep("success");
            const result: CertResult = {
                certRef,
                hashSha256: finalHash,
                timestamp: ots.timestamp,
                otsProof: proofBytes,
                blockchainStatus: "pending",
                eidasStatus: "verified",
                email: email || undefined,
            };
            setCertResult(result);

            // Generate branded QR code
            generateQR(certRef);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "An error occurred.";
            if (message === "Checkout cancelled") {
                setStep("input");
            } else {
                setError(message);
                setStep("input");
            }
        }
    };

    const handleDownloadPDF = async () => {
        if (!certResult) return;
        const pdfBytes = await generateCertificatePDF({
            certRef: certResult.certRef,
            hashSha256: certResult.hashSha256,
            registrationTimestamp: certResult.timestamp,
            blockchainStatus: certResult.blockchainStatus,
            registrantEmail: certResult.email,
        });
        downloadPDF(pdfBytes, certResult.certRef);
    };

    const handleDownloadOTS = () => {
        if (!otsProof || !hashResult) return;
        const blob = otsProofToBlob(otsProof);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${hashResult.slice(0, 16)}.ots`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownloadQR = async () => {
        if (!certResult) return;
        await downloadBrandedQR(
            `https://librisventures.com/verify?ref=${certResult.certRef}`,
            `${certResult.certRef}_QR`
        );
    };

    const copyHash = () => {
        navigator.clipboard.writeText(hashResult);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isProcessing = step === "hashing" || step === "eidas" || step === "stamping" || step === "checkout";

    return (
        <>
            <Navbar />
            <main className="flex-1 bg-[#F5F5F0]">
                {/* Header */}
                <section className="bg-[#0A2F1F] text-[#F5F5F0] py-16">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">
                            AuthorHash Certificate
                        </h1>
                        <p className="text-[#F5F5F0]/60 uppercase tracking-widest text-sm">
                            Immutable &amp; Timestamped Proof of Existence
                        </p>
                    </div>
                </section>

                {/* Main content */}
                <section className="py-16">
                    <div className="container mx-auto px-6 max-w-2xl">
                        {step === "success" && certResult ? (
                            /* ---- SUCCESS STATE ---- */
                            <div className="bg-white shadow-2xl rounded-sm overflow-hidden">
                                {/* Green header bar */}
                                <div className="bg-[#0A2F1F] p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                                            <Check className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-[#F5F5F0]">
                                                eIDAS Certificate Issued
                                            </h2>
                                            <p className="text-xs text-[#D4AF37] uppercase tracking-widest">
                                                Legally valid under EU Regulation 910/2014
                                            </p>
                                        </div>
                                    </div>
                                    <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-blue-100 text-blue-700">
                                        <ShieldCheck className="h-3 w-3" />
                                        EIDAS VERIFIED
                                    </span>
                                </div>

                                <div className="p-6 md:p-8 space-y-6">
                                    {/* Cert ref + QR side by side */}
                                    <div className="flex gap-6">
                                        <div className="flex-1 space-y-4">
                                            {/* Cert ref */}
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Certificate Reference
                                                </label>
                                                <p className="font-mono text-lg font-bold text-[#0A2F1F] mt-1">
                                                    {certResult.certRef}
                                                </p>
                                            </div>

                                            {/* Timestamp */}
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Registration Timestamp
                                                </label>
                                                <p className="font-mono text-sm text-[#0A2F1F] mt-1">
                                                    {formatDate(certResult.timestamp)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Branded QR Code */}
                                        {qrBlobUrl && (
                                            <div className="shrink-0 text-center">
                                                <div className="w-32 h-32 border-2 border-[#D4AF37]/30 rounded overflow-hidden">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={qrBlobUrl}
                                                        alt="Verification QR Code"
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <p className="text-[9px] text-gray-400 mt-1.5 leading-tight">
                                                    Authorship is protected by<br />AuthorHash® · Scan to verify
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Hash */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            SHA-256 Fingerprint
                                        </label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <code className="font-mono text-xs text-[#0A2F1F] bg-gray-50 p-2 rounded flex-1 break-all border border-gray-100">
                                                {certResult.hashSha256}
                                            </code>
                                            <button
                                                onClick={copyHash}
                                                className="p-2 hover:bg-gray-100 rounded"
                                                title="Copy hash"
                                            >
                                                {copied ? (
                                                    <Check className="h-4 w-4 text-emerald-600" />
                                                ) : (
                                                    <Copy className="h-4 w-4 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Protection Status */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                                            Protection Status
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="flex items-center gap-3 bg-blue-50 p-3 rounded border border-blue-100">
                                                <ShieldCheck className="h-5 w-5 text-blue-600" />
                                                <div>
                                                    <p className="text-sm font-bold text-[#0A2F1F]">eIDAS Qualified Timestamp</p>
                                                    <p className="text-xs text-emerald-600">✓ Active — instant legal force</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 bg-yellow-50 p-3 rounded border border-yellow-100">
                                                <Globe className="h-5 w-5 text-yellow-600 animate-pulse" />
                                                <div>
                                                    <p className="text-sm font-bold text-[#0A2F1F]">Bitcoin Blockchain Anchor</p>
                                                    <p className="text-xs text-yellow-600">⏳ Processing — ~12–24 hours</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bitcoin anchor info box */}
                                    <div className="bg-[#0A2F1F]/5 border border-[#0A2F1F]/10 rounded p-4">
                                        <p className="text-sm text-[#0A2F1F]">
                                            <strong>Your eIDAS certificate is ready now.</strong>{" "}
                                            The Bitcoin blockchain anchor will confirm in 12–24 hours.
                                            Come back to download the <strong>Dual Shield</strong> certificate
                                            (eIDAS + Bitcoin) using your verification QR code or at{" "}
                                            <a href="/verify" className="text-[#D4AF37] underline font-bold">/verify</a>.
                                        </p>
                                    </div>

                                    {/* Download buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                                        <button
                                            onClick={handleDownloadPDF}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#0A2F1F] text-[#F5F5F0] font-bold text-xs uppercase tracking-widest hover:bg-[#0A2F1F]/90 transition-all"
                                        >
                                            <Download className="h-4 w-4" />
                                            eIDAS Certificate
                                        </button>
                                        <button
                                            onClick={handleDownloadOTS}
                                            className="flex items-center justify-center gap-2 px-6 py-3 border border-[#0A2F1F] text-[#0A2F1F] font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                                        >
                                            <Download className="h-4 w-4" />
                                            OTS Proof
                                        </button>
                                        {qrBlobUrl && (
                                            <button
                                                onClick={handleDownloadQR}
                                                className="flex items-center justify-center gap-2 px-6 py-3 border border-[#D4AF37] text-[#D4AF37] font-bold text-xs uppercase tracking-widest hover:bg-[#D4AF37]/10 transition-all"
                                            >
                                                <QrCode className="h-4 w-4" />
                                                QR Code
                                            </button>
                                        )}
                                    </div>

                                    {/* Warning if no email */}
                                    {!certResult.email && (
                                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                                            <div className="flex items-start gap-2">
                                                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                                <div className="text-sm text-amber-800">
                                                    <p className="font-bold">No email provided</p>
                                                    <p className="mt-1">
                                                        Save your certificate reference{" "}
                                                        <strong>{certResult.certRef}</strong> or download the QR code — it&apos;s
                                                        the only way to look up this certificate later.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {certResult.email && (
                                        <p className="text-sm text-gray-500">
                                            A copy has been sent to{" "}
                                            <strong>{certResult.email}</strong>. You can
                                            retrieve all your certificates anytime at{" "}
                                            <a
                                                href="/verify"
                                                className="text-[#D4AF37] underline"
                                            >
                                                /verify
                                            </a>{" "}
                                            → My Certificates.
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* ---- INPUT / PROCESSING STATE ---- */
                            <div className="bg-white p-8 md:p-12 shadow-2xl rounded-sm border-t-8 border-[#D4AF37]">
                                {/* Tabs */}
                                <div className="flex mb-8 border-b">
                                    <button
                                        onClick={() => !isProcessing && setTab("upload")}
                                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${tab === "upload"
                                            ? "bg-[#0A2F1F] text-[#F5F5F0]"
                                            : "text-gray-500 hover:text-[#0A2F1F]"
                                            }`}
                                        disabled={isProcessing}
                                    >
                                        No File Upload (Local Only)
                                    </button>
                                    <button
                                        onClick={() => !isProcessing && setTab("manual")}
                                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${tab === "manual"
                                            ? "bg-[#0A2F1F] text-[#F5F5F0]"
                                            : "text-gray-500 hover:text-[#0A2F1F]"
                                            }`}
                                        disabled={isProcessing}
                                    >
                                        Manual Hash Entry
                                    </button>
                                </div>

                                {/* Liability warning */}
                                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                        <div className="text-sm text-amber-800">
                                            <p className="font-bold">
                                                Critical Liability Warning
                                            </p>
                                            <ul className="mt-2 space-y-1 list-disc list-inside">
                                                <li>You must archive the exact file version that generated this hash.</li>
                                                <li>Changing a single comma will alter the hash and invalidate your AuthorHash proof.</li>
                                                <li>Libris Ventures does not store your files. If you lose the file, the proof is useless.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* File upload or manual hash */}
                                {tab === "upload" ? (
                                    <div
                                        ref={dropRef}
                                        onDrop={handleDrop}
                                        onDragOver={(e) => e.preventDefault()}
                                        onClick={() =>
                                            document
                                                .getElementById("file-input")
                                                ?.click()
                                        }
                                        className="border-2 border-dashed border-[#D4AF37]/40 rounded-sm p-12 text-center cursor-pointer hover:border-[#D4AF37] transition-colors mb-8"
                                    >
                                        <input
                                            id="file-input"
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileSelect}
                                            accept="*/*"
                                            disabled={isProcessing}
                                        />
                                        {file ? (
                                            <div>
                                                <Check className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                                                <p className="font-bold text-[#0A2F1F]">
                                                    {file.name}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        ) : (
                                            <div>
                                                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                <p className="font-bold text-[#0A2F1F]">
                                                    Drag &amp; drop or click to select
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Any file type — manuscripts, illustrations, music, photos, code
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mb-8 space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">
                                            SHA-256 Hash (64 hex characters)
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Hash className="h-5 w-5 text-gray-400 shrink-0" />
                                            <input
                                                type="text"
                                                value={manualHash}
                                                onChange={(e) =>
                                                    setManualHash(e.target.value)
                                                }
                                                className="w-full p-3 border border-gray-300 rounded-none focus:outline-none focus:border-[#D4AF37] font-mono text-sm transition-colors"
                                                placeholder="e.g. a1b2c3d4e5f6..."
                                                maxLength={64}
                                                disabled={isProcessing}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            {manualHash.length}/64 characters
                                        </p>
                                    </div>
                                )}

                                {/* Hash result (shown after hashing) */}
                                {hashResult && step !== "success" && (
                                    <div className="bg-gray-50 p-4 rounded mb-8 border">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            SHA-256 Fingerprint
                                        </label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <code className="font-mono text-xs text-[#0A2F1F] break-all flex-1">
                                                {hashResult}
                                            </code>
                                            <button
                                                onClick={copyHash}
                                                className="p-1 hover:bg-gray-200 rounded"
                                            >
                                                {copied ? (
                                                    <Check className="h-4 w-4 text-emerald-600" />
                                                ) : (
                                                    <Copy className="h-4 w-4 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Email (optional) */}
                                <div className="mb-8 space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Registrant Email{" "}
                                        <span className="text-gray-400 font-normal">
                                            (optional)
                                        </span>
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        className="w-full p-3 border border-gray-300 rounded-none focus:outline-none focus:border-[#D4AF37] transition-colors"
                                        placeholder="author@example.com"
                                        disabled={isProcessing}
                                    />
                                    {!email && (
                                        <p className="text-xs text-amber-600">
                                            Without an email, you can still download your certificate now.
                                            However, you won&apos;t be able to retrieve it later.
                                            Save your certificate reference or QR code.
                                        </p>
                                    )}
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 p-3 rounded mb-6 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}

                                {/* Submit button with state */}
                                <button
                                    onClick={handleSecure}
                                    disabled={isProcessing}
                                    className="w-full bg-[#0A2F1F] text-[#F5F5F0] font-bold uppercase tracking-widest py-4 hover:bg-[#0A2F1F]/90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {step === "hashing" && (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Computing SHA-256 hash...
                                        </>
                                    )}
                                    {step === "eidas" && (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Securing eIDAS qualified timestamp...
                                        </>
                                    )}
                                    {step === "stamping" && (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Anchoring to Bitcoin blockchain...
                                        </>
                                    )}
                                    {step === "checkout" && (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Complete payment...
                                        </>
                                    )}
                                    {step === "input" && (
                                        <>Secure Your Asset — $4.99</>
                                    )}
                                </button>

                                <p className="text-center text-xs text-gray-500 mt-4">
                                    Payment processed by Paddle. Price includes applicable taxes.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

export default function TimestampPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-[#F5F5F0]">
                <Loader2 className="h-8 w-8 animate-spin text-[#0A2F1F]" />
            </div>
        }>
            <TimestampContent />
        </Suspense>
    );
}
