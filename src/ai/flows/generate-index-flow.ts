// src/ai/flows/generate-index-flow.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating an academic index (outline/table of contents)
 * from user-provided titles or a topic, in a specified language.
 *
 * - generateIndexFromTitles - A function that initiates the index generation process.
 * - GenerateIndexFromTitlesInput - The input type for the generateIndexFromTitles function.
 * - GenerateIndexFromTitlesOutput - The return type for the generateIndexFromTitles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const GenerateIndexFromTitlesInputSchema = z.object({
  titles: z
    .string()
    .describe(
      'The user-provided topic, preliminary titles, or general subject for the academic paper.'
    ),
  targetLanguage: z
    .string()
    .describe('The target language for the generated index (e.g., "en", "pt-BR", "pt-PT", "es", "fr").'),
});
export type GenerateIndexFromTitlesInput = z.infer<
  typeof GenerateIndexFromTitlesInputSchema
>;

// Define the output schema
const GenerateIndexFromTitlesOutputSchema = z.object({
  generatedIndex: z.string().describe('The generated academic index/outline, formatted in Markdown, with appropriate heading levels.'),
});
export type GenerateIndexFromTitlesOutput = z.infer<
  typeof GenerateIndexFromTitlesOutputSchema
>;

// Exported function to call the flow
export async function generateIndexFromTitles(
  input: GenerateIndexFromTitlesInput
): Promise<GenerateIndexFromTitlesOutput> {
  return generateIndexFromTitlesFlow(input);
}

// Define the prompt
const generateIndexFromTitlesPrompt = ai.definePrompt({
  name: 'generateIndexFromTitlesPrompt',
  input: {schema: GenerateIndexFromTitlesInputSchema},
  output: {schema: GenerateIndexFromTitlesOutputSchema},
  prompt: `You are an expert academic advisor. Your task is to generate a comprehensive and well-structured academic index or table of contents based on the provided topic or preliminary titles.
The output must be in Markdown format, using appropriate heading levels (e.g., #, ##, ###) to create a clear hierarchy.
The index should be suitable for guiding the writing of a detailed academic paper.
The entire index must be written in the {{{targetLanguage}}}.

Topic/Preliminary Titles:
{{{titles}}}

Return the generated index in the 'generatedIndex' field as a single Markdown string.
Ensure the Markdown is well-formed and represents a logical structure for an academic paper.
For example:
# Introduction
## Background
## Problem Statement
## Objectives
# Literature Review
## Key Theories
## Previous Studies
# Methodology
...and so on.
`,
});

// Define the flow
const generateIndexFromTitlesFlow = ai.defineFlow(
  {
    name: 'generateIndexFromTitlesFlow',
    inputSchema: GenerateIndexFromTitlesInputSchema,
    outputSchema: GenerateIndexFromTitlesOutputSchema,
  },
  async input => {
    const {output} = await generateIndexFromTitlesPrompt(input);
    return output!;
  }
);
