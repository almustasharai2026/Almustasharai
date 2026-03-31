'use client';

import { Firestore, collection, getDocs } from "firebase/firestore";

/**
 * بروتوكول المطابقة السيادي بين المواطن والخبير الأنسب.
 */
export async function matchConsultant(db: Firestore, userProblem: string): Promise<any | null> {
  const consultantsRef = collection(db, "consultants");
  const snap = await getDocs(consultantsRef);

  let bestMatch: any = null;
  let bestScore = 0;
  const problemLower = userProblem.toLowerCase();

  snap.forEach(doc => {
    const data = doc.data();
    let score = 0;

    if (problemLower.includes("قانون") || data.specialization?.includes("قانون")) score += 10;
    if (problemLower.includes("شركة") || data.specialization?.includes("تجاري")) score += 10;
    score += (data.rating || 0);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = { id: doc.id, ...data };
    }
  });

  return bestMatch;
}
