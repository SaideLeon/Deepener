// src/ai/flows/expand-academic-text.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for expanding existing academic text, maintaining a consistent citation style.
 * The flow identifies headings and their content, then elaborates on each section to provide more depth while adhering to the specified citation style.
 *
 * - expandAcademicText - A function that initiates the academic text expansion process.
 * - ExpandAcademicTextInput - The input type for the expandAcademicText function.
 * - ExpandAcademicTextOutput - The return type for the expandAcademicText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const ExpandAcademicTextInputSchema = z.object({
  academicText: z
    .string()
    .describe(
      'The existing academic text (in Markdown format) to be expanded.'
    ),
  targetLanguage: z
    .string()
    .describe('The language of the academic text (e.g., "en", "es", "fr", "pt-BR", "pt-PT").'),
  citationStyle: z
    .enum(["APA", "ABNT", "Sem Normas"])
    .default("Sem Normas")
    .describe('The citation style to be maintained during expansion. Options: "APA", "ABNT", "Sem Normas" (default).'),
});
export type ExpandAcademicTextInput = z.infer<
  typeof ExpandAcademicTextInputSchema
>;

// Define the output schema
const ExpandAcademicTextOutputSchema = z.object({
  expandedAcademicText: z.string().describe('The expanded academic text, formatted in Markdown, with more detailed content under each heading, maintaining the specified citation style.'),
});
export type ExpandAcademicTextOutput = z.infer<
  typeof ExpandAcademicTextOutputSchema
>;

// Exported function to call the flow
export async function expandAcademicText(
  input: ExpandAcademicTextInput
): Promise<ExpandAcademicTextOutput> {
  return expandAcademicTextFlow(input);
}

// Define the prompt
const expandAcademicTextPrompt = ai.definePrompt({
  name: 'expandAcademicTextPrompt',
  input: {schema: ExpandAcademicTextInputSchema},
  output: {schema: ExpandAcademicTextOutputSchema},
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

// Define the flow
const expandAcademicTextFlow = ai.defineFlow(
  {
    name: 'expandAcademicTextFlow',
    inputSchema: ExpandAcademicTextInputSchema,
    outputSchema: ExpandAcademicTextOutputSchema,
  },
  async input => {
    const {output} = await expandAcademicTextPrompt(input);
    return output!;
  }
);
