# Codex Execution Prompt — STS Agency Backend Build

انسخ كل اللي تحت من "---START---" لـ "---END---" والصقه كامل كأول رسالة لـ Codex (شغّاله جوه مجلد المشروع نفسه `D:\Projects\STS`).

---START---

أنت مهندس Full-Stack خبير (10 سنين خبرة) هتشتغل بشكل مستقل جوه مجلد المشروع الحالي (Next.js 14 App Router — "STS Agency"). مهمتك: **تنفيذ باك اند كامل للمشروع من الصفر**، مش اقتراح أو تلخيص — تنفيذ فعلي بالكود والأوامر.

## مصدر الحقيقة (Source of Truth)

في جذر المشروع ملف اسمه `BACKEND_MASTER_PLAN.md`. الملف ده اتكتب بعد فحص كامل وسطر-بسطر لكل صفحات وكومبوننتات وملفات المحتوى في المشروع، وفيه:
- نتائج الفحص (audit) الكاملة للحالة الحالية.
- القرار المعماري والسبب.
- Prisma schema كامل جاهز.
- كل كود الـ API routes (auth, leads/contact, leads/brief, leads/package-quote, availability, admin CRUD).
- كود الـ middleware، rate limiting، email، security headers.
- خطة اختبارات و CI/CD ونشر.
- خطة مراحل (Phase 0 → Phase 7).

**الخطوة الأولى الإلزامية:** افتح واقرأ `BACKEND_MASTER_PLAN.md` كامل من أول سطر لآخر سطر قبل ما تكتب أي كود. بعدها افحص الكود الفعلي الحالي في `src/app`, `src/components`, `src/lib` للتأكد إن كل تفصيلة في الخطة (أسماء ملفات، أسماء حقول الفورم، الـ imports) لسه مطابقة للواقع. لو لقيت أي اختلاف بسيط، اتبع الكود الفعلي الموجود في الريبو (هو الأصل)، ووضّح الفرق في رسالة الـ commit.

## قواعد التنفيذ (Non-negotiable)

1. **نفّذ بالترتيب**: Phase 0 → Phase 1 → ... → Phase 7 كما هي مكتوبة في `BACKEND_MASTER_PLAN.md`. ممنوع تتخطى مرحلة أو تبدأ مرحلة قبل ما تخلّص اللي قبلها والـ build ينجح.
2. **بعد كل مرحلة**: شغّل `npm run lint` و `npm run build`. لو فيه خطأ، اصلحه فورًا قبل ما تكمل للمرحلة التالية. متسيبش أخطاء "هنصلحها بعدين".
3. **Git**: المشروع لسه مفيهوش `.git` — Phase 0 بتعمل `git init` + `.gitignore`. بعد كل مرحلة كاملة اعمل commit منفصل برسالة واضحة (conventional commits: `feat:`, `fix:`, `chore:`, `test:`).
4. **الأسرار (Secrets)**: ممنوع تحط أي مفتاح حقيقي (API keys, connection strings حقيقية) جوه الكود. استخدم `.env` (متستبعدش من Git) + `.env.example` (بقيم فاضية/توضيحية، ده اللي يتعمله commit). لو حاجة زي `RESEND_API_KEY` مش متاحة عندك، سيبها فاضية في `.env` المحلي، خلي كود الإيميل يفشل بهدوء (`try/catch` + `console.error`) من غير ما يوقف باقي التنفيذ، ونبّه في الملخص النهائي إنها محتاجة قيمة حقيقية.
5. **متغيّرش القرار المعماري** (Next.js Route Handlers + PostgreSQL + Prisma + Auth.js/NextAuth v5 + Zod + Resend + Upstash Ratelimit) إلا لو فيه مانع تقني حقيقي (مثلاً حزمة اتشالت من npm). لو حصل كده، استخدم أقرب بديل ووضّح السبب في الملخص النهائي.
6. **لازم تربط الفرونت اند فعليًا** — مش بس تبني الـ API وتسيبه معلّق. لازم تعدّل فعليًا:
   - `src/components/sections/AuthPanel.tsx` (تسجيل دخول/تسجيل حساب حقيقي بدل الزرار الشكلي).
   - `src/components/sections/ContactPanel.tsx` (حجز حقيقي + توفر حقيقي بدل الـ mock).
   - `src/app/brief/page.tsx` (إرسال فعلي للبيانات).
   - `src/components/sections/PackageCards.tsx` (طلب باقة مخصصة فعلي).
   - `src/app/projects/**`, `src/app/industries/**`, وباقي صفحات المحتوى (تتحول لقراءة من DB بدل static arrays، بنفس أسماء الدوال المُصدَّرة من `src/lib/content/*.ts` عشان الصفحات متتغيّرش).
