-- Compatibility migration.
-- The original local development migration only removed temporary defaults from
-- SEO columns. The real cleanup now lives after the column-add migration so
-- fresh databases and Prisma shadow databases replay in the correct order.
SELECT 1;
