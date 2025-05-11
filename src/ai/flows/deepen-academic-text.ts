// src/ai/flows/deepen-academic-text.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for deepening existing academic text, maintaining a consistent citation style.
 * The flow identifies each section (content under a heading) and then individually expands
 * its development to be significantly more extensive, adding more detail, examples, and depth, while adhering to the specified citation style.
 *
 * - deepenAcademicText - A function that initiates the academic text deepening process.
 * - DeepenAcademicTextInput - The input type for the deepenAcademicText function.
 * - DeepenAcademicTextOutput - The return type for the deepenAcademicText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const DeepenAcademicTextInputSchema = z.object({
  academicText: z
    .string()
    .describe(
      'The existing academic text (in Markdown format) to be deepened.'
    ),
  targetLanguage: z
    .string()
    .describe('The language of the academic text (e.g., "en", "es", "fr", "pt-BR", "pt-PT").'),
  citationStyle: z
    .enum(["APA", "ABNT", "Sem Normas"])
    .default("Sem Normas")
    .describe('The citation style to be maintained during deepening. Options: "APA", "ABNT", "Sem Normas" (default).'),
});
export type DeepenAcademicTextInput = z.infer<
  typeof DeepenAcademicTextInputSchema
>;

// Define the output schema
const DeepenAcademicTextOutputSchema = z.object({
  deepenedAcademicText: z.string().describe('The deepened academic text, formatted in Markdown, with significantly more extensive content under each heading, maintaining the specified citation style.'),
});
export type DeepenAcademicTextOutput = z.infer<
  typeof DeepenAcademicTextOutputSchema
>;

// Exported function to call the flow
export async function deepenAcademicText(
  input: DeepenAcademicTextInput
): Promise<DeepenAcademicTextOutput> {
  return deepenAcademicTextFlow(input);
}

// Define the prompt
const deepenAcademicTextPrompt = ai.definePrompt({
  name: 'deepenAcademicTextPrompt',
  input: {schema: DeepenAcademicTextInputSchema},
  output: {schema: DeepenAcademicTextOutputSchema},
  prompt: `You are an expert academic editor specializing in significantly deepening and extending existing content within structured documents, while strictly maintaining stylistic consistency.
Your task is to take the provided academic text (in Markdown format), which is already structured with headings and content.

You must meticulously go through each section of the document. A section is defined as the content under a specific heading.
For EACH section, you must:
1.  Identify the existing content of that section.
2.  Expand this content considerably to make it MORE EXTENSIVE. This means:
    - Adding much more detailed explanations and elaborations on all concepts.
    - Providing multiple relevant examples, detailed case studies, or further illustrations where applicable.
    - Developing arguments much further with more substantial supporting points, evidence, or counter-arguments if relevant.
    - Introducing related sub-topics or facets that add depth to the section's main theme.
    - Ensuring the language remains academic, highly detailed, and consistent with the {{{targetLanguage}}}.
3.  Crucially, you must preserve the original heading itself and its level (e.g., #, ##, ###). Do NOT change the headings.
4.  The overall structure of the document (sequence of headings) must be maintained.
5.  Strictly maintain the original {{{citationStyle}}}. If the text uses APA, all new and expanded content must also use APA. If ABNT, continue ABNT. If no specific style ("Sem Normas"), continue in that general academic manner. Do not introduce a new style or mix styles. All citations and references must conform to this style.

The goal is to make EACH section's development significantly more extensive than the original, not just a minor rewrite.
Focus on adding substantial new information and depth to every part of the text under its respective heading, consistent with the original {{{citationStyle}}}.

Target Language: {{{targetLanguage}}}
Citation Style to Maintain: {{{citationStyle}}}

Academic Text to Deepen:
{{{academicText}}}

Return the fully deepened and more extensive text in the 'deepenedAcademicText' field, ensuring it is valid Markdown and adheres to the {{{citationStyle}}}.
`,
});

// Define the flow
const deepenAcademicTextFlow = ai.defineFlow(
  {
    name: 'deepenAcademicTextFlow',
    inputSchema: DeepenAcademicTextInputSchema,
    outputSchema: DeepenAcademicTextOutputSchema,
  },
  async input => {
    const {output} = await deepenAcademicTextPrompt(input);
    return output!;
  }
);
