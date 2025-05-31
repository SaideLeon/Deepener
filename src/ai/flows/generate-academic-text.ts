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
  completedSections: z
    .string()
    .optional()
    .describe('Sections of the academic text that have already been completed. These should be used as context, but not redeveloped.'),
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
Bibliographic reference: {{{reference}}}

Completed Sections (context only, do not redevelop):
{{#if completedSections}}
{{{completedSections}}}
{{/if}}

IMPORTANT: Only develop the topic(s) explicitly present in the instructions. DO NOT develop or repeat any other section (such as introduction, conclusion, bibliography, or any other part of the academic work). Do NOT repeat or summarize content from other sections. Focus strictly and exclusively on the section or topic described in the instructions. If the instructions refer to a section (e.g., 'Anatomia do Coração'), develop ONLY that section, as if it were to be inserted in the correct place in a larger academic work. Do not include any introductory, concluding, or bibliographic content unless explicitly requested in the instructions.

When generating the text, please follow these steps:
1.  Structure the academic text with clear and relevant headings (e.g., # Section Title, ## Subsection, etc.) only if appropriate for the section. Use Markdown heading syntax.
2.  For the heading(s) you create or identify from the instructions, ensure that the content beneath it is thoroughly developed and expanded upon. Provide detailed explanations, examples, arguments, and supporting details as appropriate for an academic paper.
3.  The entire text must be coherent, well-organized, and directly address the given instructions.
4.  The text must be written in the {{{targetLanguage}}}.
5.  Adhere strictly to the specified {{{citationStyle}}}.

    - If "APA" is chosen, follow the American Psychological Association (APA) 7th edition guidelines for all citations and references. Use the author-date system. Each citation must include the author's surname, year of publication, and page numbers. Prioritize the use of short direct citations (less than 40 words) incorporated into the text, following the format: De acordo com Pinto (2008) a nova reforma só surgirá em 1982, agora no contexto “da emergente sociedade da informação” (p. 29). There are three types of citations:
      - Indirect citation: Paraphrase the author's idea in your own words.
      - Direct citation (short, less than 40 words): Incorporate the quote into the text with double quotation marks. Example: Era um estágio que conferia “habilitação preferencial para o provimento dos lugares de arquivista” (Silva & Ribeiro, 2002, pp. 143-144).
      - Direct citation (long, 40 words or more): Present the quote in a separate block, without quotation marks, indented 1.27 cm from the left margin, and double-spaced. Example:

        Na década de 70 abre-se um novo período na vida dos profissionais da informação com a criação da primeira associação profissional do sector. Nessa altura:
        Debatia-se então, o orgulho de ser um profissional BAD sem complexos perante as outras profissões mais afirmativas e com maior reconhecimento social, com estatutos remuneratórios mais compensadores e carreiras mais bem definidas e estruturadas. Foram tempos de mudança, de luta, em que se ganhou consciência de classe. (Queirós, 2001, pp. 1-2)
      - Citation of a citation: Transmit the idea of an author without access to the original text.

    - If "ABNT" is chosen, use ABNT style for all citations and references. Example of in-text citation: (AUTOR, ANO, p. xx).
    - If "Sem Normas" is chosen, generate the text naturally without enforcing specific citation rules, but maintain an academic tone.
6.  It is of utmost importance to use the images present in the bibliographic references. Always seek to include these images in the generated text. If the bibliographic reference contains images (with 'src' and 'legenda'), insert the images in the most relevant section of the text using Markdown image syntax: ![Legenda](src). The image should be placed where it best illustrates or complements the content being discussed. Always include the provided legend as the image caption. If there are multiple images, distribute them throughout the text according to the context of each section. The use of images is essential to enrich and clarify the academic content.
    - For all images, never include any URL parameters (such as '?width=50&blur=10') in the image source. Always use only the base image URL (e.g., 'https://static.todamateria.com.br/upload/fo/to/fotossistemas.jpg') when inserting images into the Markdown. This applies to all images, including those from the technical sheet (ficha técnica) and any other source.
7.  The final output must be a single Markdown string. Ensure proper Markdown formatting for headings, paragraphs, lists, images, citations, etc.
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
