"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
    return (
        <>
            <Navbar />
            <main className="flex-1 bg-[#F5F5F0]">
                {/* Header */}
                <section className="bg-[#0A2F1F] text-[#F5F5F0] py-16">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">
                            Pricing
                        </h1>
                        <p className="text-[#F5F5F0]/60 uppercase tracking-widest text-sm">
                            Simple, Transparent, No Subscriptions Required
                        </p>
                    </div>
                </section>

                <section className="py-16">
                    <div className="container mx-auto px-6 max-w-4xl">
                        {/* Main pricing card */}
                        <div className="bg-white p-8 md:p-12 shadow-2xl rounded-sm border-t-8 border-[#D4AF37] mb-12">
                            <div className="text-center mb-8">
                                <span className="text-xs font-bold tracking-widest uppercase text-[#D4AF37] mb-2 block">
                                    AuthorHash Certificate
                                </span>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="font-serif text-6xl font-bold text-[#0A2F1F]">
                                        $4.99
                                    </span>
                                    <span className="text-gray-500 text-sm">
                                        per certificate
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm mt-2">
                                    Price includes applicable taxes (handled by
                                    Paddle)
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {[
                                    "SHA-256 cryptographic fingerprint",
                                    "Bitcoin blockchain anchoring via OpenTimestamps",
                                    "Certificate of Anteriority (PDF)",
                                    "Downloadable OTS proof file",
                                    "Public verification page",
                                    "No account required",
                                    "Full anonymity option",
                                    "Permanent — no renewal fees",
                                ].map((feature) => (
                                    <div
                                        key={feature}
                                        className="flex items-start gap-3"
                                    >
                                        <Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                                        <span className="text-sm text-[#333]">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="text-center">
                                <Link
                                    href="/timestamp"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#0A2F1F] text-[#F5F5F0] font-bold text-sm tracking-widest uppercase hover:bg-[#0A2F1F]/90 transition-all shadow-lg"
                                >
                                    Secure Your Asset{" "}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Volume / subscription teaser */}
                        <div className="bg-white/50 border border-gray-200 p-8 rounded-sm text-center">
                            <span className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2 block">
                                Coming Soon
                            </span>
                            <h3 className="font-serif text-2xl font-bold text-[#0A2F1F] mb-3">
                                Volume Plans
                            </h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Publishing house? Literary agency? We&apos;re
                                building subscription plans for organisations
                                that need to register multiple works. Contact us
                                for early access.
                            </p>
                        </div>

                        {/* FAQ */}
                        <div className="mt-16 space-y-8">
                            <h2 className="font-serif text-2xl font-bold text-[#0A2F1F] text-center">
                                Frequently Asked Questions
                            </h2>

                            {[
                                {
                                    q: "What exactly am I paying for?",
                                    a: "A cryptographic Certificate of Anteriority. It proves that a specific digital file existed at a specific point in time. The proof is anchored to the Bitcoin blockchain and independently verifiable by anyone.",
                                },
                                {
                                    q: "Is this a copyright registration?",
                                    a: "No. AuthorHash provides proof of existence (anteriority), not legal copyright registration. However, proof of existence at a stated date is valuable evidence in copyright disputes, IP negotiations, and publishing contracts.",
                                },
                                {
                                    q: "Do you store my file?",
                                    a: "No. Your file is hashed in your browser using the Web Crypto API. The file never leaves your device. We only store the hash (the fingerprint). If you lose the original file, the certificate cannot help you recover it.",
                                },
                                {
                                    q: "What if I change one character in my file?",
                                    a: "The hash will be completely different. SHA-256 is designed so that even a single-byte change produces an entirely new fingerprint. You must archive the exact version of the file you registered.",
                                },
                                {
                                    q: "Why is the email optional?",
                                    a: "To support full anonymity. If you provide an email, you get a backup copy and can retrieve all your certificates later via magic link. Without an email, you get the certificate immediately but must save it yourself — we have no way to contact you.",
                                },
                                {
                                    q: "Are there renewal fees?",
                                    a: "No. The certificate is permanent. The Bitcoin blockchain anchoring is immutable — once confirmed, it exists as long as Bitcoin exists. There are no ongoing costs.",
                                },
                            ].map(({ q, a }) => (
                                <div key={q} className="space-y-2">
                                    <h3 className="font-bold text-[#0A2F1F]">
                                        {q}
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
