// src/ai/flows/summarize-text-flow.ts
'use server';

/**
 * @fileOverview Defines a Genkit flow for summarizing text.
 *
 * - summarizeText - A function that initiates the text summarization process.
 * - SummarizeTextInput - The input type for the summarizeText function.
 * - SummarizeTextOutput - The return type for the summarizeText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schema for the summarization flow input
const SummarizeTextInputSchema = z.object({
  textToSummarize: z.string().describe('The text to be summarized.'),
  targetTokenCount: z
    .number()
    .optional()
    .describe(
      'An approximate target token count for the summary. This is a hint, not a strict limit.'
    ),
  context: z
    .string()
    .optional()
    .describe(
      'Context for the summarization task (e.g., "summarize for academic paper generation").'
    ),
  language: z.string().optional().describe("The language of the text to be summarized, if known (e.g., 'en', 'pt-BR').")
});
export type SummarizeTextInput = z.infer<typeof SummarizeTextInputSchema>;

// Schema for the summarization flow output
const SummarizeTextOutputSchema = z.object({
  summary: z.string().describe('The summarized text.'),
});
export type SummarizeTextOutput = z.infer<typeof SummarizeTextOutputSchema>;

// Exported function to call the flow
export async function summarizeText(
  input: SummarizeTextInput
): Promise<SummarizeTextOutput> {
  return summarizeTextFlowInternal(input);
}

// Prompt for text summarization
const summarizeTextPrompt = ai.definePrompt({
  name: 'summarizeTextPrompt',
  input: {schema: SummarizeTextInputSchema},
  output: {schema: SummarizeTextOutputSchema},
  prompt: `Summarize the following text concisely.
  {{#if context}}The summarization should be tailored for this context: {{{context}}}{{#if}}{{/if}}
  {{#if targetTokenCount}}Please aim for a summary that would be approximately {{{targetTokenCount}}} tokens.{{{#if}}{{/if}}
  {{#if language}}The text is in {{{language}}}, and the summary should also be in {{{language}}}.{{{#if}}{{/if}}

  Text to summarize:
  {{{textToSummarize}}}

  Return only the summarized text in the 'summary' field.`,
});

// Genkit flow for summarizing text
const summarizeTextFlowInternal = ai.defineFlow(
  {
    name: 'summarizeTextFlowInternal', // Changed name to avoid conflict if old one is cached
    inputSchema: SummarizeTextInputSchema,
    outputSchema: SummarizeTextOutputSchema,
  },
  async input => {
    // The input truncation logic previously here has been moved to ensureTokenLimit
    // to avoid circular dependencies and keep this flow focused.
    const {output} = await summarizeTextPrompt(input);
    if (!output) {
      throw new Error('Summarization failed to produce output.');
    }
    return output;
  }
);