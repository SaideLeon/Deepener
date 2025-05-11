import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/services/db";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const paper = await db.getPaperById(params.id);
    if (!paper) {
      return new NextResponse("Paper not found", { status: 404 });
    }

    if (paper.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.deletePaper(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PAPER_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 