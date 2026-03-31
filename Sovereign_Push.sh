#!/bin/bash

echo "🏛️ بدء بروتوكول المزامنة السيادية..."

# التحقق من وجود Git
if ! command -v git &> /dev/null
then
    echo "❌ خطأ: محرك Git غير مثبت على هذا الجهاز."
    exit
fi

# تهيئة المستودع إذا لم يكن مهيأً
if [ ! -d ".git" ]; then
    git init
    echo "✅ تم تهيئة المستودع المحلي."
fi

# إضافة التعديلات
git add .

# التوثيق
echo "📝 أدخل رسالة التوثيق (أو اضغط Enter للرسالة الافتراضية):"
read message
if [ -z "$message" ]; then
    message="تحديث سيادي من محرك king2026"
fi

git commit -m "$message"

echo "🚀 جاري الرفع إلى المستودع البعيد..."
git push origin main

echo "✨ تمت العملية بنجاح يا سيادة المالك."
