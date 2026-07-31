import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.listing.deleteMany();

  await prisma.listing.createMany({
    data: [
      { category: "homes", title: "شقة عائلية مفروشة - حي النرجس", description: "شقة واسعة من 3 غرف مع مطبخ مجهز بالكامل وموقف خاص، قريبة من الخدمات والأسواق.", price: 220, location: "الرياض، حي النرجس", featured: true },
      { category: "homes", title: "فيلا مستقلة بحديقة - حي الياسمين", description: "فيلا من 5 غرف مع حديقة خاصة ومسبح، مناسبة للعائلات الكبيرة والمناسبات.", price: 650, location: "الرياض، حي الياسمين" },
      { category: "homes", title: "استوديو حديث قرب الحرم", description: "استوديو مؤثث بالكامل مع خدمة تنظيف أسبوعية، على بعد 5 دقائق من الحرم.", price: 300, location: "مكة المكرمة" },
      { category: "cars", title: "تويوتا كامري 2024", description: "سيارة نظيفة بحالة ممتازة، تأمين شامل، تسليم واستلام مجاني داخل المدينة.", price: 180, location: "جدة" },
      { category: "cars", title: "GMC يوكن 2023", description: "دفع رباعي فاخر بسعة تسع ركاب، مناسبة للرحلات العائلية والسفر البري.", price: 350, location: "الدمام", featured: true },
      { category: "cars", title: "هيونداي النترا 2023", description: "اقتصادية بالبنزين، مناسبة للاستخدام اليومي داخل المدينة.", price: 120, location: "الرياض" },
      { category: "chalets", title: "شاليه على الواجهة البحرية", description: "شاليه خاص بمسبح ومنطقة شواء، إطلالة مباشرة على البحر وهدوء تام.", price: 900, location: "جدة، طريق الكورنيش" },
      { category: "chalets", title: "شاليه عائلي - طريق الخرج", description: "شاليه هادئ بحديقة ومسبح صغير، مناسب للتجمعات العائلية الأسبوعية.", price: 400, location: "الرياض، طريق الخرج" },
      { category: "resorts", title: "منتجع البحر الأحمر", description: "منتجع متكامل بشاطئ خاص وغرف فاخرة وخدمة نشاطات مائية على مدار اليوم.", price: 1200, location: "ينبع", featured: true },
      { category: "resorts", title: "منتجع الواحة الجبلي", description: "أجواء جبلية هادئة مع أجنحة مستقلة ومطعم داخلي وجلسات خارجية.", price: 750, location: "الطائف" },
      { category: "delivery", title: "نقل أثاث - شاحنة كبيرة", description: "خدمة نقل عفش كاملة مع عمالة فنية وتغليف آمن للقطع الحساسة.", price: 250, fromPlace: "الرياض", toPlace: "القصيم" },
      { category: "delivery", title: "توصيل طرود سريع", description: "توصيل خلال نفس اليوم داخل المدينة، مع تتبع مباشر لحالة الشحنة.", price: 35, fromPlace: "حي العليا", toPlace: "حي الملز" },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
