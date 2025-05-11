import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/services/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Paper } from "@/services/db";

export const metadata: Metadata = {
  title: "Dashboard | DeepPenAI",
  description: "Seu painel de controle",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const papers = await db.getPapersByUserId(session?.user?.id || "");
  const activityLogs = await db.getActivityLogsByUserId(session?.user?.id || "");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/papers/new">
          <Button>Novo Trabalho</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Trabalhos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{papers.length}</p>
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
        <h2 className="text-xl font-semibold">Trabalhos Recentes</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {papers.slice(0, 3).map((paper: Paper) => (
            <Card key={paper.id}>
              <CardHeader>
                <CardTitle className="line-clamp-1">{paper.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Status: {paper.status}
                </p>
                <p className="text-sm text-muted-foreground">
                  Criado em: {new Date(paper.createdAt).toLocaleDateString()}
                </p>
                <Link href={`/papers/${paper.id}`}>
                  <Button variant="link" className="p-0">
                    Ver detalhes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 