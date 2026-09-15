import { slugify } from "@/lib/utils";

export const business = {
  name: "LME Pest Solutions",
  type: "Pest control services",
  primaryArea: "Manchester",
  coverage: "North West England",
  phone: "07301 113 276",
  email: "info@lmepestsolutions.co.uk",
  openingHours: "Mon-Sun, 8:00am-8:00pm where available",
  primaryCta: "Get a Free Quote",
  secondaryCtas: ["Call Now", "WhatsApp Us"],
  instagramUrl: "https://www.instagram.com/lmepestsolutions/",
  googleReviewsUrl: "https://www.google.com/search?q=LME+GENERAL+Google+reviews",
};

export const pestServices = [
  "Rat Control",
  "Mouse Control",
  "Squirrel Control",
  "Cockroach Control",
  "Flea Treatment",
  "Bed Bug Treatment",
  "Beetle Control",
  "Silverfish Control",
  "Ant Control",
  "Moth Control",
  "Spider Control",
  "Wasp Nest Removal",
  "Bird Control",
  "Solar Panel Bird Proofing",
  "Bird Spiking",
  "Rifle Work",
].map((name) => ({
  name,
  slug: slugify(name),
  intro: `Professional ${name.toLowerCase()} for homes and businesses across Manchester and the North West.`,
}));

export const homeMaintenanceServices = [
  "Gutter Removal & Install",
  "Gutter Cleaning",
  "Powerwashing",
  "Window Cleaning",
  "Garden Maintenance",
  "Hygiene Clean / Steam Treatment",
  "Feces Removal",
  "Environmental Cleans",
  "Guano Removal",
  "Masonry Restoration",
  "Fence Staining",
  "Cement Work",
  "Brick Cleaning",
].map((name) => ({
  name,
  slug: slugify(name),
  intro: `Professional ${name.toLowerCase()} for homes and businesses across Manchester and the North West.`,
}));

export const services = [...pestServices, ...homeMaintenanceServices];

export const pestFacts = [
  ["Rats and mice", "Rodents can enter through surprisingly small gaps, so proofing and prevention matter as much as treatment."],
  ["Wasps and bees", "Never block an active nest entrance yourself. A proper assessment helps identify the safest next step."],
  ["Bird control", "Solar panel proofing and bird spiking can help protect buildings while keeping the solution targeted and humane."],
  ["Clean, documented work", "Every enquiry starts with a clear assessment, quote and practical follow-up advice."],
];

export const trustMarks = [
  ["RSPH", "Professional standards"],
  ["BPCA", "Industry standards"],
];

export const areas = [
  "Manchester",
  "Salford",
  "Bolton",
  "Bury",
  "Oldham",
  "Rochdale",
  "Stockport",
  "Tameside",
  "Trafford",
  "Wigan",
  "Warrington",
  "Liverpool",
  "St Helens",
  "Widnes",
  "Runcorn",
  "Preston",
  "Blackburn",
  "Chorley",
  "Crewe",
  "Ellesmere Port",
].map((name) => ({ name, slug: slugify(name), active: true }));

export const benefits = [
  "Rapid response",
  "Professional treatments",
  "Honest pricing",
  "Local service",
  "Domestic and commercial work",
  "Treatment and prevention advice",
  "Follow-up support",
  "Clear communication",
];

export const workflowSteps = [
  "Contact LME",
  "Initial assessment",
  "Quote supplied",
  "Appointment booked",
  "Treatment completed",
  "Prevention and follow-up",
];

export const operationalModules = [
  "Leads",
  "Customers",
  "Properties",
  "Quotes",
  "Jobs",
  "Treatment records",
  "Invoices",
  "Payments",
  "Expenses",
  "Staff",
  "Documents",
  "CMS",
  "Settings",
  "Audit log",
];

export const faqs = [
  {
    question: "How quickly can LME respond?",
    answer: "Same-day response is available where scheduling and technician capacity allow. Urgent enquiries are prioritised in the lead queue.",
  },
  {
    question: "Do quote forms create admin records?",
    answer: "Yes. Website quote submissions are validated server-side and create lead, consent and audit records.",
  },
  {
    question: "Are reviews and statistics shown automatically?",
    answer: "No. Reviews, accreditations and statistics must be verified or configured in admin before they appear publicly.",
  },
];

export const adviceArticles = [
  {
    title: "How To Prepare For A Pest Control Visit",
    slug: "prepare-for-pest-control-visit",
    description: "Simple steps to help a technician inspect safely and treat the right areas.",
    body: "Clear access to affected rooms, note where activity has been seen, secure pets where practical and keep any photos or evidence ready for the technician. Treatment-specific safety instructions should always come from the attending technician.",
  },
  {
    title: "Signs You May Have Rodent Activity",
    slug: "signs-of-rodent-activity",
    description: "Common signs that should be logged before requesting rodent support.",
    body: "Droppings, scratching noises, gnaw marks, disturbed insulation and repeated sightings can all indicate rodent activity. A proper inspection should confirm entry points, food sources, harbourage and the safest treatment route.",
  },
  {
    title: "Commercial Pest Control Records To Keep",
    slug: "commercial-pest-control-records",
    description: "A practical record checklist for commercial premises and facilities teams.",
    body: "Commercial sites should keep visit reports, treatment records, product information, proofing recommendations, action logs and follow-up dates. These records support compliance, trend review and clear accountability.",
  },
];

export const adminNav = [
  ["Dashboard", "/admin"],
  ["Search", "/admin/search"],
  ["Leads", "/admin/leads"],
  ["Customers", "/admin/customers"],
  ["Quotes", "/admin/quotes"],
  ["Quote Templates", "/admin/quote-templates"],
  ["Jobs", "/admin/jobs"],
  ["Calendar", "/admin/calendar"],
  ["Reminders", "/admin/reminders"],
  ["Contracts", "/admin/contracts"],
  ["Finance", "/admin/finance"],
  ["Resources", "/admin/resources"],
  ["Documents", "/admin/documents"],
  ["Comms", "/admin/communications"],
  ["Reports", "/admin/reports"],
  ["Audit", "/admin/audit"],
  ["CMS", "/admin/cms"],
  ["Settings", "/admin/settings"],
];
