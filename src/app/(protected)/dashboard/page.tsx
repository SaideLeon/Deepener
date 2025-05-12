import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
  const papers = await db.getPapersByUserId(session?.user?.id || "");
  const generatedWorks = await db.getGeneratedWorksByUserId(session?.user?.id || "");
  const activityLogs = await db.getActivityLogsByUserId(session?.user?.id || "");

  return (
    <DashboardLayout user={session?.user!}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link href="/creator">
            <Button>Novo Trabalho</Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Trabalhos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{generatedWorks.length}</p>
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
          <h2 className="text-xl font-semibold">Trabalhos Gerados Recentes</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {generatedWorks.slice(0, 3).map((work) => (
              <Card key={work.id}>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{work.topic}</CardTitle>
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