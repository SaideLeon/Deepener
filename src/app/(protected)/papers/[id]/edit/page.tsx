import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { db } from "@/services/db";
import { notFound, redirect } from "next/navigation";

type Params = Promise<{ id: string}>;

export default async function EditPaperPage({ params }: { params: Params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const resolvedParams = await params;
  const paper = await db.getPapersByUserId(session.user.id).then(
    (papers) => papers.find((p) => p.id === resolvedParams.id)
  );

  if (!paper) {
    notFound();
  }

  async function updatePaper(formData: FormData) {
    "use server";
    
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const status = formData.get("status") as "draft" | "completed";

    if (!title || !content) {
      throw new Error("Title and content are required");
    }

    await db.updatePaper(resolvedParams.id, {
      title,
      content,
      status,
    });

    redirect(`/papers/${resolvedParams.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/papers/${resolvedParams.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Editar Trabalho</h1>
            <p className="text-muted-foreground">
              Atualize os detalhes do trabalho
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Trabalho</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updatePaper} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                defaultValue={paper.title}
                placeholder="Digite o título do trabalho"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                name="content"
                defaultValue={paper.content}
                placeholder="Digite o conteúdo do trabalho"
                className="min-h-[400px]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={paper.status}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="draft">Rascunho</option>
                <option value="completed">Concluído</option>
              </select>
            </div>
            <div className="flex justify-end space-x-4">
              <Link href={`/papers/${resolvedParams.id}`}>
                <Button variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit">Salvar Alterações</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 