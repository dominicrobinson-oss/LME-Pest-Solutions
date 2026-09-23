# LME Production Deployment Guide

## Runtime

- Use Node 22 for production to match the Prisma toolchain warning.
- Use Supabase PostgreSQL with automated backups enabled.
- For Vercel runtime, use the Supabase pooled connection string when Supabase recommends it. For Prisma migrations, temporarily use the direct Supabase database URL if the pooler rejects migration operations.
- Set all values from `.env.production.example` in the host secret manager.
- Do not commit real `.env` files.
- Run `npm run launch:verify-env` with production secrets loaded before deployment.

## Deploy Steps

1. Install dependencies with `npm install`.
2. Run `npm run launch:verify-env`.
3. Run `npx prisma validate`.
4. Run `npm run db:migrate`.
5. Run `npm run db:seed` only when intentionally creating/updating seed users.
6. Run `npm run acceptance` for the local/CI acceptance suite.
7. Start with `npm run start`.

## Required Production Checks

- `NEXTAUTH_SECRET` is unique and long.
- `NEXTAUTH_URL` and `PUBLIC_SITE_URL` are HTTPS production URLs.
- Bank details are verified against the real business bank account.
- `EMAIL_PROVIDER=smtp`, Titan/GoDaddy SMTP credentials and `EMAIL_FROM` are verified by sending password reset and email verification messages.
- `STORAGE_PROVIDER=s3` works with Supabase Storage S3 credentials, a test PDF upload and protected document download.
- Admin/customer/technician accounts use strong passwords.
- Real legal details, bank details and verified claims are stored in the host secret manager/admin settings, not committed to Git.
