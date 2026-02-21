import OpenTimestamps from "javascript-opentimestamps";

// Defining the DetachedTimestampFile type based on library usage
export interface OTSResult {
    hash: string;
    otsFile: ArrayBuffer; // The binary proof file
    timestamp: number;
}

export async function stampHash(hashHex: string): Promise<OTSResult> {
    // 1. Create a Detached Timestamp File from the hash
    const detached = OpenTimestamps.DetachedTimestampFile.fromHash(
        new OpenTimestamps.Ops.OpSHA256(),
        hexToBytes(hashHex)
    );

    // 2. Submit to public calendars (Bitcoin anchor)
    // Using default calendars: alice.btc.calendar.opentimestamps.org, etc.
    try {
        await OpenTimestamps.stamp(detached);

        // 3. Serialize the proof to a binary format we can store/download
        const otsFile = detached.serializeToBytes();

        return {
            hash: hashHex,
            otsFile: otsFile,
            timestamp: Date.now()
        };
    } catch (error) {
        console.error("OpenTimestamps Error:", error);
        throw new Error("Failed to anchor to Bitcoin blockchain.");
    }
}

// Helper: Convert Hex String to Uint8Array/Array<number>
function hexToBytes(hex: string): Array<number> {
    const bytes = [];
    for (let c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
}

export function otsProofToBlob(otsProof: Uint8Array | ArrayBuffer): Blob {
    const bytes = otsProof instanceof ArrayBuffer
        ? new Uint8Array(otsProof)
        : new Uint8Array(otsProof);
    return new Blob([bytes.buffer as ArrayBuffer], { type: "application/octet-stream" });
}
