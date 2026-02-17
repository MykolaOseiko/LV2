import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
import OpenTimestamps from "javascript-opentimestamps";

admin.initializeApp();
const db = admin.firestore();

// ============================================================
// CERT REF GENERATION — random, non-sequential
// ============================================================

/**
 * Generate a random certificate reference: LV-AH-2026-XKW-MPD-RBT
 *
 * Format: LV-AH-{YEAR}-{AAA}-{BBB}-{CCC}
 * Uses uppercase alphanumeric (excluding ambiguous: 0/O, 1/I/L)
 * 30 chars per position × 9 positions = ~19.7 billion combinations per year
 *
 * Non-sequential to prevent enumeration of the registry.
 */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // 30 chars, no 0/O/1/I/L

function generateRandomRef(): string {
    const year = new Date().getFullYear();
    const bytes = crypto.randomBytes(9);
    const groups: string[] = [];

    for (let g = 0; g < 3; g++) {
        let group = "";
        for (let c = 0; c < 3; c++) {
            const idx = bytes[g * 3 + c] % ALPHABET.length;
            group += ALPHABET[idx];
        }
        groups.push(group);
    }

    return `LV-AH-${year}-${groups[0]}-${groups[1]}-${groups[2]}`;
}

/**
 * Generate a unique cert ref with collision check.
 * Probability of collision is astronomically low (~1 in 19 billion),
 * but we check anyway because it costs nothing.
 */
async function generateUniqueCertRef(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
        const ref = generateRandomRef();
        const existing = await db.collection("registry_entries").doc(ref).get();
        if (!existing.exists) return ref;
        functions.logger.warn(`Cert ref collision on attempt ${attempt + 1}: ${ref}`);
    }
    throw new Error("Failed to generate unique cert ref after 5 attempts");
}

// ============================================================
// 1. PADDLE WEBHOOK — handles transaction.completed
//
// Writes to TWO collections:
//   registry_entries  — PUBLIC  (hash, ref, timestamp, status)
//   registry_private  — LOCKED  (email, paddleTransactionId, otsProof)
//
// This ensures public verification doesn't leak private data.
// ============================================================

export const paddleWebhook = functions.https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).send("Method not allowed");
        return;
    }

    try {
        // --- Verify Paddle webhook signature ---
        // IMPORTANT: Enable this before going live.
        // See: https://developer.paddle.com/webhooks/signature-verification
        //
        // const secret = functions.config().paddle.webhook_secret;
        // const signature = req.headers["paddle-signature"] as string;
        // if (!verifyPaddleSignature(req.rawBody, signature, secret)) {
        //     res.status(401).send("Invalid signature");
        //     return;
        // }

        const event = req.body;

        if (event.event_type !== "transaction.completed") {
            res.status(200).send("OK");
            return;
        }

        const customData = event.data?.custom_data;
        if (!customData?.hash_sha256) {
            functions.logger.error("Missing hash_sha256 in custom_data", event);
            res.status(400).send("Missing hash data");
            return;
        }

        const hashSha256: string = customData.hash_sha256;
        const registrantEmail: string | null = customData.registrant_email || null;
        const otsProofBase64: string | null = customData.ots_proof_base64 || null;
        const timestamp: number = parseInt(customData.timestamp) || Date.now();
        const paddleTransactionId: string = event.data?.id || "";

        // --- Generate random certificate reference ---
        const certRef = await generateUniqueCertRef();

        // --- Write PUBLIC registry entry (verifiable by anyone) ---
        const publicEntry = {
            certRef,
            hashSha256,
            timestamp,
            blockchainStatus: "pending",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // --- Write PRIVATE metadata (only accessible via Cloud Functions) ---
        const privateEntry = {
            certRef,
            hashSha256,
            registrantEmail,
            otsProofBase64,
            paddleTransactionId,
            timestamp,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Atomic batch write — both succeed or both fail
        const batch = db.batch();
        batch.set(db.collection("registry_entries").doc(certRef), publicEntry);
        batch.set(db.collection("registry_private").doc(certRef), privateEntry);
        await batch.commit();

        functions.logger.info(
            `Certificate issued: ${certRef} for hash ${hashSha256.slice(0, 16)}...`
        );

        // --- Send confirmation email (if email provided) ---
        if (registrantEmail) {
            const verifyUrl = `https://libris.ventures/verify?ref=${certRef}`;

            await db.collection("mail").add({
                to: registrantEmail,
                message: {
                    subject: `AuthorHash Certificate Issued — ${certRef}`,
                    html: buildConfirmationEmail(certRef, hashSha256, verifyUrl),
                },
            });
        }

        res.status(200).json({ certRef });
    } catch (error) {
        functions.logger.error("Paddle webhook error:", error);
        res.status(500).send("Internal error");
    }
});

