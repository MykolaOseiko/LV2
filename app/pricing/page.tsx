"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Check, ArrowRight, Zap, Globe } from "lucide-react";
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
                            One Price. No Subscriptions. No Hidden Fees.
                        </p>
                    </div>
                </section>

                <section className="py-16 -mt-10">
                    <div className="container mx-auto px-6 max-w-4xl">
                        {/* Main pricing card */}
                        <div className="bg-white p-8 md:p-12 shadow-2xl rounded-sm border-t-8 border-[#D4AF37] mb-12 relative z-20">
                            <div className="text-center mb-10">
                                <span className="inline-block py-1 px-3 rounded-full bg-[#0A2F1F]/5 text-[#0A2F1F] text-xs font-bold tracking-widest uppercase mb-4">
                                    AuthorHash Certificate
                                </span>
                                <div className="flex items-baseline justify-center gap-1 mb-2">
                                    <span className="font-serif text-5xl font-bold text-[#0A2F1F]">
                                        $4.99
                                    </span>
                                    <span className="text-gray-500 text-xl">
                                        / asset
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm">
                                    One-time payment. No subscriptions. No hidden fees.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-10">
                                <div className="col-span-full mb-2">
                                    <h3 className="font-bold text-[#0A2F1F] border-b border-gray-100 pb-2 mb-4">Certificate Features</h3>
                                </div>
                                <FeatureItem text="Bitcoin Blockchain Anchor" icon={<Globe className="w-4 h-4" />} />
                                <FeatureItem text="EU Qualified Timestamp (eIDAS)" icon={<Zap className="w-4 h-4" />} />
                                <FeatureItem text="PDF Certificate of Anteriority" />
                                <FeatureItem text="Downloadable OTS Proof File" />
                                <FeatureItem text="Instant Verification Page" />
                                <FeatureItem text="Anonymity Support (No Login)" />
                            </div>

                            <div className="text-center">
                                <Link
                                    href="/timestamp"
                                    className="inline-flex items-center gap-2 px-10 py-5 bg-[#D4AF37] text-[#0A2F1F] font-bold text-sm tracking-widest uppercase hover:bg-[#D4AF37]/90 transition-all shadow-lg transform hover:-translate-y-1"
                                >
                                    Secure Your Asset Now <ArrowRight className="h-4 w-4" />
                                </Link>
                                <p className="mt-4 text-xs text-gray-400">
                                    Secured by Paddle
                                </p>
                            </div>
                        </div>

                        {/* Guarantee Section */}
                        <div className="bg-[#0A2F1F] text-[#F5F5F0] p-8 md:p-12 rounded-sm shadow-xl flex flex-col md:flex-row items-center gap-8 mb-16">
                            <div className="shrink-0">
                                <div className="w-24 h-24 rounded-full border-2 border-[#D4AF37] flex items-center justify-center relative">
                                    <div className="absolute inset-1 border border-[#D4AF37]/30 rounded-full"></div>
                                    <span className="font-serif text-3xl font-bold text-[#D4AF37]">60</span>
                                </div>
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="font-serif text-2xl font-bold mb-2 text-[#D4AF37]">Days Money Back Guarantee</h3>
                                <p className="text-[#F5F5F0]/80 text-sm leading-relaxed mb-4">
                                    We stand by the mathematical and legal integrity of our timestamps.
                                    If your certificate fails a technical verification or is rejected by a valid validator within 60 days, we will refund 100% of your payment.
                                </p>
                                <p className="text-xs text-[#F5F5F0]/50 uppercase tracking-wider">
                                    No questions asked regarding technical failures.
                                </p>
                            </div>
                        </div>

                        {/* FAQ */}
                        <div className="space-y-8 max-w-3xl mx-auto">
                            <h2 className="font-serif text-3xl font-bold text-[#0A2F1F] text-center mb-8">
                                Frequently Asked Questions
                            </h2>

                            <FAQItem
                                q="What is 'Dual Shield' technology?"
                                a="It's our proprietary method of layering two types of protection: a decentralized blockchain anchor (Bitcoin via OpenTimestamps) for mathematical immutability, AND a centralized EU Qualified Electronic Timestamp (eIDAS) for immediate legal recognition in court. You get the best of both worlds."
                            />
                            <FAQItem
                                q="Do I need to create an account?"
                                a="No. We believe in privacy by default. accessible via Promo Code or direct payment. You receive your certificate immediately. If you choose to provide an email, we can send a backup link, but it's optional."
                            />
                            <FAQItem
                                q="Is this a copyright registration?"
                                a="It provides 'Proof of Anteriority' (proof of existence at a specific time). While not a government copyright registration, it is a critical piece of evidence in copyright disputes to prove you had the work before anyone else."
                            />
                            <FAQItem
                                q="How does the 60-Day Guarantee work?"
                                a="If you find that the OpenTimestamps proof file is invalid, or the eIDAS token cannot be verified by standard European validator tools, simply email us with your certificate ID. We will verify the failure and issue a full refund immediately."
                            />
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

function FeatureItem({ text, icon }: { text: string, icon?: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3">
            <div className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[#0A2F1F]/10 text-[#0A2F1F]">
                {icon || <Check className="w-3.5 h-3.5" />}
            </div>
            <span className="text-sm font-medium text-gray-700">{text}</span>
        </div>
    )
}

function FAQItem({ q, a }: { q: string, a: string }) {
    return (
        <div className="bg-white p-6 rounded border border-gray-100 shadow-sm">
            <h3 className="font-bold text-[#0A2F1F] mb-2 flex items-center gap-2">
                <span className="text-[#D4AF37] text-lg">Q.</span> {q}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed pl-6 border-l-2 border-gray-100">
                {a}
            </p>
        </div>
    )
}
