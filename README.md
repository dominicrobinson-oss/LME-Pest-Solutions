# LME Pest Solutions Platform

Production-ready foundation for the LME Pest Solutions public website and business management platform.

## Implemented phases

Phase 1 and the first usable slice of phases 2-9 are implemented:

- Next.js App Router, TypeScript and Tailwind design system.
- Prisma/PostgreSQL schema covering users, auth, leads, CRM, properties, quotes, jobs, treatment records, commercial contracts, invoices, payments, expenses, staff, vehicles, equipment, inventory, documents, communications, CMS, settings, notifications, consent and audit logs.
- Auth.js credentials foundation with bcrypt password hashing, session expiry and login audit events.
- Public website routes for home, services, service details, areas, location details, about, reviews, FAQ, quote, contact, login, policies, sitemap, thank-you and 404.
- Quote enquiry form with server-side Zod validation, persistent Lead creation, ConsentRecord, Notification and AuditLog.
- Admin, customer and technician portal shells with noindex SEO metadata.
- XML sitemap, robots.txt and structured service schema.
- Development seed script with clearly marked local credentials.
- Launch essentials: production env template, bank-transfer payment references, Titan/GoDaddy SMTP email provider path, local/Supabase S3 storage provider modes, upload validation and database-backed rate limiting.
- Playwright browser coverage for public quote submission, public routes, role isolation and the full bank-transfer quote-to-paid workflow.
- Operations reminders for quote follow-ups, invoices, contract renewals, job follow-ups, vehicles and equipment.
- Project-owned LME logo and hero assets under `public/brand`, ready to replace with final supplied brand files.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.production.example` for production or local defaults for development. Set Supabase PostgreSQL as `DATABASE_URL` for production.

3. Generate Prisma client:

```bash
npm run db:generate
```

4. Create the database migration:

```bash
npm run db:migrate
```

5. Seed development data:

```bash
npm run db:seed
```

6. Start the app:

```bash
npm run dev
```

## Development credentials

The seed script creates:

- Admin: `admin@lme.local`
- Technician: `technician@lme.local`
- Customer: `customer@lme.local`
- Password: `ChangeMe123!` unless overridden with `ADMIN_SEED_PASSWORD`

These are development credentials only. Do not use them in production.

## External services

Configure these before production use:

- Supabase PostgreSQL database
- Titan/GoDaddy SMTP mailbox for transactional email
- Business bank account details for bank-transfer payment instructions
- Supabase Storage S3-compatible credentials for documents/photos
- Optional SMS/WhatsApp provider
- Optional maps provider

## Placeholder content needing real data

- Official logo asset and favicon
- Business email, Titan SMTP password/app password, registered office, company number, VAT status and bank details
- Opening hours and emergency availability
- Insurance details and accreditations, only if verified
- Real reviews, only if verified
- Unique local content for each service area
- Legal policy copy reviewed for the business
- Bank-transfer details and Supabase Storage credentials

## Security checklist

- Set a long `NEXTAUTH_SECRET`
- Use Node 22 in production
- Enforce HTTPS in production
- Restrict admin, customer and technician pages server-side before launch
- Keep database-backed app rate limiting enabled and add edge rate limiting where available
- Use signed document URLs
- Validate file type, size and ownership on upload
- Keep secrets out of Git
- Review role permissions before adding staff accounts
- Monitor audit logs for login and data export events

## SEO checklist

- Verify canonical production `PUBLIC_SITE_URL`
- Replace placeholder local copy with useful unique content
- Keep admin/customer/technician/API routes noindexed
- Publish only verified reviews/statistics/accreditations
- Add real image assets with descriptive alt text
- Submit `/sitemap.xml` after deployment

## Backup and restore

- Enable Supabase automated PostgreSQL backups with point-in-time recovery where available.
- Keep Supabase Storage retention/versioning settings aligned with the document policy.
- Test restore into a non-production environment quarterly.
- Export audit logs before destructive maintenance.

## Current limitations

This repository contains the working platform foundation and launch essentials, plus the first advanced workflow slice. Remaining optional improvements include open-banking reconciliation, deeper drag-and-drop calendar actions, final supplied brand assets, broader mobile visual QA and richer automated communications.
