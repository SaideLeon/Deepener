import {NextRequest,NextResponse} from 'next/server';
import {generateIntroduction, type GenerateIntroductionInput} from '@/ai/flows/generate_introduction_flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { instructions, targetLanguage } = body;

    // Validate input
    const missingFields = [];
    
    if (!instructions) missingFields.push('instructions');
    if (!targetLanguage) missingFields.push('targetLanguage');
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
    const input: GenerateIntroductionInput = {instructions,
      targetLanguage
    };

    // Call the AI flow to generate the introduction
    const result = await generateIntroduction(input);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating introduction:", error);
    return NextResponse.json(
      { error: "Failed to generate introduction." },
      { status: 500 }
    );
  }
}