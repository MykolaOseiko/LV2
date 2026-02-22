# KF Books: Lightweight Launch Plan (2026–2027)

## The Honest Assessment

The specifications, database schema, and infrastructure plan we've built describe a platform for hundreds or thousands of authors and partners. For 2026 (dozens of users) and 2027 (low hundreds), most of that is premature. Building it now would consume 7 months of development time and ~$250/month in hosting for a system that's mostly empty.

The principle: **buy or rent before you build.** Custom code only for the things that make KF Books genuinely unique. Everything else — CRM, invoicing, email, document management, even the marketing site — already exists as off-the-shelf products that are better maintained, more feature-rich, and cheaper than anything we'd build.

---

## What Actually Needs to Be Custom-Built

Only two things cannot be bought off the shelf:

1. **AuthorHash (Libris Ventures)** — cryptographic proof of authorship anchored to Bitcoin blockchain. No SaaS product does this. This is the IP moat.

2. **The marketing narrative** — the kfbooks.eu website that tells the story of the two-entity structure, escalating royalties, and AuthorHash protection. This needs to feel bespoke, not like a template. But "bespoke feel" doesn't require custom backend infrastructure.

Everything else — author relationship management, partner pipelines, royalty tracking, document storage, email — can run on existing tools in 2026 and be replaced with custom systems only when scale demands it.

---

## Phase 1: AuthorHash / Libris Ventures (Weeks 1–6)

### Why First

- Standalone revenue from day one ($5–10 per certificate, anyone can buy)
- Validates the core technical proposition before investing in the publishing platform
- Establishes LV as a real, operating entity (substance for IP custodianship)
- Every author interaction with KF Books starts with "get your AuthorHash first" — so this must exist before anything else
- Simplest project: one backend, one page, one payment flow

### What to Build

**Product:** A single-page site at libris.ventures where anyone can:
1. Upload a file (hashed client-side, file never leaves the browser)
2. Pay $5–10 via Stripe
3. Receive a Certificate of Anteriority PDF with SHA-256 fingerprint + OpenTimestamps Bitcoin anchor
4. Later verify any certificate via a public lookup tool

**Tech stack (minimal):**
- Backend: FastAPI on a single $12/month DigitalOcean Droplet (1 vCPU / 2 GB)
- Database: SQLite for launch (certificates table, email, hash, timestamp, Stripe ref). Migrate to PostgreSQL when you hit 1,000+ certificates
- Blockchain: OpenTimestamps Python library (free, anchors to Bitcoin)
- Payments: Stripe Checkout (one-time charge, no subscriptions yet)
- PDF: WeasyPrint (generates certificate from HTML template)
- Storage: Local disk or DO Spaces for certificate PDFs
- Frontend: Single HTML page with vanilla JS (file hashing + Stripe redirect). No React, no build step
- Domain: libris.ventures, Cloudflare free tier for DNS + basic protection

**Public API (for later KFB integration):**
- `POST /api/v1/certificates` — issue certificate (API key auth)
- `GET /api/v1/certificates/{ref}` — get certificate details
- `GET /api/v1/certificates/{ref}/verify` — public verification (no auth)
- `GET /api/v1/registry/search?hash={sha256}` — public registry lookup

**Scope explicitly excluded from Phase 1:**
- User accounts (email for receipt only, no login)
- Subscription plans (flat per-certificate pricing only)
- Batch processing
- IP Registry search UI (API-only for now, UI in Phase 2)

**Cost:** ~$12/month hosting + Stripe fees (2.9% + $0.30 per transaction) + domain ~$15/year.

**Team:** 1 developer, 4–6 weeks.

---

## Phase 2: KF Books Marketing Site (Weeks 5–10, overlapping with Phase 1)

### What to Build

A polished marketing site at kfbooks.eu that converts two audiences: authors and partners. This is a content site, not an application.

### Recommended Platform: Webflow or WordPress

**Why not custom Next.js (yet):**
At this stage, the marketing site needs to look great, load fast, rank in search, and be editable without a developer. Webflow or a premium WordPress theme does all of this out of the box, with hosting included, for $20–40/month. Building the same in Next.js + Sanity takes 4–6 weeks of developer time for a result that's functionally identical.

