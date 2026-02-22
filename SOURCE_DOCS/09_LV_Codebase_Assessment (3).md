# Libris Ventures: Codebase Assessment & Launch Build Plan

## What Exists (Inventory)

### Pages
| Route | Status | Notes |
|-------|--------|-------|
| `/` (home) | Built | Hero, value props, "Libris Standard" 5-step process, featured title section |
| `/timestamp` (AuthorHash) | Built | File upload (air-gapped), manual hash entry tab, email field (to be made optional), SHA-256 hashing (screenshot confirms) |
| `/pricing` | Built | 4-tier subscription: Free / Basic $10 / Advanced $40 / Professional $80 |
| `/apply` | Built | Author representation form: profile, genre, backlist, rights availability |
| `/verify` | Not built | Referenced in footer ("Validator") but no page. Will include magic-link "My Certificates" tab |
| `/login` | **Remove** | No user accounts on LV. Replace with magic-link email lookup on `/verify` |
| `/services` | Unknown | In navbar but not uploaded |
| `/public-offer` | Unknown | In navbar but not uploaded |
| `/about` | Unknown | In navbar but not uploaded |

### Core Infrastructure
| Component | Status | Notes |
|-----------|--------|-------|
| Client-side SHA-256 | ✅ Done | `hash.ts` — Web Crypto API, file never leaves browser |
| OpenTimestamps | ✅ Done | `ots.ts` — stamps hash, submits to Bitcoin calendars, serialises proof |
| Firebase Auth | ✅ Done but **removing** | `auth-context.tsx` — no longer needed. No user accounts on LV. Magic-link email verification replaces login |
| Firestore DB | ✅ Done | `registry_entries` collection, basic rules |
| Firebase Hosting | ✅ Configured | `.firebaserc`, `firebase.json` |
| PDF certificate | ❌ Not built | `pdf-lib` in dependencies but no generation code |
| Paddle payments | ❌ Not built | Not in dependencies |
| Certificate ref system | ❌ Not built | No LV-AH-XXXX-XXXXX numbering |
| Verification/lookup | ❌ Not built | No `/verify` page or API |
| Email transactional | ❌ Not built | No receipt/confirmation emails |

### Design System
| Element | Status | Notes |
|---------|--------|-------|
| Colour palette | ✅ Nailed | `#0A2F1F` / `#D4AF37` / `#F5F5F0` — matches LV spec exactly |
| Typography | ✅ Done | Playfair Display (serif), Inter (sans), Roboto Mono (mono) |
| LV monogram | ✅ Done | Gold "LV" in circular border on hero |
| Navbar | ✅ Done | Sticky, mobile hamburger, gold accent. Needs auth removal and reorder |
| Footer | ✅ Done | Three-column (Offices, Legal, Tools), system status indicator |
| Overall aesthetic | ✅ Strong | Premium, dark-green-and-gold, literary-institutional feel |

---

## What Needs to Happen for Launch

### Tier 1: Must Have (blocks launch)

**1. Complete the timestamp → certificate flow**

The timestamp page exists but the chain from "file hashed" to "certificate in hand" isn't complete. The full flow should be:

```
User uploads file
  → Client hashes (SHA-256) ✅ exists
  → User optionally enters email            (see note below)
  → User pays (Paddle overlay checkout)    ← MISSING
  → Backend stamps hash (OpenTimestamps)   ← exists in ots.ts, needs to be called
  → Backend generates certificate ref      ← MISSING (LV-AH-YYYY-NNNNN)
  → Backend writes to Firestore            ← partially exists
  → Backend generates PDF certificate      ← MISSING
  → User downloads PDF                     ← MISSING
  → If email provided: confirmation sent   ← MISSING
```

**Email is optional (anonymity by design).** AuthorHash supports full anonymity — the
certificate is downloadable immediately after payment regardless of whether an email
is provided. When the email field is empty, a soft inline warning appears:

> "Without an email, you can still download your certificate now. However, you won't
> be able to retrieve it later or view all your certificates at once. Save your
> certificate reference number (LV-AH-...) — it's the only way to look it up."

If email IS provided: certificate PDF emailed as backup, and the user can later use
the magic-link "My Certificates" feature on `/verify` to list all certificates tied
to that email.

If email is NOT provided: certificate is download-only at the moment of purchase.
Re-download is possible via `/verify` using the certificate reference number. No
email trail exists.

