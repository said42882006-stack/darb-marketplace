import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_PHONE = "91234567"; // demo contact number used across all seed listings

async function main() {
  await prisma.listing.deleteMany();

  await prisma.listing.createMany({
    data: [
      { category: "real_estate", title: "شقة عائلية مفروشة - القرم", description: "شقة واسعة من 3 غرف مع مطبخ مجهز بالكامل وموقف خاص، قريبة من الخدمات والأسواق.", price: 22, location: "مسقط، القرم", featured: true, ownerPhone: DEMO_PHONE },
      { category: "real_estate", title: "فيلا مستقلة بحديقة - المعبيلة", description: "فيلا من 5 غرف مع حديقة خاصة ومسبح، مناسبة للعائلات الكبيرة والمناسبات.", price: 65, location: "مسقط، المعبيلة", ownerPhone: DEMO_PHONE },
      { category: "land", title: "أرض سكنية للإيجار طويل الأمد - بركاء", description: "قطعة أرض مسوّرة بمساحة جيدة، مناسبة للتخزين أو الاستخدام المؤقت.", price: 15, location: "بركاء", ownerPhone: DEMO_PHONE },
      { category: "cars", title: "تويوتا كامري 2024", description: "سيارة نظيفة بحالة ممتازة، تأمين شامل، تسليم واستلام مجاني داخل المدينة.", price: 18, location: "صحار", featured: true, ownerPhone: DEMO_PHONE },
      { category: "cars", title: "هيونداي النترا 2023", description: "اقتصادية بالبنزين، مناسبة للاستخدام اليومي داخل المدينة.", price: 12, location: "مسقط", ownerPhone: DEMO_PHONE },
      { category: "chalets", title: "شاليه على الواجهة البحرية - صور", description: "شاليه خاص بمسبح ومنطقة شواء، إطلالة مباشرة على البحر وهدوء تام.", price: 90, location: "صور", featured: true, ownerPhone: DEMO_PHONE },
      { category: "resorts", title: "منتجع صلالة السياحي", description: "منتجع متكامل بشاطئ خاص وغرف فاخرة وخدمة نشاطات مائية على مدار اليوم.", price: 120, location: "صلالة", featured: true, ownerPhone: DEMO_PHONE },
      { category: "hotels", title: "فندق أعمال - وسط مسقط", description: "غرف فندقية مجهزة بالكامل، قريبة من المراكز التجارية ومناسبة لرجال الأعمال.", price: 35, location: "مسقط، الخوير", ownerPhone: DEMO_PHONE },
      { category: "transport", title: "نقل أثاث - شاحنة كبيرة", description: "خدمة نقل عفش كاملة مع عمالة فنية وتغليف آمن للقطع الحساسة.", price: 25, fromPlace: "مسقط", toPlace: "نزوى", ownerPhone: DEMO_PHONE },
      { category: "mandoob", title: "مندوب مشاوير وطلبات", description: "تنفيذ مشاويرك اليومية: تسوق، أوراق رسمية، استلام وتوصيل طلبات.", price: 2, location: "مسقط", ownerPhone: DEMO_PHONE },
      { category: "bikes", title: "دراجة هوائية جبلية للإيجار", description: "دراجة بحالة ممتازة مناسبة للمسارات الجبلية والاستخدام اليومي.", price: 3, location: "نزوى", ownerPhone: DEMO_PHONE },
      { category: "boats", title: "قارب صيد وترفيه", description: "قارب مجهز لرحلات الصيد والنزهات البحرية، يتسع لـ6 أشخاص.", price: 40, location: "مسقط، مارينا بندر الروضة", featured: true, ownerPhone: DEMO_PHONE },
      { category: "cranes", title: "رافعة شوكية للإيجار", description: "رافعة بحالة ممتازة مناسبة لمواقع البناء والمستودعات، مع سائق مرخّص.", price: 45, location: "صحار", ownerPhone: DEMO_PHONE },
      { category: "heavy_equipment", title: "حفارة صغيرة للإيجار", description: "معدة ثقيلة مناسبة لأعمال الحفر والتسوية بمواقع البناء الصغيرة والمتوسطة.", price: 55, location: "مسقط", ownerPhone: DEMO_PHONE },
      { category: "caravan", title: "كرفان مجهز للرحلات البرية", description: "كرفان كامل التجهيز بمطبخ صغير وسرير، مناسب لرحلات التخييم العائلية.", price: 30, location: "نزوى", ownerPhone: DEMO_PHONE },
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
