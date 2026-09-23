# LME Manual Go-Live Test Checklist

Use this after production credentials are configured and before publishing the live site.

## Environment And Runtime

- [ ] Production host uses Node 22.x.
- [ ] `npm run launch:verify-env` passes with production secrets loaded.
- [ ] `PUBLIC_SITE_URL` and `NEXTAUTH_URL` are the final HTTPS domain.
- [ ] `NEXTAUTH_SECRET` is unique, private and at least 32 characters.
- [ ] PostgreSQL backups and object-storage versioning are enabled.

## Public Website

- [ ] Homepage renders correctly on desktop, tablet and mobile.
- [ ] Real supplied logo/photos are installed, or project-owned launch assets are explicitly approved.
- [ ] Reviews, stats, insurance and accreditation claims are hidden unless verified.
- [ ] Quote form creates a lead, consent record, notification and audit log.
- [ ] Legal pages contain final business-approved copy.

## Admin Workflow

- [ ] Admin can log in with a non-seed production account.
- [ ] Public lead appears in `/admin/leads`.
- [ ] Lead converts to customer/property.
- [ ] Quote can be created and sent; admin records the customer's accept/decline decision.
- [ ] Accepted quote converts to a job.
- [ ] Job can be assigned, scheduled and conflict warnings appear when relevant.
- [ ] Completed job can generate treatment records, documents and an invoice.

## Document Access

- [ ] Admin-generated quote/invoice/treatment PDFs require an admin login to download.
- [ ] There is no customer self-service portal; all customer-facing communication and document sharing goes through admin/staff.

## Job Completion (Admin)

- [ ] Admin can update job status, including no-access/cancel reasons.
- [ ] Admin can complete treatment records and capture signatures.
- [ ] Admin can upload a valid photo and is blocked from invalid/oversized files.
- [ ] Admin can record materials, job expenses and follow-up dates.

## Finance And Reminders

- [ ] Invoice PDF shows correct bank-transfer details and reference.
- [ ] Pending bank transfer can be marked received by admin.
- [ ] Invoice status changes to paid when the full amount is reconciled.
- [ ] Finance KPIs update after payment.
- [ ] `/admin/reminders` generates quote, invoice, contract, follow-up, vehicle and equipment reminders.

## Final Automated Commands

- [ ] `npx prisma validate`
- [ ] `npm run db:migrate`
- [ ] `npm run db:seed` only if intentionally updating seed users/data.
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run test:integration`
- [ ] `npm run test:e2e`
- [ ] `npm run test:e2e:browser`
- [ ] `npm run build`
- [ ] `npm audit`
