import {NextRequest, NextResponse } from 'next/server';
import { generateAcademicText,
     type GenerateAcademicTextInput,
 } from '@/ai/flows/generate-academic-text';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference, instructions, targetLanguage, citationStyle } = body;

    // Validate input
    const missingFields = [];
    if (!reference) missingFields.push('reference');
    if (!instructions) missingFields.push('instructions');
    if (!targetLanguage) missingFields.push('targetLanguage');
    if (missingFields.length > 0) {
      // Envia mensagem toast amigável para o frontend
      return NextResponse.json(
        {
          error: `Missing required field(s): ${missingFields.join(', ')}`,
          toast: {
            title: 'Campo obrigatório ausente',
            description: `Preencha o(s) campo(s): ${missingFields.join(', ')}`,
            variant: 'destructive',
          }
        },
        { status: 400 }
      );
    }
    // Validate
     const input: GenerateAcademicTextInput = {
     reference: reference,
     instructions: instructions,
     targetLanguage: targetLanguage,
     citationStyle: citationStyle,
     };

    // Call the AI flow to generate the academic text
    const result = await generateAcademicText(input);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating academic text:", error);
    return NextResponse.json(
      { error: "Failed to generate academic text." },
      { status: 500 }
    );
  }
}