import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * محرك الردود الذكية السيادي (Gemini Integration).
 * يستجيب للطلبات القانونية برصانة ودقة عالية.
 */
export async function POST(request: Request) {
  try {
    const { prompt, persona } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        response: "⚠️ تنبيه: لم يتم تفعيل مفتاح Gemini API. الردود الحالية هي ردود تجريبية محاكية للمستشار AI." 
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemContext = `أنت الآن تلعب دور مستشار قانوني محترف بصفة ${persona}. 
    يجب أن تكون إجاباتك رصينة، قانونية، وتستخدم لغة عربية فصحى بسيطة. 
    ابدأ دائماً بترحيب سيادي واختم بأن هذه المعلومات استرشادية فقط.`;

    const result = await model.generateContent([systemContext, prompt]);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error("[Sovereign AI Error]", error.message);
    return NextResponse.json({ error: "فشل المحرك السيادي في توليد الرد" }, { status: 500 });
  }
}
