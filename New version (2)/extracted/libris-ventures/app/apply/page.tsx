"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useState } from "react";
import { Send, Check } from "lucide-react";

export default function ApplyPage() {
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        genre: "",
        backlist: "",
        languages: "",
        message: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // For now, just show success state.
        // In production, this would write to Firestore or send to a webhook.
        setSubmitted(true);
    };

    const update = (field: string, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    return (
        <>
            <Navbar />
            <main className="flex-1 bg-[#F5F5F0]">
                {/* Header */}
                <section className="bg-[#0A2F1F] text-[#F5F5F0] py-16">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">
                            Apply for Representation
                        </h1>
                        <p className="text-[#F5F5F0]/60 uppercase tracking-widest text-sm">
                            KF Books Publishing Partnership
                        </p>
                    </div>
                </section>

                <section className="py-16">
                    <div className="container mx-auto px-6 max-w-2xl">
                        {submitted ? (
                            <div className="bg-white p-12 shadow-2xl rounded-sm border-t-8 border-emerald-600 text-center">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="h-8 w-8 text-emerald-600" />
                                </div>
                                <h2 className="font-serif text-2xl font-bold text-[#0A2F1F] mb-4">
                                    Application Received
                                </h2>
                                <p className="text-gray-600">
                                    Thank you for your interest. We review
                                    applications on a rolling basis and will
                                    reach out if your work is a fit for our
                                    catalogue.
                                </p>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                className="bg-white p-8 md:p-12 shadow-2xl rounded-sm border-t-8 border-[#D4AF37] space-y-6"
                            >
                                <p className="text-sm text-gray-600 mb-4">
                                    KF Books specialises in bringing local
                                    bestsellers to global audiences. If you have
                                    published narrative work (novels, novellas,
                                    short story collections, literary
                                    non-fiction) with proven local success, we&apos;d
                                    like to hear from you.
                                </p>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Author Name
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) =>
                                            update("name", e.target.value)
                                        }
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-none focus:outline-none focus:border-[#D4AF37] transition-colors"
                                        placeholder="Legal name or pen name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) =>
                                            update("email", e.target.value)
                                        }
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-none focus:outline-none focus:border-[#D4AF37] transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Genre / Category
                                    </label>
                                    <input
                                        type="text"
                                        value={form.genre}
                                        onChange={(e) =>
                                            update("genre", e.target.value)
                                        }
                                        className="w-full p-3 border border-gray-300 rounded-none focus:outline-none focus:border-[#D4AF37] transition-colors"
                                        placeholder="e.g. Literary fiction, Historical novel, Thriller"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Published Works (Backlist)
                                    </label>
                                    <textarea
                                        value={form.backlist}
                                        onChange={(e) =>
                                            update("backlist", e.target.value)
                                        }
                                        rows={3}
                                        className="w-full p-3 border border-gray-300 rounded-none focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                                        placeholder="List your published titles, publishers, and approximate sales"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Languages Available
                                    </label>
                                    <input
                                        type="text"
                                        value={form.languages}
                                        onChange={(e) =>
                                            update("languages", e.target.value)
                                        }
                                        className="w-full p-3 border border-gray-300 rounded-none focus:outline-none focus:border-[#D4AF37] transition-colors"
                                        placeholder="e.g. Ukrainian, Polish, English"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Anything else?
                                    </label>
                                    <textarea
                                        value={form.message}
                                        onChange={(e) =>
                                            update("message", e.target.value)
                                        }
                                        rows={3}
                                        className="w-full p-3 border border-gray-300 rounded-none focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                                        placeholder="Awards, rights availability, preferred languages for translation..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 bg-[#0A2F1F] text-[#F5F5F0] font-bold uppercase tracking-widest py-4 hover:bg-[#0A2F1F]/90 transition-all shadow-lg"
                                >
                                    <Send className="h-4 w-4" />
                                    Submit Application
                                </button>
                            </form>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
