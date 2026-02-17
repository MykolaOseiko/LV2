"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useState } from "react";
import { Search, Check, Clock, Download, Copy, Mail, Loader2, AlertTriangle } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { truncateHash, formatDate } from "@/lib/utils";

type Tab = "ref" | "hash" | "my";

interface CertRecord {
    certRef: string;
    hashSha256: string;
    timestamp: number;
    blockchainStatus: "pending" | "confirmed";
    registrantEmail?: string;
}

export default function VerifyPage() {
    const [tab, setTab] = useState<Tab>("ref");
    const [searchInput, setSearchInput] = useState("");
    const [emailInput, setEmailInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<CertRecord[] | null>(null);
    const [error, setError] = useState("");
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [copied, setCopied] = useState("");

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(""), 2000);
    };

    // --- Search by certificate reference ---
    const searchByRef = async () => {
        setError("");
        setResults(null);
        const ref = searchInput.trim().toUpperCase();
        if (!ref) {
            setError("Please enter a certificate reference.");
            return;
        }

        setLoading(true);
        try {
            const q = query(
                collection(db, "registry_entries"),
                where("certRef", "==", ref)
            );
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                setError("No certificate found with this reference.");
            } else {
                const records: CertRecord[] = [];
                snapshot.forEach((doc) => {
                    const d = doc.data();
                    records.push({
                        certRef: d.certRef,
                        hashSha256: d.hashSha256,
                        timestamp: d.timestamp,
                        blockchainStatus: d.blockchainStatus || "pending",
                        registrantEmail: d.registrantEmail,
                    });
                });
                setResults(records);
            }
        } catch {
            setError("Failed to search. Please try again.");
        } finally {
            setLoading(false);
        }
    };

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
            const q = query(
                collection(db, "registry_entries"),
                where("hashSha256", "==", hash)
            );
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                setError("This hash is not registered in the AuthorHash Registry.");
            } else {
                const records: CertRecord[] = [];
                snapshot.forEach((doc) => {
                    const d = doc.data();
                    records.push({
                        certRef: d.certRef,
                        hashSha256: d.hashSha256,
                        timestamp: d.timestamp,
                        blockchainStatus: d.blockchainStatus || "pending",
                        registrantEmail: d.registrantEmail,
                    });
                });
                setResults(records);
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
        setMagicLinkSent(false);
        const email = emailInput.trim().toLowerCase();
        if (!email || !email.includes("@")) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);
        try {
            const functionsUrl = process.env.NEXT_PUBLIC_FUNCTIONS_URL;
            const res = await fetch(`${functionsUrl}/sendMagicLink`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                throw new Error("Failed to send magic link");
            }

            setMagicLinkSent(true);
        } catch {
            setError(
                "Failed to send magic link. Please try again or use your certificate reference number instead."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (tab === "ref") searchByRef();
        else if (tab === "hash") searchByHash();
    };

    return (
        <>
            <Navbar />
            <main className="flex-1 bg-[#F5F5F0]">
                {/* Header */}
                <section className="bg-[#0A2F1F] text-[#F5F5F0] py-16">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">
                            Verify Certificate
                        </h1>
                        <p className="text-[#F5F5F0]/60 uppercase tracking-widest text-sm">
                            Independent Verification of AuthorHash Certificates
                        </p>
                    </div>
                </section>

                {/* Search */}
                <section className="py-16">
                    <div className="container mx-auto px-6 max-w-2xl">
                        <div className="bg-white p-8 md:p-12 shadow-2xl rounded-sm border-t-8 border-[#0A2F1F]">
                            {/* Tabs */}
                            <div className="flex mb-8 border-b">
                                {[
                                    { id: "ref" as Tab, label: "Certificate Ref" },
                                    { id: "hash" as Tab, label: "SHA-256 Hash" },
                                    { id: "my" as Tab, label: "My Certificates" },
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => {
                                            setTab(t.id);
                                            setResults(null);
                                            setError("");
                                            setMagicLinkSent(false);
                                        }}
                                        className={`flex-1 py-3 text-xs sm:text-sm font-bold uppercase tracking-widest transition-colors ${
                                            tab === t.id
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
                                                    setSearchInput(
                                                        e.target.value
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    e.key === "Enter" &&
                                                    handleSearch()
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

                            {/* My Certificates (magic link) */}
                            {tab === "my" && (
                                <div className="space-y-4">
                                    {!magicLinkSent ? (
                                        <>
                                            <p className="text-sm text-gray-600">
                                                Enter the email you used when
                                                registering your certificates.
                                                We&apos;ll send a secure link
                                                (valid 30 minutes) to view all
                                                certificates tied to that
                                                email.
                                            </p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="email"
                                                    value={emailInput}
                                                    onChange={(e) =>
                                                        setEmailInput(
                                                            e.target.value
                                                        )
                                                    }
                                                    onKeyDown={(e) =>
                                                        e.key === "Enter" &&
                                                        requestMagicLink()
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
                                                Only works for certificates
                                                where you provided an email at
                                                purchase.
                                            </p>
                                        </>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Check className="h-6 w-6 text-emerald-600" />
                                            </div>
                                            <h3 className="font-bold text-[#0A2F1F] mb-2">
                                                Magic link sent
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Check your email at{" "}
                                                <strong>{emailInput}</strong>.
                                                The link is valid for 30
                                                minutes.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="mt-6 bg-red-50 border border-red-200 p-3 rounded text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            {/* Results */}
                            {results && results.length > 0 && (
                                <div className="mt-8 space-y-6">
                                    {results.map((cert) => (
                                        <div
                                            key={cert.certRef}
                                            className="border border-gray-200 p-6 space-y-4"
                                        >
                                            {/* Status badge */}
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-lg font-bold text-[#0A2F1F]">
                                                    {cert.certRef}
                                                </span>
                                                <span
                                                    className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                                                        cert.blockchainStatus ===
                                                        "confirmed"
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                                >
                                                    {cert.blockchainStatus ===
                                                    "confirmed" ? (
                                                        <Check className="h-3 w-3" />
                                                    ) : (
                                                        <Clock className="h-3 w-3" />
                                                    )}
                                                    {cert.blockchainStatus}
                                                </span>
                                            </div>

                                            {/* Hash */}
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
                                                            copyToClipboard(
                                                                cert.hashSha256
                                                            )
                                                        }
                                                        className="p-2 hover:bg-gray-100 rounded shrink-0"
                                                    >
                                                        {copied ===
                                                        cert.hashSha256 ? (
                                                            <Check className="h-4 w-4 text-emerald-600" />
                                                        ) : (
                                                            <Copy className="h-4 w-4 text-gray-400" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Timestamp */}
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Registered
                                                </label>
                                                <p className="font-mono text-sm text-[#0A2F1F] mt-1">
                                                    {formatDate(cert.timestamp)}
                                                </p>
                                            </div>

                                            {/* Blockchain detail */}
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Blockchain Anchoring
                                                </label>
                                                <p className="text-sm text-[#0A2F1F] mt-1">
                                                    {cert.blockchainStatus ===
                                                    "confirmed"
                                                        ? "Confirmed — anchored to the Bitcoin blockchain via OpenTimestamps."
                                                        : "Pending — submitted to Bitcoin calendar servers, awaiting block confirmation (~12h)."}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Explainer */}
                        <div className="mt-12 text-center text-sm text-gray-500">
                            <p>
                                AuthorHash certificates are independently
                                verifiable. The SHA-256 hash and OpenTimestamps
                                proof can be checked against the Bitcoin
                                blockchain by anyone, without relying on Libris
                                Ventures.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