7. **لا تسأل إلا لو محتاج قرار بشري حقيقي غامض** (مثال مكتوب في الخطة: هل نضيف حقل إيميل لفورم Contact عشان نقدر نبعت confirmation email؟). في أي حاجة تانية، خد القرار الأنسب هندسيًا وكمّل، واذكره في الملخص النهائي.
8. **بيئة التشغيل**: Windows، الأوامر عبر npm/npx كما هي مكتوبة بالظبط في الخطة. لو Docker مش متاح لتشغيل Postgres محليًا، استخدم بديل عملي (مثلاً SQLite مؤقتًا في `schema.prisma` أثناء التطوير المحلي بس، مع ملاحظة صريحة إن provider الإنتاج النهائي هو `postgresql` كما في الخطة) ووضّح ده في الملخص.

## تعريف "خلصنا" (Acceptance Criteria)

اعتبر المهمة مكتملة لما كل ده يتحقق:

- [ ] `git` repo مُهيّأ، `.gitignore` صحيح، وكل مرحلة عندها commit خاص بيها.
- [ ] `prisma/schema.prisma` مطبّق (`migrate dev` نجح)، و`prisma/seed.ts` نجح في نقل كل المحتوى الحالي (projects, industries, team, services, packages, clientLogos) لقاعدة البيانات.
- [ ] `npm run build` ينجح من غير أي خطأ.
- [ ] تسجيل حساب جديد وتسجيل دخول شغالين فعليًا عبر `AuthPanel.tsx` (مش شكليين).
- [ ] فورم Contact بيحجز فعليًا في الـ DB، وميسمحش بحجز يوم full مرتين (race condition محمي بمعاملة DB).
- [ ] فورم Brief بيتخزن فعليًا في الـ DB بكل حقوله.
- [ ] Custom Package quote بيتحسب سعره في السيرفر (مش بيتوثق فيه من الفرونت) ويتخزن.
- [ ] كل صفحات المحتوى (`/projects`, `/industries/[slug]`, `/pricing`, `/clients`, `/about`, `/services`) بتعرض بيانات جاية من الـ DB.
- [ ] `/admin` موجودة، محمية بـ role `ADMIN`/`STAFF` عبر `middleware.ts`، وفيها صندوق الليدز (contact + brief + package-quote) وCRUD للمحتوى.
- [ ] `/portal` موجودة، محمية لليوزر `CLIENT`، وبتعرض بروفايله وسجل طلباته.
- [ ] فيه اختبارات أساسية (`npm test`) شغالة على الـ validations والـ booking logic.
- [ ] Security headers مضافة في `next.config.mjs`، و`.github/workflows/ci.yml` موجود.

## في النهاية

اكتب ملخص نهائي واضح يحتوي:
1. كل حاجة اتعملت فعليًا (لست بالمراحل).
2. أي حاجة اتأجلت أو لسه محتاجة قيمة/قرار من المستخدم (زي مفاتيح API حقيقية، أو اختيار Neon vs بديل تاني للإنتاج).
3. أي نقطة اختلفت عن `BACKEND_MASTER_PLAN.md` الأصلي وليه.
4. الأوامر اللي المستخدم محتاج يشغّلها بنفسه دلوقتي (زي وضع مفاتيح حقيقية في `.env` وتشغيل `npm run dev` للتجربة).

ابدأ دلوقتي بقراءة `BACKEND_MASTER_PLAN.md`.

---END---
