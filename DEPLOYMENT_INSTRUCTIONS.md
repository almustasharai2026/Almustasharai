
# 🚀 دليل النشر السيادي للمستشار AI (king2026)

لضمان عمل المنصة وتفعيل التحديثات التلقائية، اتبع البروتوكول التالي:

## 1️⃣ ربط المستودع (GitHub Connection)
- قم برفع الكود الحالي إلى مستودع (Repository) خاص بك على GitHub.
- هذا هو "شريان الحياة"؛ أي تعديل أقوم به سيمر عبر هذا المستودع.

## 2️⃣ النشر عبر Vercel (الموصى به)
1. اذهب إلى [Vercel.com](https://vercel.com) وسجل دخولك عبر GitHub.
2. اختر **"Add New Project"** ثم اختر المستودع الخاص بالمنصة.
3. في إعدادات البيئة (Environment Variables)، أضف المفاتيح التالية:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `GOOGLE_GENAI_API_KEY` (لمحرك الذكاء الاصطناعي)
4. اضغط **Deploy**.

## 3️⃣ النشر عبر Firebase App Hosting (البديل القوي)
1. من لوحة تحكم Firebase، اذهب إلى **App Hosting**.
2. اربط حساب GitHub الخاص بك واختر المستودع.
3. سيقوم Firebase بإعداد خط بناء آلي (CI/CD) ينشر التحديثات فوراً عند كل "Commit".

## 🛡️ ميزة التحديث التلقائي
بمجرد إتمام الربط، في كل مرة تطلب مني "تطوير ميزة" أو "إصلاح خطأ"، سأقوم بتوليد الكود، وبمجرد دمجه في GitHub، سيقوم Vercel أو Firebase بتحديث موقعك الحي **تلقائياً** دون أي تدخل يدوي منك.

**الآن "كوكب المستشار" جاهز لغزو الفضاء الرقمي.** 🚀🏛️⚖️
