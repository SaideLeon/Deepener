import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/services/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export const metadata: Metadata = {
  title: "Dashboard | DeepPenAI",
  description: "Seu painel de controle",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    // Optionally, redirect to login or show an error message
    return null;
  }
  const generatedWorks = await db.getGeneratedWorksByUserId(session.user.id);
  const activityLogs = await db.getActivityLogsByUserId(session.user.id);

  return (
    <DashboardLayout user={session.user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
            <Link href="/creator">
              <Button disabled={false}>
                {false ? (
                  <svg className="animate-spin h-5 w-5 mr-2 inline" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  "Novo Trabalho"
                )}
              </Button>
            </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Trabalhos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{generatedWorks?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">
                Total de trabalhos criados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{activityLogs.length}</p>
              <p className="text-xs text-muted-foreground">
                Total de atividades registradas
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Trabalhos Gerados Recentimente</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {generatedWorks.slice(0, 3).map((work) => (
              <Card key={work.id}>
                <CardHeader>
                  <CardTitle className="line-clamp-1">
                    {work.topic
                      ? work.topic
                      : work.instructions
                        ? work.instructions.slice(0, 38) + (work.instructions.length > 38 ? "..." : "")
                        : work.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Idioma: {work.language}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Estilo de Citação: {work.citationStyle}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Gerado em: {new Date(work.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tipo: {work.generationType}
                  </p>
                  <div className="mt-2">
                    <Link href={`/generated/${work.id}`}>
                      <Button variant="link" className="p-0">
                        Ver Conteúdo
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}