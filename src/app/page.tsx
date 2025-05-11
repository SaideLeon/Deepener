'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, Zap, BrainCircuit, Settings, UploadCloud, FileText, Palette, CheckCircle, Lightbulb, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { signIn } from "next-auth/react";
import { Icons } from "@/components/ui/icons";

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLeadSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        const existingLeadsJSON = localStorage.getItem('capturedLeads');
        const existingLeads: string[] = existingLeadsJSON ? JSON.parse(existingLeadsJSON) : [];
        
        if (!existingLeads.includes(email)) {
          existingLeads.push(email);
          localStorage.setItem('capturedLeads', JSON.stringify(existingLeads));
          console.log('Lead captured and stored in localStorage:', email);
          console.log('All captured leads in localStorage:', existingLeads);
          
          toast({
            title: "Inscrição Recebida!",
            description: `Obrigado por se inscrever com ${email}. Manteremos você atualizado! (Email salvo localmente para demonstração.)`,
            variant: "default",
            className: "bg-accent text-accent-foreground"
          });
        } else {
          toast({
            title: "Email Já Inscrito",
            description: `${email} já está na nossa lista de demonstração local.`,
            variant: "default",
          });
        }
        setEmail('');

      } catch (error) {
        console.error('Error saving lead to localStorage:', error);
        toast({
          title: "Erro ao Salvar",
          description: "Não foi possível registrar seu email localmente.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Erro",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="bg-gradient-to-br from-background to-secondary/30 text-foreground flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between"> 
      <Link href="/" className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">DeepPenAI</span>
          </Link>

          <nav className="flex items-center gap-4">
          <Link href="/auth/signin">
            <Button variant="ghost">Entrar</Button>
          </Link>
          <Button onClick={handleGoogleSignIn} variant="outline" className="gap-2">
            <Icons.google className="h-4 w-4" />
            Entrar com Google
          </Button>
        </nav>

        </div> 
        
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
            Transforme simples tema em um trabalho acadêmico completo
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Automatize a criação de trabalhos acadêmicos a partir de instruções em arquivos
            (imagem, PDF) ou de tema fornecido.  Economize tempo, melhore a qualidade e alcance a excelência.
          </p> 
          <div className="flex flex-col items-center gap-4">
            <Button onClick={handleGoogleSignIn} size="lg" variant="outline" className="gap-2">
              <Icons.google className="h-5 w-5" />
              Continuar com Google
            </Button>
            <p className="text-sm text-muted-foreground">
              ou
            </p>
            <Link href="/auth/signin">
              <Button size="lg">Criar Conta</Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
      <section id="features" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold">Recursos Poderosos para Sua Produção Acadêmica</h2>
            <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
              DeepPenAI oferece um conjunto completo de ferramentas para elevar sua escrita.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-lg hover:shadow-xl transition-shadow bg-card/70 backdrop-blur-md border-border/50">
              <CardHeader className="items-center text-center">
                <div className="p-3 bg-primary/10 rounded-full mb-3">
                   <BrainCircuit className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-xl">Geração Inteligente de Texto</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">A partir de simples tópicos ou arquivos de instrução (PDF, DOCX, Imagens), DeepPenAI cria textos coesos e bem estruturados.</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow bg-card/70 backdrop-blur-md border-border/50">
              <CardHeader className="items-center text-center">
                <div className="p-3 bg-primary/10 rounded-full mb-3">
                  <Settings className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-xl">Formatação Automática</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">Escolha entre ABNT, APA ou outros estilos. Nós cuidamos da formatação para você, incluindo citações e referências.</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow bg-card/70 backdrop-blur-md border-border/50">
              <CardHeader className="items-center text-center">
                 <div className="p-3 bg-primary/10 rounded-full mb-3">
                  <Zap className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-xl">Refinamento Avançado</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">Expanda, aprofunde e melhore seu texto com ferramentas de edição inteligentes para garantir clareza e impacto.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold">Simples Assim: De Ideia a Trabalho Pronto em 3 Passos</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-lg ">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary text-primary-foreground rounded-full inline-flex shadow-md">
                  <UploadCloud className="h-10 w-10" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Envie suas Instruções</h3>
              <p className="text-muted-foreground">Faça upload de arquivos (PDF, DOCX, imagem) ou digite tópicos e temas para o seu trabalho.</p>
            </div>
            <div className="p-6 rounded-lg">
              <div className="flex justify-center mb-4">
                 <div className="p-4 bg-primary text-primary-foreground rounded-full inline-flex shadow-md">
                  <Palette className="h-10 w-10" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Configure o Estilo</h3>
              <p className="text-muted-foreground">Escolha o idioma, o formato de citação (APA, ABNT, etc.) e outras preferências de estilo.</p>
            </div>
            <div className="p-6 rounded-lg">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary text-primary-foreground rounded-full inline-flex shadow-md">
                  <FileText className="h-10 w-10" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Gere e Refine</h3>
              <p className="text-muted-foreground">Receba o texto gerado, revise, expanda, aprofunde e faça o download em formato DOCX.</p>
            </div>
          </div>
           <div className="text-center mt-12">
            <Button size="lg" asChild className="shadow-lg hover:shadow-xl transition-shadow">
              <Link href="/app">
                Experimente Agora Gratuitamente <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Lead Capture Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <Mail className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Fique por Dentro das Novidades!</h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Inscreva-se para receber atualizações, dicas exclusivas e acesso antecipado a novos recursos do DeepPenAI.
          </p>
          <form onSubmit={handleLeadSubmit} className="max-w-lg mx-auto flex flex-col sm:flex-row gap-4">
            <Input
              type="email"
              placeholder="Seu melhor email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow py-3 px-4 text-lg bg-background/80 text-foreground placeholder:text-muted-foreground focus:bg-background"
              required
            />
            <Button type="submit" size="lg" variant="secondary" className="shadow-md hover:shadow-lg">
              Inscrever-se
            </Button>
          </form>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">&copy; {new Date().getFullYear()} DeepPenAI. Todos os direitos reservados.</p>
          <Link href="/app" className="text-sm text-primary hover:underline mt-2 inline-block">
            Acessar a Ferramenta Principal
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

