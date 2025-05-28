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
  generatedIndex: z.array(z.string()).describe('Lista de seções do índice acadêmico, cada item é um título de seção, na ordem correta.'),
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
  prompt: `Você é um orientador acadêmico especialista. Sua tarefa é gerar uma lista de seções para um índice acadêmico (ou sumário) bem estruturado, baseado no tópico ou títulos preliminares fornecidos.\n\nRegras:\n- O resultado deve ser uma lista (array) de strings, cada uma representando o título de uma seção, na ordem correta.\n- O primeiro item da lista deve ser sempre 'Introdução' (ou equivalente na língua alvo).\n- O último item da lista deve ser sempre 'Referência Bibliográfica' (ou equivalente na língua alvo).\n- Os demais itens devem ser seções relevantes para um trabalho acadêmico, em ordem lógica.\n- Todos os títulos devem estar na língua alvo especificada em 'targetLanguage'.\n\nTópico/Títulos Preliminares:\n{{{titles}}}\n\nRetorne apenas a lista de seções no campo 'generatedIndex'.\nExemplo de saída (para português):\n[\n  "Introdução",\n  "Revisão da Literatura",\n  "Metodologia",\n  "Resultados e Discussão",\n  "Conclusão",\n  "Referência Bibliográfica"\n]\n`,
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
