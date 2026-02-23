import Database from "better-sqlite3";
import path from "path";

// Database file lives in the project root (gitignored)
const DB_PATH = path.join(process.cwd(), "data", "authorhash.db");

// Ensure the data directory exists
import { mkdirSync } from "fs";
mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

// --- Schema ---
db.exec(`
  CREATE TABLE IF NOT EXISTS certificates (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    certRef       TEXT UNIQUE NOT NULL,
    hashSha256    TEXT NOT NULL,
    timestamp     INTEGER NOT NULL,
    blockchainStatus TEXT DEFAULT 'pending',
    eidasStatus   TEXT DEFAULT 'none',
    registrantEmail TEXT,
    createdAt     TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_cert_ref ON certificates(certRef);
  CREATE INDEX IF NOT EXISTS idx_hash ON certificates(hashSha256);
  CREATE INDEX IF NOT EXISTS idx_email ON certificates(registrantEmail);
`);

// --- Data types ---
export interface CertRecord {
    id?: number;
    certRef: string;
    hashSha256: string;
    timestamp: number;
    blockchainStatus: "pending" | "confirmed";
    eidasStatus: "verified" | "pending" | "none";
    registrantEmail?: string;
    createdAt?: string;
}

// --- Queries ---

export function insertCertificate(cert: Omit<CertRecord, "id" | "createdAt">): CertRecord {
    const stmt = db.prepare(`
    INSERT INTO certificates (certRef, hashSha256, timestamp, blockchainStatus, eidasStatus, registrantEmail)
    VALUES (@certRef, @hashSha256, @timestamp, @blockchainStatus, @eidasStatus, @registrantEmail)
  `);
    stmt.run(cert);
    return findByCertRef(cert.certRef)!;
}

export function findByCertRef(certRef: string): CertRecord | undefined {
    const stmt = db.prepare("SELECT * FROM certificates WHERE UPPER(certRef) = UPPER(?)");
    return stmt.get(certRef) as CertRecord | undefined;
}

export function findByHash(hashSha256: string): CertRecord[] {
    const stmt = db.prepare("SELECT * FROM certificates WHERE hashSha256 = ?");
    return stmt.all(hashSha256) as CertRecord[];
}

export function findByEmail(email: string): CertRecord[] {
    const stmt = db.prepare("SELECT * FROM certificates WHERE registrantEmail = ? ORDER BY timestamp DESC");
    return stmt.all(email) as CertRecord[];
}

export function updateBlockchainStatus(certRef: string, status: "pending" | "confirmed"): void {
    const stmt = db.prepare("UPDATE certificates SET blockchainStatus = ? WHERE certRef = ?");
    stmt.run(status, certRef);
}

export function updateEidasStatus(certRef: string, status: "verified" | "pending" | "none"): void {
    const stmt = db.prepare("UPDATE certificates SET eidasStatus = ? WHERE certRef = ?");
    stmt.run(status, certRef);
}

// --- Certificate ref generator ---
export function generateCertRef(): string {
    const year = new Date().getFullYear();
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 to avoid confusion
    const segment = () =>
        Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `LV-AH-${year}-${segment()}-${segment()}-${segment()}`;
}

export default db;
