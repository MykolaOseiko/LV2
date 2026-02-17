"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArrowRight, Shield, Link as LinkIcon, FileCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
    return (
        <>
            <Navbar />
            <main className="flex-1">
                {/* Hero */}
                <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-[#0A2F1F] text-[#F5F5F0]">
                    <div
                        className="absolute inset-0 z-0"
                        style={{
                            backgroundImage: "url('/library-bg.png')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />
                    <div className="absolute inset-0 bg-black/60 z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A2F1F] via-transparent to-[#0A2F1F]/50 z-10" />

                    <div className="relative z-20 container mx-auto px-6 text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="mx-auto mb-8 w-24 h-24 border border-[#D4AF37]/30 rounded-full flex items-center justify-center bg-[#0A2F1F]/20 backdrop-blur-sm"
                        >
                            <div className="w-20 h-20 border border-[#D4AF37]/60 rounded-full flex items-center justify-center">
                                <span className="font-serif text-2xl text-[#D4AF37]">
                                    LV
                                </span>
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="font-serif text-5xl md:text-7xl font-bold mb-6 tracking-tight text-[#F5F5F0] drop-shadow-lg"
                        >
                            Immutable Proof <br className="hidden md:block" />
                            Your Work Existed
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="mx-auto max-w-2xl text-lg md:text-xl text-[#F5F5F0]/90 font-light mb-10 leading-relaxed drop-shadow-md"
                        >
                            Before anyone else can claim it. SHA-256
                            fingerprint anchored to the Bitcoin blockchain via
                            OpenTimestamps.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9, duration: 0.8 }}
                            className="flex flex-col md:flex-row gap-4 justify-center items-center"
                        >
                            <Link
                                href="/timestamp"
                                className="px-8 py-4 bg-[#D4AF37] text-[#0A2F1F] font-bold text-sm tracking-widest uppercase hover:bg-[#D4AF37]/90 transition-all flex items-center gap-2 shadow-lg"
                            >
                                Secure Your Asset{" "}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/verify"
                                className="px-8 py-4 border border-[#F5F5F0]/30 text-[#F5F5F0] font-bold text-sm tracking-widest uppercase hover:bg-[#F5F5F0]/10 transition-all backdrop-blur-sm"
                            >
                                Verify a Certificate
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* Trust signal */}
                <div className="border-y border-white/5 bg-[#0A2F1F] py-4 overflow-hidden">
                    <div className="container mx-auto flex justify-between items-center text-xs font-mono tracking-widest text-[#F5F5F0]/40 uppercase px-6">
                        <span>SHA-256 Cryptographic Hash</span>
                        <span className="hidden md:inline">
                            Bitcoin Blockchain Anchored
                        </span>
                        <span>$4.99 per Certificate</span>
                    </div>
                </div>

                {/* How it works */}
                <section className="py-24 bg-[#F5F5F0] text-[#0A2F1F]">
                    <div className="container mx-auto px-6">
                        <div className="mb-16 text-center">
                            <span className="text-xs font-bold tracking-widest uppercase text-[#D4AF37] mb-2 block">
                                How It Works
                            </span>
                            <h2 className="font-serif text-4xl font-bold text-[#0A2F1F]">
                                Three Steps. Permanent Proof.
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-[#0A2F1F] rounded-full flex items-center justify-center">
                                    <span className="font-mono text-sm text-[#D4AF37] font-bold">
                                        01
                                    </span>
                                </div>
                                <h3 className="font-serif text-2xl font-bold">
                                    Hash
                                </h3>
                                <p className="text-[#333333]/80 leading-relaxed">
                                    Upload your file. It never leaves your
                                    browser — we compute a SHA-256 fingerprint
                                    locally on your device. Air-gapped security.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-[#0A2F1F] rounded-full flex items-center justify-center">
                                    <span className="font-mono text-sm text-[#D4AF37] font-bold">
                                        02
                                    </span>
                                </div>
                                <h3 className="font-serif text-2xl font-bold">
                                    Anchor
                                </h3>
                                <p className="text-[#333333]/80 leading-relaxed">
                                    Your hash is submitted to Bitcoin calendar
                                    servers via OpenTimestamps. Within hours,
                                    it&apos;s permanently embedded in the
                                    blockchain.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-[#0A2F1F] rounded-full flex items-center justify-center">
                                    <span className="font-mono text-sm text-[#D4AF37] font-bold">
                                        03
                                    </span>
                                </div>
                                <h3 className="font-serif text-2xl font-bold">
                                    Certify
                                </h3>
                                <p className="text-[#333333]/80 leading-relaxed">
                                    Download your Certificate of Anteriority —
                                    a verifiable PDF with your hash, timestamp,
                                    and blockchain proof. Anyone can verify it.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Value props */}
                <section className="py-24 bg-white text-[#0A2F1F]">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="space-y-4">
                                <Shield className="h-10 w-10 text-[#0A2F1F]/80" />
                                <h3 className="font-serif text-2xl font-bold">
                                    Air-Gapped Security
                                </h3>
                                <p className="text-[#333333]/80 leading-relaxed">
                                    Your file never leaves your device. We hash
                                    it in your browser using the Web Crypto API.
                                    We never see, store, or transmit your work.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <LinkIcon className="h-10 w-10 text-[#0A2F1F]/80" />
                                <h3 className="font-serif text-2xl font-bold">
                                    Bitcoin Anchored
                                </h3>
                                <p className="text-[#333333]/80 leading-relaxed">
                                    Your proof is anchored to the most secure
                                    blockchain in existence. Not our database —
                                    the Bitcoin network. Independently
                                    verifiable forever.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <FileCheck className="h-10 w-10 text-[#0A2F1F]/80" />
                                <h3 className="font-serif text-2xl font-bold">
                                    Full Anonymity
                                </h3>
                                <p className="text-[#333333]/80 leading-relaxed">
                                    Email is optional. No account required.
                                    You can register a hash with zero personal
                                    information — just pay and download your
                                    certificate.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-24 bg-[#0A2F1F] text-[#F5F5F0]">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
                            $4.99 per Certificate
                        </h2>
                        <p className="text-[#F5F5F0]/70 max-w-xl mx-auto mb-10 text-lg">
                            One file. One hash. One immutable proof.
                            No subscription required.
                        </p>
                        <Link
                            href="/timestamp"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-[#D4AF37] text-[#0A2F1F] font-bold text-sm tracking-widest uppercase hover:bg-[#D4AF37]/90 transition-all shadow-lg"
                        >
                            Secure Your Asset{" "}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
