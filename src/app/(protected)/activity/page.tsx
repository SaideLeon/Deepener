import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
export default async function ActivityPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    // Optionally, you can redirect or show a loading/error state here
    return null;
  }

  return (
    <DashboardLayout user={session.user}> 
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Atividades</h1>
        <p className="text-muted-foreground">
          Acompanhe suas atividades recentes
        </p>
      </div>

      <div className="space-y-4">
        {/* Placeholder for activities list */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Novo trabalho criado</CardTitle>
              <Badge variant="secondary">Hoje</Badge>
            </div>
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>2 de Março, 2024</span>
              <Clock className="h-4 w-4 ml-2" />
              <span>14:30</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Você criou um novo trabalho acadêmico: &quot;Análise de Dados com Python&quot;
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Atualização de perfil</CardTitle>
              <Badge variant="secondary">Ontem</Badge>
            </div>
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>1 de Março, 2024</span>
              <Clock className="h-4 w-4 ml-2" />
              <span>10:15</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Você atualizou suas informações de perfil
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </DashboardLayout>
  );
}