import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    iconClassName?: string; // Kept for compatibility, though mostly unused now
}

export function Logo({ className, iconClassName }: LogoProps) {
    return (
        <ShieldCheck
            className={cn("text-accent", className, iconClassName)}
            strokeWidth={1.5}
        />
    );
}
