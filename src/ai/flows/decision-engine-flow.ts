
'use server';
/**
 * @fileOverview محرك اتخاذ القرار السيادي.
 * يقوم بتحليل المدخلات وتقديم نتائج هيكلية (مستوى المخاطر، التوصيات، اليقين).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DecisionInputSchema = z.object({
  context: z.string().describe('وصف الحالة القانونية أو التجارية'),
  domain: z.enum(['legal', 'business', 'medical']).default('legal'),
});

const DecisionOutputSchema = z.object({
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).describe('مستوى الخطورة'),
  recommendedAction: z.string().describe('الإجراء الفوري الموصى به'),
  alternatives: z.array(z.string()).describe('حلول بديلة'),
  confidenceScore: z.number().describe('نسبة اليقين في التحليل (0-100)'),
  prediction: z.string().describe('التنبؤ بالنتيجة المستقبلية بناءً على المعطيات'),
});

export type DecisionOutput = z.infer<typeof DecisionOutputSchema>;

export async function executeDecisionEngine(input: {context: string}): Promise<DecisionOutput> {
  return decisionEngineFlow(input);
}

const decisionPrompt = ai.definePrompt({
  name: 'decisionPrompt',
  input: {schema: DecisionInputSchema},
  output: {schema: DecisionOutputSchema},
  prompt: `أنت الآن "محرك القرار السيادي". مهمتك ليست الدردشة، بل التحليل الهيكلي العميق.
بناءً على السياق التالي: {{{context}}}

قم بإصدار قرار فني يتضمن:
1. تحديد مستوى المخاطر بدقة.
2. وضع خطة عمل فورية (Recommended Action).
3. طرح مسارات بديلة في حال فشل الخطة الأولى.
4. حساب نسبة اليقين بناءً على وضوح المعطيات.
5. التنبؤ بالنتيجة النهائية (Prediction) بأسلوب استراتيجي.

يجب أن يكون الرد احترافياً جداً وباللغة العربية الرصينة.`,
});

const decisionEngineFlow = ai.defineFlow(
  {
    name: 'decisionEngineFlow',
    inputSchema: DecisionInputSchema,
    outputSchema: DecisionOutputSchema,
  },
  async input => {
    const {output} = await decisionPrompt(input);
    return output!;
  }
);
