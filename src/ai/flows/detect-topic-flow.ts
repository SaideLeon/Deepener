'use server';
/**
 * @fileOverview Detects the main topic from a given academic index/outline.
 *
 * - detectTopicFromIndex - A function that initiates the topic detection process.
 * - DetectTopicFromIndexInput - The input type for the detectTopicFromIndex function.
 * - DetectTopicFromIndexOutput - The return type for the detectTopicFromIndex function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectTopicFromIndexInputSchema = z.object({
  academicIndex: z
    .string()
    .describe('The academic index/outline (in Markdown format) from which to detect the main topic.'),
  targetLanguage: z
    .string()
    .describe('The language of the academic index (e.g., "en", "es", "fr", "pt-BR", "pt-PT"). The detected topic should also be in this language.'),
});
export type DetectTopicFromIndexInput = z.infer<typeof DetectTopicFromIndexInputSchema>;

const DetectTopicFromIndexOutputSchema = z.object({
  detectedTopic: z
    .string()
    .describe('The main topic detected from the academic index, in the specified target language.'),
});
export type DetectTopicFromIndexOutput = z.infer<typeof DetectTopicFromIndexOutputSchema>;

export async function detectTopicFromIndex(
  input: DetectTopicFromIndexInput
): Promise<DetectTopicFromIndexOutput> {
  return detectTopicFromIndexFlow(input);
}

const detectTopicPrompt = ai.definePrompt({
  name: 'detectTopicPrompt',
  input: {schema: DetectTopicFromIndexInputSchema},
  output: {schema: DetectTopicFromIndexOutputSchema},
  prompt: `You are an expert in understanding academic structures.
Your task is to identify and extract the main topic or central theme from the provided academic index/outline.
The index is written in {{{targetLanguage}}}.
The detected topic should be concise and also in {{{targetLanguage}}}.

Academic Index/Outline:
{{{academicIndex}}}

Return only the main topic in the 'detectedTopic' field.
For example, if the index is about "Introduction to Artificial Intelligence", "Machine Learning Concepts", "Neural Networks", the topic might be "Artificial Intelligence".
If the index is "História da Filosofia Antiga", "Platão e Aristóteles", "Estoicismo", the topic might be "Filosofia Antiga".
If the index is "# Introduction\n## Background\n## Problem Statement\n# Literature Review\n## Key Theories\n# AI Ethics\n## Bias in AI\n## Fairness", the topic might be "AI Ethics".
`,
});

const detectTopicFromIndexFlow = ai.defineFlow(
  {
    name: 'detectTopicFromIndexFlow',
    inputSchema: DetectTopicFromIndexInputSchema,
    outputSchema: DetectTopicFromIndexOutputSchema,
  },
  async input => {
    const {output} = await detectTopicPrompt(input);
    return output!;
  }
);