// ============================================================
// 2. MAGIC LINK — sends a time-limited email for My Certificates
//
// Queries registry_private (not registry_entries) for email lookup.
// ============================================================

export const sendMagicLink = functions.https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "https://libris.ventures");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }

    if (req.method !== "POST") {
        res.status(405).send("Method not allowed");
        return;
    }

    try {
        const { email } = req.body;
        if (!email || typeof email !== "string" || !email.includes("@")) {
            res.status(400).send("Invalid email");
            return;
        }

        const normalised = email.trim().toLowerCase();

        // Check registry_private for email (not the public collection)
        const certs = await db
            .collection("registry_private")
            .where("registrantEmail", "==", normalised)
            .limit(1)
            .get();

        if (certs.empty) {
            // Don't reveal whether the email exists — prevents enumeration
            res.status(200).json({ sent: true });
            return;
        }

        // Generate magic token
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = admin.firestore.Timestamp.fromMillis(
            Date.now() + 30 * 60 * 1000
        );

        await db.collection("magic_links").doc(token).set({
            email: normalised,
            expiresAt, // Firestore Timestamp — compatible with TTL policy
            used: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const magicUrl = `https://libris.ventures/verify?magic=${token}`;

        await db.collection("mail").add({
            to: normalised,
            message: {
                subject: "Your AuthorHash Certificates — Libris Ventures",
                html: buildMagicLinkEmail(magicUrl),
            },
        });

        res.status(200).json({ sent: true });
    } catch (error) {
        functions.logger.error("Magic link error:", error);
        res.status(500).send("Internal error");
    }
});

// ============================================================
// 3. VALIDATE MAGIC LINK — returns certificates for a valid token
//
// Joins registry_private (for email→certRef mapping) with
// registry_entries (for public certificate data).
// ============================================================

export const validateMagicLink = functions.https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "https://libris.ventures");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }

    try {
        const token = req.query.token as string;
        if (!token) {
            res.status(400).send("Missing token");
            return;
        }

        const linkDoc = await db.collection("magic_links").doc(token).get();
        if (!linkDoc.exists) {
            res.status(404).json({ error: "Invalid or expired link" });
            return;
        }

        const linkData = linkDoc.data()!;
        const expiresAtMs = linkData.expiresAt?.toMillis
            ? linkData.expiresAt.toMillis()
            : linkData.expiresAt;

        if (linkData.used || expiresAtMs < Date.now()) {
            res.status(410).json({ error: "Link has expired" });
            return;
        }

        // Mark as used
        await db.collection("magic_links").doc(token).update({ used: true });

        // Find all cert refs for this email from the PRIVATE collection
        const privateSnapshot = await db
            .collection("registry_private")
            .where("registrantEmail", "==", linkData.email)
            .orderBy("timestamp", "desc")
            .get();

        // Fetch public data for each cert from registry_entries
        const certificates = [];
        for (const privDoc of privateSnapshot.docs) {
            const privData = privDoc.data();
            const pubDoc = await db
                .collection("registry_entries")
                .doc(privData.certRef)
                .get();

            if (pubDoc.exists) {
                const pubData = pubDoc.data()!;
                certificates.push({
                    certRef: pubData.certRef,
                    hashSha256: pubData.hashSha256,
                    timestamp: pubData.timestamp,
                    blockchainStatus: pubData.blockchainStatus || "pending",
                });
            }
        }

        // Return public cert data only — no email, no transaction IDs
        res.status(200).json({ email: linkData.email, certificates });
    } catch (error) {
        functions.logger.error("Validate magic link error:", error);
        res.status(500).send("Internal error");
    }
});

