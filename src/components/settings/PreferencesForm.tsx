"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";

interface PreferencesFormProps {
  initialPreferences: {
    emailNotifications: boolean;
  };
}

export function PreferencesForm({ initialPreferences }: PreferencesFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(
    initialPreferences.emailNotifications
  );

  async function onEmailNotificationsChange(checked: boolean) {
    setIsLoading(true);
    setEmailNotifications(checked);

    try {
      const response = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailNotifications: checked,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar preferências");
      }

      toast({
        title: "Sucesso",
        description: "Preferências atualizadas com sucesso!",
      });
      router.refresh();
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao atualizar preferências",
        variant: "destructive",
      });
      setEmailNotifications(!checked);
    } finally {
      setIsLoading(false);
    }
  }

  function onThemeChange() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Notificações por email</Label>
          <p className="text-sm text-muted-foreground">
            Receba atualizações sobre suas atividades
          </p>
        </div>
        <Switch
          checked={emailNotifications}
          onCheckedChange={onEmailNotificationsChange}
          disabled={isLoading}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Tema</Label>
          <p className="text-sm text-muted-foreground">
            Escolha entre tema claro ou escuro
          </p>
        </div>
        <Switch
          checked={theme === "dark"}
          onCheckedChange={onThemeChange}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}