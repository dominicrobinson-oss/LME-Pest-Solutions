const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../src/generated/prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/lme_pest_solutions",
  }),
});

const services = [
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
];

const locations = [
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
];

const adviceArticles = [
  {
    title: "How To Prepare For A Pest Control Visit",
    slug: "advice-prepare-for-pest-control-visit",
    metaDescription: "Simple steps to help a technician inspect safely and treat the right areas.",
    body: "Clear access to affected rooms, note where activity has been seen, secure pets where practical and keep any photos or evidence ready for the technician.\n\nTreatment-specific safety instructions should always come from the attending technician.",
  },
  {
    title: "Signs You May Have Rodent Activity",
    slug: "advice-signs-of-rodent-activity",
    metaDescription: "Common signs that should be logged before requesting rodent support.",
    body: "Droppings, scratching noises, gnaw marks, disturbed insulation and repeated sightings can all indicate rodent activity.\n\nA proper inspection should confirm entry points, food sources, harbourage and the safest treatment route.",
  },
  {
    title: "Commercial Pest Control Records To Keep",
    slug: "advice-commercial-pest-control-records",
    metaDescription: "A practical record checklist for commercial premises and facilities teams.",
    body: "Commercial sites should keep visit reports, treatment records, product information, proofing recommendations, action logs and follow-up dates.\n\nThese records support compliance, trend review and clear accountability.",
  },
];