// ============================================================
// 4. UPGRADE STAMPS — daily cron to check pending OTS proofs
//
// Reads otsProofBase64 from registry_private, attempts upgrade,
// and updates blockchainStatus in BOTH collections on success.
// ============================================================

export const upgradeStamps = functions.scheduler.onSchedule(
    "every 24 hours",
    async () => {
        functions.logger.info("Running OTS upgrade check...");

        try {
            const pending = await db
                .collection("registry_entries")
                .where("blockchainStatus", "==", "pending")
                .get();

            if (pending.empty) {
                functions.logger.info("No pending stamps to upgrade.");
                return;
            }

            functions.logger.info(
                `Found ${pending.size} pending stamps to check.`
            );

            let upgraded = 0;
            let failed = 0;

            for (const pubDoc of pending.docs) {
                const certRef = pubDoc.id;

                try {
                    // Read the OTS proof from the private collection
                    const privDoc = await db
                        .collection("registry_private")
                        .doc(certRef)
                        .get();

                    if (!privDoc.exists) {
                        functions.logger.warn(
                            `No private record for ${certRef}, skipping`
                        );
                        continue;
                    }

                    const privData = privDoc.data()!;
                    const otsProofBase64 = privData.otsProofBase64;

                    if (!otsProofBase64) {
                        functions.logger.warn(
                            `No OTS proof for ${certRef}, skipping`
                        );
                        continue;
                    }

                    // Deserialise the stored OTS proof
                    const proofBytes = Array.from(
                        Buffer.from(otsProofBase64, "base64")
                    );
                    const hashHex = privData.hashSha256 as string;
                    const hashBytes = hexToBytes(hashHex);

                    // Reconstruct the detached timestamp file
                    const detached =
                        OpenTimestamps.DetachedTimestampFile.fromHash(
                            new OpenTimestamps.Ops.OpSHA256(),
                            hashBytes
                        );

                    // Attempt to upgrade (checks Bitcoin calendar servers)
                    const isUpgraded = await OpenTimestamps.upgrade(detached);

                    if (isUpgraded) {
                        const upgradedProof = Buffer.from(
                            detached.serializeToBytes()
                        ).toString("base64");

                        // Update both collections atomically
                        const batch = db.batch();
                        batch.update(
                            db.collection("registry_entries").doc(certRef),
                            {
                                blockchainStatus: "confirmed",
                                upgradedAt:
                                    admin.firestore.FieldValue.serverTimestamp(),
                            }
                        );
                        batch.update(
                            db.collection("registry_private").doc(certRef),
                            {
                                otsProofBase64: upgradedProof,
                                upgradedAt:
                                    admin.firestore.FieldValue.serverTimestamp(),
                            }
                        );
                        await batch.commit();

                        upgraded++;
                        functions.logger.info(`Upgraded: ${certRef}`);
                    } else {
                        functions.logger.info(
                            `Not yet confirmable: ${certRef}`
                        );
                    }
                } catch (entryError) {
                    failed++;
                    functions.logger.error(
                        `Failed to upgrade ${certRef}:`,
                        entryError
                    );
                }
            }

            functions.logger.info(
                `Upgrade complete: ${upgraded} upgraded, ${failed} failed, ` +
                    `${pending.size - upgraded - failed} still pending.`
            );
        } catch (error) {
            functions.logger.error("Upgrade stamps error:", error);
        }
    }
);

// ============================================================
// 5. CLEANUP MAGIC LINKS — daily cron to delete expired tokens
//
// Belt-and-suspenders alongside the Firestore TTL policy.
// TTL policy handles automatic deletion; this catches any stragglers.
// ============================================================

