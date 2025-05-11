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
import { redirect } from "next/navigation";

export default function NewPaperPage() {
  async function createPaper(formData: FormData) {
    "use server";
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    if (!title || !content) {
      throw new Error("Title and content are required");
    }

    const paper = await db.createPaper({
      title,
      content,
      userId: session.user.id,
      status: "draft",
    });

    redirect(`/papers/${paper.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/papers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Novo Trabalho</h1>
            <p className="text-muted-foreground">
              Crie um novo trabalho acadêmico
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Trabalho</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createPaper} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                placeholder="Digite o título do trabalho"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Digite o conteúdo do trabalho"
                className="min-h-[200px]"
                required
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Link href="/papers">
                <Button variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit">Criar Trabalho</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 