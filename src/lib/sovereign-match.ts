'use client';

import { 
  Firestore, 
  collection, 
  getDocs 
} from "firebase/firestore";

/**
 * بروتوكول المطابقة السيادي السريع.
 * يقوم بالبحث اليدوي عن أفضل خبير متاح بناءً على معطيات الحالة والتقييم.
 * يتميز بالسرعة العالية وتوفير الموارد.
 */
export async function matchConsultantSovereign(
  db: Firestore, 
  userProblem: string
): Promise<any | null> {
  const consultantsRef = collection(db, "consultants");
  const snap = await getDocs(consultantsRef);

  let bestMatch: any = null;
  let bestScore = 0;

  const problemLower = userProblem.toLowerCase();

  snap.forEach(doc => {
    const data = doc.data();
    let score = 0;

    // 🔥 ميزان المطابقة السيادي (Sovereign Weighting Scale)
    
    // 1. مطابقة التخصصات القانونية
    if (problemLower.includes("قانون") || problemLower.includes("محامي") || problemLower.includes("قضية") || problemLower.includes("legal")) {
      if (data.specialization?.includes("قانون") || data.specialization?.toLowerCase().includes("legal")) score += 10;
    }
    
    // 2. مطابقة قطاع الأعمال والشركات
    if (problemLower.includes("شركة") || problemLower.includes("تجارة") || problemLower.includes("عقد") || problemLower.includes("business")) {
      if (data.specialization?.includes("تجاري") || data.specialization?.toLowerCase().includes("business")) score += 10;
    }

    // 3. مطابقة الأحوال الشخصية والأسرة
    if (problemLower.includes("أسرة") || problemLower.includes("طلاق") || problemLower.includes("نفقة") || problemLower.includes("family")) {
      if (data.specialization?.includes("أسرة") || data.specialization?.toLowerCase().includes("family")) score += 10;
    }

    // 4. مطابقة الجنايات والشرطة
    if (problemLower.includes("شرطة") || problemLower.includes("جريمة") || problemLower.includes("جنائي") || problemLower.includes("criminal")) {
      if (data.specialization?.includes("جنائي") || data.specialization?.toLowerCase().includes("criminal")) score += 10;
    }

    // 5. وزن التقييم السيادي (Influence of Excellence)
    // التقييم العالي يرجح كفة الخبير في حال تساوى التخصص
    score += (data.rating || 0);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = { id: doc.id, ...data };
    }
  });

  return bestMatch;
}