**If Webflow:**
- Visual builder, no code, designer-quality output
- Built-in hosting, SSL, CDN, forms
- CMS for blog posts and FAQ
- Custom domain: kfbooks.eu
- Cost: ~$30/month (CMS plan)
- Can be done by a designer alone, no developer needed

**If WordPress (self-hosted on DO):**
- Theme: Flavor theme (Flavor), Flavor theme, or a premium theme like flavor theme (flavor theme)
- Hosting: Same $12 Droplet as LV services (Nginx vhost routing)
- Plugins: Yoast SEO, Contact Form 7, WP Mail SMTP
- Cost: ~$0 additional hosting (shares LV Droplet) + ~$60 one-time theme
- More flexible long-term, but needs a developer for customisation

**If you strongly prefer Next.js** (for future-proofing and developer control):
- Static site generation, deploy to the same Droplet
- Sanity.io free tier for CMS
- Takes 4–6 weeks of developer time
- Makes sense if you have a developer on retainer anyway

### Content Needed (ref: 02_Site_Map_UX_UI.md)

The site map and UX spec we already wrote is the content brief. The key pages:
- Homepage (hero + escalating royalties + two-entity + AuthorHash + CTAs)
- /authors (value prop, royalty table, zero-investment, safeguards)
- /partners (Tier A vs B, economics, CTA)
- /about (team, mission, LV explanation)
- /about/authorhash (links to libris.ventures, verification tool)
- Legal (/terms, /privacy)
- Contact / Apply forms

### The "Apply" Form

The author application and partner enquiry forms submit to the CRM (Phase 3), not to a custom backend. Webflow forms, WordPress Contact Form 7, or Tally.so can all pipe submissions directly into a CRM via Zapier or native integrations.

---

## Phase 3: CRM + Operational Backbone (Weeks 7–12)

### Why a CRM

At 20–50 authors, your core operational challenge is not software — it's relationship management. You need to track:

- Which authors you've approached / who approached you
- Where each conversation stands (initial contact → proposal → manuscript review → WA offer → signed)
- Partner enquiries and their pipeline stage
- Follow-up reminders ("Author X hasn't responded to WA offer in 2 weeks")
- Notes from calls and emails
- Which works are in which stage of production

This is exactly what a CRM does. Building a custom "Author Portal" to replace it is like building a custom email client because Gmail doesn't have your brand colours.

### Recommended: HubSpot Free CRM + Deals Pipeline

**Why HubSpot Free:**
- Genuinely free for up to 1,000 contacts (more than enough for 2026–2027)
- Custom deal pipeline stages that map exactly to the work states we defined:

```
Author Pipeline:
  Lead → Proposal Received → Proposal Review → Manuscript Requested → 
  Manuscript Received → Under Review → Offer Sent → Signed → In Production → Published

Partner Pipeline:
  Enquiry → Initial Call → Terms Discussion → Sub-Licence Drafted → Signed → Active
```

- Email tracking (know when an author opened your WA offer email)
- Task reminders ("Follow up with Author X in 3 days")
- Forms that embed on your marketing site (author application → CRM contact + deal)
- Free email templates (for your E-01 through E-26 emails — manually sent, but from templates)
- Contact properties can store: AuthorHash ref, pen name, original language, genre, WA status
- Document upload per deal (store WA PDFs, manuscripts, certificates)
- Reporting dashboard (pipeline value, conversion rates, time-in-stage)
- Mobile app (manage on the go)
- Scales to paid plans when you need automation

**Alternative: Pipedrive** (~$15/user/month)
Better UX for pure deal management, less feature bloat. Good if you don't need marketing automation.

**Alternative: Notion database**
Free, fully customisable, but no email tracking, no reminders, no pipeline automation. Works if you're very disciplined. Breaks down past ~50 active relationships.

### CRM as the System of Record (2026)

In 2026, the CRM replaces our entire custom Author Portal:

