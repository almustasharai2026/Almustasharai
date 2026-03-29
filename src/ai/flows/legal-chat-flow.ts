'use server';
/**
 * @fileOverview محرك المحادثة القانوني الذكي.
 * يتولى معالجة الاستشارات بناءً على شخصية المستشار المختار.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LegalChatInputSchema = z.object({
  prompt: z.string().describe('استفسار المستخدم القانوني'),
  characterName: z.string().describe('اسم الشخصية القانونية المختارة'),
  characterDesc: z.string().describe('وصف خبرة الشخصية'),
});
export type LegalChatInput = z.infer<typeof LegalChatInputSchema>;

const LegalChatOutputSchema = z.object({
  response: z.string().describe('الرد القانوني المفصل'),
});
export type LegalChatOutput = z.infer<typeof LegalChatOutputSchema>;

export async function processLegalQuery(input: LegalChatInput): Promise<LegalChatOutput> {
  return legalChatFlow(input);
}

const legalChatPrompt = ai.definePrompt({
  name: 'legalChatPrompt',
  input: {schema: LegalChatInputSchema},
  output: {schema: LegalChatOutputSchema},
  prompt: `أنت الآن تلعب دور {{characterName}}، وهو خبير في {{characterDesc}}.
مهمتك هي تقديم استشارة قانونية دقيقة، رصينة، واحترافية باللغة العربية.

تذكر دائماً القواعد التالية:
1. ابدأ الرد بترحيب يليق بشخصيتك.
2. قدم تحليلاً قانونياً مبدئياً بناءً على المعلومات المتاحة.
3. استخدم لغة قانونية سليمة وبسيطة في نفس الوقت.
4. في نهاية الرد، ذكّر المستخدم دائماً أن هذه الاستشارة "لأغراض استرشادية فقط" ويجب مراجعة محامي مختص.

استفسار العميل: {{{prompt}}}`,
});

const legalChatFlow = ai.defineFlow(
  {
    name: 'legalChatFlow',
    inputSchema: LegalChatInputSchema,
    outputSchema: LegalChatOutputSchema,
  },
  async input => {
    const {output} = await legalChatPrompt(input);
    return output!;
  }
);
