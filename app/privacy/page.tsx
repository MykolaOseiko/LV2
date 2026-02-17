import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function PrivacyPage() {
    return (
        <>
            <Navbar />
            <main className="flex-1 bg-[#F5F5F0]">
                <section className="bg-[#0A2F1F] text-[#F5F5F0] py-16">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-[#F5F5F0]/60 uppercase tracking-widest text-sm">
                            Your Data, Your Control
                        </p>
                    </div>
                </section>

                <section className="py-16">
                    <div className="container mx-auto px-6 max-w-3xl">
                        <div className="bg-white p-8 md:p-12 shadow-2xl rounded-sm prose prose-sm max-w-none">
                            <p className="text-sm text-gray-500 mb-8">
                                Last updated: February 2026
                            </p>

                            <h2>1. Controller</h2>
                            <p>
                                Libris Ventures LLC, a limited liability company
                                organised under the laws of Wyoming, USA (&quot;Libris
                                Ventures&quot;, &quot;we&quot;, &quot;us&quot;), is the data controller for
                                the processing described in this policy.
                            </p>

                            <h2>2. What We Collect</h2>

                            <h3>Data we store</h3>
                            <ul>
                                <li>
                                    <strong>SHA-256 hash</strong> — the
                                    cryptographic fingerprint of your file (64
                                    hexadecimal characters). This is not personal
                                    data; it cannot be reversed to reconstruct
                                    your file.
                                </li>
                                <li>
                                    <strong>Certificate reference number</strong>{" "}
                                    — a unique identifier (e.g.
                                    LV-AH-2026-XKW-MPD-RBT).
                                </li>
                                <li>
                                    <strong>Registration timestamp</strong> —
                                    the date and time of registration.
                                </li>
                                <li>
                                    <strong>OpenTimestamps proof</strong> — the
                                    cryptographic proof file linking the hash to
                                    the Bitcoin blockchain.
                                </li>
                                <li>
                                    <strong>Registrant email</strong>{" "}
                                    (optional) — only if you choose to provide
                                    it.
                                </li>
                                <li>
                                    <strong>Paddle transaction ID</strong> — a
                                    reference to the payment processed by
                                    Paddle.
                                </li>
                            </ul>

                            <h3>Data we do NOT collect</h3>
                            <ul>
                                <li>
                                    Your file. It is hashed entirely in your
                                    browser and never transmitted to us.
                                </li>
                                <li>
                                    Your legal name (unless you provide it
                                    voluntarily via email or the Apply form).
                                </li>
                                <li>
                                    Payment card details (processed and held
                                    exclusively by Paddle).
                                </li>
                            </ul>

                            <h2>3. Legal Basis (GDPR)</h2>
                            <p>
                                We process your data on the basis of contract
                                performance (Article 6(1)(b) GDPR) — the data
                                is necessary to deliver the AuthorHash
                                certificate you purchased. Where you provide
                                your email, processing is also based on
                                legitimate interest (Article 6(1)(f)) for
                                service delivery (sending confirmation emails
                                and enabling magic-link certificate retrieval).
                            </p>

                            <h2>4. Payment Processing</h2>
                            <p>
                                Payments are processed by Paddle.com Market
                                Limited, which acts as our Merchant of Record.
                                Paddle collects and processes your payment
                                information under its own privacy policy. We
                                receive only a transaction ID confirming
                                successful payment.
                            </p>

                            <h2>5. Data Retention</h2>
                            <p>
                                Certificate data (hash, reference, timestamp,
                                proof) is retained indefinitely — the purpose of
                                the service is to provide a permanent verifiable
                                record. If you provided an email, it is retained
                                alongside the certificate data to enable
                                retrieval. You may request deletion of your
                                email at any time; however, the certificate
                                record itself must be retained to maintain the
                                integrity of the registry.
                            </p>

                            <h2>6. Data Sharing</h2>
                            <p>
                                We do not sell your data. We share data only
                                with:
                            </p>
                            <ul>
                                <li>
                                    <strong>Paddle</strong> — payment processing
                                    (Merchant of Record).
                                </li>
                                <li>
                                    <strong>Google Firebase</strong> — database
                                    hosting and infrastructure (data stored in
                                    EU/US data centres).
                                </li>
                                <li>
                                    <strong>Public blockchain</strong> — the
                                    SHA-256 hash is anchored to the Bitcoin
                                    blockchain. This is a core feature of the
                                    service. The hash alone cannot identify you
                                    or reveal your file contents.
                                </li>
                            </ul>

                            <h2>7. Your Rights (GDPR)</h2>
                            <p>
                                If you are in the EEA/UK, you have the right to
                                access, rectify, erase, restrict, and port your
                                personal data, and to object to processing.
                                Note that erasure of the certificate record
                                (hash, reference, timestamp) would destroy the
                                proof of existence — which is the service you
                                purchased. We will explain this if you request
                                erasure and work with you to find a reasonable
                                solution.
                            </p>
                            <p>
                                To exercise your rights, contact us at the
                                address below.
                            </p>

                            <h2>8. Cookies</h2>
                            <p>
                                We do not use tracking cookies or third-party
                                analytics. Paddle may set cookies during the
                                checkout process under its own cookie policy.
                            </p>

                            <h2>9. Contact</h2>
                            <p>
                                For privacy-related inquiries:
                                <br />
                                Libris Ventures LLC
                                <br />
                                Wyoming, USA
                                <br />
                                privacy@libris.ventures
                            </p>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