export const cleanupMagicLinks = functions.scheduler.onSchedule(
    "every 24 hours",
    async () => {
        functions.logger.info("Cleaning up expired magic links...");

        try {
            const now = admin.firestore.Timestamp.now();
            const expired = await db
                .collection("magic_links")
                .where("expiresAt", "<", now)
                .limit(500)
                .get();

            if (expired.empty) {
                functions.logger.info("No expired magic links to clean.");
                return;
            }

            const batch = db.batch();
            expired.docs.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();

            functions.logger.info(
                `Deleted ${expired.size} expired magic links.`
            );
        } catch (error) {
            functions.logger.error("Cleanup magic links error:", error);
        }
    }
);

// ============================================================
// HELPERS
// ============================================================

function hexToBytes(hex: string): number[] {
    const bytes: number[] = [];
    for (let c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
}

function buildConfirmationEmail(
    certRef: string,
    hashSha256: string,
    verifyUrl: string
): string {
    return `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0A2F1F; padding: 24px; text-align: center;">
                <h1 style="color: #F5F5F0; font-size: 20px; margin: 0;">LIBRIS VENTURES</h1>
                <p style="color: #D4AF37; font-size: 12px; margin: 4px 0 0;">Certificate of Anteriority</p>
            </div>
            <div style="padding: 32px; background: #fff;">
                <h2 style="color: #0A2F1F; margin-top: 0;">Certificate Issued</h2>
                <p style="color: #333;">Your AuthorHash certificate has been successfully registered.</p>
                
                <div style="background: #f5f5f0; padding: 16px; margin: 16px 0; border-left: 4px solid #D4AF37;">
                    <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase;">Certificate Reference</p>
                    <p style="margin: 4px 0 0; font-size: 18px; font-weight: bold; color: #0A2F1F; font-family: monospace;">${certRef}</p>
                </div>
                
                <div style="background: #f5f5f0; padding: 16px; margin: 16px 0;">
                    <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase;">SHA-256 Fingerprint</p>
                    <p style="margin: 4px 0 0; font-size: 11px; color: #0A2F1F; font-family: monospace; word-break: break-all;">${hashSha256}</p>
                </div>
                
                <p style="color: #333; font-size: 14px;">
                    <strong>Blockchain status:</strong> Pending — submitted to Bitcoin calendar servers, awaiting block confirmation (~12h).
                </p>
                
                <p style="color: #333; font-size: 14px;">
                    <a href="${verifyUrl}" style="color: #D4AF37;">Verify your certificate</a> | 
                    <a href="https://libris.ventures/verify" style="color: #D4AF37;">View all your certificates</a>
                </p>
                
                <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
                    <p><strong>Important:</strong> Archive the exact file version that generated this hash. Any modification will produce a different fingerprint and invalidate your proof.</p>
                </div>
            </div>
            <div style="background: #0A2F1F; padding: 16px; text-align: center;">
                <p style="color: #F5F5F0; font-size: 11px; margin: 0;">Libris Ventures LLC &bull; Wyoming, USA &bull; libris.ventures</p>
            </div>
        </div>
    `;
}

function buildMagicLinkEmail(magicUrl: string): string {
    return `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0A2F1F; padding: 24px; text-align: center;">
                <h1 style="color: #F5F5F0; font-size: 20px; margin: 0;">LIBRIS VENTURES</h1>
                <p style="color: #D4AF37; font-size: 12px; margin: 4px 0 0;">My Certificates</p>
            </div>
            <div style="padding: 32px; background: #fff;">
                <p style="color: #333;">Click the link below to view all AuthorHash certificates registered with this email address:</p>
                
                <div style="text-align: center; margin: 24px 0;">
                    <a href="${magicUrl}" style="display: inline-block; background: #0A2F1F; color: #F5F5F0; padding: 12px 32px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 13px; letter-spacing: 2px;">
                        View My Certificates
                    </a>
                </div>
                
                <p style="color: #999; font-size: 12px;">This link is valid for 30 minutes. If you didn't request this, you can safely ignore this email.</p>
            </div>
            <div style="background: #0A2F1F; padding: 16px; text-align: center;">
                <p style="color: #F5F5F0; font-size: 11px; margin: 0;">Libris Ventures LLC &bull; Wyoming, USA &bull; libris.ventures</p>
            </div>
        </div>
    `;
}
