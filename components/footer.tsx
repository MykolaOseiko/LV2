import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
    return (
        <footer className="bg-primary text-primary-foreground border-t border-accent/20 mt-auto">
            <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex flex-col gap-4">
                        <Link href="/" className="flex items-center gap-2 group">
                            <Logo className="h-6 w-6 group-hover:scale-110 transition-transform" />
                            <span className="font-serif text-lg font-bold text-background">Libris Ventures</span>
                        </Link>
                        <div className="text-xs font-mono text-muted-foreground max-w-xs space-y-2">
                            <p>
                                Cryptographic proof of authorship.
                            </p>
                            <p>
                                &copy; {new Date().getFullYear()} Libris Ventures LLC. All rights reserved.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-8 text-sm">
                        <ul className="flex flex-wrap gap-x-8 gap-y-2">
                            <li><Link href="/terms" className="text-accent hover:text-background transition-colors">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="text-accent hover:text-background transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}
