import { useSession } from "next-auth/react";
import { db } from "@/services/db";

export function useActivityLog() {
  const { data: session } = useSession();

  const logActivity = async (action: string, details: string) => {
    if (!session?.user?.id) return;

    try {
      await db.createActivityLog({
        action,
        details,
        userId: session.user.id,
      });
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  return { logActivity };
} 