| Custom Portal Feature | CRM Equivalent |
|-----------------------|---------------|
| Work state tracking | Deal pipeline stages |
| Author profile | Contact record + custom properties |
| Proposal submission | Form on website → new deal in CRM |
| Manuscript request email | Email template sent from CRM |
| WA offer tracking | Deal stage + document attachment |
| Royalty beneficiary info | Custom properties on contact |
| Edition status | Custom properties on deal or linked records |
| Notifications | CRM tasks + email sequences |
| Timeline | CRM activity feed (automatic) |

### What the CRM Doesn't Replace

- AuthorHash (custom-built, Phase 1)
- Royalty calculation (spreadsheet in 2026, see Phase 4)
- The marketing site (Webflow/WordPress, Phase 2)
- Legal document generation (manual from templates in 2026)

---

## Phase 4: Financial Operations (Weeks 10–16)

### Royalty Tracking: Spreadsheet First

For 20–50 works generating sales across a few platforms, the royalty calculation is a spreadsheet problem, not a software problem.

**Google Sheets "Royalty Engine":**
- Tab 1: **Works Master** — work ID, author, AuthorHash ref, WA date, current tier, cumulative copies
- Tab 2: **Sales Import** — paste monthly/quarterly sales data from Amazon KDP, Apple, Google dashboards (all provide CSV exports)
- Tab 3: **Royalty Calculator** — formulas that apply the escalating tier logic (22% / 33% / 44% / Premium), calculate per-work royalties, output per-author totals
- Tab 4: **Payment Tracker** — amounts due, paid dates, bank refs
- Tab 5: **Partner Revenue** — Tier A royalty floor calc, Tier B phase tracking

This spreadsheet implements 100% of the royalty engine from `06_DB_Schema_API_Endpoints.md` with zero code. It's auditable, shareable, and anyone with Excel skills can maintain it.

**When to replace it with software:** When you're processing more than ~100 works across more than ~5 platforms and the manual CSV imports take more than a day per quarter. That's probably late 2027 or 2028.

### Invoicing: Xero or QuickBooks

- Issue royalty payment invoices to authors
- Track partner payments received
- Custodianship fee tracking (KFB → LV)
- Bank reconciliation
- Tax reporting
- Cost: ~$15–30/month

### Document Management: Google Drive (Structured)

```
KF Books Drive/
├── Authors/
│   ├── [Author Name]/
│   │   ├── Proposals/
│   │   ├── Manuscripts/
│   │   ├── Work Agreements (signed)/
│   │   ├── AuthorHash Certificates/
│   │   └── Royalty Statements/
│   └── ...
├── Partners/
│   ├── [Partner Name]/
│   │   ├── Sub-Licence Agreements/
│   │   ├── Sales Reports/
│   │   └── Correspondence/
│   └── ...
├── Templates/
│   ├── Work Agreement Template.docx
│   ├── Sub-Licence Agreement Template.docx
│   ├── Royalty Statement Template.xlsx
│   └── Email Templates/
└── Finance/
    ├── Royalty Calculations/
    └── Custodianship Fees/
```

Link Google Drive folders to CRM deals for each author/partner. This gives you document management without building a custom document system.

### Email: Resend or Mailchimp

The 26 email templates (E-01 through E-26) are sent manually from the CRM or from email templates in 2026. As volume grows, move to Resend (transactional) or Mailchimp (marketing) for automation.

---

## Phase 5: Author & Partner Self-Service (2027+, only if needed)

### When to Build Custom

Build the custom Author Portal and Partner Portal only when:

- You have 100+ active authors and manual CRM management takes more time than it saves
- Authors are asking to self-service (check their own royalty statements, download certificates)
- Partners need to submit sales reports more frequently than quarterly
- The royalty spreadsheet breaks down under data volume
- You're hiring staff who need structured workflows, not founder-mode flexibility

At that point, the specs we've already written (05_Author_Work_States.md, 06_DB_Schema_API_Endpoints.md, 07_Implementation_Plan.md) become the blueprint. Nothing is wasted — it's a technical specification ready for a development team when the business justifies it.

### What to Build First When That Time Comes

