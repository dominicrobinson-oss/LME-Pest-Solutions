# LME Pest Solutions Tab Audit

Date: 2026-07-13

Database status: **UNBLOCKED**. Local PostgreSQL database `lme_pest_solutions` exists, migration passes and seed is rerunnable.

## Admin Tabs

| Tab | Route | Current state | Status |
|---|---|---|---|
| Dashboard | `/admin` | DB-backed KPI cards for leads, quotes, jobs, invoices, revenue and expenses. | PARTIAL |
| Leads | `/admin/leads`, `/admin/leads/[id]` | Searchable list, assignment, status, notes, conversion, quote creation and CSV export. | PARTIAL |
| Customers | `/admin/customers`, `/admin/customers/[id]` | Customer CRM list/detail, creation, property creation, quote creation and history counts. | PARTIAL |
| Quotes | `/admin/quotes`, `/admin/quotes/[id]` | Quote list/detail, line items, send stub, customer approval link and convert-to-job workflow. | PARTIAL |
| Jobs | `/admin/jobs`, `/admin/jobs/[id]` | Job list/detail, status filters, manual creation, assignment, status history, scheduling form, conflict warnings and invoice creation. | PARTIAL |
| Reminders | `/admin/reminders` | Generates and lists reminders for quote follow-ups, due/overdue invoices, contract renewals, job follow-ups, vehicles and equipment. | PARTIAL |
| Contracts | `/admin/contracts`, `/admin/contracts/[id]` | Commercial contract register, creation form, linked customer/site detail, renewal fields, recurring visit creation and recurring invoice creation. | PARTIAL |
| Finance | `/admin/finance` | Revenue/expense/profit metrics, VAT summary, pending bank transfers, quote conversion, payment method mix, invoices, payments and expense capture. | PARTIAL |
| Finance detail | `/admin/finance/invoices/[id]`, `/admin/finance/payments/[id]`, `/admin/finance/expenses/[id]` | Dedicated invoice/payment/expense views with payment capture on invoices. | PARTIAL |
| Resources | `/admin/resources`, `/admin/resources/[kind]/[id]` | Staff, vehicles, equipment, suppliers and product/inventory tables plus detail pages and creation forms. | PARTIAL |
| Documents | `/admin/documents` | Document register with customer/job links, local/S3 storage-provider-backed upload, file validation and protected links. | PARTIAL |
| Communications | `/admin/communications` | Communication timeline and logging form for customer/lead/job records. | PARTIAL |
| Reports | `/admin/reports` | Invoice, treatment and high-level performance report views with branded quote/invoice/treatment PDF endpoints. | PARTIAL |
| Audit | `/admin/audit` | Immutable audit-log table with latest actions and metadata. | PARTIAL |
| Search | `/admin/search` | Global search across leads, customers, quotes, jobs and invoices. | PARTIAL |
| Quote templates | `/admin/quote-templates` | Template library and creation form for reusable quote defaults. | PARTIAL |
| CMS | `/admin/cms` | DB-backed content pages, services, locations, FAQ/review visibility and editing forms. | PARTIAL |
| Settings | `/admin/settings` | JSON-backed business/provider/claim settings with persisted configuration. | PARTIAL |

## Public Website

| Page group | Routes | Current state | Status |
|---|---|---|---|
| Homepage | `/` | Visually corrected toward reference with functional quote form and project-owned LME logo/hero assets. | PARTIAL |
| Segment landing pages | `/domestic`, `/commercial`, `/emergency` | Dedicated public landing pages with quote forms and honest no-fake-claims content. | PARTIAL |
| Services | `/services`, `/services/[slug]` | Static/seeded service pages; CMS now manages service records but public pages still need deeper CMS integration. | PARTIAL |
| Areas | `/areas-we-cover`, `/pest-control/[slug]` | Static/seeded location pages; CMS now manages location records. | PARTIAL |
| Quote/contact/reviews/FAQ/legal | `/get-a-quote`, `/contact`, `/reviews`, `/faq`, policy pages | Quote/contact forms persist to DB; reviews/FAQ read CMS records where published. Legal content still needs final production copy. | PARTIAL |

## Workflow Proof

| Workflow | Current proof | Remaining gap |
|---|---|---|
| Public lead | API code path and DB now available; integration test covers model chain; Playwright submits public quote forms into the database. | Wider spam/abuse, mobile and visual QA still need expansion. |
| Lead to customer/property/quote | Admin code path exists (lead conversion, customer/property creation, quote creation); Playwright covers conversion and quote creation. There is no customer self-service portal or invite flow. | Manual edge-case QA still needed. |
| Quote acceptance to job | Admin records the customer's decision (accepted/declined) and converts to a job; Playwright covers this path. Customers do not accept quotes themselves online. | Deposit handling should use the same bank-transfer remittance workflow if deposits are required. |
| Job completion | Status, treatment record, local document/photo upload, materials, drawn signatures, follow-up and job expense capture exist in the admin job detail view; Playwright covers treatment completion. | Broader mobile/device QA still needed. |
| Invoice/payment | Invoice from job, customer bank-transfer request, branded invoice PDF remittance details, pending payment and admin reconciliation exist; Playwright covers paid invoice flow. | Optional open-banking import/matching remains future work. |
| Security isolation | Middleware, ownership/assignment helpers, persistent rate limiting, upload validation, browser role checks and Playwright cross-customer document denial exist. | Wider abuse testing and optional 2FA need expansion. |
