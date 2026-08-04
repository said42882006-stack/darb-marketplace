export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col gap-5">
      <h1 className="text-3xl font-display font-bold text-navy">الشروط والأحكام</h1>

      <div className="rounded-xl border border-amber/40 bg-sand p-4 text-xs text-ink leading-relaxed">
        هذا نص عام أولي وليس استشارة قانونية. قبل إطلاق الموقع فعلياً لجمهور حقيقي، يُنصح بمراجعته من محامٍ مختص
        بالقوانين العُمانية (خصوصاً حماية البيانات الشخصية والمعاملات الإلكترونية) وتعديله حسب الحاجة.
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="font-bold text-navy">1. طبيعة المنصة</h2>
        <p className="text-sm leading-relaxed text-ink">
          OTR منصة إعلانات مبوّبة تتيح للمستخدمين نشر إعلانات تأجير أو خدمات نقل والتواصل المباشر فيما بينهم. المنصة
          ليست طرفاً في أي اتفاق أو معاملة تتم بين المعلن والمستأجر أو المستفيد من الخدمة، ولا تتحمّل أي مسؤولية عن
          دقة المعلومات المنشورة أو جودة الخدمة أو حالة العنصر المعروض.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-bold text-navy">2. حسابات المستخدمين</h2>
        <p className="text-sm leading-relaxed text-ink">
          يلتزم المستخدم بتقديم بيانات صحيحة عند التسجيل، بما في ذلك رقم جوال فعّال يُستخدم للتحقق. المستخدم مسؤول
          عن سرية بيانات دخوله وعن أي نشاط يتم عبر حسابه.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-bold text-navy">3. محتوى الإعلانات</h2>
        <p className="text-sm leading-relaxed text-ink">
          يتحمّل المعلن وحده مسؤولية صحة ودقة كل ما ينشره (الوصف، السعر، الصور، بيانات التواصل)، والتزامه بالأنظمة
          المحلية المتعلقة بالنشاط المعلَن عنه. تحتفظ إدارة الموقع بحق إزالة أي إعلان مخالف دون إشعار مسبق.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-bold text-navy">4. الاشتراكات والدفع</h2>
        <p className="text-sm leading-relaxed text-ink">
          الاشتراك مطلوب فقط لنشر إعلانات إضافية بعد استنفاد الإعلانات المجانية، ويُدفع عبر بوابة دفع خارجية آمنة.
          لا تفرض المنصة أي رسوم على معاملات الحجز أو الإيجار نفسها بين المستخدمين.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-bold text-navy">5. حدود المسؤولية</h2>
        <p className="text-sm leading-relaxed text-ink">
          يستخدم المستخدم المنصة على مسؤوليته الخاصة. لا تضمن OTR دقة أو اكتمال أي إعلان، ولا تتحمّل مسؤولية أي
          ضرر ناتج عن التعامل مع طرف آخر تم التواصل معه عبر المنصة.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-bold text-navy">6. التعديلات</h2>
        <p className="text-sm leading-relaxed text-ink">
          يجوز تحديث هذه الشروط من وقت لآخر. استمرار استخدام المنصة بعد أي تعديل يُعد قبولاً بالشروط المحدّثة.
        </p>
      </section>
    </div>
  );
}
