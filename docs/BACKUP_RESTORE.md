# LME Backup And Restore Guide

## Backups

- Enable Supabase daily PostgreSQL backups with point-in-time recovery where available on the selected plan.
- Keep Supabase Storage retention/versioning settings aligned with the document policy for documents and photos.
- Export audit logs before any destructive maintenance.
- Store backup access separately from app hosting credentials.

## Restore Drill

1. Create a non-production database.
2. Restore the latest PostgreSQL backup.
3. Point a staging deployment at the restored Supabase database and copied storage bucket.
4. Run `npx prisma validate` and `npm run build`.
5. Manually verify login, lead list, customer document access, invoice PDF and bank payment records.

Run this drill quarterly and before major platform changes.
