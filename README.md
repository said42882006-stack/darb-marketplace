# دَرْب — منصة تأجير ونقل

مشروع Next.js 14 (App Router) كامل: واجهة متعددة الصفحات + مصادقة + رفع صور + خرائط جوجل + دفع حقيقي + إشعارات بريد إلكتروني، مبني على Prisma.

## المميزات

- صفحة رئيسية + صفحة مستقلة لكل قسم، مع فلاتر بحث حقيقية من السيرفر
- **تسجيل دخول / إنشاء حساب** (NextAuth، بريد وكلمة مرور مشفّرة bcrypt)
- **رفع صور** للإعلان (حتى 6 صور) مع معاينة مصغّرة
- **تحديد الموقع عبر خرائط جوجل**: بحث بالعنوان (Places Autocomplete) + دبّوس قابل للسحب لضبط الدقة، ويظهر مضمّناً في صفحة تفاصيل الإعلان
- **دفع حقيقي عبر Moyasar** لكل من الحجوزات والاشتراكات، مع وضع محاكاة تلقائي عند غياب مفتاح فعلي
- **بريد إلكتروني تلقائي**: ترحيب عند التسجيل، تأكيد حجز للعميل ولصاحب الإعلان، تأكيد تفعيل الاشتراك
- نشر إعلان محمي بتسجيل الدخول ومربوط باشتراك فعّال
- **تبديل اللغة (عربي/إنجليزي)**: زر في الهيدر يبدّل اتجاه الصفحة (RTL/LTR) ونصوص الواجهة الرئيسية فوراً، ويُحفظ الاختيار في المتصفح

## التشغيل محلياً

```bash
npm install
cp .env.example .env
npx prisma db push       # ينشئ قاعدة بيانات SQLite محلية (dev.db)
npm run db:seed          # يضيف إعلانات تجريبية
npm run dev
```

افتح http://localhost:3000

بدون أي إعداد إضافي، الموقع يعمل كاملاً بالوضع التجريبي: الدفع يُحاكى تلقائياً، رفع الصور يعمل فعلياً على القرص المحلي، والبريد الإلكتروني يُطبع في الطرفية بدل إرساله فعلياً.

## إعداد المميزات الحقيقية

### 1) تسجيل الدخول (NextAuth)
```bash
openssl rand -base64 32   # ضع الناتج في NEXTAUTH_SECRET بملف .env
```

### 2) خرائط جوجل
1. أنشئ مشروعاً في [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. فعّل **Maps JavaScript API** و **Places API**
3. أنشئ مفتاح API وضعه في `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

بدون هذا المفتاح، حقل الموقع يعمل كحقل نصي عادي تلقائياً (بدون كسر الموقع).

### 3) الدفع الحقيقي (Moyasar)
1. أنشئ حساباً على [moyasar.com](https://moyasar.com)
2. ضع `MOYASAR_SECRET_KEY` الحقيقي في `.env` (إزالة كلمة `xxxx` تفعّل المسار الحقيقي تلقائياً في `lib/payments.ts`)

بدائل أخرى مناسبة للخليج: **HyperPay**، **PayTabs**، **Tap Payments**.

### 4) البريد الإلكتروني
ضع بيانات أي مزوّد SMTP في `.env` (Gmail App Password، SendGrid، Mailgun، Amazon SES...):
```
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="..."
SMTP_PASS="..."
```

### 5) رفع الصور في الإنتاج
حالياً الصور تُكتب مباشرة على القرص في `/public/uploads` — يعمل محلياً وعلى استضافات Node التقليدية، **لكن ليس على Vercel** (نظام ملفات مؤقت). للإنتاج على Vercel، بدّل `app/api/upload/route.ts` لرفع الصور إلى Cloudinary أو Vercel Blob أو S3 (الكود فيه تعليق يوضّح مكان التبديل بالضبط).

## قاعدة البيانات في الإنتاج

1. أنشئ قاعدة Postgres (Supabase / Neon / Railway)
2. غيّر `provider` في `prisma/schema.prisma` من `sqlite` إلى `postgresql`
3. ضع رابط الاتصال في `DATABASE_URL` بالإنتاج، ثم `npx prisma db push`

## بنية المشروع

```
app/
  page.tsx                     الصفحة الرئيسية
  category/[slug]/page.tsx     صفحة كل قسم + فلاتر
  listing/[id]/page.tsx        تفاصيل الإعلان + صور + خريطة + الحجز
  post/page.tsx                نشر إعلان (محمي بتسجيل الدخول)
  pricing/page.tsx             باقات الاشتراك
  login/ register/             صفحات المصادقة
  api/listings/                GET (فلاتر) + POST (نشر، يتطلب جلسة)
  api/upload/                  رفع الصور
  api/checkout/ api/subscribe/ الدفع (Moyasar حقيقي أو محاكاة)
  api/auth/                    NextAuth + التسجيل
components/                    ImageUploader, LocationPicker, PaymentModal...
lib/                           prisma, auth, payments, mailer
prisma/schema.prisma           User, Listing, Subscriber, Booking
```

## خطوات مقترحة لاحقاً

- لوحة تحكم للمعلن لإدارة إعلاناته وحجوزاته
- Webhook من Moyasar لتأكيد حالة الدفع بشكل غير متزامن
- ضغط/تحسين الصور المرفوعة تلقائياً
- توسيع تبديل اللغة: حالياً يغطي الهيدر والفوتر والصفحة الرئيسية والأقسام والباقات (عبر `lib/i18n.ts` و`components/LanguageProvider.tsx`) — بقية النصوص (نماذج النشر مثلاً) لا تزال عربية فقط. إضافة صفحة جديدة لقاموس الترجمة يتبع نفس النمط الموجود. كذلك يمكن لاحقاً نقل تخزين اللغة من localStorage إلى كوكي + middleware لتفادي وميض RTL→LTR عند أول تحميل لمستخدمي الإنجليزية.
