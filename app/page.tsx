"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArrowRight, Shield, Globe, Lock, Smartphone, FileText, Music, Image as ImageIcon, Zap, ShieldCheck } from "lucide-react";
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
                            className="mx-auto mb-8 w-24 h-24 relative flex items-center justify-center"
                        >
                            <Shield className="w-full h-full text-[#D4AF37]" strokeWidth={1} />
                            <span className="absolute inset-0 flex items-center justify-center font-serif text-2xl font-bold text-[#D4AF37] pt-2">
                                LV
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="font-serif text-5xl md:text-7xl font-bold mb-6 tracking-tight text-[#F5F5F0] drop-shadow-lg"
                        >
                            Instant proof of <br className="hidden md:block" />
                            authorship for your <br className="hidden md:block" />
                            digital assets.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="mx-auto max-w-2xl text-lg md:text-xl text-[#F5F5F0]/90 font-light mb-10 leading-relaxed drop-shadow-md"
                        >
                            Manuscripts · Illustrations · Music · Photos · Code — secured in under 60 seconds
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
                                Secure Your Asset <ArrowRight className="h-4 w-4" />
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* Tech Foundation: Dual Shield */}
                <section className="py-24 bg-[#0A2F1F] text-[#F5F5F0]">
                    <div className="container mx-auto px-6">
                        <div className="mb-16 text-center">
                            <span className="text-xs font-bold tracking-widest uppercase text-[#D4AF37] mb-2 block">
                                Technological Foundation
                            </span>
                            <h2 className="font-serif text-4xl font-bold">
                                Dual Shield
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="bg-[#F5F5F0]/5 p-8 rounded border border-[#F5F5F0]/10 hover:border-[#D4AF37]/50 transition-colors">
                                <ShieldCheck className="h-10 w-10 text-[#D4AF37] mb-6" />
                                <h3 className="font-serif text-xl font-bold mb-3">EU Certified Timestamp</h3>
                                <p className="text-[#F5F5F0]/70 text-sm leading-relaxed">
                                    Qualified timestamp under eIDAS regulation (EU). Instant legal force — admissible as direct evidence in European and global courts.
                                </p>
                            </div>
                            <div className="bg-[#F5F5F0]/5 p-8 rounded border border-[#F5F5F0]/10 hover:border-[#D4AF37]/50 transition-colors">
                                <Globe className="h-10 w-10 text-[#D4AF37] mb-6" />
                                <h3 className="font-serif text-xl font-bold mb-3">Blockchain Anchor</h3>
                                <p className="text-[#F5F5F0]/70 text-sm leading-relaxed">
                                    Secondary fixation in the public Bitcoin registry via OpenTimestamps. Retroactive date manipulation is mathematically impossible.
                                </p>
                            </div>
                            <div className="bg-[#F5F5F0]/5 p-8 rounded border border-[#F5F5F0]/10 hover:border-[#D4AF37]/50 transition-colors">
                                <Zap className="h-10 w-10 text-[#D4AF37] mb-6" />
                                <h3 className="font-serif text-xl font-bold mb-3">Deterministic Proof</h3>
                                <p className="text-[#F5F5F0]/70 text-sm leading-relaxed">
                                    Your file produces a unique SHA-256 fingerprint — change a single byte and the hash changes entirely. This creates tamper-proof, mathematically verifiable evidence.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Spheres of Protection */}
                <section className="py-24 bg-[#F5F5F0] text-[#0A2F1F]">
                    <div className="container mx-auto px-6">
                        <div className="mb-16 text-center">
                            <span className="text-xs font-bold tracking-widest uppercase text-[#D4AF37] mb-2 block">
                                Spheres of Protection
                            </span>
                            <h2 className="font-serif text-4xl font-bold text-[#0A2F1F]">
                                From Text to Mobile Media
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Text */}
                            <div className="bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <FileText className="h-8 w-8 text-[#0A2F1F] mb-4" />
                                <h3 className="font-serif text-lg font-bold mb-2">Text</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Prose, Poetry, Code</p>
                                <p className="text-sm text-gray-700">
                                    <strong>Version History:</strong> Chain of drafts to prove the evolution of the work.
                                </p>
                            </div>

                            {/* Art */}
                            <div className="bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <ImageIcon className="h-8 w-8 text-[#0A2F1F] mb-4" />
                                <h3 className="font-serif text-lg font-bold mb-2">Digital Art</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Illustrations, 3D</p>
                                <p className="text-sm text-gray-700">
                                    <strong>Batch Shield:</strong> Batch fixation of dozens of sketches in a single click.
                                </p>
                            </div>

                            {/* Audio */}
                            <div className="bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <Music className="h-8 w-8 text-[#0A2F1F] mb-4" />
                                <h3 className="font-serif text-lg font-bold mb-2">Audio</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Tracks, Samples</p>
                                <p className="text-sm text-gray-700">
                                    <strong>Stems Integrity:</strong> Mathematical combination of separate tracks into one proof.
                                </p>
                            </div>

                            {/* Mobile */}
                            <div className="bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <Smartphone className="h-8 w-8 text-[#0A2F1F] mb-4" />
                                <h3 className="font-serif text-lg font-bold mb-2">Mobile Media</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Photo/Video</p>
                                <p className="text-sm text-gray-700">
                                    <strong>Deep Meta & GPS:</strong> Proof of authenticity via device metadata.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Promo Codes & Privacy */}
                <section className="py-24 bg-white border-t border-gray-100">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row gap-16 items-center">
                            <div className="flex-1">
                                <span className="text-xs font-bold tracking-widest uppercase text-[#D4AF37] mb-2 block">
                                    Privacy & Virality
                                </span>
                                <h2 className="font-serif text-4xl font-bold text-[#0A2F1F] mb-6">
                                    Promo Codes Instead of Accounts
                                </h2>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#0A2F1F]/5 flex items-center justify-center shrink-0">
                                            <Lock className="h-5 w-5 text-[#0A2F1F]" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#0A2F1F] mb-1">Zero-Friction & Anonymity</h4>
                                            <p className="text-sm text-gray-600">
                                                No passwords. Users enter a code to gain access. The code is the identifier for your certificate collection.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#0A2F1F]/5 flex items-center justify-center shrink-0">
                                            <Globe className="h-5 w-5 text-[#0A2F1F]" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#0A2F1F] mb-1">Paired Referral System</h4>
                                            <p className="text-sm text-gray-600">
                                                Refer a friend — they get a discount, and you earn free Shield Credits.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 bg-[#0A2F1F] p-8 md:p-12 text-[#F5F5F0] rounded-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-32 bg-[#D4AF37]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <h3 className="font-serif text-2xl font-bold mb-6 relative z-10">Libris Mobile Strategy</h3>
                                <ul className="space-y-4 relative z-10 text-sm opacity-90">
                                    <li className="flex gap-3">
                                        <CheckIcon />
                                        <span><strong>Timestamp on Demand:</strong> Protect valuable content with one tap.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <CheckIcon />
                                        <span><strong>Visual Marker:</strong> Shield with QR code on every asset for instant verification.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <CheckIcon />
                                        <span><strong>Gallery Integration:</strong> Create a "digital alibi" right at the scene.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Guarantee */}
                <section className="py-24 bg-[#0A2F1F] text-[#F5F5F0] border-t border-[#F5F5F0]/10">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
                            Quality Guarantee: 60 Days Money Back
                        </h2>
                        <p className="text-[#F5F5F0]/70 max-w-2xl mx-auto mb-10 text-lg">
                            We guarantee mathematical and legal accuracy.
                            100% refund if the hash doesn't match or the timestamp fails verification.
                        </p>
                        <Link
                            href="/timestamp"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-[#D4AF37] text-[#0A2F1F] font-bold text-sm tracking-widest uppercase hover:bg-[#D4AF37]/90 transition-all shadow-lg"
                        >
                            Try It Now <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

function CheckIcon() {
    return (
        <svg className="w-5 h-5 text-[#D4AF37] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    )
}
