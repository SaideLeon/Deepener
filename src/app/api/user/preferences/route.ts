import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { userService } from "@/services/userService";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { emailNotifications } = body;

    if (typeof emailNotifications !== "boolean") {
      return new NextResponse("Email notifications preference is required", {
        status: 400,
      });
    }

    const user = await userService.getUserByEmail(session.user.email);

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // TODO: Update user preferences in database
    // For now, we'll just return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PREFERENCES_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}