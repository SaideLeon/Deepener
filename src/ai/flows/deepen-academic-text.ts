'use server';

/**
 * @fileOverview This file defines a Genkit flow for deepening existing academic text, maintaining a consistent citation style.
 * The flow identifies each section (content under a heading) and then individually expands
 * its development to be significantly more extensive, adding more detail, examples, and depth, while adhering to the specified citation style.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Função utilitária para delay entre execuções
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para dividir o texto por títulos Markdown
function splitMarkdownByHeadings(text: string): { heading: string; content: string }[] {
  const lines = text.split('\n');
  const sections: { heading: string; content: string }[] = [];
  let currentHeading = '';
  let currentContent: string[] = [];

  for (const line of lines) {
    if (/^#{1,6} /.test(line)) {
      if (currentHeading || currentContent.length > 0) {
        sections.push({
          heading: currentHeading,
          content: currentContent.join('\n').trim(),
        });
      }
      currentHeading = line.trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  // Adiciona última seção
  if (currentHeading || currentContent.length > 0) {
    sections.push({
      heading: currentHeading,
      content: currentContent.join('\n').trim(),
    });
  }

  return sections;
}

// Schema de entrada
const DeepenAcademicTextInputSchema = z.object({
  academicText: z
    .string()
    .describe('The existing academic text (in Markdown format) to be deepened.'),
  targetLanguage: z
    .string()
    .describe('The language of the academic text (e.g., "en", "es", "fr", "pt-BR", "pt-PT").'),
  citationStyle: z
    .enum(['APA', 'ABNT', 'Sem Normas'])
    .default('Sem Normas')
    .describe('The citation style to be maintained during deepening.'),
});
export type DeepenAcademicTextInput = z.infer<typeof DeepenAcademicTextInputSchema>;

// Schema de saída
const DeepenAcademicTextOutputSchema = z.object({
  deepenedAcademicText: z
    .string()
    .describe('The deepened academic text, formatted in Markdown, with significantly more extensive content under each heading, maintaining the specified citation style.'),
});
export type DeepenAcademicTextOutput = z.infer<typeof DeepenAcademicTextOutputSchema>;

// Prompt
const deepenAcademicTextPrompt = ai.definePrompt({
  name: 'deepenAcademicTextPrompt',
  input: { schema: DeepenAcademicTextInputSchema },
  output: { schema: DeepenAcademicTextOutputSchema },
  prompt: `You are an expert academic editor specializing in significantly deepening and extending existing content within structured documents, while strictly maintaining stylistic consistency.
Your task is to take the provided academic text (in Markdown format), which is already structured with headings and content.

You must meticulously go through each section of the document. A section is defined as the content under a specific heading.
For EACH section, you must:
1. Identify the existing content of that section.
2. Expand this content considerably to make it MORE EXTENSIVE. This means:
   - Adding much more detailed explanations and elaborations on all concepts.
   - Providing multiple relevant examples, detailed case studies, or further illustrations where applicable.
   - Developing arguments much further with more substantial supporting points, evidence, or counter-arguments if relevant.
   - Introducing related sub-topics or facets that add depth to the section's main theme.
   - Ensuring the language remains academic, highly detailed, and consistent with the {{{targetLanguage}}}.
3. Crucially, you must preserve the original heading itself and its level (e.g., #, ##, ###). Do NOT change the headings.
4. The overall structure of the document (sequence of headings) must be maintained.
5. Strictly maintain the original {{{citationStyle}}}. If the text uses APA, all new and expanded content must also use APA. If ABNT, continue ABNT. If no specific style ("Sem Normas"), continue in that general academic manner. Do not introduce a new style or mix styles.

Target Language: {{{targetLanguage}}}
Citation Style to Maintain: {{{citationStyle}}}

Academic Text to Deepen:
{{{academicText}}}

Return the fully deepened and more extensive text in the 'deepenedAcademicText' field, ensuring it is valid Markdown and adheres to the {{{citationStyle}}}.
`,
});

// Função principal exportada
export async function deepenAcademicText(
  input: DeepenAcademicTextInput
): Promise<DeepenAcademicTextOutput> {
  const sections = splitMarkdownByHeadings(input.academicText);

  const deepenedSections: string[] = [];

  for (let i = 0; i < sections.length; i++) {
    const { heading, content } = sections[i];

    const fullSection = `${heading}\n${content}`;

    try {
      const { output } = await deepenAcademicTextPrompt({
        academicText: fullSection,
        targetLanguage: input.targetLanguage,
        citationStyle: input.citationStyle,
      });

      deepenedSections.push(output?.deepenedAcademicText ?? fullSection);
    } catch (error) {
      // Fallback em caso de erro: mantém a seção original
      deepenedSections.push(fullSection);
    }

    // Delay de 1.2 segundos entre chamadas para evitar sobrecarga
    await sleep(1200);
  }

  return {
    deepenedAcademicText: deepenedSections.join('\n\n'),
  };
}

// Flow Genkit
const deepenAcademicTextFlow = ai.defineFlow(
  {
    name: 'deepenAcademicTextFlow',
    inputSchema: DeepenAcademicTextInputSchema,
    outputSchema: DeepenAcademicTextOutputSchema,
  },
  async input => {
    return deepenAcademicText(input);
  }
);
