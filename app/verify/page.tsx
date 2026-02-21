"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useState, useEffect, useCallback, Suspense } from "react";
import {
    Search, Check, Clock, Download, Copy, Mail,
    Loader2, ShieldCheck, Globe, QrCode,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

type Tab = "ref" | "hash" | "my";

interface CertRecord {
    certRef: string;
    hashSha256: string;
    timestamp: number;
    blockchainStatus: "pending" | "confirmed";
    eidasStatus?: "verified" | "pending" | "none";
    registrantEmail?: string;
}

function VerifyContent() {
    const searchParams = useSearchParams();
    const [tab, setTab] = useState<Tab>("ref");
    const [searchInput, setSearchInput] = useState("");
    const [emailInput, setEmailInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<CertRecord[] | null>(null);
    const [error, setError] = useState("");
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [copied, setCopied] = useState("");
    const [autoLoaded, setAutoLoaded] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(""), 2000);
    };

    // --- Search by certificate reference ---
    const searchByRef = useCallback(async (ref?: string) => {
        setError("");
        setResults(null);
        const searchRef = (ref || searchInput).trim().toUpperCase();
        if (!searchRef) {
            setError("Please enter a certificate reference.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/certificates?ref=${encodeURIComponent(searchRef)}`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "No certificate found.");
            } else {
                setResults(data.certificates);
            }
        } catch {
            setError("Failed to search. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [searchInput]);

    // --- Search by hash ---
    const searchByHash = async () => {
        setError("");
        setResults(null);
        const hash = searchInput.trim().toLowerCase();
        if (!hash || hash.length !== 64) {
            setError("Please enter a valid 64-character SHA-256 hash.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/certificates?hash=${encodeURIComponent(hash)}`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "No certificate found.");
            } else {
                setResults(data.certificates);
            }
        } catch {
            setError("Failed to search. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // --- Request magic link ---
    const requestMagicLink = async () => {
        setError("");
        const email = emailInput.trim().toLowerCase();
        if (!email || !email.includes("@")) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);
        try {
            // In production: send email with magic link
            // For now, directly fetch certificates by email
            const res = await fetch(`/api/certificates?email=${encodeURIComponent(email)}`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "No certificates found for this email.");
            } else {
                setResults(data.certificates);
            }
        } catch {
            setError("Failed to search. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (tab === "ref") searchByRef();
        else if (tab === "hash") searchByHash();
    };

    // --- Auto-load from QR code URL (?ref=...) ---
    useEffect(() => {
        const ref = searchParams.get("ref");
        if (ref && !autoLoaded) {
            setAutoLoaded(true);
            setSearchInput(ref);
            searchByRef(ref);
        }
    }, [searchParams, autoLoaded, searchByRef]);

    /** Determine the shield status label */
    const getShieldStatus = (cert: CertRecord) => {
        const hasEidas = cert.eidasStatus === "verified";
        const hasBtc = cert.blockchainStatus === "confirmed";

        if (hasEidas && hasBtc) {
            return { label: "DUAL SHIELD", color: "bg-emerald-100 text-emerald-700", icon: <ShieldCheck className="h-3 w-3" /> };
        }
        if (hasEidas) {
            return { label: "EIDAS VERIFIED", color: "bg-blue-100 text-blue-700", icon: <ShieldCheck className="h-3 w-3" /> };
        }
        if (hasBtc) {
            return { label: "BLOCKCHAIN CONFIRMED", color: "bg-emerald-100 text-emerald-700", icon: <Globe className="h-3 w-3" /> };
        }
        return { label: "PENDING", color: "bg-yellow-100 text-yellow-700", icon: <Clock className="h-3 w-3" /> };
    };

    const isFromQR = !!searchParams.get("ref");

    return (
        <>
            <Navbar />
            <main className="flex-1 bg-[#F5F5F0]">
                {/* Header */}
                <section className="bg-[#0A2F1F] text-[#F5F5F0] py-16">
                    <div className="container mx-auto px-6 text-center">
                        {isFromQR && !loading && results && results.length > 0 ? (
                            <>
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <QrCode className="h-8 w-8 text-[#D4AF37]" />
                                    <h1 className="font-serif text-3xl md:text-5xl font-bold">
                                        Certificate Verified
                                    </h1>
                                </div>
                                <p className="text-[#D4AF37] uppercase tracking-widest text-sm">
                                    Authorship is protected by AuthorHash® · Independently verifiable
                                </p>
                            </>
                        ) : (
                            <>
                                <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">
                                    Verify Certificate
                                </h1>
                                <p className="text-[#F5F5F0]/60 uppercase tracking-widest text-sm">
                                    Independent Verification of AuthorHash Certificates
                                </p>
                            </>
                        )}
                    </div>
                </section>

                <section className="py-16">
                    <div className="container mx-auto px-6 max-w-2xl">
                        {/* Show results directly if auto-loaded from QR */}
                        {isFromQR && results && results.length > 0 ? (
                            <div className="space-y-6">
                                {results.map((cert) => {
                                    const shield = getShieldStatus(cert);
                                    return (
                                        <div
                                            key={cert.certRef}
                                            className="bg-white shadow-2xl rounded-sm border-t-8 border-[#D4AF37] overflow-hidden"
                                        >
                                            {/* Certificate header */}
                                            <div className="bg-[#0A2F1F] p-6 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-[#D4AF37] uppercase tracking-widest font-bold mb-1">
                                                        Certificate Reference
                                                    </p>
                                                    <p className="font-mono text-xl font-bold text-[#F5F5F0]">
                                                        {cert.certRef}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full ${shield.color}`}
                                                >
                                                    {shield.icon}
                                                    {shield.label}
                                                </span>
                                            </div>

                                            <div className="p-6 md:p-8 space-y-6">
                                                {/* Hash */}
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                        SHA-256 Digital Fingerprint
                                                    </label>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <code className="font-mono text-xs text-[#0A2F1F] bg-gray-50 p-3 rounded break-all flex-1 border border-gray-100">
                                                            {cert.hashSha256}
                                                        </code>
                                                        <button
                                                            onClick={() =>
                                                                copyToClipboard(cert.hashSha256)
                                                            }
                                                            className="p-2 hover:bg-gray-100 rounded shrink-0"
                                                            title="Copy hash"
                                                        >
                                                            {copied === cert.hashSha256 ? (
                                                                <Check className="h-4 w-4 text-emerald-600" />
                                                            ) : (
                                                                <Copy className="h-4 w-4 text-gray-400" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Timestamp */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                            Registration Timestamp
                                                        </label>
                                                        <p className="font-mono text-sm text-[#0A2F1F] mt-1">
                                                            {formatDate(cert.timestamp)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                            Protection Status
                                                        </label>
                                                        <div className="mt-1 space-y-1.5">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <ShieldCheck className={`h-4 w-4 ${cert.eidasStatus === "verified" ? "text-emerald-600" : "text-gray-300"}`} />
                                                                <span className={cert.eidasStatus === "verified" ? "text-[#0A2F1F]" : "text-gray-400"}>
                                                                    eIDAS Qualified Timestamp
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Globe className={`h-4 w-4 ${cert.blockchainStatus === "confirmed" ? "text-emerald-600" : "text-yellow-500 animate-pulse"}`} />
                                                                <span className={cert.blockchainStatus === "confirmed" ? "text-[#0A2F1F]" : "text-gray-400"}>
                                                                    {cert.blockchainStatus === "confirmed"
                                                                        ? "Bitcoin Blockchain Anchor"
                                                                        : "Bitcoin Anchor — processing (~12h)"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Download buttons */}
                                                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                                                    <button
                                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#0A2F1F] text-[#F5F5F0] font-bold text-xs uppercase tracking-widest hover:bg-[#0A2F1F]/90 transition-all"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                        {cert.blockchainStatus === "confirmed"
                                                            ? "Download Dual Shield Certificate"
                                                            : "Download eIDAS Certificate"}
                                                    </button>
                                                    <button
                                                        className="flex items-center justify-center gap-2 px-6 py-3 border border-[#0A2F1F] text-[#0A2F1F] font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                        OTS Proof
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Footer text for QR visitors */}
                                <div className="text-center space-y-4 pt-8">
                                    <p className="text-sm text-gray-500">
                                        This certificate was issued by <strong>Libris Ventures LLC</strong> and is independently verifiable.
                                        The SHA-256 hash and cryptographic proofs can be checked against the Bitcoin blockchain and eIDAS infrastructure by anyone.
                                    </p>
                                    <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest">
                                        Authorship is protected by AuthorHash® · Scan to verify
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* --- Standard search interface --- */
                            <>
                                <div className="bg-white p-8 md:p-12 shadow-2xl rounded-sm border-t-8 border-[#0A2F1F]">
                                    {/* Tabs */}
                                    <div className="flex mb-8 border-b">
                                        {([
                                            { id: "ref" as Tab, label: "Certificate Ref" },
                                            { id: "hash" as Tab, label: "SHA-256 Hash" },
                                            { id: "my" as Tab, label: "My Certificates" },
                                        ]).map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => {
                                                    setTab(t.id);
                                                    setResults(null);
                                                    setError("");
                                                    setMagicLinkSent(false);
                                                }}
                                                className={`flex-1 py-3 text-xs sm:text-sm font-bold uppercase tracking-widest transition-colors ${tab === t.id
                                                    ? "bg-[#0A2F1F] text-[#F5F5F0]"
                                                    : "text-gray-500 hover:text-[#0A2F1F]"
                                                    }`}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Ref / Hash search */}
                                    {(tab === "ref" || tab === "hash") && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-semibold text-gray-700">
                                                    {tab === "ref"
                                                        ? "Certificate Reference"
                                                        : "SHA-256 Hash"}
                                                </label>
                                                <div className="flex gap-2 mt-2">
                                                    <input
                                                        type="text"
                                                        value={searchInput}
                                                        onChange={(e) =>
                                                            setSearchInput(e.target.value)
                                                        }
                                                        onKeyDown={(e) =>
                                                            e.key === "Enter" && handleSearch()
                                                        }
                                                        className="flex-1 p-3 border border-gray-300 rounded-none focus:outline-none focus:border-[#D4AF37] font-mono text-sm transition-colors"
                                                        placeholder={
                                                            tab === "ref"
                                                                ? "LV-AH-2026-XKW-MPD-RBT"
                                                                : "e.g. a1b2c3d4e5f6..."
                                                        }
                                                    />
                                                    <button
                                                        onClick={handleSearch}
                                                        disabled={loading}
                                                        className="px-6 bg-[#0A2F1F] text-[#F5F5F0] font-bold uppercase text-sm tracking-widest hover:bg-[#0A2F1F]/90 transition-all disabled:opacity-50 flex items-center gap-2"
                                                    >
                                                        {loading ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Search className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* My Certificates (email lookup) */}
                                    {tab === "my" && (
                                        <div className="space-y-4">
                                            {!magicLinkSent ? (
                                                <>
                                                    <p className="text-sm text-gray-600">
                                                        Enter the email you used when registering your certificates.
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="email"
                                                            value={emailInput}
                                                            onChange={(e) =>
                                                                setEmailInput(e.target.value)
                                                            }
                                                            onKeyDown={(e) =>
                                                                e.key === "Enter" && requestMagicLink()
                                                            }
                                                            className="flex-1 p-3 border border-gray-300 rounded-none focus:outline-none focus:border-[#D4AF37] text-sm transition-colors"
                                                            placeholder="author@example.com"
                                                        />
                                                        <button
                                                            onClick={requestMagicLink}
                                                            disabled={loading}
                                                            className="px-6 bg-[#0A2F1F] text-[#F5F5F0] font-bold uppercase text-sm tracking-widest hover:bg-[#0A2F1F]/90 transition-all disabled:opacity-50 flex items-center gap-2"
                                                        >
                                                            {loading ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Mail className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-gray-400">
                                                        Only works for certificates where you provided an email at purchase.
                                                    </p>
                                                </>
                                            ) : null}
                                        </div>
                                    )}

                                    {/* Error */}
                                    {error && (
                                        <div className="mt-6 bg-red-50 border border-red-200 p-3 rounded text-sm text-red-700">
                                            {error}
                                        </div>
                                    )}

                                    {/* Search Results */}
                                    {results && results.length > 0 && (
                                        <div className="mt-8 space-y-6">
                                            {results.map((cert) => {
                                                const shield = getShieldStatus(cert);
                                                return (
                                                    <div
                                                        key={cert.certRef}
                                                        className="border border-gray-200 rounded p-6 space-y-4"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-mono text-lg font-bold text-[#0A2F1F]">
                                                                {cert.certRef}
                                                            </span>
                                                            <span
                                                                className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${shield.color}`}
                                                            >
                                                                {shield.icon}
                                                                {shield.label}
                                                            </span>
                                                        </div>

                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                                SHA-256 Fingerprint
                                                            </label>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <code className="font-mono text-xs text-[#0A2F1F] bg-gray-50 p-2 rounded break-all flex-1">
                                                                    {cert.hashSha256}
                                                                </code>
                                                                <button
                                                                    onClick={() =>
                                                                        copyToClipboard(cert.hashSha256)
                                                                    }
                                                                    className="p-2 hover:bg-gray-100 rounded shrink-0"
                                                                >
                                                                    {copied === cert.hashSha256 ? (
                                                                        <Check className="h-4 w-4 text-emerald-600" />
                                                                    ) : (
                                                                        <Copy className="h-4 w-4 text-gray-400" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                                Registered
                                                            </label>
                                                            <p className="font-mono text-sm text-[#0A2F1F] mt-1">
                                                                {formatDate(cert.timestamp)}
                                                            </p>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <ShieldCheck className={`h-4 w-4 ${cert.eidasStatus === "verified" ? "text-emerald-600" : "text-gray-300"}`} />
                                                                <span className={cert.eidasStatus === "verified" ? "text-[#0A2F1F]" : "text-gray-400"}>
                                                                    eIDAS
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Globe className={`h-4 w-4 ${cert.blockchainStatus === "confirmed" ? "text-emerald-600" : "text-yellow-500"}`} />
                                                                <span className={cert.blockchainStatus === "confirmed" ? "text-[#0A2F1F]" : "text-gray-400"}>
                                                                    {cert.blockchainStatus === "confirmed" ? "Bitcoin" : "Pending"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Explainer */}
                                <div className="mt-12 text-center text-sm text-gray-500">
                                    <p>
                                        AuthorHash certificates are independently verifiable.
                                        The SHA-256 hash and cryptographic proofs can be checked
                                        against the Bitcoin blockchain and EU eIDAS infrastructure by anyone,
                                        without relying on Libris Ventures.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-[#F5F5F0]">
                <Loader2 className="h-8 w-8 animate-spin text-[#0A2F1F]" />
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}
