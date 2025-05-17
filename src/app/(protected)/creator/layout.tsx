import type {Metadata} from 'next';
import '../../globals.css'; 
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'DeepPenAI - Ferramenta de Geração',
  description: 'Interface principal para geração e edição de texto acadêmico com DeepPenAI.',
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
