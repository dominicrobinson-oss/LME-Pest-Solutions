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
};

export const services = [
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
  "Commercial Pest Control",
  "Emergency Pest Control",
].map((name) => ({
  name,
  slug: slugify(name),
  intro: `Professional ${name.toLowerCase()} for homes and businesses across Manchester and the North West.`,
}));

export const homeMaintenanceServices = [
  "Gutter Removal & Installation",
  "Gutter Cleaning",
  "Powerwashing",
  "Window Cleaning",
  "Garden Maintenance",
  "Hygiene Clean & Steam Treatment",
  "Faeces Removal",
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

export const specialistServiceContent: Record<
  string,
  {
    intro: string;
    signs: string[];
    risks: string[];
    treatment: string;
    inspectionProcess: string;
    treatmentOptions: string[];
    preventionAdvice: string[];
  }
> = {
  "bird-spiking": {
    intro: "Bird spiking creates a physical deterrent that stops pigeons and gulls landing and roosting on ledges, roof lines and signage.",
    signs: ["Birds regularly landing on ledges, signage or roof lines", "Droppings and nesting debris building up on flat surfaces", "Noise or mess complaints from neighbouring units"],
    risks: ["Droppings can damage roofing, guttering and render", "Slip hazards from fouling on walkways", "Nesting material can block gutters and drainage"],
    treatment: "Anti-roosting spikes are fitted to the specific ledges, signage or roofline sections birds are using, sized and spaced to the surface without harming birds.",
    inspectionProcess: "A technician surveys the affected elevations, identifies landing and roosting points, and confirms access and fixing methods before quoting.",
    treatmentOptions: ["Stainless steel or polycarbonate anti-roosting spikes", "Fixing to ledges, signage, solar panels and roofline", "Combined with proofing or netting where needed"],
    preventionAdvice: ["Keep ledges and roof areas clear of nesting debris", "Address roosting activity early, before nests establish", "Combine with solar panel bird proofing on exposed panel arrays"],
  },
  "solar-panel-bird-proofing": {
    intro: "Solar panel bird proofing stops pigeons and gulls nesting underneath panel arrays, protecting cabling and reducing fire and pest risks.",
    signs: ["Birds seen entering or leaving gaps under panels", "Droppings around the base of the array", "Nesting material or feathers visible at panel edges"],
    risks: ["Nesting material and droppings can damage cabling and inverters", "Fire risk from nesting debris close to electrical components", "Reduced panel performance from debris and corrosive droppings"],
    treatment: "A weatherproof mesh proofing kit is fitted around the perimeter of the panel array, sealing the gaps birds use to access the underside while maintaining airflow.",
    inspectionProcess: "A technician checks the array for existing nesting activity, measures the perimeter, and confirms safe access before any mesh is fitted.",
    treatmentOptions: ["Full perimeter mesh proofing kits", "Safe removal of existing nests where present", "Clean-up of droppings and debris before fitting"],
    preventionAdvice: ["Have proofing fitted before nesting season begins", "Check panel arrays periodically for gaps or damaged mesh", "Report any cabling damage to your installer promptly"],
  },
  "rifle-work": {
    intro: "Rifle work is a controlled, licensed method used for outdoor pest bird and grey squirrel control on sites where other methods are not effective.",
    signs: ["Persistent pest bird or grey squirrel activity across open or agricultural land", "Other control methods proving insufficient on their own", "Sites where controlled shooting is a legally permitted option"],
    risks: ["Ongoing crop, structural or feed contamination from pest activity", "Disease and hygiene risks from large pest populations", "Property, stock or building damage where activity is left unmanaged"],
    treatment: "Controlled shooting is carried out only by licensed, insured technicians, in line with firearms legislation, land access agreements and wildlife protection law.",
    inspectionProcess: "A technician assesses the site, confirms this is a legally permitted and appropriate method for the location, and agrees safe zones, timing and access with the landowner before any work begins.",
    treatmentOptions: ["Site assessment and legal suitability check", "Controlled shooting by licensed technicians only", "Combined with proofing, trapping or habitat management where appropriate"],
    preventionAdvice: ["Only used on suitable outdoor sites with landowner agreement", "Most effective alongside long-term proofing or habitat management", "Always carried out within firearms and wildlife legislation"],
  },
};

export const trustBadges = [
  { label: "RSPH Certified", icon: "shield" as const },
  { label: "BPCA Member", icon: "badge" as const },
  { label: "Fully Insured", icon: "shield-check" as const },
  { label: "5-Star Rated on Google", icon: "star" as const },
];

export const heroStats = [
  { label: "Years Experience", value: "10+", icon: "users" as const },
  { label: "Fast Response", value: "30-90 Mins", icon: "clock" as const },
  { label: "Certified Technicians", value: "Fully", icon: "shield-check" as const },
  { label: "Guaranteed Results", value: "100%", icon: "check" as const },
];

export const trustPartners = [
  { label: "Google Reviews", icon: "google" as const },
  { label: "Checkatrade", icon: "checkatrade" as const },
  { label: "Trustpilot", icon: "trustpilot" as const },
  { label: "RSPH Certified", icon: "rsph" as const },
  { label: "24/7 Service", icon: "clock" as const },
];

export const pestFacts = [
  "A single rat can squeeze through a gap the size of a 50p coin.",
  "A female house mouse can produce up to 60 offspring a year.",
  "German cockroaches can survive for a month without food.",
  "Bed bugs can go without feeding for several months while staying active.",
  "Wasp nests are usually abandoned by late autumn but can hold thousands of wasps at their peak.",
  "Grey squirrels can chew through timber, lead flashing and even electrical cabling to get into a loft.",
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
    answer: "No. Accreditation badges shown on the site (RSPH, BPCA, insurance, Google rating) are only published once verified. Individual customer review quotes and counts stay hidden until confirmed in admin settings.",
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
