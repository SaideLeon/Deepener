'use server';

/**
 * @fileOverview Este arquivo define um Genkit flow especializado em gerar introduções acadêmicas baseadas em instruções e idioma especificados.
 * O flow produz uma introdução bem estruturada e detalhada.
 *
 * - generateIntroduction - Função que inicia o processo de geração de introdução acadêmica.
 * - GenerateIntroductionInput - Tipo de entrada para a função generateIntroduction.
 * - GenerateIntroductionOutput - Tipo de retorno da função generateIntroduction.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define o schema de entrada
const GenerateIntroductionInputSchema = z.object({
  instructions: z
    .string()
    .describe(
      'As instruções para a geração da introdução acadêmica, extraídas da imagem ou fornecidas pelo usuário.'
    ),
  targetLanguage: z
    .string()
    .describe('O idioma alvo para a introdução gerada (ex: "en", "es", "fr", "pt-BR", "pt-PT").'),
});
export type GenerateIntroductionInput = z.infer<
  typeof GenerateIntroductionInputSchema
>;

// Define o schema de saída
const GenerateIntroductionOutputSchema = z.object({
  introduction: z.string().describe('A introdução acadêmica gerada, formatada em Markdown, bem desenvolvida.'),
});
export type GenerateIntroductionOutput = z.infer<
  typeof GenerateIntroductionOutputSchema
>;

// Função exportada para chamar o flow
export async function generateIntroduction(
  input: GenerateIntroductionInput
): Promise<GenerateIntroductionOutput> {
  return generateIntroductionFlow(input);
}

// Define o prompt
const generateIntroductionPrompt = ai.definePrompt({
  name: 'generateIntroductionPrompt',
  input: {schema: GenerateIntroductionInputSchema},
  output: {schema: GenerateIntroductionOutputSchema},
  prompt: `Você é um especialista em redação acadêmica. Sua tarefa é gerar uma introdução acadêmica abrangente com base nas instruções fornecidas, no idioma especificado. A saída deve ser formatada em Markdown.\n\nInstruções: {{{instructions}}}\nIdioma alvo: {{{targetLanguage}}}\n\nAo gerar a introdução, siga estas orientações:\n1. Estruture a introdução com um título apropriado (ex: # Introdução) usando sintaxe Markdown.\n2. Desenvolva o texto de forma detalhada, apresentando o contexto, relevância, objetivo e justificativa do tema conforme apropriado para um texto acadêmico.\n3. O texto deve ser coeso, organizado e atender diretamente às instruções fornecidas.\n4. Escreva no idioma {{{targetLanguage}}}.\n5. A saída final deve ser uma única string em Markdown, com formatação adequada para título, parágrafos, etc.\n`,
});

// Define o flow
const generateIntroductionFlow = ai.defineFlow(
  {
    name: 'generateIntroductionFlow',
    inputSchema: GenerateIntroductionInputSchema,
    outputSchema: GenerateIntroductionOutputSchema,
  },
  async input => {
    const {output} = await generateIntroductionPrompt(input);
    return output!;
  }
);
