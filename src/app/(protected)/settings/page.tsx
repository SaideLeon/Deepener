import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { PreferencesForm } from "@/components/settings/PreferencesForm";
import { PasswordForm } from "@/components/settings/PasswordForm";
import { Toaster } from "@/components/ui/toaster";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  const initialPreferences = {
    emailNotifications: true,  
  };

  return (
    <DashboardLayout user={session?.user!}> 
    <div className="container max-w-4xl py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas configurações de conta e preferências
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>
            Atualize suas informações pessoais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={session.user} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferências</CardTitle>
          <CardDescription>
            Configure suas preferências de notificação e aparência
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreferencesForm initialPreferences={initialPreferences} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Segurança</CardTitle>
          <CardDescription>
            Atualize sua senha e configurações de segurança
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>

      <Toaster />
    </div>
    </DashboardLayout>
  );
} 