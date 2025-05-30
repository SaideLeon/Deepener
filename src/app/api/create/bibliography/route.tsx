import { NextRequest, NextResponse } from "next/server";
import { generateBibliography, type GenerateBibliographyInput } from "@/ai/flows/generate_bibliography_flow";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, citationStyle } = body;

    // Validate input
    const missingFields = [];
    if (!content) missingFields.push("content");
    if (!citationStyle) missingFields.push("citationStyle");
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required field(s): ${missingFields.join(", ")}`,
          toast: {
            title: "Campo obrigatório ausente",
            description: `Preencha o(s) campo(s): ${missingFields.join(", ")}`,
            variant: "destructive",
          },
        },
        { status: 400 }
      );
    }

    // Prepare input for AI flow
    const input: GenerateBibliographyInput = { content, citationStyle };

    // Call the AI flow to generate the bibliography
    const result = await generateBibliography(input);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating bibliography:", error);
    return NextResponse.json(
      { error: "Failed to generate bibliography." },
      { status: 500 }
    );
  }
}