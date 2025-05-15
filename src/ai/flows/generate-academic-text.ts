// src/ai/flows/generate-academic-text.ts
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateAcademicTextInputSchema = z.object({
  instructions: z.string().describe('The full academic instruction set to be split and processed.'),
  targetLanguage: z.string().describe('The language of the academic text (e.g., "pt-BR", "en", etc.).'),
  citationStyle: z.enum(["APA", "ABNT", "Sem Normas"]).default("Sem Normas").describe('The citation style.'),
});
export type GenerateAcademicTextInput = z.infer<typeof GenerateAcademicTextInputSchema>;

const GenerateAcademicTextOutputSchema = z.object({
  academicText: z.string().describe('The complete academic text, in Markdown, with developed sections.'),
});
export type GenerateAcademicTextOutput = z.infer<typeof GenerateAcademicTextOutputSchema>;

export async function generateAcademicText(input: GenerateAcademicTextInput): Promise<GenerateAcademicTextOutput> {
  return generateAcademicTextFlow(input);
}

// Prompt permanece o mesmo
const generateAcademicTextPrompt = ai.definePrompt({
  name: 'generateAcademicTextPrompt',
  input: { schema: GenerateAcademicTextInputSchema },
  output: { schema: GenerateAcademicTextOutputSchema },
  prompt: `You are an expert academic writer. Your task is to generate a comprehensive academic text based on the provided instructions, in the specified target language, and adhering to the chosen citation style. The output must be formatted in Markdown.

Instructions: {{{instructions}}}
Target Language: {{{targetLanguage}}}
Citation Style: {{{citationStyle}}}

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

// Novo flow com fragmentação
const generateAcademicTextFlow = ai.defineFlow(
  {
    name: 'generateAcademicTextFlow',
    inputSchema: GenerateAcademicTextInputSchema,
    outputSchema: GenerateAcademicTextOutputSchema,
  },
  async ({ instructions, targetLanguage, citationStyle }) => {
    // Divide por tópicos com base em quebras de linha duplas
    const fragments = instructions
      .split(/\n{2,}/)
      .map(s => s.trim())
      .filter(Boolean);

    const parts: string[] = [];

    for (const [index, fragment] of fragments.entries()) {
      const partialInput = {
        instructions: fragment,
        targetLanguage,
        citationStyle,
      };

      const { output } = await generateAcademicTextPrompt(partialInput);

      if (output?.academicText) {
        parts.push(output.academicText.trim());
      }

      // Aguarda 1 segundo entre partes (para evitar sobrecarga/token burst)
      if (index < fragments.length - 1) {
        await new Promise(res => setTimeout(res, 1000));
      }
    }

    return {
      academicText: parts.join('\n\n'),
    };
  }
);
