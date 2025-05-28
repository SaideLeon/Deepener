import { NextRequest, NextResponse } from "next/server";
import { detectTopicFromIndex, DetectTopicFromIndexInput } from "@/ai/flows/detect-topic-flow";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topicTitles, targetLanguage } = body;

    // Validate input
    if (!topicTitles || !targetLanguage) {
      return NextResponse.json(
        { error: "Titles and target language are required." },
        { status: 400 }
      );
    }
    const topicInput: DetectTopicFromIndexInput = {
           academicIndex: topicTitles,
           targetLanguage: targetLanguage,
         };

    // Call the AI flow to detect the topic
    const topicResult = await detectTopicFromIndex(topicInput);

    return NextResponse.json(topicResult);
  } catch (error) {
    console.error("Error detecting topic:", error);
    return NextResponse.json(
      { error: "Failed to detect topic." },
      { status: 500 }
    );
  }
}