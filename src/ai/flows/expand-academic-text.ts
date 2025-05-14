// src/ai/flows/expand-academic-text.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for expanding existing academic text, maintaining a consistent citation style.
 * The flow identifies headings and their content, then elaborates on each section to provide more depth while adhering to the specified citation style.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Delay para evitar sobrecarga do modelo
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Regex compatível com ES5/ES2017 (sem flag 's')
function splitMarkdownByHeadings(text: string) {
  const sections: { heading: string; content: string }[] = [];
  const regex = /(#+\s.*)([\s\S]*?)(?=\n#+\s|\n*$)/g;

  let match;
  while ((match = regex.exec(text)) !== null) {
    const heading = match[1].trim();
    const content = match[2].trim();
    sections.push({ heading, content });
  }

  return sections;
}

// Esquema de entrada
const ExpandAcademicTextInputSchema = z.object({
  academicText: z.string().describe('The existing academic text (in Markdown format) to be expanded.'),
  targetLanguage: z.string().describe('The language of the academic text (e.g., "en", "es", "fr", "pt-BR", "pt-PT").'),
  citationStyle: z.enum(["APA", "ABNT", "Sem Normas"]).default("Sem Normas").describe('The citation style to be maintained during expansion.'),
});
export type ExpandAcademicTextInput = z.infer<typeof ExpandAcademicTextInputSchema>;

// Esquema de saída
const ExpandAcademicTextOutputSchema = z.object({
  expandedAcademicText: z.string().describe('The expanded academic text, formatted in Markdown, with more detailed content under each heading, maintaining the specified citation style.'),
});
export type ExpandAcademicTextOutput = z.infer<typeof ExpandAcademicTextOutputSchema>;

// Prompt original preservado
const expandAcademicTextPrompt = ai.definePrompt({
  name: 'expandAcademicTextPrompt',
  input: { schema: ExpandAcademicTextInputSchema },
  output: { schema: ExpandAcademicTextOutputSchema },
  prompt: `You are an expert academic editor specializing in elaborating and deepening existing content while maintaining stylistic consistency.
Your task is to take the provided academic text, which is already structured with headings and content, and expand upon it significantly.
When expanding, you must:
- Add more detailed explanations.
- Provide relevant examples or case studies if applicable.
- Develop arguments further with more supporting points or evidence.
- Elaborate on concepts mentioned.
- Ensure the language remains academic and consistent with the {{{targetLanguage}}}.
- Crucially, maintain the original {{{citationStyle}}}. If the text uses APA, continue using APA. If ABNT, continue ABNT. If no specific style ("Sem Normas"), continue in that general academic manner. Do not introduce a new style or mix styles.
Do NOT change the existing headings or the overall structure. Focus solely on enriching the content within each section according to the original {{{citationStyle}}}.
The output must be in Markdown format, preserving the original heading levels.

Target Language: {{{targetLanguage}}}
Citation Style to Maintain: {{{citationStyle}}}

Academic Text to Expand:
{{{academicText}}}

Return the fully expanded text in the 'expandedAcademicText' field.
`,
});

// Fluxo principal com processamento por seção
const expandAcademicTextFlow = ai.defineFlow(
  {
    name: 'expandAcademicTextFlow',
    inputSchema: ExpandAcademicTextInputSchema,
    outputSchema: ExpandAcademicTextOutputSchema,
  },
  async (input) => {
    const sections = splitMarkdownByHeadings(input.academicText);
    let fullExpandedText = '';

    for (const section of sections) {
      const sectionText = `${section.heading}\n\n${section.content}`;
      const { output } = await expandAcademicTextPrompt({
        academicText: sectionText,
        targetLanguage: input.targetLanguage,
        citationStyle: input.citationStyle,
      });

      fullExpandedText += output?.expandedAcademicText.trim() + '\n\n';
      await sleep(1000); // 1 segundo de pausa entre seções
    }

    return { expandedAcademicText: fullExpandedText.trim() };
  }
);

// Função exportada
export async function expandAcademicText(
  input: ExpandAcademicTextInput
): Promise<ExpandAcademicTextOutput> {
  return expandAcademicTextFlow(input);
}
