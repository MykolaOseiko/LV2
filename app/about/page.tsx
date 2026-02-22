import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Shield, Lock, Globe } from "lucide-react";

export default function AboutPage() {
    return (
        <>
            <Navbar />
            <main className="flex-1 bg-[#F5F5F0]">
                <section className="bg-[#0A2F1F] text-[#F5F5F0] py-8">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">
                            About Libris Ventures
                        </h1>
                        <p className="text-[#F5F5F0]/60 uppercase tracking-widest text-sm">
                            Protecting Creative Assets
                        </p>
                    </div>
                </section>

                <section className="py-16 -mt-10">
                    <div className="container mx-auto px-6 max-w-3xl space-y-12 relative z-20">
                        {/* Mission */}
                        <div className="bg-white p-8 md:p-12 shadow-2xl rounded-sm border-t-8 border-[#D4AF37]">
                            <h2 className="font-serif text-2xl font-bold text-[#0A2F1F] mb-4">
                                Our Mission
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                Libris Ventures LLC exists to protect
                                intellectual property through verifiable,
                                immutable cryptographic proof. We provide
                                authors, creators, and innovators with
                                independently verifiable evidence that their
                                work existed at a specific point in time —
                                anchored to the most secure blockchain in
                                existence.
                            </p>
                        </div>

                        {/* What we do */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-6 shadow rounded-sm space-y-3">
                                <Lock className="h-8 w-8 text-[#0A2F1F]" />
                                <h3 className="font-serif text-lg font-bold text-[#0A2F1F]">
                                    AuthorHash
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Our Certificate service provides SHA-256
                                    fingerprinting with both EU-grade timestamp
                                    and OpenTimestamp (Bitcoin blockchain
                                    anchoring).
                                </p>
                            </div>
                            <div className="bg-white p-6 shadow rounded-sm space-y-3">
                                <Globe className="h-8 w-8 text-[#0A2F1F]" />
                                <h3 className="font-serif text-lg font-bold text-[#0A2F1F]">
                                    Global Reach
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    We serve clients worldwide, helping authors,
                                    creators, and innovators protect their work
                                    across international markets.
                                </p>
                            </div>
                            <div className="bg-white p-6 shadow rounded-sm space-y-3">
                                <Shield className="h-8 w-8 text-[#0A2F1F]" />
                                <h3 className="font-serif text-lg font-bold text-[#0A2F1F]">
                                    Asset Protection
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    We hold and protect IP rights for narrative
                                    works on behalf of authors, structurally
                                    separating it from commercial operations of
                                    their publishers.
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
