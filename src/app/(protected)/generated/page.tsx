import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/services/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export const metadata: Metadata = {
  title: "Trabalhos Gerados | DeepPenAI",
  description: "Lista de todos os trabalhos gerados",
};

export default async function GeneratedWorksPage() {
  const session = await getServerSession(authOptions);
  const generatedWorks = await db.getGeneratedWorksByUserId(session?.user?.id || "");

  if (!session?.user) {
    // You can render a fallback, redirect, or throw an error here
    return null;
  }

  return (
    <DashboardLayout user={session.user}>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Trabalhos Gerados</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {generatedWorks.map((work) => (
          <Card key={work.id}>
            <CardHeader>
              <CardTitle className="line-clamp-1">{work.topic
                      ? work.topic
                      : work.instructions
                        ? work.instructions.slice(0, 38) + (work.instructions.length > 38 ? "..." : "")
                        : work.title}</CardTitle>
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
    </DashboardLayout>
  );
}