1. **Author Portal MVP:** Login, view works and their states, view/download royalty statements (generated from the spreadsheet data, imported into a simple DB), download AuthorHash certificates. Read-only first.
2. **Proposal submission form** (replaces the CRM form with a structured multi-step wizard)
3. **Royalty engine** (replaces the spreadsheet with automated calculation)
4. **Partner Portal MVP:** Login, view licensed works, submit sales reports
5. **Admin panel** (replaces CRM for work state management)

---

## Revised Timeline and Costs

### 2026 Launch Stack

| Component | Tool | Monthly Cost | Setup Time |
|-----------|------|-------------|------------|
| AuthorHash (libris.ventures) | Custom FastAPI on DO Droplet | $12 | 4–6 weeks (developer) |
| Marketing site (kfbooks.eu) | Webflow CMS plan | $30 | 2–3 weeks (designer) |
| CRM (author + partner mgmt) | HubSpot Free | $0 | 1 week (configuration) |
| Royalty tracking | Google Sheets | $0 | 1 week (template) |
| Invoicing | Xero Starter | $15 | 1 week (setup) |
| Document management | Google Workspace | $7/user | Already have |
| Email (transactional) | Resend Free (3K/mo) | $0 | 1 day |
| Domain + DNS | Cloudflare Free | $3 (amortised) | 1 hour |
| **Total** | | **~$67/month** | **8–10 weeks** |

Compare to the full custom build: **$259/month + 28 weeks of development**.

### 2027 Upgrade Path

| Trigger | Action | Cost |
|---------|--------|------|
| 50+ authors, CRM feels limiting | Add HubSpot Starter ($20/mo) for automation | $20/month |
| 100+ works, spreadsheet too slow | Build royalty engine (custom, 4–6 weeks) | One-time dev cost |
| Authors want self-service | Build Author Portal MVP (8–10 weeks) | One-time dev cost |
| 10+ partners, reporting complex | Build Partner Portal MVP (6–8 weeks) | One-time dev cost |
| Marketing site needs i18n | Migrate Webflow → Next.js + Sanity | 4–6 weeks dev |
| Traffic spikes / SEO needs | Add CDN, LB, second server | $50–100/month |

### What's Preserved

Every specification document we've created remains valuable:

| Document | Role in 2026 | Role in 2027+ |
|----------|-------------|---------------|
| 01_Project_Manifesto.md | Brand/content brief for Webflow site | Same |
| 02_Site_Map_UX_UI.md | Content structure for Webflow build | Blueprint for Next.js migration |
| 03_IP_Protection_Explanation.md | Website copy source | Same |
| 04_Tech_Stack.md | Reference for AuthorHash build | Blueprint for full platform |
| 05_Author_Work_States.md | CRM pipeline configuration | State machine spec for custom portal |
| 06_DB_Schema_API_Endpoints.md | Not used yet | Database spec for custom build |
| 07_Implementation_Plan.md | Not used yet | Development roadmap when ready |
| Bridge_between_sites_v3.md | Webflow UX reference | Portal UX spec |
| author_portal_mockup.html | Future reference | Design spec for custom portal |

---

## Revised Decision: What to Do Now

### Immediate (Weeks 1–6): Ship AuthorHash
One developer. One Droplet. libris.ventures goes live. Revenue from day one. Establishes LV as a real entity.

### Next (Weeks 5–10): Ship Marketing Site
Designer builds kfbooks.eu on Webflow (or a developer builds it in Next.js if you prefer to invest in the codebase from the start). Content sourced from our spec documents.

### Parallel (Week 7): Configure CRM
Set up HubSpot with author and partner pipelines matching our state machine. Import any existing contacts. Embed application forms on the marketing site.

### Parallel (Week 10): Financial Setup
Google Sheets royalty template. Xero for invoicing. Google Drive structure for documents.

### Then: Start Operating
Sign authors. Issue AuthorHash certificates. Review proposals. Send WA offers (manually, from templates). Track everything in the CRM. Calculate royalties quarterly in a spreadsheet. Pay via bank transfer.

### Build custom software only when the manual process breaks.
