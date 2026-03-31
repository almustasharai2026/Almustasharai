
'use server';
/**
 * @fileOverview محرك اتخاذ القرار السيادي (Sovereign Decision Engine).
 * يقوم بتحليل المدخلات القانونية المعقدة وتقديم مخرجات هيكلية (مستوى المخاطر، التوصيات، التنبؤ بالنتيجة).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DecisionInputSchema = z.object({
  context: z.string().describe('وصف الحالة القانونية أو التجارية المراد تحليلها'),
  domain: z.enum(['legal', 'business', 'administrative']).default('legal'),
  historicalContext: z.string().optional().describe('سياق تاريخي أو سوابق قضائية مرتبطة'),
});

const DecisionOutputSchema = z.object({
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).describe('مستوى الخطورة القانونية المستنتج'),
  strategicAction: z.string().describe('الإجراء الاستراتيجي الفوري الموصى به'),
  legalBasis: z.array(z.string()).describe('الأسس القانونية أو المواد التشريعية التي بني عليها القرار'),
  alternatives: z.array(z.string()).describe('خيارات بديلة في حال تعذر المسار الأول'),
  confidenceScore: z.number().min(0).max(100).describe('نسبة اليقين في هذا التحليل'),
  prediction: z.string().describe('التنبؤ بالنتيجة المستقبلية المتوقعة بناءً على المعطيات الحالية'),
});

export type DecisionOutput = z.infer<typeof DecisionOutputSchema>;

export async function executeSupremeDecision(input: {context: string}): Promise<DecisionOutput> {
  return decisionEngineFlow(input);
}

const decisionPrompt = ai.definePrompt({
  name: 'decisionPrompt',
  input: {schema: DecisionInputSchema},
  output: {schema: DecisionOutputSchema},
  prompt: `أنت الآن "محرك القرار السيادي" في منظومة المستشار AI. مهمتك ليست الدردشة العادية، بل التفكير الاستراتيجي العميق.
بناءً على المعطيات التالية: {{{context}}}
{{#if historicalContext}} ومع مراعاة السوابق التالية: {{{historicalContext}}} {{/if}}

قم بإصدار قرار فني محكم يتضمن:
1. تحديد مستوى المخاطر بدقة متناهية.
2. وضع "الإجراء الاستراتيجي" الذي يضمن مصلحة الموكل بأقل خسائر.
3. ذكر المواد القانونية أو المبادئ القضائية المتعلقة (Legal Basis).
4. طرح مسارات بديلة (Plan B) للطوارئ.
5. حساب نسبة اليقين (Confidence) بناءً على اكتمال المعلومات.
6. تقديم تنبؤ (Prediction) منطقي لمآل القضية أو الطلب.

يجب أن تكون اللغة عربية رصينة، قانونية، ومباشرة جداً.`,
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
