'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

import { Session } from 'next-auth';

export function SessionProvider({ children, session }: { children: React.ReactNode; session: Session | null | undefined }) {
  return <NextAuthSessionProvider session={session}>{children}</NextAuthSessionProvider>;
}