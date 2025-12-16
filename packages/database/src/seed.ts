import { prisma } from "./client";

/**
 * Document types to seed.
 */
const DOCUMENT_TYPES = [
  { code: "CPF", name: "CPF" },
  // Future document types:
  // { code: "RG", name: "RG" },
  // { code: "PASSPORT", name: "Passaporte" },
];

async function seedDocumentTypes() {
  console.log("Seeding document types...");

  for (const docType of DOCUMENT_TYPES) {
    await prisma.documentType.upsert({
      where: { code: docType.code },
      update: { name: docType.name },
      create: docType,
    });
  }

  console.log(`Seeded ${DOCUMENT_TYPES.length} document type(s)`);
}

(async () => {
  try {
    await seedDocumentTypes();
    console.log("Seed completed successfully");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
