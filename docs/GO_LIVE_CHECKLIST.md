# LME Go-Live Checklist

- Production `.env` values match `.env.production.example`.
- `npm run launch:verify-env` passes under Node 22 with production secrets loaded.
- Supabase PostgreSQL runtime URL and direct migration URL have both been tested.
- Supabase Storage S3 credentials upload a private test document successfully.
- Titan/GoDaddy SMTP sends password reset, email verification and invoice email tests successfully.
- Real logo, imagery, business address, email, bank details and legal copy are installed.
- Reviews, stats, insurance and accreditation claims are verified or hidden.
- Public quote form creates a lead.
- Password reset and email verification emails are delivered.
- Admin can record a bank-transfer reference against an invoice and mark a pending bank transfer as received.
- Staff/admin 2FA can be enabled and an emailed security code can be used to log in.
- Bulk contract visit/invoice generation has been smoke-tested.
- Admin can complete a job, draw signatures and upload photos.
- Document downloads are restricted to admin/staff (there is no customer self-service portal).
- `npm audit` findings are reviewed and accepted or remediated.
- Final commands pass: validate, migrate, typecheck, lint, tests, integration tests, E2E guard, browser E2E, build and audit.
- Backup/restore drill has been tested in a non-production environment.
- Manual desktop, tablet and mobile QA has been signed off.
