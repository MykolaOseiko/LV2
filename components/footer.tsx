import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
    return (
        <footer className="bg-primary text-primary-foreground border-t border-accent/20 mt-auto">
            <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex flex-col gap-4">
                        <Link href="/" className="flex items-center gap-2 group">
                            <Logo className="h-6 w-6 group-hover:scale-110 transition-transform" />
                            <span className="font-serif text-lg font-bold text-background">Libris Ventures</span>
                        </Link>
                        <p className="text-xs font-mono text-muted-foreground max-w-xs">
                            Cryptographic proof of authorship. eIDAS certified timestamps anchored to the Bitcoin blockchain.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-sm">
                        <div>
                            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-accent mb-3">Office</h3>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>Wyoming, USA</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-accent mb-3">Legal</h3>
                            <ul className="space-y-2 text-muted-foreground hover:text-background transition-colors">
                                <li><Link href="/terms">Terms of Service</Link></li>
                                <li><Link href="/privacy">Privacy Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-mono">
                    <p>&copy; {new Date().getFullYear()} Libris Ventures LLC. All rights reserved.</p>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        System Operational
                    </div>
                </div>
            </div>
        </footer>
    );
}
