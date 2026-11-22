/**
 * Seeds the catalog taxonomy (categories + business types), and the owner account when asked. No products.
 * Idempotent: safe to re-run, it updates instead of duplicating.
 *
 *   npm run prisma:seed                                           → taxonomy only
 *   OWNER_EMAIL=… OWNER_PASSWORD=… npm run prisma:seed            → also creates/resets the owner
 *
 * The owner's credentials come from the command line only, so the password never lands in a file.
 */
import { PrismaClient } from "@prisma/client";
import { PASSWORD_MIN_LENGTH } from "../src/modules/auth/domain/password-policy";
import { BcryptPasswordHasher } from "../src/modules/auth/infrastructure/bcrypt-password-hasher";

const prisma = new PrismaClient();

type Name = { slug: string; en: string; ar: string };

/**
 * Main categories in display order: butchery first (our lead line), then the big, high-value equipment (cooking, frying, dishwashing,
 * refrigeration), small preparation items last. Each with its subcategories and the code prefix
 * of its products (e.g. "FRY" → GS-FRY-0001). Never change a prefix once products use it.
 */
const categories: Array<Name & { code: string; children: Name[] }> = [
  {
    slug: "butchery", code: "BCH", en: "Butchery", ar: "معدات الملاحم",
    children: [
      { slug: "bone-saws", en: "Bone saws", ar: "مناشير عظم" },
      { slug: "mincers", en: "Mincers", ar: "فرّامات" },
      { slug: "bowl-cutters", en: "Bowl cutters", ar: "كترات" },
      { slug: "sausage-machines", en: "Sausage machines", ar: "ماكينات نقانق" },
    ],
  },
  {
    slug: "cooking", code: "COK", en: "Cooking", ar: "معدات الطبخ",
    children: [
      { slug: "cooking-lines", en: "Cooking lines", ar: "خطوط طبخ" },
      { slug: "grills", en: "Grills", ar: "شوايات" },
      { slug: "griddles", en: "Griddles", ar: "صاجات" },
    ],
  },
  {
    slug: "frying", code: "FRY", en: "Frying", ar: "القلي",
    children: [
      { slug: "open-fryers", en: "Open fryers", ar: "قلايات مفتوحة" },
      { slug: "pressure-fryers", en: "Pressure fryers", ar: "قلايات ضغط" },
    ],
  },
  {
    slug: "dishwashing", code: "DSH", en: "Dishwashing", ar: "الغسيل",
    children: [
      { slug: "dishwashers", en: "Dishwashers", ar: "غسالات صحون" },
      { slug: "sinks", en: "Sinks", ar: "مغاسل" },
    ],
  },
  {
    slug: "refrigeration", code: "REF", en: "Refrigeration", ar: "التبريد",
    children: [
      { slug: "refrigerators", en: "Refrigerators", ar: "ثلاجات" },
      { slug: "freezers", en: "Freezers", ar: "فريزرات" },
      { slug: "cold-rooms", en: "Cold rooms", ar: "غرف تبريد" },
    ],
  },
  {
    slug: "ovens", code: "OVN", en: "Ovens", ar: "الأفران",
    children: [
      { slug: "convection-ovens", en: "Convection ovens", ar: "أفران كونفكشن" },
      { slug: "combi-ovens", en: "Combi ovens", ar: "أفران كومبي" },
      { slug: "rack-ovens", en: "Rack ovens", ar: "أفران دوّارة" },
    ],
  },
  {
    slug: "display", code: "DSP", en: "Display", ar: "العرض",
    children: [
      { slug: "gelato-showcases", en: "Gelato showcases", ar: "واجهات جيلاتو" },
      { slug: "pastry-displays", en: "Pastry displays", ar: "واجهات حلويات" },
      { slug: "meat-counters", en: "Refrigerated displays", ar: "واجهات عرض مبردة" },
    ],
  },
  {
    slug: "holding", code: "HLD", en: "Holding & warming", ar: "الحفظ والتسخين",
    children: [
      { slug: "food-warmers", en: "Food warmers", ar: "وورمرات" },
      { slug: "holding-cabinets", en: "Holding cabinets", ar: "خزائن حفظ" },
    ],
  },
  {
    slug: "stainless", code: "STL", en: "Stainless steel", ar: "الستانلس",
    children: [
      { slug: "work-tables", en: "Work tables", ar: "طاولات عمل" },
      { slug: "shelving", en: "Shelving", ar: "رفوف" },
      { slug: "hoods", en: "Extraction hoods", ar: "شفّاطات" },
    ],
  },
  {
    slug: "preparation", code: "PRP", en: "Preparation", ar: "التحضير",
    children: [
      { slug: "mixers", en: "Mixers", ar: "عجّانات" },
      { slug: "slicers", en: "Slicers", ar: "قطّاعات" },
      { slug: "breading-tables", en: "Breading tables", ar: "طاولات تتبيل" },
      { slug: "potato-peelers", en: "Potato peelers", ar: "مقشرات بطاطا" },
      { slug: "vegetable-cutters", en: "Vegetable cutters", ar: "قطّاعات خضار" },
      { slug: "vegetable-dryers", en: "Spin dryers", ar: "مجففات خضار" },
      { slug: "vegetable-washers", en: "Vegetable washers", ar: "غسالات خضار" },
      { slug: "soy-milk-machines", en: "Soy milk machines", ar: "ماكينات حليب الصويا" },
    ],
  },
];

