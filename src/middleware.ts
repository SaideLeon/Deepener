import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Registra a ação do usuário
    const userId = req.nextauth.token?.sub;
    if (userId) {
      // Aqui você pode implementar o registro de ações
      console.log(`User ${userId} accessed ${req.nextUrl.pathname}`);
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/creator/:path*",
    "/dashboard/:path*",
    "/papers/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
}; 