Tasks:
- Make email field optional with soft warning UX (inline, not blocking)
- Add Paddle.js overlay checkout (one-time $4.99 per certificate, checkout stays on your page)
- Generate sequential certificate reference: `LV-AH-{YEAR}-{NNNNN}` (Firestore counter)
- Call `stampHash()` from `ots.ts` after Paddle webhook confirms payment
- Store: hash, certificate ref, OTS proof bytes, timestamp, Paddle transaction ID, email (nullable)
- Generate PDF certificate with `pdf-lib`: certificate ref, SHA-256 hash, registration timestamp, QR code linking to verify URL, LV branding
- Serve PDF for immediate download
- If email provided: also email a copy with verification link
- Post-payment "success" screen with certificate preview, download button, and prominent certificate ref display

**2. Build the `/verify` page**

Public, no auth required. Three tabs:

**Tab 1: Certificate Reference** — enter LV-AH-YYYY-NNNNN → Firestore lookup → shows certificate details.

**Tab 2: SHA-256 Hash** — enter or paste a hash → searches Firestore → shows whether registered and by which certificate.

**Tab 3: My Certificates** — enter email → sends a one-time magic link (valid 30 minutes) → link opens a page listing all certificates tied to that email, with download links for each PDF. Only works for certificates where an email was provided at purchase.

Display for all lookups: certificate ref, hash (truncated with copy button), registration date, blockchain anchoring status (pending / confirmed), link to OpenTimestamps proof file (.ots download), PDF re-download.

This is the page that proves AuthorHash has value — anyone can independently verify. The magic link tab replaces the need for user accounts entirely.

**3. Paddle integration**

Add Paddle.js (client-side script, loaded from paddle.com CDN — no npm package needed). Use Paddle overlay checkout for the simplest implementation:
- User provides hash + optionally email → clicks "Secure Your Asset" → Paddle overlay opens on the same page
- Paddle collects its own email for the payment receipt (separate from the optional registrant email)
- User pays $4.99 → Paddle handles VAT calculation, collection, and remittance globally (Merchant of Record)
- Paddle webhook (`transaction.completed`) fires → Cloud Function writes to Firestore and triggers certificate generation

Why Paddle over Stripe: Paddle is the Merchant of Record, meaning they are the legal seller and handle all global tax compliance (VAT, GST, sales tax across 100+ jurisdictions). For a small team selling digital products worldwide, this eliminates the entire tax registration and filing burden. Fee is 5% + $0.50 per transaction (or 10% for transactions under $10 — so $0.499 on a $4.99 certificate). The premium over Stripe (~$0.05 more per certificate) buys complete tax peace of mind.

This requires a Firebase Cloud Function to handle the Paddle webhook and verify the signature.

**4. Tighten Firestore rules**

Current rules allow anyone to write to `registry_entries` with just an email and hash. After adding Paddle, writes should only happen from the backend (Cloud Function) after payment confirmation. Client should be read-only for verification lookups.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /registry_entries/{entry} {
      allow read: if true;      // public verification
      allow write: if false;    // only Cloud Functions (admin SDK bypasses rules)
    }
    match /certificate_counter/{doc} {
      allow read, write: if false;  // internal only
    }
    match /magic_links/{token} {
      allow read, write: if false;  // internal only (Cloud Functions create + validate)
    }
  }
}
```

### Tier 2: Should Have (launch is weaker without)

**5. Confirmation email (conditional)**

Only sent if the user provided an email during purchase. Contents:
- Certificate PDF attached
- Certificate reference number
- Verification URL: `https://libris.ventures/verify?ref=LV-AH-YYYY-NNNNN`
- Reminder to archive the original file
- Note: "You can view all your certificates anytime at libris.ventures/verify → My Certificates"

If no email was provided, the user sees a prominent reminder on the success page to save their certificate reference number and download the PDF immediately.

Options: Firebase Extensions (Trigger Email from Firestore), Resend, or SendGrid. Firebase's "Trigger Email" extension is zero-code: write a document to a `mail` collection and it sends.

**6. OpenTimestamps upgrade check**

Initial OTS stamps are "pending" (submitted to calendar servers but not yet anchored to a Bitcoin block — takes ~12 hours). Add a Cloud Function that runs daily, checks pending stamps, and upgrades them when confirmed. Update Firestore with `blockchain_status: "confirmed"` and the block height.

**7. Legal pages**

`/terms` and `/privacy` must exist before accepting payments. Can be simple markdown-rendered pages. Content needed:
- Terms of Service: AuthorHash is proof of existence, not proof of authorship/ownership. LV does not store files. No refunds (digital product). Governing law (England and Wales).
- Privacy Policy: What data is collected (email, hash, payment ref). GDPR basis (contract performance). No file storage. Data retention.

### Tier 3: Nice to Have (post-launch)

**8. Content repositioning**

