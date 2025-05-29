// src/ai/flows/generate-conclusion.ts
'use server';

/**
 * @fileOverview Este arquivo define um Genkit flow especializado em gerar conclusões acadêmicas a partir do conteúdo de uma ficha de leitura ou trabalho completo.
 * O flow produz uma conclusão bem estruturada, coesa e adequada ao contexto fornecido.
 *
 * - generateConclusion - Função que inicia o processo de geração de conclusão.
 * - GenerateConclusionInput - Tipo de entrada para a função generateConclusion.
 * - GenerateConclusionOutput - Tipo de retorno da função generateConclusion.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define o schema de entrada
const GenerateConclusionInputSchema = z.object({
  content: z
    .string()
    .describe(
      'O conteúdo da ficha de leitura ou do trabalho completo, a partir do qual a conclusão acadêmica será gerada.'
    ),
});
export type GenerateConclusionInput = z.infer<
  typeof GenerateConclusionInputSchema
>;

// Define o schema de saída
const GenerateConclusionOutputSchema = z.object({
  conclusion: z.string().describe('A conclusão acadêmica gerada, formatada em Markdown e bem desenvolvida.'),
});
export type GenerateConclusionOutput = z.infer<
  typeof GenerateConclusionOutputSchema
>;

// Função exportada para chamar o flow
export async function generateConclusion(
  input: GenerateConclusionInput
): Promise<GenerateConclusionOutput> {
  return generateConclusionFlow(input);
}

// Define o prompt
const generateConclusionPrompt = ai.definePrompt({
  name: 'generateConclusionPrompt',
  input: {schema: GenerateConclusionInputSchema},
  output: {schema: GenerateConclusionOutputSchema},
  prompt: `Você é um especialista em redação acadêmica. Sua tarefa é analisar o conteúdo fornecido (que pode ser uma ficha de leitura ou um trabalho completo) e gerar uma conclusão acadêmica coesa, clara e bem estruturada, adequada ao contexto apresentado. A saída deve ser formatada em Markdown.\n\nConteúdo: {{{content}}}\n\nAo gerar a conclusão, siga estas orientações:\n1. Apresente um parágrafo conclusivo que sintetize as ideias principais do conteúdo, destacando a relevância, possíveis desdobramentos e fechamento do tema.\n2. Mantenha o texto objetivo, claro e alinhado ao tom acadêmico.\n3. A saída final deve ser uma única string em Markdown, com formatação adequada para parágrafos e título (ex: # Conclusão).\n`,
});

// Define o flow
const generateConclusionFlow = ai.defineFlow(
  {
    name: 'generateConclusionFlow',
    inputSchema: GenerateConclusionInputSchema,
    outputSchema: GenerateConclusionOutputSchema,
  },
  async input => {
    const {output} = await generateConclusionPrompt(input);
    return output!;
  }
);
