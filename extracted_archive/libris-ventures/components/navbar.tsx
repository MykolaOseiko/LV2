"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/logo";

const navigation = [
    { name: "AuthorHash", href: "/timestamp" },
    { name: "Verify", href: "/verify" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
];

export function Navbar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md border-b border-accent/20">
            <nav
                className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
                aria-label="Global"
            >
                {/* Logo */}
                <div className="flex lg:flex-1">
                    <Link
                        href="/"
                        className="-m-1.5 p-1.5 flex items-center gap-3 group"
                    >
                        <span className="sr-only">Libris Ventures</span>
                        <Logo className="h-10 w-10 transition-transform group-hover:scale-110" />
                        <div className="flex flex-col">
                            <span className="font-serif text-xl font-bold tracking-wide text-background">
                                LIBRIS VENTURES
                            </span>
                            <span className="font-mono text-[10px] tracking-[0.2em] text-accent uppercase">
                                Est. 2025
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Mobile hamburger */}
                <div className="flex lg:hidden">
                    <button
                        type="button"
                        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-accent"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <span className="sr-only">Toggle menu</span>
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" aria-hidden="true" />
                        ) : (
                            <Menu className="h-6 w-6" aria-hidden="true" />
                        )}
                    </button>
                </div>

                {/* Desktop navigation */}
                <div className="hidden lg:flex lg:gap-x-12">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "text-sm font-semibold leading-6 transition-colors hover:text-accent font-sans tracking-wide",
                                pathname === item.href
                                    ? "text-accent border-b border-accent"
                                    : "text-background/90"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* CTA */}
                <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                    <Link
                        href="/apply"
                        className="rounded-none border border-accent px-4 py-2 text-sm font-semibold text-accent hover:bg-accent hover:text-primary transition-all duration-300 font-mono uppercase"
                    >
                        Apply
                    </Link>
                </div>
            </nav>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-accent/20">
                    <div className="space-y-1 px-6 pb-6 pt-4">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                    "block py-3 text-sm font-semibold border-b border-white/5",
                                    pathname === item.href
                                        ? "text-accent"
                                        : "text-background/80"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Link
                            href="/apply"
                            onClick={() => setMobileMenuOpen(false)}
                            className="mt-4 block text-center border border-accent px-4 py-3 text-sm font-semibold text-accent font-mono uppercase"
                        >
                            Apply
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
