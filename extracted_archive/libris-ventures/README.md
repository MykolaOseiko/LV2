# Libris Ventures — AuthorHash

Cryptographic proof of existence for digital assets. SHA-256 fingerprint anchored to the Bitcoin blockchain via OpenTimestamps.

## Architecture

```
libris.ventures (Firebase Hosting + Next.js)
├── /                    Landing page
├── /timestamp           AuthorHash purchase flow
├── /verify              Public lookup + My Certificates (magic link)
├── /pricing             $4.99 per certificate
├── /about               Corporate info
├── /apply               Author applications (future KFB migration)
├── /terms               Terms of Service
└── /privacy             Privacy Policy

Firebase Services
├── Firestore            registry_entries, certificate_counter, magic_links, mail
├── Cloud Functions      paddleWebhook, sendMagicLink, validateMagicLink, upgradeStamps
└── Storage              (future: generated certificate PDFs for server-side generation)

External Services
├── Paddle               $4.99 MoR payment (handles all global VAT/GST/sales tax)
├── OpenTimestamps       Bitcoin blockchain anchoring
└── Cloudflare           DNS (free tier)
```

**No user accounts. No login. No Firebase Auth.**

## Setup

### Prerequisites

- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project
- A Paddle account (sandbox for development)

### 1. Clone and install

```bash
git clone <repo-url>
cd libris-ventures
npm install
cd functions && npm install && cd ..
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in your Firebase and Paddle credentials in `.env.local`.

### 3. Firebase setup

```bash
firebase login
firebase use --add   # select your project
```

#### Firebase Extensions

Install the **Trigger Email** extension for sending confirmation emails and magic links:

```bash
firebase ext:install firebase/firestore-send-email --project=YOUR_PROJECT
```

Configure it to watch the `mail` collection and connect your SMTP provider (e.g., SendGrid, Mailgun, or Gmail SMTP).

#### Firestore Indexes

Create a composite index for the magic link certificate lookup:

- Collection: `registry_entries`
- Fields: `registrantEmail` (Ascending), `timestamp` (Descending)

### 4. Paddle setup

1. Create a Paddle account at paddle.com
2. Create a product: "AuthorHash Certificate"
3. Create a price: $4.99 USD, one-time
4. Copy the Client Token and Price ID to `.env.local`
5. Set up a webhook endpoint pointing to your Cloud Function URL:
   - Event: `transaction.completed`
   - URL: `https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/paddleWebhook`

### 5. Run locally

```bash
npm run dev                    # Next.js dev server
firebase emulators:start       # Firestore + Functions emulators (separate terminal)
```

### 6. Deploy

```bash
npm run build                  # Build Next.js static export
firebase deploy                # Deploy hosting + functions + rules
```

## Key Design Decisions

- **Client-side hashing**: File never leaves the browser (Web Crypto API)
- **Client-side OTS stamping**: Hash goes directly from browser to Bitcoin calendars
- **Client-side PDF generation**: Certificate PDF built with pdf-lib in the browser
- **Server-side registration**: Firestore writes only happen via Cloud Function after Paddle webhook confirms payment
- **Optional email**: Supports full anonymity — no email means download-only, no retrieval later
- **Magic links over accounts**: 30-minute signed URLs replace traditional login for certificate retrieval
- **Paddle as MoR**: Eliminates all global tax compliance burden

## Project Structure

```
├── app/                    Next.js pages
│   ├── layout.tsx          Root layout (fonts, metadata)
│   ├── page.tsx            Landing page
│   ├── timestamp/          AuthorHash purchase flow
│   ├── verify/             Certificate verification + magic link
│   ├── pricing/            Pricing + FAQ
│   ├── about/              Corporate info
│   ├── apply/              Author application form
│   ├── terms/              Terms of Service
│   └── privacy/            Privacy Policy
├── components/             Shared UI components
│   ├── navbar.tsx          Navigation (no auth)
│   ├── footer.tsx          Footer with links
│   └── logo.tsx            LV shield icon
├── lib/                    Client-side libraries
│   ├── firebase.ts         Firestore client (no Auth)
│   ├── hash.ts             SHA-256 hashing (Web Crypto)
│   ├── ots.ts              OpenTimestamps stamping
│   ├── paddle.ts           Paddle checkout integration
│   ├── pdf.ts              Certificate PDF generation
│   └── utils.ts            Helpers (cn, formatDate, etc.)
├── functions/              Firebase Cloud Functions
│   └── src/index.ts        paddleWebhook, sendMagicLink, validateMagicLink, upgradeStamps
├── firestore.rules         Security rules
├── firebase.json           Firebase config
└── .env.example            Environment variables template
```

## Monthly Cost

$0 at launch volume (Firebase free tier + Cloudflare free) + $0.499 per certificate sold (Paddle 10% fee on sub-$10 transactions).
