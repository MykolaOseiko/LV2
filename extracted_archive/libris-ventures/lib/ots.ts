import OpenTimestamps from "javascript-opentimestamps";

export interface OTSResult {
    hash: string;
    otsProof: Uint8Array;
    timestamp: number;
}

/**
 * Submit a SHA-256 hash to public OpenTimestamps calendar servers
 * for anchoring to the Bitcoin blockchain.
 *
 * This runs client-side — the hash goes directly from the user's
 * browser to the OTS calendar servers. We never touch it.
 */
export async function stampHash(hashHex: string): Promise<OTSResult> {
    const hashBytes = hexToBytes(hashHex);

    const detached = OpenTimestamps.DetachedTimestampFile.fromHash(
        new OpenTimestamps.Ops.OpSHA256(),
        hashBytes
    );

    try {
        await OpenTimestamps.stamp(detached);

        const otsProof = detached.serializeToBytes();

        return {
            hash: hashHex,
            otsProof: new Uint8Array(otsProof),
            timestamp: Date.now(),
        };
    } catch (error) {
        console.error("OpenTimestamps Error:", error);
        throw new Error("Failed to anchor to Bitcoin blockchain.");
    }
}

/**
 * Convert a serialised OTS proof to a downloadable Blob.
 */
export function otsProofToBlob(proof: Uint8Array): Blob {
    return new Blob([proof], { type: "application/octet-stream" });
}

function hexToBytes(hex: string): number[] {
    const bytes: number[] = [];
    for (let c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
}