/** Each venue with the subcategories (slugs) shown on its page, in the order they appear there. */
const businessTypes: Array<Name & { categories: string[] }> = [
  {
    slug: "fried-chicken", en: "Fried chicken", ar: "مطاعم البروستد",
    categories: ["breading-tables", "pressure-fryers", "open-fryers", "food-warmers", "holding-cabinets", "refrigerators", "freezers", "sinks", "work-tables", "hoods"],
  },
  {
    slug: "burger", en: "Burger", ar: "مطاعم البرجر",
    categories: ["slicers", "griddles", "grills", "open-fryers", "food-warmers", "refrigerators", "freezers", "sinks", "work-tables", "hoods"],
  },
  {
    slug: "central-kitchen", en: "Central kitchen", ar: "المطابخ المركزية",
    categories: ["mixers", "mincers", "slicers", "cooking-lines", "grills", "griddles", "combi-ovens", "convection-ovens", "holding-cabinets", "refrigerators", "freezers", "cold-rooms", "dishwashers", "sinks", "work-tables", "shelving", "hoods"],
  },
  {
    slug: "hotel", en: "Hotels & large kitchens", ar: "الفنادق والمطابخ الكبيرة",
    categories: ["mixers", "slicers", "cooking-lines", "grills", "combi-ovens", "convection-ovens", "food-warmers", "holding-cabinets", "refrigerators", "freezers", "cold-rooms", "pastry-displays", "dishwashers", "sinks", "work-tables", "shelving", "hoods"],
  },
  {
    slug: "bakery", en: "Bakery", ar: "المخابز",
    categories: ["mixers", "rack-ovens", "convection-ovens", "refrigerators", "freezers", "pastry-displays", "work-tables", "shelving"],
  },
  {
    slug: "gelato", en: "Gelato & pastry", ar: "الجيلاتو والحلويات",
    categories: ["mixers", "convection-ovens", "refrigerators", "freezers", "gelato-showcases", "pastry-displays", "sinks", "work-tables"],
  },
  {
    slug: "butchery", en: "Butchery", ar: "الملاحم",
    categories: ["bone-saws", "mincers", "bowl-cutters", "sausage-machines", "meat-counters", "work-tables", "sinks", "freezers", "cold-rooms"],
  },
  {
    slug: "supermarket", en: "Supermarket", ar: "السوبرماركت",
    categories: ["refrigerators", "freezers", "cold-rooms", "meat-counters", "pastry-displays", "shelving"],
  },
  {
    slug: "coffee-shop", en: "Coffee shop", ar: "الكوفي شوب",
    categories: ["convection-ovens", "refrigerators", "pastry-displays", "dishwashers", "sinks", "work-tables"],
  },
];

/**
 * Subcategory order is `parent position × 100 + own position`, so sorting subcategories alone
 * still follows the main-category order when a page lists subcategories from several main categories.
 */
async function seedCategories() {
  for (const [i, main] of categories.entries()) {
    const parentOrder = (i + 1) * 100;
    const parent = await prisma.category.upsert({
      where: { slug: main.slug },
      update: { nameEn: main.en, nameAr: main.ar, sortOrder: parentOrder, codePrefix: main.code, parentId: null },
      create: { slug: main.slug, nameEn: main.en, nameAr: main.ar, sortOrder: parentOrder, codePrefix: main.code },
    });

    for (const [j, child] of main.children.entries()) {
      const data = { nameEn: child.en, nameAr: child.ar, sortOrder: parentOrder + j + 1, parentId: parent.id };
      await prisma.category.upsert({ where: { slug: child.slug }, update: data, create: { slug: child.slug, ...data } });
    }
  }
}

/** Upserts each venue and makes its category links match the list above: same categories, same order. */
async function seedBusinessTypes() {
  const categoryIds = new Map((await prisma.category.findMany({ select: { id: true, slug: true } })).map((c) => [c.slug, c.id]));

  for (const [i, type] of businessTypes.entries()) {
    const data = { nameEn: type.en, nameAr: type.ar, sortOrder: i + 1 };
    const row = await prisma.businessType.upsert({ where: { slug: type.slug }, update: data, create: { slug: type.slug, ...data } });

    const ids = type.categories.map((slug) => {
      const categoryId = categoryIds.get(slug);
      if (!categoryId) throw new Error(`Business type "${type.slug}" lists unknown category "${slug}"`);
      return categoryId;
    });
    await prisma.$transaction([
      prisma.businessTypeCategory.deleteMany({ where: { businessTypeId: row.id, categoryId: { notIn: ids } } }),
      ...ids.map((categoryId, position) =>
        prisma.businessTypeCategory.upsert({
          where: { businessTypeId_categoryId: { businessTypeId: row.id, categoryId } },
          update: { sortOrder: position + 1 },
          create: { businessTypeId: row.id, categoryId, sortOrder: position + 1 },
        }),
      ),
    ]);
  }
}

/** Returns the owner's email when one was created, or null when no credentials were passed. */
async function seedOwner(): Promise<string | null> {
  const email = process.env.OWNER_EMAIL?.trim().toLowerCase();
  const password = process.env.OWNER_PASSWORD;
  if (!email || !password) return null;
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new Error(`OWNER_PASSWORD must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }

  const passwordHash = await new BcryptPasswordHasher().hash(password);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, role: "owner" },
    create: { email, passwordHash, name: "Owner", role: "owner" },
  });
  return email;
}

async function main() {
  await seedCategories();
  await seedBusinessTypes();
  const owner = await seedOwner();
  console.log(`Seed complete: categories, business types${owner ? `, owner ${owner}` : ""}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
