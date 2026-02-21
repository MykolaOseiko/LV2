import { NextRequest, NextResponse } from "next/server";
import {
    findByCertRef,
    findByHash,
    findByEmail,
    insertCertificate,
    generateCertRef,
} from "@/lib/db";

// GET /api/certificates?ref=...&hash=...&email=...
export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const ref = searchParams.get("ref");
    const hash = searchParams.get("hash");
    const email = searchParams.get("email");

    try {
        if (ref) {
            const cert = findByCertRef(ref.toUpperCase());
            if (!cert) {
                return NextResponse.json({ error: "No certificate found with this reference." }, { status: 404 });
            }
            return NextResponse.json({ certificates: [cert] });
        }

        if (hash) {
            const certs = findByHash(hash.toLowerCase());
            if (certs.length === 0) {
                return NextResponse.json({ error: "No certificate found for this hash." }, { status: 404 });
            }
            return NextResponse.json({ certificates: certs });
        }

        if (email) {
            const certs = findByEmail(email.toLowerCase());
            if (certs.length === 0) {
                return NextResponse.json({ error: "No certificates found for this email." }, { status: 404 });
            }
            return NextResponse.json({ certificates: certs });
        }

        return NextResponse.json({ error: "Provide ?ref=, ?hash=, or ?email= parameter." }, { status: 400 });
    } catch {
        return NextResponse.json({ error: "Database error." }, { status: 500 });
    }
}

// POST /api/certificates — create a new certificate
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { hashSha256, timestamp, registrantEmail, eidasStatus } = body;

        if (!hashSha256 || !timestamp) {
            return NextResponse.json({ error: "hashSha256 and timestamp are required." }, { status: 400 });
        }

        const certRef = generateCertRef();
        const cert = insertCertificate({
            certRef,
            hashSha256,
            timestamp,
            blockchainStatus: "pending",
            eidasStatus: eidasStatus || "none",
            registrantEmail: registrantEmail || null,
        });

        return NextResponse.json({ certificate: cert }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to create certificate." }, { status: 500 });
    }
}
