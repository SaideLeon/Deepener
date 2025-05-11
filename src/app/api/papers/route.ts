import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/services/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const papers = await db.getPapersByUserId(session.user.id);
    return NextResponse.json(papers);
  } catch (error) {
    console.error("[PAPERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { title, content, status } = body;

    if (!title || !content) {
      return new NextResponse("Title and content are required", { status: 400 });
    }

    const paper = await db.createPaper({
      title,
      content,
      userId: session.user.id,
      status: status || "draft",
    });

    return NextResponse.json(paper);
  } catch (error) {
    console.error("[PAPERS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 