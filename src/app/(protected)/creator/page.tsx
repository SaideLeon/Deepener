'use client';
import {FichaLeitura, TrabalhoAcademico} from '@/types';
import React, {useState, useEffect, ChangeEvent} from 'react';
import {
 Upload,
 Edit3,
 FileText,
 Loader2,
 Languages,
 Copy,
 Maximize2,
 Layers,
 Trash2,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
 Card,
 CardHeader,
 CardTitle,
 CardContent,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea'; 
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/ui/select';
import {Toaster} from '@/components/ui/toaster';
import {useToast} from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MarkdownToDocx from '@/components/markdown-to-docx';
import { getSession } from "next-auth/react";  
import { Session } from "next-auth";

import {
 expandAcademicText,
 type ExpandAcademicTextInput,
} from '@/ai/flows/expand-academic-text';
import {
 deepenAcademicText,
 type DeepenAcademicTextInput,
} from '@/ai/flows/deepen-academic-text';
 
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Image from 'next/image';   

type CitationStyle = 'APA' | 'ABNT' | 'Sem Normas';
type ActiveTab = 'file' | 'titles';
type LanguageCode = 'pt-BR' | 'pt-PT' | 'en' | 'es' | 'fr';

const languageMap: Record<LanguageCode, string> = {
 'pt-BR': 'Português (Brasil)',
 'pt-PT': 'Português (Portugal)',
 en: 'English',
 es: 'Español',
 fr: 'Français',
};

const DeepPenAIApp = () => {
 const {toast} = useToast();
 const [session, setSession] = useState<Session | null | undefined>();
 const [isLoading, setIsLoading] = useState(true);
 const [activeTab, setActiveTab] = useState<ActiveTab>('file');
 


 const [topicTitles, setTopicTitles] = useState<string>('');
 const [generatedIndex, setGeneratedIndex] = useState<string | null>(null); 
 
 const [detectedLanguage, setDetectedLanguage] = useState<LanguageCode>('pt-PT');
 const [targetLanguage, setTargetLanguage] = useState<LanguageCode>('pt-PT');
 const [citationStyle, setCitationStyle] = useState<CitationStyle>('Sem Normas');
 const [generatedText, setGeneratedText] = useState<string | null>(null);  
 const [isLoadingExpand, setIsLoadingExpand] = useState<boolean>(false);
 const [isLoadingDeepen, setIsLoadingDeepen] = useState<boolean>(false); 
 

 // Detectar tópico usando 'api/detectTopic'
  const [detectedTopic, setDetectedTopic] = useState<string | null>(null); ;
  const [temaExtraido, setTemaExtraido] = useState(false);
  const [autoStartFichamento, setAutoStartFichamento] = useState(false);


 // Extrair instruções do arquivo enviado
  const [extractedInstructions, setExtractedInstructions] = useState<string | null>(null);
   const [fileName, setFileName] = useState<string>('Nenhum ficheiro selecionado');
   const [fileDataUri, setFileDataUri] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isLoadingExtract, setIsLoadingExtract] = useState(false); 


 // Referencia bibliografica 
 const [todasPaginas, setTodasPaginas] = useState(false);
  const [fichas, setFichas] = useState<FichaLeitura[] | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [totalResultados, setTotalResultados] = useState(0);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [fichaCriada, setFichaCriada] = useState(false);
  

   // Desenolvimento de trabalho acadêmico   
  const [escrevendo, setEscrevendo] = useState(false); 
  const [logEscritor, seLogEscritor] = useState<string[] | null>(null);
  const [logDesevolvendo, setLogDesevolvendo] = useState<string[] | null>(null);
  const [titulosTotais, setTitulosTotais] = useState(0);
  const [tituloAtual, setTituloAtual] = useState(0);
  const [trabalhoCriado, setTrabalhoCriado] = useState(false);


  // Estado para controlar o tamanho da fonte do texto gerado
const [fontSizePx, setFontSizePx] = useState<number>(16);


  const adicionarLog = React.useCallback((mensagem: string) => {
    setLog((prev: string[]) => [...prev.slice(-2), mensagem]);
  }, []);

   const iniciarFichamento = async () => {
    setCarregando(true);
    setFichas([]);
    setLog([]);
    setPaginaAtual(0); 
    setTodasPaginas(false);

   // tenta detectar topico usando 'api/detectTopic' 
   try {
      const response = await fetch('/api/detectTopic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicTitles, targetLanguage })
      });
      if (!response.ok) throw new Error('Erro na resposta da API: ' + response.status);
      const result = await response.json();
      setDetectedTopic(result.detectedTopic);
      adicionarLog(`🔍 Tópico detectado: ${result.detectedTopic}`);
    } catch (erro: unknown) {
      if (erro instanceof Error) {
        adicionarLog('❌ Erro ao detectar tópico: ' + erro.message);
      } else {
        adicionarLog('❌ Erro ao detectar tópico: ' + String(erro));
      }
      setCarregando(false);
      return;
    }
    const topic = detectedTopic || topicTitles.trim();
    if (!topic) {
      adicionarLog('❌ Nenhum tópico ou título fornecido.');
      setCarregando(false);
      return;
    }

     

    adicionarLog(`🔍 Buscando artigos para: ${topic}`);

    let resultados: { titulo: string; url: string }[] = [];
    try {
      const response = await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ termoBusca : detectedTopic || topicTitles.trim(), todasPaginas })
      });
      if (!response.ok) throw new Error('Erro na resposta da API: ' + response.status);
      resultados = await response.json();
      setTotalResultados(resultados.length);
      adicionarLog(`🔗 ${resultados.length} artigos encontrados`);
    } catch (erro: unknown) {
      if (erro instanceof Error) {
        adicionarLog('❌ Erro ao buscar links: ' + erro.message);
      } else {
        adicionarLog('❌ Erro ao buscar links: ' + String(erro));
      }
      setCarregando(false);
      return;
    }

    const fichasGeradas: FichaLeitura[] = [];
    for (let i = 0; i < resultados.length; i++) {
      const { url } = resultados[i];
      setPaginaAtual(i + 1);
      
      try {
        adicionarLog(`📄 Processando página ${i + 1} de ${resultados.length}: ${url}`);
        
        const conteudoResp = await fetch('/api/scraper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        
        if (!conteudoResp.ok) throw new Error('Erro ao raspar conteúdo: ' + conteudoResp.status);
        const conteudo = await conteudoResp.json();
        
        // Chamada segura da API para gerar ficha
        let ficha = null;
        try {
          const fichaResp = await fetch('/api/fichamento', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conteudo })
          });
          if (!fichaResp.ok) throw new Error('Erro ao gerar ficha: ' + fichaResp.status);
          ficha = await fichaResp.json();
        } catch (apiError) {
          adicionarLog(`❌ Erro ao gerar ficha: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
          continue; // Pula para o próximo artigo
        }
        fichasGeradas.push(ficha);
        setFichas([...fichasGeradas]); // Atualiza em tempo real

        adicionarLog(`✅ Ficha criada: ${ficha.titulo}`);
      } catch (erro: unknown) {
        adicionarLog(`❌ Erro ao processar página ${i + 1}: ${erro instanceof Error ? erro.message : String(erro)}`);
      }
    }

    adicionarLog(`🎉 Processo finalizado! ${fichasGeradas.length} fichas geradas`);
    setFichaCriada(true);
    setCarregando(false);
    
  };

  // Função para iniciar o desenvolvimento do trabalho acadêmico usando 'api/indice' para gerar índice e 'api/escritor' para gerar texto

  const iniciarDesenvolvimento = async () => {
  setEscrevendo(true);
  setTituloAtual(0);
  setTitulosTotais(fichas?.length || 0);
  setTrabalhoCriado(false);
  setGeneratedText(null);
  setLogDesevolvendo(null);
  seLogEscritor(null);


  adicionarLog(`📝 Iniciando desenvolvimento de trabalho acadêmico sobre ${detectedTopic}!`);
  let resultados: string[] = [];
  try {
    const response = await fetch('/api/indice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titles: topicTitles, targetLanguage })
    });
    if (!response.ok) throw new Error('Erro na resposta da API: ' + response.status);
    const data = await response.json();
    resultados = data.generatedIndex;
    console.log('Resultados do índice:', resultados);
    setTitulosTotais(resultados.length);
    adicionarLog(`📑 Índice gerado com ${resultados.length} titulos.`);
  } catch (erro: unknown) {
    if (erro instanceof Error) {
      adicionarLog('❌ Erro ao gerar índice: ' + erro.message);
    } else {
      adicionarLog('❌ Erro ao gerar índice: ' + String(erro));
    }
    setEscrevendo(false);
    return;
  }

  const trabalhosGerados: TrabalhoAcademico[] = [];
  for (let i = 0; i < resultados.length; i++) {
    const titulo = resultados[i];
    setTituloAtual(i + 1);
    setLogDesevolvendo((prev: string[] | null) => [
      ...(prev ? prev.slice(+1) : []),
      `📄 Desenvolvendo  "${titulo}"...`
    ]);
     
    let dados = null;
    try {
      adicionarLog(`📄 Gerando texto para o título ${i + 1} de ${resultados.length}: ${titulo}`);

     
      const tituloLower = titulo.toLowerCase();
      if (tituloLower.includes('conclusão')) {
        const response = await fetch('/api/create/conclusion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
        content: generatedText,
        citationStyle,
          })
        });
        if (!response.ok) throw new Error('Erro ao gerar conclusão: ' + response.status);
        dados = await response.json();
      } else if (tituloLower.includes('bibliografia')) {
        const response = await fetch('/api/create/bibliography', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
        content: fichas?.map(ficha => JSON.stringify(ficha)).join(''),
        citationStyle,
          })
        });
        if (!response.ok) throw new Error('Erro ao gerar bibliografia: ' + response.status);
        dados = await response.json();
      } else if (tituloLower.includes('introdução')) {
        const response = await fetch('/api/create/introduction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
        instructions: topicTitles,
        targetLanguage,
          })
        });
        if (!response.ok) throw new Error('Erro ao gerar introdução: ' + response.status);
        dados = await response.json();
      } else {
        // Chamada para a API de escritor
        const response = await fetch('/api/escritor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
        reference: fichas?.map(ficha => JSON.stringify(ficha)).join(''),
        instructions: titulo,
        targetLanguage,
        citationStyle,
        completedSections: trabalhosGerados?.map(trabalhosGerado => JSON.stringify(trabalhosGerado)).join(''),
          })
        });
        if (!response.ok) throw new Error('Erro ao gerar texto: ' + response.status);
        dados = await response.json();
      }
    } catch (erro: unknown) {
      
      seLogEscritor((prev) => [...(prev ? prev.slice(+2) : []),`❌ Erro ao gerar trabalho para o título ${i + 1}: ${erro instanceof Error ? erro.message : String(erro)}`]);
      continue; // Pula para o próximo título
    }
    const academicText = dados?.generatedText || dados?.academicText || dados?.introduction || dados?.conclusion || dados?.bibliography || null;
    if (!academicText) {
      
      seLogEscritor((prev) => [...(prev ? prev.slice(+2) : []), `❌ Erro ao gerar texto para o título ${titulo}. Pulando...`]);
      continue; // Pula para o próximo título
    }
    trabalhosGerados.push({ academicText }); 
    seLogEscritor((prev) => [...(prev ? prev.slice(+2) : []), `✅"${titulo}" foi desenvolvido com sucesso! `]);
  }
  seLogEscritor((prev) => [...(prev ? prev.slice(+2) : []), `🎉 Desenvolvimento finalizado! ${trabalhosGerados.length} trabalhos criados.`]); 
  setTrabalhoCriado(true);
  setEscrevendo(false);
  setGeneratedText(null);
  setGeneratedText(trabalhosGerados.map(t => t.academicText).join('\n\n'));
};

  // Função para extrair instruções do arquivo enviado usando 'api/extractInfoFile'
  const extractInstructions = React.useCallback(async () => { 
    if (!fileDataUri) {
      toast({
        title: 'Atenção',
        description: 'Por favor, selecione um arquivo primeiro.',
        variant: 'default',
      });
      return;
    }
    setIsLoadingExtract(true); 
    setExtractedInstructions(null);

    adicionarLog('🔍 Extraindo instruções do arquivo enviado...');
    try {
      const response = await fetch('/api/extractInfoFile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileDataUri })
      });
      if (!response.ok) throw new Error('Erro na resposta da API: ' + response.status);
      const result = await response.json();
      if (result.extractedText) {
        setExtractedInstructions(result.extractedText);
        setTemaExtraido(true);
        const lang = result.detectedLanguage.toLowerCase();
        let supportedLang: LanguageCode = 'pt-PT';
        if (Object.keys(languageMap).includes(lang)) {
          supportedLang = lang as LanguageCode;
        } else if (lang === 'pt') {
          supportedLang = 'pt-PT';
        }
        setDetectedLanguage(supportedLang);
        setTargetLanguage(supportedLang);
        toast({
          title: 'Sucesso',
          description: `Instruções extraídas. Idioma detectado: ${getLanguageName(supportedLang)}.`,
          variant: 'default',
          className: 'bg-accent text-accent-foreground',
        }); 
      } else {
        throw new Error('Nenhum texto extraído do arquivo.');
      }
    } catch (err: unknown) {
      console.error('Error extracting instructions:', err);
      toast({
        title: 'Erro na Extração',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
    finally {
      setIsLoadingExtract(false);
    }
  }, [fileDataUri, toast, adicionarLog, setExtractedInstructions, setTemaExtraido, setDetectedLanguage, setTargetLanguage]);
  
  // Função para detectar tópico usando 'api/detectTopic'
  const detectTopicFunction = async () => {
      
    setDetectedTopic(null);

    adicionarLog('🔍 Detectando tópico a partir do índice gerado...');
    try {
      const response = await fetch('/api/detectTopic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicTitles: extractedInstructions || topicTitles, targetLanguage })
      });
      if (!response.ok) throw new Error('Erro na resposta da API: ' + response.status);
      const result = await response.json();
      setDetectedTopic(result.detectedTopic);
      toast({
        title: 'Sucesso',
        description: `Tópico detectado: ${result.detectedTopic}`,
        variant: 'default',
        className: 'bg-accent text-accent-foreground',
      });
    } catch (err: unknown) {
      console.error('Error detecting topic:', err); 
      toast({
        title: 'Erro na Detecção de Tópico',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setAutoStartFichamento(true); 
    }
  };


 // All useEffect hooks together
 useEffect(() => {
   const fetchSession = async () => {
     const sess = await getSession();
     setSession(sess);
     setIsLoading(false);
   };
   fetchSession();
 }, []);

 

 useEffect(() => {
   if (activeTab === 'file') {
     const value = detectedLanguage ?? 'pt-PT';
     setTargetLanguage(value); 
   }
 }, [activeTab, detectedLanguage, extractedInstructions]);

 // Chama automaticamente extrair instruções após o envio do arquivo
  useEffect(() => {
    if (fileDataUri) {
      extractInstructions();
      setFileDataUri(null); // Limpa o URI após a extração
    }
  }, [fileDataUri, extractInstructions]); 

  // Chama automaticamente a detecção de tópico após o envio do arquivo
  useEffect(() => {
    if (temaExtraido) {
      detectTopicFunction();
      setTemaExtraido(false); // Garante que só detecta uma vez por ciclo
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [temaExtraido]);


 // Chama automaticamente de criação de ficha após autoStartFichamento ser true
 useEffect(() => {
  if (autoStartFichamento) {
    iniciarFichamento();
    setAutoStartFichamento(false); // Garante que só inicia uma vez por ciclo
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartFichamento]);

 // Chama automaticamente a geração de texto após fichamento
 useEffect(() => {
  if (fichaCriada) {
    iniciarDesenvolvimento(); // fixed: call the function
    setFichaCriada(false); // Garante que só gera uma vez por ciclo
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [fichaCriada]);


  

  

 if (isLoading) {
   return (
     <div className="flex items-center justify-center min-h-screen">
       <Loader2 className="h-8 w-8 animate-spin" />
     </div>
   );
 }

 if (!session?.user) {
   return null;
 }

 

 const getLanguageName = (code: LanguageCode | string | undefined): string => {
 return languageMap[code as LanguageCode] || code || 'Desconhecido';
 };

 const currentInstructions =
 activeTab === 'file' ? extractedInstructions : generatedIndex;

 const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
 const selectedFile = event.target.files?.[0];
 if (selectedFile) {
 if (selectedFile.size > 10 * 1024 * 1024) {
 toast({
 title: 'Erro',
 description: 'O arquivo excede o limite de 10MB.',
 variant: 'destructive',
 });
 return;
 }
 setFile(selectedFile);
 setFileName(selectedFile.name);
 

 const reader = new FileReader();
 reader.onloadend = () => {
 setFileDataUri(reader.result as string);
 };
 reader.onerror = () => {
 toast({
 title: 'Erro',
 description: 'Falha ao ler o arquivo.',
 variant: 'destructive',
 });

 setFileDataUri(null);
 };
 reader.readAsDataURL(selectedFile);
 } else {
 setFile(null);
 setFileName('Nenhum ficheiro selecionado');
 setFileDataUri(null);
 }
 };

  


 const handleExpandText = async () => {
 if (!generatedText) {
 toast({
 title: 'Atenção',
 description: 'Não há texto gerado para expandir.',
 variant: 'default',
 });
 return;
 }
 setIsLoadingExpand(true);

 try {
 const input: ExpandAcademicTextInput = {
 academicText: generatedText,
 targetLanguage: targetLanguage,
 citationStyle: citationStyle,
 };
 const result = await expandAcademicText(input);
 setGeneratedText(result.expandedAcademicText);
 await autoSaveGeneratedWork('expandido', result.expandedAcademicText);
 toast({
 title: 'Sucesso',
 description: 'Texto expandido.',
 variant: 'default',
 className: 'bg-accent text-accent-foreground',
 });
 } catch (err: unknown) {
 console.error('Error expanding text:', err); 
 toast({
 title: 'Erro ao Expandir',
 description: err instanceof Error ? err.message : 'Erro desconhecido',
 variant: 'destructive',
 });
 } finally {
 setIsLoadingExpand(false);
 }
 };

 const handleDeepenText = async () => {
 if (!generatedText) {
 toast({
 title: 'Atenção',
 description: 'Não há texto gerado para aprofundar.',
 variant: 'default',
 });
 return;
 }
 setIsLoadingDeepen(true); 
 try {
 const input: DeepenAcademicTextInput = {
 academicText: generatedText,
 targetLanguage: targetLanguage,
 citationStyle: citationStyle,
 };
 const result = await deepenAcademicText(input);
 setGeneratedText(result.deepenedAcademicText);
 await autoSaveGeneratedWork('aprofundado', result.deepenedAcademicText);
 toast({
 title: 'Sucesso',
 description: 'Texto aprofundado.',
 variant: 'default',
 className: 'bg-accent text-accent-foreground',
 });
 } catch (err: unknown) {
 console.error('Error deepening text:', err);
 toast({
 title: 'Erro ao Aprofundar',
 description: err instanceof Error ? err.message : 'Erro desconhecido',
 variant: 'destructive',
 });
 } finally {
 setIsLoadingDeepen(false);
 }
 };

 // Função auxiliar para salvar automaticamente
 const autoSaveGeneratedWork = async (type: 'gerado' | 'expandido' | 'aprofundado', text: string) => {
   if (!text || !currentInstructions) return;
   try {
     await fetch('/api/generated-work/save', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         title: 'Trabalho Gerado',
         topic: detectedTopic,
         instructions: currentInstructions,
         generatedText: text,
         language: targetLanguage,
         citationStyle,
         sourceType: activeTab === 'file' ? 'file' : 'manual',
         sourceContent: activeTab === 'file' ? extractedInstructions : topicTitles,
         paperId: null,
         generationType: type,
       })
     });
     toast({
       title: 'Salvo automaticamente',
       description: `Trabalho ${type} salvo no banco de dados.`,
       className: 'bg-green-600 text-white',
     });
   } catch {
     toast({
       title: 'Erro ao salvar automaticamente',
       description: 'Ocorreu um erro ao salvar o trabalho.',
       variant: 'destructive',
     });
   }
 };

 const handleResetAll = () => {
 setActiveTab('file');
 setFile(null);
 setFileName('Nenhum ficheiro selecionado');
 setFileDataUri(null);
 setTopicTitles('');
 setGeneratedIndex(null);
 setDetectedTopic(null);
 setExtractedInstructions(null); 
 setDetectedLanguage('pt-PT');
 setTargetLanguage('pt-PT');
 setCitationStyle('Sem Normas');
 setGeneratedText(null);
 setIsLoadingExtract(false);
  
 setIsLoadingExpand(false);
 setIsLoadingDeepen(false);
  
 const fileInput = document.getElementById('file-upload') as HTMLInputElement;
 if (fileInput) fileInput.value = '';
 toast({
 title: 'Redefinido',
 description: 'Todos os campos foram limpos.',
 variant: 'default',
 });
 };

 const copyToClipboard = () => {
 if (generatedText) {
 navigator.clipboard
 .writeText(generatedText)
 .then(() =>
 toast({
 title: 'Copiado!',
 description:
 'Texto gerado copiado para a área de transferência.',
 className: 'bg-accent text-accent-foreground',
 })
 )
 .catch(() =>
  toast({
    title: 'Erro',
    description: 'Falha ao copiar texto.',
    variant: 'destructive',
  })
 );
 }
 };

 return (
  <DashboardLayout user={session?.user ?? undefined}>
  <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
  {/* Main Content */}
  <main className="container mx-auto px-1 sm:px-8 py-1">
  {/* Tabs for Input Method */}
  {!temaExtraido && (<Tabs
  value={activeTab}
  onValueChange={value => {
  setActiveTab(value as ActiveTab);
  setGeneratedText(null); // Clear generated text when switching tabs
  setGeneratedIndex(null);
  setDetectedTopic(null);
  // Update target language based on new tab
  if (value === 'file') {
    setTargetLanguage(detectedLanguage || 'pt-PT'); 
  } else {
    // For 'titles' tab, language is explicitly chosen by user or defaults.
    // Here, we just ensure the displayed instructions are for the current tab. 
  }
  }}
  className="mb-8"
  >
  <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-xl p-1.5 shadow-inner border border-border/30">
  <TabsTrigger
  value="file"
  className="data-[state=active]:bg-card/90 data-[state=active]:text-primary data-[state=active]:shadow-lg rounded-lg transition-all duration-200 hover:bg-muted/70 py-3 text-base"
  >
  <Upload className="h-5 w-5 mr-2"/>
  Enviar Arquivo
  </TabsTrigger>
  <TabsTrigger
  value="titles"
  className="data-[state=active]:bg-card/90 data-[state=active]:text-primary data-[state=active]:shadow-lg rounded-lg transition-all duration-200 hover:bg-muted/70 py-3 text-base"
  >
  <Edit3 className="h-5 w-5 mr-2"/>
  Digitar Títulos/Tema
  </TabsTrigger>
  </TabsList>

  {/* File Upload Tab */}
  <TabsContent value="file">
  <Card className="rounded-xl shadow-lg overflow-hidden border-t-4 bg-card/70 backdrop-blur-md border-border/50 mt-4">
  <CardHeader className="bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent p-6 border-b border-border/30">
  <div className="flex items-center gap-4">
  <div className="bg-gradient-to-br from-primary to-accent text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg">
  1
  </div>
  <CardTitle className="text-2xl font-semibold text-primary">
  Enviar Arquivo de Instruções
  </CardTitle>
  </div>
  </CardHeader>
  <CardContent className="p-8">
  <p className="text-muted-foreground mb-6">
  Envie um arquivo (.jpg, .png, .webp, .pdf, .docx, max 10MB). O idioma será detectado automaticamente.
  </p>
  <Label
  htmlFor="file-upload"
  className="block border-2 border-dashed border-primary/40 rounded-lg p-10 text-center bg-background/50 hover:border-primary/70 transition-all cursor-pointer shadow-sm hover:shadow-md backdrop-blur-sm"
  >
  <div className="flex justify-center mb-4">
  <Upload className="h-14 w-14 text-primary/70"/>
  </div>
  <Button
  type="button"
  variant="default"
  size="lg"
  className="mb-3 shadow-md hover:shadow-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
  onClick={() => document.getElementById('file-upload')?.click()}
  >
  <FileText className="mr-2 h-5 w-5"/> Escolher ficheiro
  </Button>
  <Input
  id="file-upload"
  type="file"
  className="hidden"
  onChange={handleFileChange}
  accept=".jpg,.jpeg,.png,.webp,.pdf,.docx"
  />
  <p className="text-sm text-muted-foreground">{fileName}</p>
  </Label>
  {fileDataUri && file?.type.startsWith('image/') && (
  <div className="mt-4 border border-border/50 rounded-md overflow-hidden shadow-sm backdrop-blur-sm bg-background/30">
    <Image
      data-ai-hint="document preview"
      src={fileDataUri}
      alt="Preview"
      width={300}
      height={192}
      className="max-h-48 w-auto mx-auto"
    />
  </div>
  )}
  <p className="mt-6 text-sm text-muted-foreground italic">
  Garanta que o arquivo seja claro e legível para resultados ótimos.
  </p>
   
  </CardContent>
  </Card>
  </TabsContent>

  {/* Titles/Theme Tab */}
  <TabsContent value="titles">
  <Card className="rounded-xl shadow-lg overflow-hidden border-t-4 border-primary/80 bg-card/70 backdrop-blur-md border-border/50 mt-4">
  <CardHeader className="bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent p-6 border-b border-border/30">
  <div className="flex items-center gap-4">
  <div className="bg-gradient-to-br from-primary to-accent text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg">
  1
  </div>
  <CardTitle className="text-2xl font-semibold text-primary">
  Inserir Títulos ou Tema
  </CardTitle>
  </div>
  </CardHeader>
  <CardContent className="p-8 bg-gradient-to-r from-blue-70 to-blue-80 rounded-xl" >
  <p className="text-2xl font-semibold text-primary text-black mb-6">
  Digite os títulos, tópicos ou o tema geral. Escolha o idioma de geração no topo da página.
  </p>
  <Textarea
  placeholder="Ex: Introdução à Inteligência Artificial, Impactos da IA na Sociedade..."
  value={topicTitles}
  onChange={e => {
    setTopicTitles(e.target.value);
  }}
  className="min-h-[150px] text-base rounded-md shadow-sm focus:shadow-md bg-background/50 border-input focus:border-primary/70 backdrop-blur-sm border-2 border-primary/40 font-semibold text-lg"
  rows={6}
  spellCheck={false}
  />  
 <Button
  className="mt-4 w-full bg-primary text-white font-semibold shadow-md hover:bg-primary/90"
  onClick={() => setTemaExtraido(true)}
  disabled={!topicTitles.trim()}
  type="button"
>
  Enviar 
</Button>
  </CardContent>
  </Card>
  </TabsContent>
  </Tabs>)}
  

  

  {/* Language and Citation Style Selection */}
  <div className="grid md:grid-cols-2 gap-6 items-end">
  <div>
  <Label className="block mb-2 font-semibold">Idioma de Geração</Label>
  <div className="flex items-center p-3.5 bg-muted/30 rounded-md border border-input shadow-sm backdrop-blur-sm">
  <Languages className="text-primary h-6 w-6 mr-3"/>
  {/* Language Selection */}
  <Select
  value={targetLanguage}
  onValueChange={value => setTargetLanguage(value as LanguageCode)}
  >
  <SelectTrigger className="w-[180px] text-sm py-2 rounded-md border-input bg-background shadow-sm"> 
  <SelectValue placeholder="Selecionar Idioma"/>
  </SelectTrigger>
  <SelectContent className="bg-popover text-popover-foreground border-border shadow-md">
  {(Object.keys(languageMap) as LanguageCode[]).map(langCode => (
  <SelectItem
  key={langCode}
  value={langCode}
  className="hover:bg-accent/20 focus:bg-accent/30"
  >
  {languageMap[langCode]}
  </SelectItem>
  ))}
  </SelectContent>
  </Select>
  </div>
  <p className="mt-1 text-xs text-muted-foreground">
  {activeTab === 'file'
    ? `Detectado: ${getLanguageName(detectedLanguage)}.`
    : `Use seletor para alterar o idioma.`}
  </p>
  </div>
  <div>
  <Label htmlFor="citation-style" className="block mb-2 font-semibold">
  Formato de Citação
  </Label>
  <div className="flex items-center p-3.5 bg-muted/30 rounded-md border border-input shadow-sm backdrop-blur-sm">
  <Select
  value={citationStyle}
  onValueChange={value => setCitationStyle(value as CitationStyle)}
  >
  <SelectTrigger
  id="citation-style"
  className="w-full py-3 rounded-md shadow-sm focus:shadow-md bg-background/50 border-input hover:border-primary/70 backdrop-blur-sm"
  >
  <SelectValue placeholder="Selecionar Formato"/>
  </SelectTrigger>
  <SelectContent className="bg-popover text-popover-foreground border-border shadow-md">
  <SelectItem
  value="Sem Normas"
  className="hover:bg-accent/20 focus:bg-accent/30"
  >
  Sem Normas (Padrão)
  </SelectItem>
  <SelectItem
  value="APA"
  className="hover:bg-accent/20 focus:bg-accent/30"
  >
  Normas APA
  </SelectItem>
  <SelectItem
  value="ABNT"
  className="hover:bg-accent/20 focus:bg-accent/30"
  >
  Normas ABNT
  </SelectItem>
  </SelectContent>
  </Select>
  </div>
  <p className="mt-1 text-xs text-muted-foreground">
   Use seletor para alterar a norma de citação.
  </p>
  </div>
  </div>

 

  {/* Progress extract */}
  {isLoadingExtract && (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between text-gray-700 dark:text-white/80 text-sm mb-2">
        <span>Extraindo instruções do arquivo...</span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-500 dark:to-orange-500 rounded-full transition-all duration-500 progress-bar-animated"
          style={{ width: '100%' }}
        />
      </div>
      <div className="bg-gray-100/80 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4">
              <div className="text-gray-800 dark:text-white/90 font-mono text-sm">
                {log.map((linha, i) => (
                  <div 
                    key={i} 
                    className="transition-all duration-300 animate-fade-in"
                    style={{
                      opacity: 1 - (i * 0.3),
                      transform: `scale(${1 - i * 0.05})`
                    }}
                  >
                    {linha}
                  </div>
                ))}
              </div>
            </div>
    </div>
  )}

  {/* Progress index */}

  {/* Progress Section */}
        {carregando && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between text-gray-700 dark:text-white/80 text-sm mb-2">
              <span>Pesquisando artigos que contribuam para o trabalho</span>
              <span>{paginaAtual} de {totalResultados}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-full transition-all duration-500 progress-bar-animated"
                style={{
                  width: totalResultados ? `${(paginaAtual / totalResultados) * 100}%` : '0%'
                }}
              />
            </div>
            <div className="bg-gray-100/80 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4">
              <div className="text-gray-800 dark:text-white/90 font-mono text-sm">
                {log.map((linha, i) => (
                  <div 
                    key={i} 
                    className="transition-all duration-300 animate-fade-in"
                    style={{
                      opacity: 1 - (i * 0.3),
                      transform: `scale(${1 - i * 0.05})`
                    }}
                  >
                    {linha}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
  
  {/* progresso de desenvolvimento */}
  {escrevendo && (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between text-gray-700 dark:text-white/80 text-sm mb-2">
        <span>{(logDesevolvendo ?? []).map((linha, i) => (
                  <div 
                    key={i} 
                    className="transition-all duration-300 animate-fade-in"
                    style={{
                      opacity: 1 - (i * 0.3),
                      transform: `scale(${1 - i * 0.05})`
                    }}
                  >
                    {linha}
                  </div>
                ))}</span>
        <span>{tituloAtual} de {titulosTotais}</span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-500 dark:to-teal-500 rounded-full transition-all duration-500 progress-bar-animated"
          style={{
            width: titulosTotais ? `${(tituloAtual / titulosTotais) * 100}%` : '0%'
          }}
        />

      </div>
      <div className="bg-gray-100/80 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4">
        <div className="text-gray-800 dark:text-white/90 font-mono text-sm">
          {(logEscritor ?? []).map((linha, i) => (
            <div 
              key={i} 
              className="transition-all duration-300 animate-fade-in"
              style={{
                opacity: 1 - (i * 0.3),
                transform: `scale(${1 - i * 0.05})`
              }}
            >
              {linha}
            </div>
          ))}
        </div>
      </div>
    </div>
  )}

  {/* Generated Text Display */}
{trabalhoCriado && (
  <div className="sm:ml-1 sm:mr-1 bg-black/60 dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors duration-300">
    <div className="flex justify-between items-center px-6 py-4 bg-gray-50/10 dark:bg-gray-900/50 border-b border-gray-200/20 dark:border-gray-700/30">
      <h3 className="text-xl font-semibold text-gray-100 dark:text-gray-100">
       
          {detectedTopic || 'Trabalho Gerado'}
      </h3> 
      <div className="flex items-center gap-4">
        <label htmlFor="font-size-select" className="text-gray-300 dark:text-gray-300 text-sm mr-2">Tamanho do texto:</label>
        <input
          id="font-size-select"
          type="range"
          min={12}
          max={32}
          value={fontSizePx}
          onChange={e => setFontSizePx(Number(e.target.value))}
          className="w-24 accent-primary"
        />
        <span className="text-gray-300 dark:text-gray-300 text-sm w-8 text-center">{fontSizePx}px</span>
        <button
          onClick={copyToClipboard}
          title="Copiar texto"
          className="text-gray-300 dark:text-gray-300 hover:bg-gray-200/20 dark:hover:bg-gray-700/50 rounded p-1.5 transition-colors"
        >
          <Copy className="h-5 w-5" />
        </button>
      </div>
    </div>

    <div className="p-1 sm:p-8 min-h-[200px]">
      <div 
        className="bg-white dark:bg-gray-100 p-1 sm:p-8 rounded shadow-sm overflow-auto max-h-[600px]"
        style={{ 
          backgroundImage: "linear-gradient(to bottom, #f9f9f9 0%, white 100%)",
          border: "1px solid #e0e0e0"
        }}
      >
        <div className="mr-1 ml-1 sm:mr-24 sm:ml-24 max-w-none text-gray-900 dark:text-gray-800 font-serif prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:text-back-900 dark:prose-headings:text-blue-800 prose-p:my-4 prose-p:leading-relaxed prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-1 prose-strong:font-bold prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-em:italic prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-code:text-sm prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:p-4 prose-pre:rounded-lg"
          style={{
            lineHeight: "1.9",
            textAlign: "justify",
            fontSize: `${fontSizePx}px`,
          }}
        >
          <style>{`
            .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
              font-size: ${Math.round(fontSizePx * 0.97)}px !important;
            }
          `}</style>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedText}</ReactMarkdown>
        </div>
      </div>
    </div> 

    {!isLoadingExpand && !isLoadingDeepen && (
      <div className="flex justify-between items-center px-6 py-3 border-t border-gray-200/20 dark:border-gray-700/30 text-sm text-gray-400 dark:text-gray-400">
        <div>
          Estilo: <span className="font-semibold text-primary-foreground/80 dark:text-primary-foreground/80">{citationStyle}</span>
        </div>
        <div>
          Idioma: <span className="font-semibold text-primary-foreground/80 dark:text-primary-foreground/80">{getLanguageName(targetLanguage)}</span>
        </div>
      </div>
    )}
  </div>
)}


{/* Refinement Options */}
  <div className="mt-6 space-y-4">
  <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
  <Button
  onClick={handleExpandText}
  disabled={
  !generatedText || isLoadingExpand || isLoadingDeepen
  }
  variant="outline"
  className="flex-1 shadow-sm hover:shadow-md border-primary/50 text-primary hover:bg-primary/10 backdrop-blur-sm py-3 text-base"
  >
  {isLoadingExpand ? (
  <Loader2 className="h-5 w-5 animate-spin mr-2"/>
  ) : (
  <Maximize2 className="h-5 w-5 mr-2"/>
  )}
  Expandir Texto
  </Button>
  <Button
  onClick={handleDeepenText}
  disabled={
  !generatedText || isLoadingDeepen ||  isLoadingExpand
  }
  variant="outline"
  className="flex-1 shadow-sm hover:shadow-md border-primary/50 text-primary hover:bg-primary/10 backdrop-blur-sm py-3 text-base"
  >
  {isLoadingDeepen ? (
  <Loader2 className="h-5 w-5 animate-spin mr-2"/>
  ) : (
  <Layers className="h-5 w-5 mr-2"/>
  )}
  Aprofundar Texto
  </Button>
  </div>
  <MarkdownToDocx
  markdownContent={generatedText}
  fileName={
    detectedTopic
      ? `DeepPenAI_${detectedTopic.replace(/[\s:]+/g, '_').replace(/[^\w.-]/g, '')}_${citationStyle}_${targetLanguage}`
      : `DeepPenAI_Output_${citationStyle}_${targetLanguage}`
  }
  disabled={ isLoadingExpand || isLoadingDeepen}
  />
  </div>

  <div className="mt-6 space-y-4">
  <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">

  {/* Reset Button */}
  <Button
  onClick={handleResetAll}
  variant="destructive"
  className="w-full mt-6 shadow-md hover:shadow-lg bg-destructive/80 hover:bg-destructive/90 text-destructive-foreground backdrop-blur-sm py-3 text-base"
  >
  <Trash2 className="h-5 w-5 mr-2"/>
  Redefinir Tudo
  </Button>

  </div>
  </div>


   
  </main>

  {/* Toaster */}
  <Toaster/>
  </div>
  </DashboardLayout>
 );
};

export default DeepPenAIApp;

