// src/ai/flows/extract-instructions-from-file.ts
'use server';
/**
 * @fileOverview Extracts instructions from a file (image, PDF, or DOCX) using a multimodal model and detects the language of the text.
 *
 * - extractInstructionsFromFile - A function that extracts instructions from a file and detects its language.
 * - ExtractInstructionsFromFileInput - The input type for the extractInstructionsFromFile function.
 * - ExtractInstructionsFromFileOutput - The return type for the extractInstructionsFromFile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractInstructionsFromFileInputSchema = z.object({
  fileUri: z
    .string()
    .describe(
      'The file containing the instructions (image, PDF, or DOCX), as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type ExtractInstructionsFromFileInput = z.infer<typeof ExtractInstructionsFromFileInputSchema>;

const ExtractInstructionsFromFileOutputSchema = z.object({
  extractedText: z
    .string()
    .describe('The extracted text from the file, representing the instructions.'),
  detectedLanguage: z
    .string()
    .describe('The detected language of the extracted text (e.g., "en", "es", "fr", "pt-BR", "pt-PT").'),
});
export type ExtractInstructionsFromFileOutput = z.infer<typeof ExtractInstructionsFromFileOutputSchema>;

export async function extractInstructionsFromFile(
  input: ExtractInstructionsFromFileInput
): Promise<ExtractInstructionsFromFileOutput> {
  return extractInstructionsFromFileFlow(input);
}

const extractInstructionsFromFilePrompt = ai.definePrompt({
  name: 'extractInstructionsFromFilePrompt',
  input: {schema: ExtractInstructionsFromFileInputSchema},
  output: {schema: ExtractInstructionsFromFileOutputSchema},
  prompt: `Extract the text from the following file. The file could be an image (PNG, JPG, WEBP), a PDF document, or a DOCX document. The file content is provided as a data URI.
Your primary goal is to identify and extract instructions for an academic paper from this file.
Also, detect the language of the extracted text. For example, if the text is in English, return "en"; if Spanish, return "es"; if Portuguese (Brazil), return "pt-BR"; if Portuguese (Portugal), return "pt-PT".

{{media url=fileUri}}

Ensure the extracted text is accurate and complete.
Return the extracted text in the 'extractedText' field and the detected language code (ISO 639-1 like, e.g. pt-BR or pt-PT) in the 'detectedLanguage' field.
`,
});

const extractInstructionsFromFileFlow = ai.defineFlow(
  {
    name: 'extractInstructionsFromFileFlow',
    inputSchema: ExtractInstructionsFromFileInputSchema,
    outputSchema: ExtractInstructionsFromFileOutputSchema,
  },
  async input => {
    const {output} = await extractInstructionsFromFilePrompt(input);
    return output!;
  }
);

