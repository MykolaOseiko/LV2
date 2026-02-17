import { initializePaddle, type Paddle } from "@paddle/paddle-js";

let paddleInstance: Paddle | null = null;

/**
 * Initialise Paddle.js. Call once on app load.
 */
export async function getPaddle(): Promise<Paddle> {
    if (paddleInstance) return paddleInstance;

    const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as
        | "sandbox"
        | "production";

    const paddle = await initializePaddle({
        environment: environment || "sandbox",
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
    });

    if (!paddle) throw new Error("Failed to initialise Paddle");

    paddleInstance = paddle;
    return paddle;
}

export interface CheckoutParams {
    hashSha256: string;
    registrantEmail?: string;
    otsProofBase64: string;
    timestamp: number;
}

/**
 * Open the Paddle overlay checkout for a single AuthorHash certificate.
 *
 * Returns a promise that resolves with the Paddle transaction ID
 * on successful payment, or rejects on cancellation/error.
 */
export function openCheckout(params: CheckoutParams): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            const paddle = await getPaddle();

            paddle.Checkout.open({
                items: [
                    {
                        priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID!,
                        quantity: 1,
                    },
                ],
                customData: {
                    hash_sha256: params.hashSha256,
                    registrant_email: params.registrantEmail || "",
                    ots_proof_base64: params.otsProofBase64,
                    timestamp: params.timestamp.toString(),
                },
                settings: {
                    displayMode: "overlay",
                    theme: "dark",
                    successUrl: `${window.location.origin}/timestamp?success=true&hash=${params.hashSha256}`,
                },
            });

            // Paddle fires events on the window — listen for completion
            // Note: in production you rely on the webhook, not this event
            const handler = (event: any) => {
                if (event.detail?.name === "checkout.completed") {
                    window.removeEventListener(
                        "paddle:checkout.completed" as any,
                        handler
                    );
                    resolve(event.detail.data?.transaction_id || "");
                }
                if (event.detail?.name === "checkout.closed") {
                    window.removeEventListener(
                        "paddle:checkout.closed" as any,
                        handler
                    );
                    reject(new Error("Checkout cancelled"));
                }
            };

            // Paddle.js v2 event listeners
            window.addEventListener(
                "paddle:checkout.completed" as any,
                handler
            );
            window.addEventListener(
                "paddle:checkout.closed" as any,
                handler
            );
        } catch (error) {
            reject(error);
        }
    });
}