Per our discussion: LV site should lead with AuthorHash as a standalone product, not literary representation. The "Apply for Representation" page and CTA should eventually move to kfbooks.eu. For now, it can stay but should be de-emphasised (secondary nav item, not primary CTA).

Navbar priority reorder:
```
Current:  Services | AuthorHash | Pricing | Public Offer | About | [Sign In] [APPLY]
Launch:   AuthorHash | Verify | Pricing | About | [APPLY]
```

Remove "Member Sign In" entirely — no user accounts on LV. The "My Certificates"
lookup lives on `/verify` via magic link. "Services" and "Public Offer" are KFB territory.

**9. Landing page refocus**

The hero currently says "IP Rights Management for your Narrative Assets" — that's the KFB value prop. For LV standalone launch, the hero should centre on AuthorHash:

> "Cryptographic Proof of Authorship" or
> "Immutable Proof Your Work Existed — Before Anyone Else Can Claim It"

The "Featured Title" section (The Cartographer's Daughter) is KFB catalogue content. Replace with AuthorHash social proof, a "How It Works" explainer, or pricing summary.

**10. Subscription billing (Paddle)**

The pricing page shows 4 subscription tiers. For launch, skip subscriptions entirely — just do pay-per-certificate ($4.99 via Paddle overlay checkout). Add subscriptions in month 2 when you have data on who's buying and how many certificates they need. Paddle supports both one-time and subscription billing, so the migration is seamless.

---

## Recommended Build Order

### Sprint 1 (Weeks 1–2): Payment + Certificate Generation

| Day | Task |
|-----|------|
| 1–2 | Create Paddle account, configure product ($4.99 one-time "AuthorHash Certificate"). Add Paddle.js script to timestamp page. Make email field optional with soft inline warning ("Without an email, you won't be able to retrieve certificates later — save your reference number"). Build overlay checkout flow: hash + optional email → open Paddle checkout → payment completes on-page |
| 3–4 | Firebase Cloud Function: Paddle webhook handler. On `transaction.completed`: (a) verify webhook signature, (b) generate certificate ref from Firestore counter, (c) call `stampHash()`, (d) write `registry_entries` document, (e) generate PDF with `pdf-lib`, (f) store PDF in Firebase Storage |
| 5 | PDF certificate template: LV branding (dark green + gold), certificate ref, SHA-256 hash (monospace), registration timestamp, QR code to verify URL. Use `pdf-lib` to build from scratch or embed in a pre-designed template |
| 6–7 | Post-payment success page: certificate preview, PDF download button, "verify your certificate" link. Handle edge cases (payment failure, duplicate hash warning) |
| 8 | Tighten Firestore rules (client read-only, writes via admin SDK only) |

### Sprint 2 (Week 3): Verify + Email + Legal

| Day | Task |
|-----|------|
| 9–10 | Build `/verify` page with three tabs: (1) Certificate ref lookup, (2) SHA-256 hash lookup, (3) "My Certificates" — enter email → Cloud Function sends magic link (signed URL, 30-min expiry) → link opens page listing all certs for that email |
| 11 | Confirmation email (conditional): Firebase Trigger Email extension or Resend. Only fires if registrant email was provided. Send PDF + cert details |
| 12 | Legal pages: `/terms` and `/privacy` (markdown content, rendered in LV styling) |
| 13 | OTS upgrade Cloud Function: daily cron, check pending stamps, upgrade when Bitcoin-confirmed |
| 14 | Testing: end-to-end flow (upload → pay → certificate → verify → email). Paddle sandbox mode |

### Sprint 3 (Week 4): Polish + Launch

| Day | Task |
|-----|------|
| 15–16 | Content repositioning: rewrite hero for AuthorHash focus, reorder navbar (remove Sign In, add Verify), de-emphasise Apply/Services. Remove Firebase Auth (`auth-context.tsx`, `useAuth` imports) and `/login` page |
| 17 | Mobile responsiveness check (all pages) |
| 18 | Paddle: switch from sandbox to live mode. Verify webhook signatures in production |
| 19 | Firebase deploy to production. DNS: libris.ventures → Firebase Hosting |
| 20 | Soft launch: test with 5–10 real certificates. Monitor Paddle, Firestore, OTS |

---

## Architecture for Launch

```
┌─────────────────────────────────────────────────────┐
│                  libris.ventures                     │
│              (Firebase Hosting + Next.js)             │
│                                                       │
│   /                    Landing page                   │
│   /timestamp           AuthorHash purchase flow       │
│   /verify              Public lookup + My Certificates│
│   /pricing             Plans (future subscriptions)   │
│   /terms, /privacy     Legal                          │
│   /apply               Author application (temporary) │
│                                                       │
│   No user accounts. No login page.                    │
│                                                       │
├─────────────────────────────────────────────────────┤
│                Firebase Services                      │
│                                                       │
│   Firestore ─── registry_entries (certificates)       │
│                  certificate_counter (sequential ref)  │
│                  mail (Trigger Email extension)        │
│                  magic_links (short-lived tokens)      │
│   Cloud Functions:                                    │
│     • paddleWebhook — handles payment confirmation     │
│     • sendMagicLink — emails time-limited verify URL  │
│     • upgradeStamps — daily cron, OTS confirmation    │
│   Storage ───── Generated certificate PDFs            │
│                                                       │
├─────────────────────────────────────────────────────┤
│                External Services                      │
│                                                       │
│   Paddle ────── One-time $4.99 payment per cert       │
│                  (Merchant of Record: handles all      │
│                   global VAT/GST/sales tax)            │
│   OTS Calendars ── Bitcoin blockchain anchoring       │
│   Cloudflare ── DNS for libris.ventures (free tier)   │
│                                                       │
└─────────────────────────────────────────────────────┘
```

Monthly cost: $0 (Firebase free tier + Cloudflare free) + Paddle fees per transaction ($0.499 per $4.99 certificate).

---

## Key Decision Points

**1. Firebase Cloud Functions vs Next.js API Routes?**

For the Paddle webhook, Cloud Functions are better: they run independently of the Next.js app, have their own scaling, and are the standard Firebase pattern for webhooks. The OTS upgrade cron also works cleanly as a scheduled Cloud Function. Keep Next.js for the frontend, Cloud Functions for backend logic.

**2. PDF generation: client-side or server-side?**

Server-side (Cloud Function). The certificate should only be generated after confirmed payment. Generating client-side would let someone skip payment and fabricate a certificate. The Cloud Function generates the PDF, stores it in Firebase Storage, and returns the download URL.

**3. Do you need user accounts for AuthorHash?**

No. LV has no user accounts. The purchase flow requires only a file hash (mandatory) and email (optional). Certificate retrieval is handled three ways:
- By certificate reference (LV-AH-YYYY-NNNNN) on `/verify` — always works
- By SHA-256 hash on `/verify` — always works
- By email via magic link on `/verify` → lists all certificates tied to that email — only works if email was provided at purchase

Firebase Auth (`auth-context.tsx`) should be removed from the codebase. This eliminates a dependency, removes the login page, and simplifies the navbar. The magic-link email for "My Certificates" is a simple Cloud Function that generates a signed, time-limited URL — no Firebase Auth needed.

**4. Pay-per-certificate or subscriptions first?**

Pay-per-certificate. The subscription tiers on the pricing page are good forward planning, but implementing subscription metering and usage tracking is significantly more complex than a single one-time purchase. Launch with $4.99/certificate via Paddle, add subscriptions in month 2 based on demand patterns. Paddle supports both models natively, so upgrading is straightforward.

**5. Should the Apply page stay?**

Yes, for now. It captures leads for KFB. But move it down in the navbar priority. When kfbooks.eu launches, the Apply CTA migrates there and the LV site focuses purely on AuthorHash + verification.

---

## What Stays, What Changes, What's New

| Component | Status | Action |
|-----------|--------|--------|
| Landing page | Rewrite | Centre on AuthorHash, remove featured title |
| Timestamp page | Extend | Add Paddle overlay checkout, post-payment flow, certificate download |
| Verify page | **New** | Three-tab lookup: cert ref, SHA-256 hash, magic-link "My Certificates" |
| Pricing page | Keep | But note "Coming soon" for subscriptions, launch with pay-per-cert |
| Apply page | Keep | De-emphasise in nav, move to KFB later |
| Login page | **Remove** | No user accounts on LV. Magic link on `/verify` replaces it |
| Terms + Privacy | **New** | Required for payment processing |
| Navbar | Reorder | AuthorHash first, Verify added, Sign In removed, Apply de-emphasised |
| Firebase Auth | **Remove** | Delete `auth-context.tsx`, remove `firebase/auth` import, remove `useAuth` from navbar |
| Firestore | Extend | Tighten rules, add counter doc, add mail collection |
| Cloud Functions | **New** | Paddle webhook, PDF generation, OTS upgrade cron |
| hash.ts | Keep | Works perfectly |
| ots.ts | Move | Move call to Cloud Function (server-side after payment) |
| PDF generation | **New** | Cloud Function using pdf-lib |
| Paddle | **New** | Overlay checkout for $4.99 one-time payment (Merchant of Record) |
| Email | **New** | Firebase Trigger Email or Resend |
