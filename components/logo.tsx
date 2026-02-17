import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
}

export function Logo({ className }: LogoProps) {
    return (
        <ShieldCheck
            className={cn("text-accent", className)}
            strokeWidth={1.5}
        />
    );
}
