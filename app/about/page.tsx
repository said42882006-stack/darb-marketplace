export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col gap-4">
      <h1 className="text-3xl font-display font-bold text-navy">عن OTR</h1>
      <p className="text-sm leading-relaxed text-ink">
        OTR منصة إعلانات مبوّبة عُمانية تجمع كل ما يُؤجَّر أو يُنقَل في مكان واحد: منازل، سيارات، شاليهات، منتجعات،
        دراجات، وقوارب — إضافة لخدمات الشاحنات ونقل النفط والمندوب والتاكسي وتوصيل الطرود.
      </p>
      <p className="text-sm leading-relaxed text-ink">
        فكرتنا بسيطة: تصفّح الإعلان، وتواصل مع المعلن مباشرة عبر الاتصال أو واتساب دون وسيط ودون رسوم على المعاملة
        نفسها. المنصة تعتمد على اشتراكات النشر فقط — لا عمولة على الحجز أو الإيجار.
      </p>
      <p className="text-sm leading-relaxed text-ink">
        كل مستخدم يحصل على 3 إعلانات مجانية عند التسجيل، وبعدها يمكنه الاشتراك بباقة شهرية أو سنوية للنشر غير المحدود.
      </p>
      <p className="text-sm leading-relaxed text-muted">
        لأي استفسار أو ملاحظة، يسعدنا تواصلك معنا عبر{" "}
        <a href="/contact" className="text-teal font-bold underline">صفحة التواصل</a>.
      </p>
    </div>
  );
}
