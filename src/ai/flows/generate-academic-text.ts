// src/ai/flows/generate-academic-text.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating academic text based on instructions, a specified language, and a citation style.
 * The flow aims to produce well-structured academic content with detailed explanations under each heading, adhering to the chosen citation style.
 *
 * - generateAcademicText - A function that initiates the academic text generation process.
 * - GenerateAcademicTextInput - The input type for the generateAcademicText function.
 * - GenerateAcademicTextOutput - The return type for the generateAcademicText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const GenerateAcademicTextInputSchema = z.object({
  reference: z
    .string()
    .describe(
      'The reference for the academic text generation, extracted from the image or provided by the user.'
    ),
  instructions: z
    .string()
    .describe(
      'The instructions for the academic text generation, extracted from the image or provided by the user.'
    ),
  targetLanguage: z
    .string()
    .describe('The target language for the generated academic text (e.g., "en", "es", "fr", "pt-BR", "pt-PT").'),
  citationStyle: z
    .enum(["APA", "ABNT", "Sem Normas"])
    .default("Sem Normas")
    .describe('The citation style to be used for the academic text. Options: "APA", "ABNT", "Sem Normas" (default).'),
});
export type GenerateAcademicTextInput = z.infer<
  typeof GenerateAcademicTextInputSchema
>;

// Define the output schema
const GenerateAcademicTextOutputSchema = z.object({
  academicText: z.string().describe('The generated academic text, formatted in Markdown, with well-developed sections under each heading, following the specified citation style.'),
});
export type GenerateAcademicTextOutput = z.infer<
  typeof GenerateAcademicTextOutputSchema
>;

// Exported function to call the flow
export async function generateAcademicText(
  input: GenerateAcademicTextInput
): Promise<GenerateAcademicTextOutput> {
  return generateAcademicTextFlow(input);
}

// Define the prompt
const generateAcademicTextPrompt = ai.definePrompt({
  name: 'generateAcademicTextPrompt',
  input: {schema: GenerateAcademicTextInputSchema},
  output: {schema: GenerateAcademicTextOutputSchema},
  prompt: `You are an expert academic writer. Your task is to generate a comprehensive academic text based on the provided instructions, in the specified target language, and adhering to the chosen citation style. The output must be formatted in Markdown.

Instructions: {{{instructions}}}
Target Language: {{{targetLanguage}}}
Citation Style: {{{citationStyle}}}
Bibliographic reference: {{{referencia}}}

When generating the text, please follow these steps:
1.  Structure the academic text with clear and relevant headings (e.g., # Introduction, ## Main Section 1, ### Subsection 1.1, etc.). Use Markdown heading syntax.
2.  For each heading you create or identify from the instructions, ensure that the content beneath it is thoroughly developed and expanded upon. Provide detailed explanations, examples, arguments, and supporting details as appropriate for an academic paper.
3.  The entire text must be coherent, well-organized, and directly address the given instructions.
4.  The text must be written in the {{{targetLanguage}}}.
5.  Adhere strictly to the specified {{{citationStyle}}}.
    - If "APA" is chosen, use APA style for all citations and references. Example of in-text citation: (Author, Year, p. xx).
    - If "ABNT" is chosen, use ABNT style for all citations and references. Example of in-text citation: (AUTOR, ANO, p. xx).
    - If "Sem Normas" is chosen, generate the text naturally without enforcing specific citation rules, but maintain an academic tone.
6.  The final output must be a single Markdown string. Ensure proper Markdown formatting for headings, paragraphs, lists, citations, etc.
`,
});

// Define the flow
const generateAcademicTextFlow = ai.defineFlow(
  {
    name: 'generateAcademicTextFlow',
    inputSchema: GenerateAcademicTextInputSchema,
    outputSchema: GenerateAcademicTextOutputSchema,
  },
  async input => {
    const {output} = await generateAcademicTextPrompt(input);
    return output!;
  }
);
