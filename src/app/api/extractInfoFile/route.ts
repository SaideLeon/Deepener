import { NextRequest, NextResponse } from "next/server";
import {
 extractInstructionsFromFile,
 type ExtractInstructionsFromFileInput,
} from '@/ai/flows/extract-instructions-from-file';

export async function POST(req: NextRequest) {
  
    const body = await req.json();
    const {fileDataUri } = body;

    // Validate input
    if (!fileDataUri) {
      return NextResponse.json(
        { error: "File URI is required." },
        { status: 400 }
      );
    }
  try {
    // Call the AI flow to extract instructions from the file
    const input: ExtractInstructionsFromFileInput = {
      fileUri: fileDataUri,
    };
    const result = await extractInstructionsFromFile(input);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error extracting instructions from file:", error);
    return NextResponse.json(
      { error: "Failed to extract instructions from file." },
      { status: 500 }
    );
  }   }