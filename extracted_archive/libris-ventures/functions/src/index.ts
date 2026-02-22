import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as crypto from "crypto";

admin.initializeApp();
const db = admin.firestore();

// ============================================================
// 1. PADDLE WEBHOOK — handles transaction.completed
// ============================================================

export const paddleWebhook = functions.https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).send("Method not allowed");
        return;
    }

    try {
        // --- Verify Paddle webhook signature ---
        // In production, verify the Paddle-Signature header.
        // See: https://developer.paddle.com/webhooks/signature-verification
        //
        // const secret = functions.config().paddle.webhook_secret;
        // const signature = req.headers["paddle-signature"];
        // if (!verifyPaddleSignature(req.rawBody, signature, secret)) {
        //     res.status(401).send("Invalid signature");
        //     return;
        // }

        const event = req.body;

        if (event.event_type !== "transaction.completed") {
            // Acknowledge but ignore non-completion events
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

        // --- Generate certificate reference ---
        const certRef = await generateCertRef();

        // --- Write registry entry ---
        const entry = {
            certRef,
            hashSha256,
            registrantEmail,
            otsProofBase64,
            timestamp,
            paddleTransactionId,
            blockchainStatus: "pending",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection("registry_entries").doc(certRef).set(entry);

        functions.logger.info(`Certificate issued: ${certRef} for hash ${hashSha256.slice(0, 16)}...`);

        // --- Send confirmation email (if email provided) ---
        if (registrantEmail) {
            const verifyUrl = `https://libris.ventures/verify?ref=${certRef}`;

            await db.collection("mail").add({
                to: registrantEmail,
                message: {
                    subject: `AuthorHash Certificate Issued — ${certRef}`,
                    html: `
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
                                <p style="color: #F5F5F0; font-size: 11px; margin: 0;">Libris Ventures LLC • Wyoming, USA • libris.ventures</p>
                            </div>
                        </div>
                    `,
                },
            });
        }

        res.status(200).json({ certRef });
    } catch (error) {
        functions.logger.error("Paddle webhook error:", error);
        res.status(500).send("Internal error");
    }
});

/**
 * Generate a sequential certificate reference: LV-AH-2026-00001
 * Uses a Firestore transaction to ensure atomicity.
 */
async function generateCertRef(): Promise<string> {
    const counterRef = db.collection("certificate_counter").doc("current");
    const year = new Date().getFullYear();

    const newCount = await db.runTransaction(async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let count = 1;

        if (counterDoc.exists) {
            const data = counterDoc.data();
            if (data?.year === year) {
                count = (data.count || 0) + 1;
            }
            // If year changed, reset counter
        }

        transaction.set(counterRef, { year, count });
        return count;
    });

    const padded = String(newCount).padStart(5, "0");
    return `LV-AH-${year}-${padded}`;
}

// ============================================================
// 2. MAGIC LINK — sends a time-limited email for My Certificates
// ============================================================

export const sendMagicLink = functions.https.onRequest(async (req, res) => {
    // CORS headers
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

        // Check if any certificates exist for this email
        const certs = await db
            .collection("registry_entries")
            .where("registrantEmail", "==", normalised)
            .limit(1)
            .get();

        if (certs.empty) {
            // Don't reveal whether the email exists — send a generic success
            // This prevents email enumeration
            res.status(200).json({ sent: true });
            return;
        }

        // Generate magic token
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes

        await db.collection("magic_links").doc(token).set({
            email: normalised,
            expiresAt,
            used: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const magicUrl = `https://libris.ventures/verify?magic=${token}`;

        // Send email via Firebase Trigger Email extension
        await db.collection("mail").add({
            to: normalised,
            message: {
                subject: "Your AuthorHash Certificates — Libris Ventures",
                html: `
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
                            <p style="color: #F5F5F0; font-size: 11px; margin: 0;">Libris Ventures LLC • Wyoming, USA • libris.ventures</p>
                        </div>
                    </div>
                `,
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

        if (linkData.used || linkData.expiresAt < Date.now()) {
            res.status(410).json({ error: "Link has expired" });
            return;
        }

        // Mark as used
        await db.collection("magic_links").doc(token).update({ used: true });

        // Fetch all certificates for this email
        const certsSnapshot = await db
            .collection("registry_entries")
            .where("registrantEmail", "==", linkData.email)
            .orderBy("timestamp", "desc")
            .get();

        const certificates = certsSnapshot.docs.map((doc) => {
            const d = doc.data();
            return {
                certRef: d.certRef,
                hashSha256: d.hashSha256,
                timestamp: d.timestamp,
                blockchainStatus: d.blockchainStatus || "pending",
            };
        });

        res.status(200).json({ email: linkData.email, certificates });
    } catch (error) {
        functions.logger.error("Validate magic link error:", error);
        res.status(500).send("Internal error");
    }
});

// ============================================================
// 4. UPGRADE STAMPS — daily cron to check pending OTS proofs
// ============================================================

export const upgradeStamps = functions.scheduler
    .onSchedule("every 24 hours", async () => {
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

            // Note: OpenTimestamps upgrade requires the javascript-opentimestamps
            // package. In Cloud Functions, you would:
            //
            // 1. Install javascript-opentimestamps in functions/package.json
            // 2. For each pending entry:
            //    a. Deserialise the OTS proof from otsProofBase64
            //    b. Call OpenTimestamps.upgrade(detached)
            //    c. If upgraded, update blockchainStatus to "confirmed"
            //       and store the upgraded proof
            //
            // This is a placeholder that logs the entries to upgrade.
            // Implementation requires the OTS library to work in Node.js
            // (it does — same package as the client).

            for (const doc of pending.docs) {
                const data = doc.data();
                functions.logger.info(
                    `Pending: ${data.certRef} — hash ${data.hashSha256?.slice(0, 16)}...`
                );

                // TODO: Implement OTS upgrade logic
                // const proof = Buffer.from(data.otsProofBase64, 'base64');
                // const detached = OpenTimestamps.DetachedTimestampFile.deserialize(proof);
                // const upgraded = await OpenTimestamps.upgrade(detached);
                // if (upgraded) {
                //     await doc.ref.update({
                //         blockchainStatus: "confirmed",
                //         otsProofBase64: Buffer.from(detached.serializeToBytes()).toString('base64'),
                //         upgradedAt: admin.firestore.FieldValue.serverTimestamp(),
                //     });
                //     functions.logger.info(`Upgraded: ${data.certRef}`);
                // }
            }
        } catch (error) {
            functions.logger.error("Upgrade stamps error:", error);
        }
    });