const slugify = (value) =>
  value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function main() {
  const adminEmail = process.env.ADMIN_SEED_EMAIL || "admin@lme.local";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: "SUPER_ADMIN", status: "ACTIVE" },
    create: { email: adminEmail, name: "LME Admin", passwordHash, role: "SUPER_ADMIN" },
  });

  await prisma.user.upsert({
    where: { email: "owner@lme.local" },
    update: { passwordHash, role: "SUPER_ADMIN", status: "ACTIVE", emailVerified: new Date() },
    create: { email: "owner@lme.local", name: "LME Owner Review", passwordHash, role: "SUPER_ADMIN", emailVerified: new Date() },
  });

  const technician = await prisma.user.upsert({
    where: { email: "technician@lme.local" },
    update: { passwordHash, role: "TECHNICIAN", status: "ACTIVE" },
    create: { email: "technician@lme.local", name: "Sample Technician", passwordHash, role: "TECHNICIAN" },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: "customer@lme.local" },
    update: { passwordHash, role: "CUSTOMER", status: "ACTIVE", emailVerified: new Date() },
    create: { email: "customer@lme.local", name: "Sample Customer", passwordHash, role: "CUSTOMER", emailVerified: new Date() },
  });

  await prisma.staffProfile.upsert({
    where: { userId: technician.id },
    update: { skills: ["Rodents", "Wasps", "Inspections"], coverageAreas: ["Manchester", "Salford"] },
    create: {
      userId: technician.id,
      phone: "07301 113 276",
      skills: ["Rodents", "Wasps", "Inspections"],
      qualifications: [],
      coverageAreas: ["Manchester", "Salford"],
    },
  });

  for (const name of services) {
    await prisma.service.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: {
        name,
        slug: slugify(name),
        seoTitle: `${name} in Manchester | LME Pest Solutions`,
        metaDescription: `Request professional ${name.toLowerCase()} across Manchester and the North West from LME Pest Solutions.`,
        intro: `Professional ${name.toLowerCase()} for homes and businesses across Manchester and the North West.`,
        signs: ["Sightings or activity", "Droppings, damage or nesting evidence", "Unusual smells, noise or bite marks"],
        risks: ["Property damage", "Health and hygiene concerns", "Spread to neighbouring areas if untreated"],
        treatment: "LME records the inspection, recommends a suitable treatment plan and schedules follow-up support where needed.",
        inspectionProcess: "A technician checks access points, harbourage areas, activity levels and customer safety considerations before recommending next steps.",
        treatmentOptions: ["Inspection and advice", "Targeted treatment", "Proofing and prevention", "Follow-up visit"],
        preventionAdvice: ["Remove food sources", "Seal access points", "Monitor activity", "Book follow-up where recommended"],
      },
    });
  }

  for (const name of locations) {
    await prisma.serviceArea.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name), region: "North West England", active: true },
    });
    await prisma.locationPage.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: {
        locationName: name,
        slug: slugify(name),
        countyOrRegion: "North West England",
        pageTitle: `Pest Control ${name}`,
        metaTitle: `Pest Control ${name} | LME Pest Solutions`,
        metaDescription: `Local pest control enquiries for ${name}. Request a quote from LME Pest Solutions.`,
        canonicalPath: `/pest-control/${slugify(name)}`,
        ogTitle: `Pest Control ${name} | LME Pest Solutions`,
        ogDescription: `Local pest control enquiries for ${name}. Request a quote from LME Pest Solutions.`,
        heroCopy: `Pest control support for residential and commercial properties in ${name}.`,
        localIntro: `Local pest control support for homes and businesses in ${name}.`,
        mainContent: `This page is ready for unique local content managed in the admin CMS. It should describe real coverage, common local property types, and the services LME currently offers in ${name}.`,
        commonPestIssues: ["Rodent activity", "Wasp nests", "Stored product and hygiene pests"],
        residentialNotes: `Residential notes for ${name} can be expanded with verified local service details.`,
        commercialNotes: `Commercial notes for ${name} can be expanded with verified contract and site visit coverage.`,
        nearbyAreas: locations.filter((area) => area !== name).slice(0, 4),
        availableServices: services.slice(0, 8),
        ctaCopy: `Request pest control support in ${name}.`,
      },
    });
  }

  await prisma.fAQ.createMany({
    data: [
      { category: "Quotes", question: "How quickly will you respond?", answer: "LME aims to respond quickly, with same-day callouts available where capacity allows." },
      { category: "Treatment", question: "Do I need to leave the property?", answer: "That depends on the treatment. Safety instructions are recorded on the treatment report." },
      { category: "Commercial", question: "Can you support multiple sites?", answer: "Yes, commercial accounts can hold multiple sites, scheduled visits and visit reports." },
    ],
    skipDuplicates: true,
  });

  for (const article of adviceArticles) {
    await prisma.contentPage.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        metaTitle: `${article.title} | LME Pest Solutions`,
        metaDescription: article.metaDescription,
        canonicalPath: `/advice/${article.slug.replace(/^advice-/, "")}`,
        body: article.body,
        status: "PUBLISHED",
      },
      create: {
        slug: article.slug,
        title: article.title,
        metaTitle: `${article.title} | LME Pest Solutions`,
        metaDescription: article.metaDescription,
        canonicalPath: `/advice/${article.slug.replace(/^advice-/, "")}`,
        body: article.body,
        status: "PUBLISHED",
      },
    });
  }

  const customer = await prisma.customer.upsert({
    where: { customerNumber: "LME-CUS-2026-0001" },
    update: { userId: customerUser.id },
    create: {
      customerNumber: "LME-CUS-2026-0001",
      userId: customerUser.id,
      name: "Sample Customer",
      email: "customer@example.com",
      phone: "07301 113 276",
      customerType: "Residential",
    },
  });

  let property = await prisma.property.findFirst({
    where: { customerId: customer.id, postcode: "M1 1AA", propertyName: "Home" },
  });
  if (!property) {
    property = await prisma.property.create({
      data: {
        customerId: customer.id,
        propertyName: "Home",
        address: "Manchester",
        postcode: "M1 1AA",
        propertyType: "House",
      },
    });
  }

  const lead = await prisma.lead.upsert({
    where: { leadNumber: "LME-LEAD-2026-0001" },
    update: {
      customerId: customer.id,
      propertyId: property.id,
      customerName: customer.name,
      email: customer.email,
      phone: customer.phone || "07301 113 276",
      postcode: "M1 1AA",
      pestType: "Rat Control",
      propertyType: "Domestic",
      urgency: "This week",
      preferredContactMethod: "Phone",
      description: "Sample development lead.",
      consentText: "Development seed consent record.",
    },
    create: {
      leadNumber: "LME-LEAD-2026-0001",
      customerId: customer.id,
      propertyId: property.id,
      customerName: customer.name,
      email: customer.email,
      phone: customer.phone || "07301 113 276",
      postcode: "M1 1AA",
      pestType: "Rat Control",
      propertyType: "Domestic",
      urgency: "This week",
      preferredContactMethod: "Phone",
      description: "Sample development lead.",
      consentText: "Development seed consent record.",
      consentRecords: {
        create: {
          type: "Quote enquiry",
          text: "Development seed consent record.",
          granted: true,
        },
      },
    },
  });

  const quote = await prisma.quote.upsert({
    where: { quoteNumber: "LME-QTE-2026-0001" },
    update: {
      customerId: customer.id,
      propertyId: property.id,
      leadId: lead.id,
      pestType: "Rat Control",
      title: "Initial rodent inspection and treatment",
      status: "SENT",
      subtotal: 150,
      total: 150,
    },
    create: {
      quoteNumber: "LME-QTE-2026-0001",
      customerId: customer.id,
      propertyId: property.id,
      leadId: lead.id,
      pestType: "Rat Control",
      title: "Initial rodent inspection and treatment",
      status: "SENT",
      subtotal: 150,
      total: 150,
      items: {
        create: [{ description: "Inspection and initial treatment", quantity: 1, unitPrice: 150, total: 150 }],
      },
    },
  });

  const scheduledStart = new Date();
  scheduledStart.setDate(scheduledStart.getDate() + 1);
  const scheduledEnd = new Date();
  scheduledEnd.setDate(scheduledEnd.getDate() + 1);
  scheduledEnd.setHours(scheduledEnd.getHours() + 2);

  const job = await prisma.job.upsert({
    where: { jobNumber: "LME-JOB-2026-0001" },
    update: {
      customerId: customer.id,
      propertyId: property.id,
      quoteId: quote.id,
      pestType: "Rat Control",
      jobType: "Initial treatment",
      status: "SCHEDULED",
      scheduledStart,
      scheduledEnd,
    },
    create: {
      jobNumber: "LME-JOB-2026-0001",
      customerId: customer.id,
      propertyId: property.id,
      quoteId: quote.id,
      pestType: "Rat Control",
      jobType: "Initial treatment",
      status: "SCHEDULED",
      scheduledStart,
      scheduledEnd,
      assignments: { create: [{ userId: technician.id }] },
    },
  });

  await prisma.jobAssignment.upsert({
    where: { jobId_userId: { jobId: job.id, userId: technician.id } },
    update: {},
    create: { jobId: job.id, userId: technician.id },
  });

  await prisma.invoice.upsert({
    where: { invoiceNumber: "LME-INV-2026-0001" },
    update: {
      customerId: customer.id,
      quoteId: quote.id,
      jobId: job.id,
      subtotal: 150,
      total: 150,
      amountOutstanding: 150,
      status: "SENT",
    },
    create: {
      invoiceNumber: "LME-INV-2026-0001",
      customerId: customer.id,
      quoteId: quote.id,
      jobId: job.id,
      subtotal: 150,
      total: 150,
      amountOutstanding: 150,
      status: "SENT",
      items: { create: [{ description: "Inspection and initial treatment", quantity: 1, unitPrice: 150, total: 150 }] },
    },
  });

  for (const name of ["Chemicals", "Traps and bait", "PPE", "Equipment", "Vehicle fuel", "Vehicle maintenance", "Insurance", "Advertising", "Software", "Phone", "Office", "Training", "Subcontractor", "Travel", "Uniform", "Other"]) {
    await prisma.expenseCategory.upsert({ where: { name }, update: {}, create: { name } });
  }

  await prisma.businessSetting.upsert({
    where: { key: "business.identity" },
    update: {},
    create: {
      key: "business.identity",
      value: {
        businessName: "LME Pest Solutions",
        primaryArea: "Manchester",
        coverage: "North West England",
        phone: "07301 113 276",
        logoPlaceholder: true,
      },
    },
  });

  console.log(`Seed complete. Development admin: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
