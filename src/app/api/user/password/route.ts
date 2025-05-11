import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { userService } from "@/services/userService";
import bcrypt from "bcryptjs";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return new NextResponse("Current password and new password are required", {
        status: 400,
      });
    }

    const user = await userService.getUserByEmail(session.user.email);

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // TODO: Verify current password
    // For now, we'll just hash and update the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // TODO: Update user password in database
    // For now, we'll just return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PASSWORD_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 