import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_PHONE = "91234567"; // demo contact number used across all seed listings

async function main() {
  await prisma.listing.deleteMany();

  await prisma.listing.createMany({
    data: [
      { category: "homes", title: "شقة عائلية مفروشة - القرم", description: "شقة واسعة من 3 غرف مع مطبخ مجهز بالكامل وموقف خاص، قريبة من الخدمات والأسواق.", price: 22, location: "مسقط، القرم", featured: true, ownerPhone: DEMO_PHONE },
      { category: "homes", title: "فيلا مستقلة بحديقة - المعبيلة", description: "فيلا من 5 غرف مع حديقة خاصة ومسبح، مناسبة للعائلات الكبيرة والمناسبات.", price: 65, location: "مسقط، المعبيلة", ownerPhone: DEMO_PHONE },
      { category: "cars", title: "تويوتا كامري 2024", description: "سيارة نظيفة بحالة ممتازة، تأمين شامل، تسليم واستلام مجاني داخل المدينة.", price: 18, location: "صحار", featured: true, ownerPhone: DEMO_PHONE },
      { category: "cars", title: "هيونداي النترا 2023", description: "اقتصادية بالبنزين، مناسبة للاستخدام اليومي داخل المدينة.", price: 12, location: "مسقط", ownerPhone: DEMO_PHONE },
      { category: "chalets", title: "شاليه على الواجهة البحرية - صور", description: "شاليه خاص بمسبح ومنطقة شواء، إطلالة مباشرة على البحر وهدوء تام.", price: 90, location: "صور", featured: true, ownerPhone: DEMO_PHONE },
      { category: "resorts", title: "منتجع صلالة السياحي", description: "منتجع متكامل بشاطئ خاص وغرف فاخرة وخدمة نشاطات مائية على مدار اليوم.", price: 120, location: "صلالة", featured: true, ownerPhone: DEMO_PHONE },
      { category: "trucks", title: "نقل أثاث - شاحنة كبيرة", description: "خدمة نقل عفش كاملة مع عمالة فنية وتغليف آمن للقطع الحساسة.", price: 25, fromPlace: "مسقط", toPlace: "نزوى", ownerPhone: DEMO_PHONE },
      { category: "oil_transport", title: "نقل مشتقات نفطية بين المحافظات", description: "ناقلة مرخّصة لنقل الوقود والمشتقات النفطية بمعايير سلامة كاملة.", price: 60, fromPlace: "صحار", toPlace: "مسقط", ownerPhone: DEMO_PHONE },
      { category: "delivery", title: "توصيل طرود سريع", description: "توصيل خلال نفس اليوم داخل المدينة، مع تتبع مباشر لحالة الشحنة.", price: 3, fromPlace: "الخوض", toPlace: "روي", ownerPhone: DEMO_PHONE },
      { category: "mandoob", title: "مندوب مشاوير وطلبات", description: "تنفيذ مشاويرك اليومية: تسوق، أوراق رسمية، استلام وتوصيل طلبات.", price: 2, location: "مسقط", ownerPhone: DEMO_PHONE },
      { category: "taxi", title: "تاكسي خاص داخل مسقط", description: "خدمة توصيل مريحة داخل مسقط والمناطق المجاورة، سائق ملتزم بالمواعيد.", price: 5, location: "مسقط", ownerPhone: DEMO_PHONE },
      { category: "bikes", title: "دراجة هوائية جبلية للإيجار", description: "دراجة بحالة ممتازة مناسبة للمسارات الجبلية والاستخدام اليومي.", price: 3, location: "نزوى", ownerPhone: DEMO_PHONE },
      { category: "boats", title: "قارب صيد وترفيه", description: "قارب مجهز لرحلات الصيد والنزهات البحرية، يتسع لـ6 أشخاص.", price: 40, location: "مسقط، مارينا بندر الروضة", featured: true, ownerPhone: DEMO_PHONE },
      { category: "other", title: "معدات تخييم كاملة للإيجار", description: "خيمة، طاولات، كراسي، ومستلزمات تخييم كاملة لرحلة نهاية الأسبوع.", price: 8, location: "مسقط", ownerPhone: DEMO_PHONE },
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
