// src/ai/flows/generate-bibliography.ts
'use server';

/**
 * @fileOverview Este arquivo define um Genkit flow especializado em gerar referências bibliográficas a partir de instruções, idioma e estilo de citação especificados.
 * O flow produz uma lista de referências formatadas conforme o estilo de citação escolhido.
 *
 * - generateBibliography - Função que inicia o processo de geração de bibliografia.
 * - GenerateBibliographyInput - Tipo de entrada para a função generateBibliography.
 * - GenerateBibliographyOutput - Tipo de retorno da função generateBibliography.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define o schema de entrada
const GenerateBibliographyInputSchema = z.object({
  content: z
    .string()
    .describe(
      'O conteúdo da ficha de leitura ou do trabalho completo, a partir do qual as referências bibliográficas serão extraídas e geradas.'
    ),
  citationStyle: z
    .enum(["APA", "ABNT"])
    .default("APA")
    .describe('O estilo de citação a ser utilizado nas referências. Opções: "APA", "ABNT".'),
});
export type GenerateBibliographyInput = z.infer<
  typeof GenerateBibliographyInputSchema
>;

// Define o schema de saída
const GenerateBibliographyOutputSchema = z.object({
  bibliography: z.string().describe('A lista de referências bibliográficas gerada, formatada em Markdown e seguindo o estilo de citação especificado.'),
});
export type GenerateBibliographyOutput = z.infer<
  typeof GenerateBibliographyOutputSchema
>;

// Função exportada para chamar o flow
export async function generateBibliography(
  input: GenerateBibliographyInput
): Promise<GenerateBibliographyOutput> {
  return generateBibliographyFlow(input);
}

// Define o prompt
const generateBibliographyPrompt = ai.definePrompt({
  name: 'generateBibliographyPrompt',
  input: {schema: GenerateBibliographyInputSchema},
  output: {schema: GenerateBibliographyOutputSchema},
  prompt: `Você é um especialista em normas de referências acadêmicas. Sua tarefa é analisar o conteúdo fornecido (que pode ser uma ficha de leitura ou um trabalho completo) e gerar uma lista de referências bibliográficas extraídas desse conteúdo, seguindo o estilo de citação escolhido. A saída deve ser formatada em Markdown.\n\nConteúdo: {{{content}}}\nEstilo de citação: {{{citationStyle}}}\n\nAo gerar a bibliografia, siga estas orientações:\n1. Analise o conteúdo e identifique todas as fontes, obras, autores e referências citadas.\n2. Liste todas as referências de acordo com o estilo de citação especificado em {{{citationStyle}}} (APA ou ABNT).\n3. Mantenha os títulos, nomes e demais dados das referências conforme aparecem no conteúdo original, sem traduzir ou adaptar o idioma.\n4. A saída final deve ser uma única string em Markdown, com formatação adequada para listas e referências.\n`,
});

// Define o flow
const generateBibliographyFlow = ai.defineFlow(
  {
    name: 'generateBibliographyFlow',
    inputSchema: GenerateBibliographyInputSchema,
    outputSchema: GenerateBibliographyOutputSchema,
  },
  async input => {
    const {output} = await generateBibliographyPrompt(input);
    return output!;
  }
);
