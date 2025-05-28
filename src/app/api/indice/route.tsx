import { NextRequest, NextResponse } from "next/server";
import { generateIndexFromTitles } from "@/ai/flows/generate-index-flow";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { titles, targetLanguage } = body;

    // Validate input
    if (!titles || !targetLanguage) {
      return NextResponse.json(
        { error: "Titles and target language are required." },
        { status: 400 }
      );
    }

    // Call the AI flow to generate the index
    const result = await generateIndexFromTitles({ titles, targetLanguage });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating index:", error);
    return NextResponse.json(
      { error: "Failed to generate index." },
      { status: 500 }
    );
  }
}