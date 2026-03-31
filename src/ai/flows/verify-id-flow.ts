'use server';
/**
 * @fileOverview محرك التحقق السيادي من الهوية المهنية.
 * يستخدم رؤية الحاسوب لتحليل وثائق المحاماة والمستشارين.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdVerificationInputSchema = z.object({
  frontIdUri: z.string().describe("صورة وجه الهوية أو الكارنيه (Base64)"),
  backIdUri: z.string().describe("صورة ظهر الهوية أو الكارنيه (Base64)"),
  docType: z.enum(['syndicate', 'national_id']).describe("نوع الوثيقة"),
});

const IdVerificationOutputSchema = z.object({
  isValid: z.boolean().describe("هل الوثيقة صحيحة ومنطقية؟"),
  extractedName: z.string().optional().describe("الاسم المستخرج من الوثيقة"),
  idNumber: z.string().optional().describe("رقم القيد أو الهوية"),
  profession: z.string().optional().describe("المهنة المكتوبة"),
  confidence: z.number().describe("نسبة اليقين"),
  moderationNote: z.string().describe("ملاحظة المحرك السيادي"),
});

export async function verifyLegalIdentity(input: z.infer<typeof IdVerificationInputSchema>) {
  return verifyIdFlow(input);
}

const verifyIdPrompt = ai.definePrompt({
  name: 'verifyIdPrompt',
  input: {schema: IdVerificationInputSchema},
  output: {schema: IdVerificationOutputSchema},
  prompt: `أنت الآن "عين الرقابة السيادية" للمستشار AI.
مهمتك هي تحليل صورتين لوثيقة قانونية ({{docType}}).

الصورة الأولى (الوجه): {{media url=frontIdUri}}
الصورة الثانية (الظهر): {{media url=backIdUri}}

قم بالتحقق مما يلي:
1. هل الصور تمثل فعلاً {{docType}} (كارنيه نقابة المحامين أو بطاقة هوية)؟
2. استخرج الاسم الكامل، رقم القيد/الهوية، والمهنة.
3. تأكد من عدم وجود تلاعب واضح.

أصدر تقريراً تقنياً باللغة العربية حول صلاحية هذه الهوية للانضمام لهيئة الخبراء.`,
});

const verifyIdFlow = ai.defineFlow(
  {
    name: 'verifyIdFlow',
    inputSchema: IdVerificationInputSchema,
    outputSchema: IdVerificationOutputSchema,
  },
  async input => {
    const {output} = await verifyIdPrompt(input);
    return output!;
  }
);
