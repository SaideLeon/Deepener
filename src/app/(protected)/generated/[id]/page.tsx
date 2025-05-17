// src\app\(protected)\generated\[id]\page.tsx
import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/services/db";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { GeneratedWorkContent } from "./generated-work-content";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export const metadata: Metadata = {
  title: "Trabalho Gerado | DeepPenAI",
  description: "Visualização de trabalho gerado",
};
type Params = Promise<{ id: string}>;

export default async function GeneratedWorkPage({ params }: { params: Params }) { 

  const session = await getServerSession(authOptions);
  const work = await db.getGeneratedWorkById((await params).id);

  if (!work || work.userId !== session?.user?.id) {
    notFound();
  }

  return (
    <DashboardLayout user={session?.user}> 
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{work.topic}</h1>
        <Link href="/generated">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{work.sourceType}</CardTitle>
            <div className="text-sm text-muted-foreground">  
              <p>Gerado em: {new Date(work.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardHeader>  

        <GeneratedWorkContent work={{ ...work, generationType: work.generationType ?? undefined }} />
      </Card>
      <Toaster />
    </div>
    </DashboardLayout>
  );
}