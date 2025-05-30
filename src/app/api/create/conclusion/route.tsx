import {NextRequest, NextResponse } from 'next/server';
import { generateConclusion, type GenerateConclusionInput } from '@/ai/flows/generate_conclusion_flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content } = body;

    // Validate input
    const missingFields = [];
    
    if (!content) missingFields.push('instructions');
    
    if (missingFields.length > 0) {
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

    // Prepare input for AI flow
    const input: GenerateConclusionInput = { content };

    // Call the AI flow to generate the conclusion
    const result = await generateConclusion(input);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating conclusion:", error);
    return NextResponse.json(
      { error: "Failed to generate conclusion." },
      { status: 500 }
    );
  }
}