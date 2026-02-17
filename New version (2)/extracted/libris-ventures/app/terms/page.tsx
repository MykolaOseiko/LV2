import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function TermsPage() {
    return (
        <>
            <Navbar />
            <main className="flex-1 bg-[#F5F5F0]">
                <section className="bg-[#0A2F1F] text-[#F5F5F0] py-16">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">
                            Terms of Service
                        </h1>
                        <p className="text-[#F5F5F0]/60 uppercase tracking-widest text-sm">
                            AuthorHash Protection Service
                        </p>
                    </div>
                </section>

                <section className="py-16">
                    <div className="container mx-auto px-6 max-w-3xl">
                        <div className="bg-white p-8 md:p-12 shadow-2xl rounded-sm prose prose-sm max-w-none">
                            <p className="text-sm text-gray-500 mb-8">
                                Last updated: February 2026
                            </p>

                            <h2>1. Service Description</h2>
                            <p>
                                Libris Ventures LLC (&quot;Libris Ventures&quot;, &quot;we&quot;,
                                &quot;us&quot;) provides the AuthorHash Protection service,
                                which generates a SHA-256 cryptographic
                                fingerprint of a digital file and anchors it to
                                the Bitcoin blockchain via OpenTimestamps. The
                                service issues a Certificate of Anteriority — a
                                verifiable record that a specific digital
                                fingerprint existed at a specific point in time.
                            </p>

                            <h2>2. What AuthorHash Is and Is Not</h2>
                            <p>
                                AuthorHash provides <strong>proof of existence</strong>{" "}
                                (anteriority). It does <strong>not</strong>{" "}
                                constitute proof of authorship, ownership,
                                copyright registration, or any legal right. The
                                certificate attests that a hash existed at a
                                stated time; it makes no claim about who created
                                the underlying file or who owns the rights to
                                it.
                            </p>

                            <h2>3. File Handling</h2>
                            <p>
                                Your file is processed entirely within your web
                                browser using the Web Crypto API. The file is
                                never transmitted to our servers, stored, or
                                accessed by Libris Ventures. We receive and
                                store only the resulting SHA-256 hash (a
                                64-character hexadecimal string). If you lose
                                the original file, we cannot help you recover
                                it.
                            </p>

                            <h2>4. Your Responsibility</h2>
                            <p>
                                You are solely responsible for archiving the
                                exact version of the file that was hashed. Any
                                modification to the file — even a single byte —
                                will produce a different hash and render the
                                certificate inapplicable to the modified
                                version. You are also responsible for saving
                                your certificate reference number and PDF, particularly
                                if you chose not to provide an email address.
                            </p>

                            <h2>5. Payments</h2>
                            <p>
                                Payments are processed by Paddle.com Market
                                Limited (&quot;Paddle&quot;), which acts as our Merchant
                                of Record. Paddle handles all tax calculation,
                                collection, and remittance globally. By
                                purchasing a certificate, you agree to Paddle&apos;s
                                terms of service. All sales of AuthorHash
                                certificates are final. No refunds are offered
                                as the service (cryptographic timestamping and
                                blockchain anchoring) is performed immediately
                                upon payment.
                            </p>

                            <h2>6. No Warranty</h2>
                            <p>
                                The service is provided &quot;as is&quot; without
                                warranties of any kind, express or implied.
                                Libris Ventures does not warrant the
                                admissibility of AuthorHash certificates in any
                                legal proceeding, the uninterrupted availability
                                of the service, or the perpetual operation of
                                the Bitcoin network or OpenTimestamps calendar
                                servers.
                            </p>

                            <h2>7. Limitation of Liability</h2>
                            <p>
                                Libris Ventures&apos; total liability to you for any
                                claim arising from the service shall not exceed
                                the amount you paid for the specific certificate
                                in question.
                            </p>

                            <h2>8. Privacy</h2>
                            <p>
                                See our{" "}
                                <a
                                    href="/privacy"
                                    className="text-[#D4AF37] underline"
                                >
                                    Privacy Policy
                                </a>{" "}
                                for details on how we handle your data.
                            </p>

                            <h2>9. Governing Law</h2>
                            <p>
                                These terms are governed by the laws of England
                                and Wales. Any dispute shall be submitted to
                                Expedited Arbitration administered by the WIPO
                                Arbitration and Mediation Center in London.
                            </p>

                            <h2>10. Changes</h2>
                            <p>
                                We may update these terms by publishing a
                                revised version on this page. Continued use of
                                the service after changes constitutes
                                acceptance.
                            </p>

                            <div className="mt-12 pt-8 border-t text-sm text-gray-500">
                                <p>
                                    Libris Ventures LLC
                                    <br />
                                    Wyoming, USA
                                    <br />
                                    libris.ventures
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
