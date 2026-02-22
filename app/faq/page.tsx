"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
    {
        category: "What is AuthorHash?",
        items: [
            {
                q: "What does AuthorHash actually do?",
                a: "AuthorHash creates an unforgeable timestamp proving that your file existed at a specific moment in time. We generate a SHA-256 cryptographic fingerprint of your file (without uploading it), anchor that fingerprint to the Bitcoin blockchain, and issue you a Certificate of Anteriority — a verifiable record that this specific digital fingerprint existed before anyone else can claim it.",
            },
            {
                q: "Is this the same as copyright registration?",
                a: "No. AuthorHash provides proof of existence (anteriority), not copyright registration. It does not grant you any legal rights. However, in a dispute over who created a work first, an AuthorHash certificate can serve as strong, independently verifiable evidence of the date your version existed — which is often the most difficult thing to prove.",
            },
            {
                q: "Who is AuthorHash for?",
                a: "Anyone who creates original digital work — writers, illustrators, musicians, photographers, software developers, researchers, designers. If you've ever worried that someone might copy your work and claim it as their own, or that you might need to prove when your version existed, AuthorHash gives you that proof in under 60 seconds.",
            },
            {
                q: "What types of files can I protect?",
                a: "Any digital file — manuscripts, illustrations, music tracks, photographs, videos, source code, design files, research data, contracts, or any other digital asset. If it's a file on your device, you can generate a proof of existence for it.",
            },
        ],
    },
    {
        category: "How It Works",
        items: [
            {
                q: "Is my file uploaded to your servers?",
                a: "No. Your file never leaves your device. The SHA-256 fingerprint is calculated entirely in your browser using the Web Crypto API. We receive only the resulting hash — a 64-character string that cannot be reversed to reconstruct your file. Your content remains 100% private.",
            },
            {
                q: "What is a SHA-256 hash?",
                a: "It's a cryptographic fingerprint — a unique 64-character string generated from your file. Even changing a single comma in your document produces a completely different hash. This makes it mathematically impossible to tamper with the file without changing the hash, and impossible to reconstruct the file from the hash.",
            },
            {
                q: "What is OpenTimestamps and the Bitcoin blockchain?",
                a: "OpenTimestamps is an open-source protocol that anchors data to the Bitcoin blockchain — the most secure, decentralised, and tamper-proof public ledger in existence. Once your hash is anchored, even we cannot alter or delete the timestamp. It becomes a permanent, independently verifiable public record.",
            },
            {
                q: "How long does the process take?",
                a: "The entire process — hashing, timestamping, and certificate generation — takes under 60 seconds. The blockchain confirmation (which strengthens the proof) happens automatically in the background over the next few hours, but your certificate is valid immediately.",
            },
            {
                q: "Can I verify my certificate independently?",
                a: "Yes. Your certificate includes the .ots proof file. Anyone can verify it independently using the open-source OpenTimestamps tools — no trust in Libris Ventures is required. You can also verify directly on our website at librisventures.com/verify.",
            },
        ],
    },
    {
        category: "Your Responsibility",
        items: [
            {
                q: "What happens if I lose my original file?",
                a: "The certificate proves that a specific hash existed at a specific time. Without the original file, you cannot prove that a particular work matches that hash. We strongly recommend archiving the exact version of the file that was hashed. We do not store your files — if you lose it, we cannot help you recover it.",
            },
            {
                q: "What if I modify my file after hashing?",
                a: "Even a single byte change will produce a completely different hash. The certificate will only match the exact version of the file that was originally hashed. If you update your work, you should create a new AuthorHash for each significant version.",
            },
            {
                q: "Can I hash the same file twice?",
                a: "Yes. The hash will be identical, but the timestamp will be different. Each certificate is independent proof of existence at a specific point in time.",
            },
        ],
    },
    {
        category: "Legal & Practical",
        items: [
            {
                q: "Is AuthorHash legally admissible?",
                a: "AuthorHash provides cryptographic evidence anchored to a public blockchain, which is increasingly recognised by courts worldwide. However, admissibility depends on the jurisdiction and circumstances of each case. The certificate is designed to be the strongest possible independent evidence of when your file existed.",
            },
            {
                q: "How is this different from emailing myself a copy?",
                a: "Emailing yourself (a \"poor man's copyright\") relies on email providers that can be compromised, spoofed, or shut down. AuthorHash anchors your proof to the Bitcoin blockchain — a decentralised network that no single entity controls. It's cryptographically verifiable by anyone, forever, without trusting any third party.",
            },
            {
                q: "What if Libris Ventures ceases to exist?",
                a: "Your proof survives independently. The Bitcoin blockchain is decentralised and permanent. Your .ots proof file can be verified using open-source tools by anyone, anywhere — no reliance on our company is needed. That's the entire point of blockchain anchoring.",
            },
            {
                q: "Can I get a refund?",
                a: "All sales are final because the service (cryptographic timestamping and blockchain anchoring) is performed immediately upon payment. However, we offer a 60-day guarantee: if the hash doesn't match or the timestamp fails verification, you receive a 100% refund.",
            },
        ],
    },
    {
        category: "Privacy & Security",
        items: [
            {
                q: "What data do you store?",
                a: "We store only: the SHA-256 hash (not your file), the certificate reference number, the timestamp, the OpenTimestamps proof, and your email (only if you choose to provide it). We do not use tracking cookies or third-party analytics beyond privacy-friendly GoatCounter.",
            },
            {
                q: "Do I need to create an account?",
                a: "No. AuthorHash works without accounts or passwords. You provide an optional email (for certificate retrieval), pay via Paddle, and receive your certificate. That's it.",
            },
        ],
    },
];

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-gray-200 last:border-0">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between py-5 text-left gap-4 group"
            >
                <span className="font-semibold text-[#0A2F1F] group-hover:text-[#D4AF37] transition-colors">
                    {q}
                </span>
                <ChevronDown
                    className={`h-5 w-5 text-[#D4AF37] shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""
                        }`}
                />
            </button>
            {open && (
                <div className="pb-5 text-sm text-gray-600 leading-relaxed pr-8">
                    {a}
                </div>
            )}
        </div>
    );
}

export default function FaqPage() {
    return (
        <>
            <Navbar />
            <main className="flex-1 bg-[#F5F5F0]">
                <section className="bg-[#0A2F1F] text-[#F5F5F0] py-16">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-[#F5F5F0]/60 uppercase tracking-widest text-sm">
                            Everything You Need to Know About AuthorHash
                        </p>
                    </div>
                </section>

                <section className="py-16">
                    <div className="container mx-auto px-6 max-w-3xl">
                        {faqs.map((section) => (
                            <div key={section.category} className="mb-12">
                                <h2 className="font-serif text-2xl font-bold text-[#0A2F1F] mb-6 pb-2 border-b-2 border-[#D4AF37]">
                                    {section.category}
                                </h2>
                                <div className="bg-white shadow-sm rounded-sm">
                                    <div className="px-6">
                                        {section.items.map((item) => (
                                            <FaqItem
                                                key={item.q}
                                                q={item.q}
                                                a={item.a}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
